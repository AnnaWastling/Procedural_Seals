// import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
//import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';
import { ImprovedNoise } from '/node_modules/three/examples/jsm/math/ImprovedNoise.js';
import { SimplexNoise } from '/node_modules/three/examples/jsm/math/SimplexNoise.js';
import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.138.3/examples/jsm/loaders/GLTFLoader.js';
const modelUrl = new URL('seal.glb', import.meta.url);

//Scene init
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
camera.position.set(10, -2, 10);
const orbit = new OrbitControls(camera, renderer.domElement);

//Lightning
const dirLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( 100, 100, 100);
const light = new THREE.AmbientLight( 0xfff1e3, 0.2);
scene.add( light );
// const helper = new THREE.DirectionalLightHelper( dirLight, 5 );
// scene.add( helper );
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
hemiLight.color.setHSL( 0.6, 1, 0.6 );
hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
hemiLight.position.set( -50, 20, -50 );
// const helper2 = new THREE.HemisphereLightHelper( hemiLight, 5 );
// scene.add( helper2 );
scene.add( hemiLight, dirLight );
const terrainMesh = MakeTerrain();

//Load seal models
const assetLoader = new GLTFLoader();
const objects = [];
const mixers = [];
assetLoader.load(modelUrl.href, function(gltf) {
    const model = gltf.scene;
    const count = 600;
    //clone 600 seals
    for (let index = 0; index < count; index++) {
        const sealClone = SkeletonUtils.clone(model);
        //place randomly inside interval, position 20 at y-axis to calc rotation around x-axis and z-axis
        sealClone.position.set(Math.random()*-250, 20, Math.random()*-250);
        //Ray from seal to terrain
        // var testLineMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 });
        // var points = [];
        // points.push(new THREE.Vector3(sealClone.position.x, sealClone.position.y + 10, sealClone.position.z));
        // points.push(new THREE.Vector3(sealClone.position.x, sealClone.position.y - 10, sealClone.position.z));
        // var geometry = new THREE.BufferGeometry().setFromPoints(points);
        // var line = new THREE.Line(geometry, testLineMaterial);
        // scene.add(line);
        // See if the ray hits the terrain from seal
        const raycaster = new THREE.Raycaster(new THREE.Vector3(sealClone.position.x, sealClone.position.y, sealClone.position.z), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(terrainMesh);
        if (intersects.length > 0) {
            //rotate seal according to the normal of the terrain
            sealClone.lookAt( intersects[0].face.normal );
            sealClone.position.copy( intersects[0].point );
        }
        //make a random rotation around y-axis
        sealClone.rotateY(Math.PI/Math.random());
        //place all clones in a array
        objects.push(sealClone);
        //Apply a random rotation from 4 rotations
        const mixer = new THREE.AnimationMixer(sealClone);
        var randomnumber = Math.floor(Math.random() * (2 - 0 + 2)) + 0;
        const clip = gltf.animations[randomnumber]
        const action = mixer.clipAction(clip);
        action.play();
        mixers.push(mixer);
    }
    
    //go through all clones and check for collision
    for (let i = 0; i < objects.length; i++) {
        //collisionbox
        const box_i = new THREE.Box3();
        box_i.setFromObject(objects[i]);
        box_i.expandByScalar(5);
        for (let j = i+1; j < objects.length; j++) {
            const box_j = new THREE.Box3();
            box_j.setFromObject(objects[j]);
            box_j.expandByScalar(5);
            //check if intersection
            if(box_i.intersectsBox(box_j)){
                // const boxh = new THREE.BoxHelper( objects[i], 0xa3403c);
                // scene.add( boxh );
                break;
            }else{
                objects[i].traverse( ( object ) => {
                    if ( object.name == 'Cube001_1') {
                        //apply random color from palette
                        const color = new THREE.Color();      
                        const palette = [ 0xedf2ef, 0x8c8981, 0x383736, 0x3d2712, 0xa3a3a3, 0x826051];
                        color.setHex(palette[Math.floor( Math.random() * palette.length )]);
                        let clonedMaterial = object.material.clone();
                        object.material.color = color;
                        object.material = clonedMaterial;
                        object.material.color.set(color);
                    }
                } );
                //finally add object to scene
                scene.add(objects[i]);
            }     
        }
    }
}, undefined, function(error) {
    console.error(error);
});

const clock = new THREE.Clock();
function animate() {
    const delta = clock.getDelta();
    mixers.forEach(function(mixer) {
        mixer.update(delta);
    });
    orbit.update();
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

//Make a terrain by using noise
function MakeTerrain()
{
    const geometry = new THREE.BufferGeometry();
    const indices = [];
    const vertices = [];
    const normals = [];
    const colors = [];

    const size = 300;
    const segments = 25;

    const halfSize = size / 2;
    const segmentSize = size / segments;

    // generate vertices, normals and color data for a simple grid geometry
    for (let i = 0; i <= segments; i ++) {
        for (let j = 0; j <= segments; j ++) {
            const perlin = new ImprovedNoise();
            const noise = new SimplexNoise();
            const z = (i * segmentSize) - halfSize
            const x = (j * segmentSize) - halfSize;
            //combine perlin noise with simplexnoise to get a more interesting texture
            let y = Math.abs(perlin.noise(x/halfSize, 1, z/halfSize) * segmentSize* 5 + noise.noise(x/size, 1, z/size) * segmentSize*0.2 );
            vertices.push(x, y, z);
            normals.push(0, 1, 0);
            //if statement to remove extremevalues
            if(y < 2 ){
                y = 3; // to remove black color in terrain
             }else if(y >12){
                y = 11; // to remove white color in terrain
             }
             //Apply color from y value (height)
            const r = (y / size)* 10;
            const g = (y / size)* 10;
            const b = (y / size)* 10;
            //more red and green to create sandcolor
            colors.push(r*2, g*1.5, b);
        }
    }
    // generate indices (data for element array buffer)
    for (let i = 0; i < segments; i ++) {
        for (let j = 0; j < segments; j ++) {
            const a = i * (segments + 1) + (j + 1);
            const b = i * (segments + 1) + j;
            const c = (i + 1) * (segments + 1) + j;
            const d = (i + 1) * (segments + 1) + (j + 1);
            // generate two faces (triangles) per iteration
            indices.push(a, b, d); // face one
            indices.push(b, c, d); // face two
        }
    }
    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshPhongMaterial({
        vertexColors: true,
        side:THREE.DoubleSide
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.position.set(-100,-10,-100);
    scene.add(ground);

    const waterGeo = new THREE.PlaneGeometry( 1000, 1000 );
    const waterMat = new THREE.MeshLambertMaterial( { 
        color: 0x91a9b3,
        side:THREE.DoubleSide
    } );

    const water = new THREE.Mesh( waterGeo, waterMat );
    water.position.y = -8;
    water.rotation.x = -Math.PI / 2;
    scene.add( water );  
    return ground;
}


