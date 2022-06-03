//import * as THREE from '../node_modules/three';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from '../node_modules/three/examples/jsm/utils/SkeletonUtils.js';
import { DirectionalLight, AmbientLight } from '../node_modules/three/build/three.module.js';
import { PerspectiveCamera  } from '../node_modules/three/build/three.module.js';
import { Color, Scene } from '../node_modules/three/build/three.module.js';
import { WebGLRenderer } from '../node_modules/three/build/three.module.js';
import {  PlaneGeometry, Mesh, MeshBasicMaterial, Vector2, Vector3, Raycaster } from '../node_modules/three/build/three.module.js';
import { Clock } from '../node_modules/three/src/core/Clock.js';
import {AnimationMixer} from '../node_modules/three/src/animation/AnimationMixer.js'

const modelUrl = new URL('../NEWSEAL.glb', import.meta.url);

const renderer = new WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0xA3A3A3);

document.body.appendChild(renderer.domElement);

const scene = new Scene();

const camera = new PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 6, 10);
orbit.update();

const ambientLight = new AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);
directionalLight.position.set(3, 3, 3);

const assetLoader = new GLTFLoader();

let seal;
let clips;
assetLoader.load(modelUrl.href, function(gltf) {
    const model = gltf.scene;
    model.scale.set(0.3, 0.3, 0.3);
    seal = model;
    clips = gltf.animations;
}, undefined, function(error) {
    console.error(error);
});

const planeMesh = new Mesh(
    new PlaneGeometry(20, 20),
    new MeshBasicMaterial({
        visible: false
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);
planeMesh.name = 'ground';


const highlightMesh = new Mesh(
    new PlaneGeometry(1, 1),
    new MeshBasicMaterial({
        transparent: true
    })
);
highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);

const mousePosition = new Vector2();
const raycaster = new Raycaster();
let intersects;

window.addEventListener('mousemove', function(e) {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach(function(intersect) {
        if(intersect.object.name === 'ground') {
            const highlightPos = new Vector3().copy(intersect.point).floor().addScalar(0.5);
            highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

            const objectExist = objects.find(function(object) {
                return (object.position.x === highlightMesh.position.x)
                && (object.position.z === highlightMesh.position.z)
            });

            if(!objectExist)
                highlightMesh.material.color.setHex(0xFFFFFF);
            else
                highlightMesh.material.color.setHex(0xFF0000);
        }
    });
});

const objects = [];
const mixers = [];
window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });

    if(!objectExist) {
        intersects.forEach(function(intersect) {
            if(intersect.object.name === 'ground') {
                const sealClone = SkeletonUtils.clone(seal);
                sealClone.position.copy(highlightMesh.position);
                scene.add(sealClone);
                objects.push(sealClone);
                highlightMesh.material.color.setHex(0xFF0000);

                const mixer = new AnimationMixer(sealClone);
                const clip = seal.animations[0];
                const action = mixer.clipAction(clip);
                action.play();
                mixers.push(mixer);
            }
        });
    }
    console.log(scene.children.length);
});

const clock = new Clock();
function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);

    const delta = clock.getDelta();
    mixers.forEach(function(mixer) {
        mixer.update(delta);
    });
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});