import bpy

print("--- CONSOLIDATING MATERIALS & CLEANING SLOTS ---")

# 1. Map to master materials
black_mats = {
    'black', 'black plactic', 'black skin', 'black skin.001', 'black skin.002',
    'black.001', 'black.002', 'black.003', 'glossy black', 'plastic black.002',
    'plastic.black', 'Plástico fosco', 'Plástico fosco.001', 'BlackGloss', 'BlackPlastic Matte',
    'black metal', 'Black metal', 'screw.002', 'rubber.002', 'grid', 'grid.001'
}

master_black = bpy.data.materials.get("Black plastic PL.003") or bpy.data.materials.get("Black metal")
if not master_black:
    master_black = bpy.data.materials.new("Master_Black")
    master_black.use_nodes = True

metal_mats = {
    'steel.001', 'alumínio desgastado', 'Stainless Steel', 'metallic paint', 'metallic paint.logo',
    'metal', 'metal.001', 'Metal.001', 'Brushed nickel.001', 'Brushed gold.002'
}
master_metal = bpy.data.materials.get("Metal.001") or bpy.data.materials.get("steel.001")

# Replace slot materials across all objects
for obj in bpy.data.objects:
    if obj.type != 'MESH':
        continue
    for slot in obj.material_slots:
        if not slot.material:
            continue
        mname = slot.material.name
        if mname in black_mats:
            slot.material = master_black
        elif mname in metal_mats and master_metal:
            slot.material = master_metal
        elif mname.startswith("edge paper.") and bpy.data.materials.get("edge paper"):
            slot.material = bpy.data.materials.get("edge paper")

# 2. Merge duplicate material slots on each mesh
# If an object has multiple slots with the same material, reassign faces to the first slot and remove the duplicates
for obj in bpy.data.objects:
    if obj.type != 'MESH' or len(obj.material_slots) <= 1:
        continue
    
    mesh = obj.data
    slot_map = {} # mat -> first_index
    remap = {}    # old_index -> new_index
    
    unique_slots = []
    for i, slot in enumerate(obj.material_slots):
        mat = slot.material
        if mat not in slot_map:
            slot_map[mat] = len(unique_slots)
            unique_slots.append(mat)
            remap[i] = slot_map[mat]
        else:
            remap[i] = slot_map[mat]
            
    # Remap polygon material indices
    for poly in mesh.polygons:
        poly.material_index = remap.get(poly.material_index, 0)
        
    # Rebuild material slots
    obj.data.materials.clear()
    for mat in unique_slots:
        obj.data.materials.append(mat)

# 3. Purge orphaned materials
for _ in range(4):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# 4. Count remaining active materials
active_mats = set()
total_slots = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        total_slots += len(obj.material_slots)
        for s in obj.material_slots:
            if s.material:
                active_mats.add(s.material.name)

print(f"Total mesh objects: {len([o for o in bpy.data.objects if o.type == 'MESH'])}")
print(f"Total material slots across all meshes (glTF primitives): {total_slots}")
print(f"Total active materials: {len(active_mats)}")
print("Active materials list:")
for m in sorted(active_mats):
    print(f"  * {m}")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
