//components
import { createCamera } from '../components/camera.js';
import { createTerrain } from '../components/terrain.js';
import { createScene } from '../components/scene.js';
import { createLights } from '../components/lights.js';
//Systems
import { createRenderer } from '../systems/renderer.js';
import { Resizer } from '../systems/Resizer.js';

// These variables are module-scoped: we cannot access them
// from outside the module
let camera;
let renderer;
let scene;

class World {
    constructor(container) {
        camera = createCamera();
        scene = createScene();
        renderer = createRenderer();
        container.append(renderer.domElement);

        const terrain = createTerrain();
        const light = createLights();

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
export { World };