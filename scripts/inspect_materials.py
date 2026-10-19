import bpy

bpy.ops.wm.open_mainfile(filepath=r"d:\Blender\blender-club-3d-studio\GamingRoom.blend")

print(f"Total Materials in scene: {len(bpy.data.materials)}")
used_materials = set()
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for slot in obj.material_slots:
            if slot.material:
                used_materials.add(slot.material.name)

print(f"Materials actually used by meshes ({len(used_materials)}):")
for mname in sorted(used_materials):
    mat = bpy.data.materials.get(mname)
    nodes = mat.node_tree.nodes if mat and mat.node_tree else []
    tex_nodes = [n.image.name for n in nodes if n.type == 'TEX_IMAGE' and n.image]
    print(f"  * {mname:<30} (textures: {len(tex_nodes)}) -> {', '.join(tex_nodes[:3])}")
