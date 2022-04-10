import { World } from './threejs/World.js';

// create the main function
function main() {
  // Get a reference to the container element
  const container = document.querySelector('#scene-container');

  // Create an instance of the World app
  const world = new World(container);

  // Render the scene
  world.render();
}
main();