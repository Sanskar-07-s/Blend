import bpy

bpy.ops.wm.open_mainfile(filepath=r"d:\Blender\blender-club-3d-studio\GamingRoom.blend")

for mat in bpy.data.materials:
    if not mat.node_tree:
        continue
    mname = mat.name.lower()
    # Strip unnecessary roughness/metallic/normal maps on small objects
    if any(k in mname for k in ['keys', 'base', 'material.00', 'material.01', 'paper']):
        nodes = mat.node_tree.nodes
        for n in list(nodes):
            if n.type == 'TEX_IMAGE' and n.image:
                iname = n.image.name.lower()
                if any(x in iname for x in ['rough', 'metal', 'normal']):
                    nodes.remove(n)

for _ in range(4):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

used_images = set()
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for slot in obj.material_slots:
            if slot.material and slot.material.node_tree:
                for n in slot.material.node_tree.nodes:
                    if n.type == 'TEX_IMAGE' and n.image:
                        used_images.add(n.image.name)

print(f"COUNT OF ACTIVE TEXTURES: {len(used_images)}")
bpy.ops.wm.save_mainfile(filepath=r"d:\Blender\blender-club-3d-studio\GamingRoom.blend")
