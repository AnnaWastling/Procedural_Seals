import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';

const modelUrl = new URL('seal.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0xA3A3A3);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 6, 10);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);
directionalLight.position.set(3, 3, 3);

const assetLoader = new GLTFLoader();

let seal;
let clips;
assetLoader.load(modelUrl.href, function(gltf) {
    const model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);
    seal = model;
    clips = gltf.animations;
    for (let index = 0; index < 200; index++) {
        const sealClone = SkeletonUtils.clone(seal);
        sealClone.position.set(Math.random()*-20, 0, Math.random()*-20);
        sealClone.rotateY(Math.PI/Math.random());
        objects.push(sealClone);
        const mixer = new THREE.AnimationMixer(sealClone);
        for (let index = 0; index < 2; index++) {
            const clip = gltf.animations[index]
            const action = mixer.clipAction(clip);
            action.play();
        }
        mixers.push(mixer);
    }

    for (let i = 0; i < objects.length; i++) {
        const box_i = new THREE.Box3();
        box_i.setFromObject(objects[i]);
        for (let j = i+1; j < objects.length; j++) {
            const box_j = new THREE.Box3();
            box_j.setFromObject(objects[j]);
            if(box_j.intersectsBox(box_i)){
                const boxh = new THREE.BoxHelper( objects[i], 0xffff00 );
                scene.add( boxh );  
            }else{
                scene.add(objects[i]);
            }     
        }
    }

}, undefined, function(error) {
    console.error(error);
});

const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshBasicMaterial({
        visible: true
    })
);
planeMesh.rotateX(-Math.PI / 2);
planeMesh.position.set(-20,0, -20);
scene.add(planeMesh);
planeMesh.name = 'ground';

const objects = [];
const mixers = [];

const clock = new THREE.Clock();
function animate(time) {
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