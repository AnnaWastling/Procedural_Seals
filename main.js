import { World } from './threejs/World.js';

// create the main function
async function main() {
  // Get a reference to the container element
  const container = document.querySelector('#scene-container');

  // Create an instance of the World app
  const world = new World(container);
  // complete async tasks
  await world.init();
  // start the animation loop
  world.start();

}
main();

/*what to do:
1. animation seals
2. place seals
3. texture seals
4. variations seals
5. noise terrain
6. texture terrain
*/