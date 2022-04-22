import { DirectionalLight, AmbientLight } from '../node_modules/three/build/three.module.js';

function createLights() {
  // Create a directional light
  const light = new DirectionalLight('white', 8);
  //const ambientLight = new AmbientLight(0xffffff, 0.3);
    // move the light right, up, and towards us
    light.position.set(10, 10, 10);

  return light;
}

export { createLights };