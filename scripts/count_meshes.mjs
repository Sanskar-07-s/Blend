import fs from 'fs';
import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS);
const doc = await io.read('public/models/room.glb');
const root = doc.getRoot();

console.log('Meshes:', root.listMeshes().length);
console.log('Nodes:', root.listNodes().length);
console.log('Materials:', root.listMaterials().length);
console.log('Textures:', root.listTextures().length);

// Count meshes per group_
const groups = root.listNodes().filter(n => n.getName().startsWith('group_'));
console.log('\n--- GROUPS ---');
for (const g of groups) {
  let meshCount = 0;
  function countChildren(node) {
    if (node.getMesh()) meshCount++;
    for (const child of node.listChildren()) {
      countChildren(child);
    }
  }
  countChildren(g);
  console.log(`${g.getName()}: ${meshCount} meshes`);
}
