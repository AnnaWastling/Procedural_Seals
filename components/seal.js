import { GLTFLoader } from '../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { setupModel } from '../systems/setupModel.js';
async function loadSeals() {
  const loader = new GLTFLoader();

  const [sealData] = await Promise.all([
    loader.loadAsync('./NEWSEAL.glb'),
  ]);

  console.log('seals!', sealData);

  const seal = setupModel(sealData);
  seal.position.set(0, 0.7, -2.5);


  return {
    seal
  };
}

export { loadSeals };