import {  PlaneBufferGeometry, Mesh, MeshStandardMaterial } from '../node_modules/three/build/three.module.js';

function createTerrain() {
    const width = 256;
    const height = 256;
    const xSegment = 100;
    const ySegment = 100;
  // create a geometry
  const geometry = new PlaneBufferGeometry(width, height, xSegment, ySegment);
  const spec = {
    color: 'green',
  }
  // create a default (white) Basic material
  const material = new MeshStandardMaterial(spec);
   var heightmap = new Array(width,height);
  for(var y=0; y<height; y++){
    for(var x=0; x<height; x++){
        heightmap[y][x] = getNoise(y,x);
    }
  }
  // create a Mesh containing the geometry and material
  const terrain = new Mesh(geometry, material);
  terrain.rotation.set(-1.5, 0.0, 0.0);

  return terrain;
}
function getNoise(x, y){

}

export { createTerrain };