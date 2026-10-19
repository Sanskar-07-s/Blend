import bpy
import os

print("--- TESTING JOIN PER GROUP ---")
blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.open_mainfile(filepath=blend_file)

group_root_mapping = {
    'group_floor': ['floor'],
    'group_backwall': ['backwall'],
    'group_leftwall': ['leftwall'],
    'group_rightwall': ['rightwall'],
    'group_ceiling': ['roof'],
    'group_desk': ['Gaming Desk With Monitor Shelf'],
    'group_pc': ['Gaming Computer Case'],
    'group_monitors': ['Samsung Odyssey G8 Monitor 34inch', 'Dell monitor 24 inch S2421HN'],
    'group_chair': ['Gaming chair/chair', 'Next generation gaming chair concept'],
    'group_shelf': ['Geometric Display Shelf', 'Wooden Display Shelf', 'Cloud shelf'],
    'group_sign': ['Gamer neon  sign'],
    'group_props': [
        'Acer Nitro 7 Gaming Laptop', 'Gaming Mouse', 'Gaming Mousepad 01',
        'Razer kraken headset gaming', 'rgb gaming keyboard ', 'rgb gaming keyboard', 'keyboard', 'keys',
        'Framed gaming art', 'Empty.011', 'Individual Book Collection 1', 'Modern Design Book Pack',
        'Stacked set of books', 'Game Cases Pack 5', 'PS5 games', 'Xbox one games'
    ],
}

total_before = len([o for o in bpy.data.objects if o.type == 'MESH'])
print(f"Total meshes before: {total_before}")

for gname, root_names in group_root_mapping.items():
    mesh_objs = []
    for rname in root_names:
        r_obj = bpy.data.objects.get(rname)
        if not r_obj:
            continue
        if r_obj.type == 'MESH':
            mesh_objs.append(r_obj)
        for child in r_obj.children_recursive:
            if child.type == 'MESH':
                mesh_objs.append(child)
    
    if len(mesh_objs) <= 1:
        continue

    # Apply all transforms first
    bpy.ops.object.select_all(action='DESELECT')
    for o in mesh_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = mesh_objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Group by material
    mats_to_objs = {}
    for o in mesh_objs:
        mat_key = o.material_slots[0].material.name if (o.material_slots and o.material_slots[0].material) else "__no_mat__"
        mats_to_objs.setdefault(mat_key, []).append(o)
    
    joined_count = 0
    for mat_key, objs in mats_to_objs.items():
        if len(objs) > 1:
            bpy.ops.object.select_all(action='DESELECT')
            for o in objs:
                o.select_set(True)
            bpy.context.view_layer.objects.active = objs[0]
            try:
                bpy.ops.object.join()
                objs[0].name = f"{gname}_{mat_key}"
                joined_count += len(objs) - 1
            except Exception as e:
                print(f"Error joining {mat_key} in {gname}: {e}")
    print(f"Group {gname}: reduced {joined_count} meshes (from {len(mesh_objs)} to {len(mesh_objs) - joined_count})")

total_after = len([o for o in bpy.data.objects if o.type == 'MESH'])
print(f"\nTotal meshes after join: {total_after} (was {total_before})")
