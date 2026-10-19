import bpy

print("===================================================================")
print("     CONSOLIDATING MATERIALS TO TARGET (< 25 TOTAL MATERIALS)      ")
print("===================================================================")

master_black = bpy.data.materials.get("Black plastic PL.003") or bpy.data.materials.get("Black metal")
master_metal = bpy.data.materials.get("Metal.001")
master_paper = bpy.data.materials.get("edge paper") or bpy.data.materials.get("paper")

# Find a good book cover image
cover_img = None
for im in bpy.data.images:
    if 'cover' in im.name.lower() or 'game' in im.name.lower() or 'elden' in im.name.lower():
        cover_img = im
        break

master_cover = bpy.data.materials.get("Cover book-01") or bpy.data.materials.get("book cover")
if not master_cover:
    master_cover = bpy.data.materials.new("Studio_Book_Cover")
    master_cover.use_nodes = True
    if cover_img:
        bsdf = master_cover.node_tree.nodes.get("Principled BSDF")
        tex = master_cover.node_tree.nodes.new("ShaderNodeTexImage")
        tex.image = cover_img
        master_cover.node_tree.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])

# List of book/case cover names
book_mats = {
    '1984', 'Alfred Stieglitz_Cover', 'Bodies_Cover', 'Chairs_Cover',
    'Cover book-01', 'Cover book-02', 'Cover book-03', 'Stubbs_Cover',
    'book cover', 'design', 'factful', 'factful.001', 'greenbook', 'how to',
    'hygge', 'ikigai', 'sapiens'
}

# Mouse materials
mouse_mats = {
    f"Material.{i:03d}" for i in range(1, 17)
}

# Chair & prop materials
chair_prop_black = {
    'outline', 'outline.001', 'hole', 'blue', 'red', 'Material.017', 'Material.018',
    'Material.019', 'Material.020', 'Material.021', 'Material.023', 'Material.024',
    'Material.025', 'Borracha', 'Recycled cardboard texture', 'Light iron', 'Metal Aluminio preto',
    'carbonfiber.001', 'chip', 'main body', 'main body.001', 'subtle', 'screen matte',
    ' black', 'Generic_Monitor_Chassis', 'Generic_Monitor_Stand', 'ScreenRim', 'ManeTex',
    'gpu', 'mb', 'Translucent Plastic.001', 'Translucent Plastic.002'
}

glass_mats = {
    'clear plastic film.001', 'clear plastic film.002', 'Plastic Glass Shader.001', 'Vidro', 'Transparent'
}
master_glass = bpy.data.materials.get("Glass")

metal_mats_extra = {
    'chrome', 'gold', 'Metal.002', 'Brushed Steel Procedural'
}

wood_mats = {
    'Wood'
}
master_wood = bpy.data.materials.get("Black and Light Wood")

paper_extra = {
    'Paper.002'
}

for obj in bpy.data.objects:
    if obj.type != 'MESH':
        continue
    for slot in obj.material_slots:
        if not slot.material:
            continue
        mname = slot.material.name
        
        # Check books
        if mname in book_mats or mname.startswith("cover.") or mname.startswith("title."):
            slot.material = master_cover
        elif mname.startswith("edge paper") or mname.startswith("stacked paper") or mname == "paper" or mname in paper_extra:
            slot.material = master_paper
        elif mname in mouse_mats or mname in chair_prop_black:
            slot.material = master_black
        elif mname in glass_mats and master_glass:
            slot.material = master_glass
        elif mname in metal_mats_extra and master_metal:
            slot.material = master_metal
        elif mname in wood_mats and master_wood:
            slot.material = master_wood

# Merge duplicate material slots on each mesh
for obj in bpy.data.objects:
    if obj.type != 'MESH' or len(obj.material_slots) <= 1:
        continue
    
    mesh = obj.data
    slot_map = {}
    remap = {}
    unique_slots = []
    
    for i, slot in enumerate(obj.material_slots):
        mat = slot.material
        if mat not in slot_map:
            slot_map[mat] = len(unique_slots)
            unique_slots.append(mat)
            remap[i] = slot_map[mat]
        else:
            remap[i] = slot_map[mat]
            
    for poly in mesh.polygons:
        poly.material_index = remap.get(poly.material_index, 0)
        
    obj.data.materials.clear()
    for mat in unique_slots:
        obj.data.materials.append(mat)

# Purge unused materials
for _ in range(4):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# Count remaining active materials
active_mats = set()
total_slots = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        total_slots += len(obj.material_slots)
        for s in obj.material_slots:
            if s.material:
                active_mats.add(s.material.name)

print("\n=======================================================")
print(f"TOTAL MESH OBJECTS: {len([o for o in bpy.data.objects if o.type == 'MESH'])}")
print(f"TOTAL PRIMITIVES (MATERIAL SLOTS): {total_slots}")
print(f"TOTAL ACTIVE MATERIALS: {len(active_mats)} (TARGET < 25)")
print("=======================================================")
for m in sorted(active_mats):
    print(f"  * {m}")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
