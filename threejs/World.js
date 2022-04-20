//components
import { createCamera } from '../components/camera.js';
import { createTerrain } from '../components/terrain.js';
import { createScene } from '../components/scene.js';
import { createLights } from '../components/lights.js';
//Systems
import { createRenderer } from '../systems/renderer.js';
import { Resizer } from '../systems/Resizer.js';

//stuff
import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js'
import { Vector3 } from '../node_modules/three/src/math/Vector3.js'
import { Mesh } from '../node_modules/three/src/objects/Mesh.js'
//import { Box3 } from '../node_modules/three/src/math/Box3.js'
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js'

// These variables are module-scoped: we cannot access them
// from outside the module
let camera;
let renderer;
let scene;
let sealOriginal = new Mesh();

class World {
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        container.append(renderer.domElement);
        const controls = new OrbitControls( camera, renderer.domElement );
        const terrain = createTerrain();
        const light = createLights();
        const loader = new GLTFLoader();
        loader.load('./NEWSEAL.glb', function(gltf){
           sealOriginal = gltf.scene;

          for(var i=0; i<10; i++){
            var mesh = sealOriginal.clone();
            //new Mesh(sealOriginal.geometry, sealOriginal.material);
            mesh.position.set( i * 1, 0, 0 );
            mesh.scale.set(2, 2, 2);
            scene.add( mesh );
          }
        });
        scene.add(terrain, light);
        
        const resizer = new Resizer(container, camera, renderer);
        resizer.onResize = () => {
            this.render();
          };
    }
    render() {
        // draw a single frame
        renderer.render(scene, camera);
        
      }
}

function spawn(){
  for(var i=0; i < numSeals; i++){
      randPos =  new Vector3.random()
      var clone = seal.copy()
  }
}
export { World };