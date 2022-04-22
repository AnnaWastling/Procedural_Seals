//components
import { createCamera } from '../components/camera.js';
import { createTerrain } from '../components/terrain.js';
import { createScene } from '../components/scene.js';
import { createLights } from '../components/lights.js';
import { loadSeals } from '../components/seal.js';
import { createControls } from '../components/controls.js';
//Systems
import { createRenderer } from '../systems/renderer.js';
import { Resizer } from '../systems/Resizer.js';
import {Loop} from '../systems/loop.js'

// These variables are module-scoped: we cannot access them
// from outside the module
let camera;
let renderer;
let scene;
let loop;
let controls;

class World {
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        loop = new Loop(camera, scene, renderer);
        container.append(renderer.domElement);
        controls = createControls(camera, renderer.domElement);
        const terrain = createTerrain();
        const light = createLights();

        loop.updatables.push(controls);
        scene.add(terrain, light);
        
        const resizer = new Resizer(container, camera, renderer);
        resizer.onResize = () => {
            this.render();
          };
    }
    async init() {
      const { seal } = await loadSeals();
      // move the target to the center of the front seal
      controls.target.copy(seal.position);
      loop.updatables.push(seal);
      scene.add(seal);
    }
    render() {
        // draw a single frame
        renderer.render(scene, camera);
        
      }
        start() {
    loop.start();
  }

  stop() {
    loop.stop();
  }
}

export { World };