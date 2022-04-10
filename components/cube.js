import {  BoxBufferGeometry, Mesh, MeshStandardMaterial } from '../node_modules/three/build/three.module.js';

function createCube() {
  // create a geometry
  const geometry = new BoxBufferGeometry(2, 2, 2);
  const spec = {
    color: 'purple',
  }
  // create a default (white) Basic material
  const material = new MeshStandardMaterial(spec);

  // create a Mesh containing the geometry and material
  const cube = new Mesh(geometry, material);
  cube.rotation.set(-0.5, -0.1, 0.8);

  return cube;
}

export { createCube };