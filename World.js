import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';
import { ImprovedNoise } from '/node_modules/three/examples/jsm/math/ImprovedNoise.js';
import { SimplexNoise } from '/node_modules/three/examples/jsm/math/SimplexNoise.js';

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
const terrainMesh = MakeTerrain();
const assetLoader = new GLTFLoader();
let seal;
const objects = [];
const mixers = [];
assetLoader.load(modelUrl.href, function(gltf) {
    const model = gltf.scene;
    seal = model;
    for (let index = 0; index < 200; index++) {
        const sealClone = SkeletonUtils.clone(seal);
        sealClone.position.set(Math.random()*-200, 10, Math.random()*-200);
        // var testLineMaterial = new THREE.LineBasicMaterial({ color: 0xFF0000 });
        // var points = [];
        // points.push(new THREE.Vector3(sealClone.position.x, sealClone.position.y + 10, sealClone.position.z));
        // points.push(new THREE.Vector3(sealClone.position.x, sealClone.position.y - 10, sealClone.position.z));
        // var geometry = new THREE.BufferGeometry().setFromPoints(points);
        // var line = new THREE.Line(geometry, testLineMaterial);
        // scene.add(line);
        // See if the ray hits the terrain
        const raycaster = new THREE.Raycaster(new THREE.Vector3(sealClone.position.x, sealClone.position.y + 2, sealClone.position.z), new THREE.Vector3(0, -1, 0));
        const intersects = raycaster.intersectObject(terrainMesh);
        if ( intersects.length > 0 ) {
            sealClone.lookAt( intersects[ 0 ].face.normal );
            sealClone.position.copy( intersects[ 0 ].point );
        }
        sealClone.rotateY(Math.PI/Math.random());
        objects.push(sealClone);
        const mixer = new THREE.AnimationMixer(sealClone);
        var randomnumber = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
        const clip = gltf.animations[randomnumber]
        const action = mixer.clipAction(clip);
        action.play();
        mixers.push(mixer);
    }

    // const color = new THREE.Color();
    // const palette = [ 0xF20587, 0xF2D479, 0xF2C879, 0xF2B077, 0xF24405 ]; 
    // color.setHex( palette[ Math.floor( Math.random() * palette.length ) ] );
    // sealMesh.setColorAt(i, color);
    
    for (let i = 0; i < objects.length; i++) {
        const box_i = new THREE.Box3();
        box_i.setFromObject(objects[i]);
        box_i.expandByScalar(5);
        for (let j = i+1; j < objects.length; j++) {
            const box_j = new THREE.Box3();
            box_j.setFromObject(objects[j]);
            box_j.expandByScalar(5);
            if(box_i.intersectsBox(box_j)){
                // const boxh = new THREE.BoxHelper( objects[i], 0xa3403c);
                // scene.add( boxh );
                break;
            }else{
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
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function MakeTerrain()
{
    const geometry = new THREE.BufferGeometry();

    const indices = [];
    const vertices = [];
    const normals = [];
    const colors = [];

    const size = 500;
    const segments = 50;

    const halfSize = size / 2;
    const segmentSize = size / segments;

    // generate vertices, normals and color data for a simple grid geometry
    for ( let i = 0; i <= segments; i ++ ) {
        for ( let j = 0; j <= segments; j ++ ) {
            const perlin = new ImprovedNoise();
            const z = ( i * segmentSize ) - halfSize
            const x = ( j * segmentSize ) - halfSize;
            const y = Math.abs(perlin.noise(x/halfSize, 1, z/halfSize) * segmentSize*2.5 );
            vertices.push( x, y, z);
            normals.push( 0, 1, 0 );

            const r = ( x / size ) + 0.5;
            const b = ( z / size ) + 0.5;

            colors.push( r, 0, b );

        }

    }

    // generate indices (data for element array buffer)
    for ( let i = 0; i < segments; i ++ ) {

        for ( let j = 0; j < segments; j ++ ) {

            const a = i * ( segments + 1 ) + ( j + 1 );
            const b = i * ( segments + 1 ) + j;
            const c = ( i + 1 ) * ( segments + 1 ) + j;
            const d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );

            // generate two faces (triangles) per iteration
            indices.push( a, b, d ); // face one
            indices.push( b, c, d ); // face two

        }
    }

    geometry.setIndex( indices );
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    const material = new THREE.MeshPhongMaterial( {
        side: THREE.DoubleSide,
        vertexColors: true
    } );

    const mesh = new THREE.Mesh( geometry, material );
    scene.add(mesh);
    return mesh;
}
