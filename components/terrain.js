import {  PlaneBufferGeometry, Mesh, ShaderMaterial } from '../node_modules/three/build/three.module.js';
const terrain_vert = `
varying vec3 vUv; 

void main() {
  vUv = position; 

  vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewPosition; 
}
`
function createTerrain() {
    const width = 256;
    const height = 256;
    const xSegment = 100;
    const ySegment = 100;
  // create a default (white) Basic material
  const material = new ShaderMaterial({
    //uniforms: uniforms,
    vertexShader : terrain_vert,

  });

  // create a geometry
  const geometry = new PlaneBufferGeometry(width, height, xSegment, ySegment);
  // create a Mesh containing the geometry and material
  const terrain = new Mesh(geometry, material);
  terrain.receiveShadow = true;
  terrain.rotation.set(-1.5, 0.0, 0.0);

  return terrain;
}

export { createTerrain };