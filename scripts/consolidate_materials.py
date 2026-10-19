import bpy

print("===================================================================")
print("     CONSOLIDATE MATERIALS & TEXTURES (< 25 MATS, < 25 TEXTURES)   ")
print("===================================================================")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.open_mainfile(filepath=blend_file)

# 1. Clean up heavy texture nodes from tiny props (screws, rubber, steel, chip)
# Replace with clean Principled BSDF procedural values
simple_pbr_mats = {
    'screw.002': {'base_color': (0.1, 0.1, 0.12, 1.0), 'metallic': 0.9, 'roughness': 0.3},
    'rubber.002': {'base_color': (0.05, 0.05, 0.07, 1.0), 'metallic': 0.0, 'roughness': 0.8},
    'steel.001': {'base_color': (0.3, 0.3, 0.35, 1.0), 'metallic': 0.85, 'roughness': 0.35},
    'alumínio desgastado': {'base_color': (0.2, 0.2, 0.25, 1.0), 'metallic': 0.9, 'roughness': 0.4},
    'Stainless Steel': {'base_color': (0.4, 0.4, 0.45, 1.0), 'metallic': 0.95, 'roughness': 0.25},
    'grid': {'base_color': (0.08, 0.07, 0.12, 1.0), 'metallic': 0.8, 'roughness': 0.4},
    'grid.001': {'base_color': (0.08, 0.07, 0.12, 1.0), 'metallic': 0.8, 'roughness': 0.4},
    'metallic paint.logo': {'base_color': (0.1, 0.1, 0.15, 1.0), 'metallic': 0.8, 'roughness': 0.4},
    'chip': {'base_color': (0.08, 0.09, 0.14, 1.0), 'metallic': 0.7, 'roughness': 0.35},
}

for mat_name, props in simple_pbr_mats.items():
    mat = bpy.data.materials.get(mat_name)
    if mat and mat.node_tree:
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        # Remove all texture image nodes
        for n in list(nodes):
            if n.type in ['TEX_IMAGE', 'BUMP', 'NORMAL_MAP', 'DISPLACEMENT']:
                nodes.remove(n)
        bsdf = nodes.get('Principled BSDF')
        if not bsdf:
            for n in nodes:
                if n.type == 'BSDF_PRINCIPLED':
                    bsdf = n
                    break
        if bsdf:
            if 'Base Color' in bsdf.inputs:
                bsdf.inputs['Base Color'].default_value = props['base_color']
            if 'Metallic' in bsdf.inputs:
                bsdf.inputs['Metallic'].default_value = props['metallic']
            if 'Roughness' in bsdf.inputs:
                bsdf.inputs['Roughness'].default_value = props['roughness']

# 2. Consolidate book and game case covers into 3 shared dark cyberpunk covers
shared_covers = [
    '2021-12-31_61cec85e5a322_2crta139cr881-950x565.jpg',
    'elden.jpg',
    'dlihgt.jpg',
]
# Find or load these 3 images
kept_cover_imgs = [bpy.data.images.get(name) for name in shared_covers if bpy.data.images.get(name)]
if not kept_cover_imgs:
    # grab any 3 images
    kept_cover_imgs = [img for img in bpy.data.images if 'cover' in img.name.lower() or 'game' in img.name.lower()][:3]

if kept_cover_imgs:
    print(f"Sharing {len(kept_cover_imgs)} cover textures across all book/game materials...")
    cover_idx = 0
    for mat in bpy.data.materials:
        if any(term in mat.name.lower() for term in ['cover.', 'title.', 'book', 'sapiens', 'hygge', 'ikigai', 'design', 'stubbs', 'factful', 'bodies', 'chairs']):
            if mat.node_tree:
                for n in list(mat.node_tree.nodes):
                    if n.type in ['BUMP', 'NORMAL_MAP', 'DISPLACEMENT']:
                        mat.node_tree.nodes.remove(n)
                    elif n.type == 'TEX_IMAGE' and n.image:
                        n.image = kept_cover_imgs[cover_idx % len(kept_cover_imgs)]
                cover_idx += 1

# 3. Consolidate black / plastic materials across meshes
master_black_mat = bpy.data.materials.get("Black plastic PL.003") or bpy.data.materials.get("Black metal")
if not master_black_mat:
    master_black_mat = bpy.data.materials.new("Studio_Dark_Plastic")
    master_black_mat.use_nodes = True
    bsdf = master_black_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.05, 0.04, 0.08, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.5
        bsdf.inputs['Metallic'].default_value = 0.1

black_mats_to_replace = {
    'black', 'black plactic', 'black skin', 'black skin.001', 'black skin.002',
    'black.001', 'black.002', 'black.003', 'glossy black', 'plastic black.002',
    'plastic.black', 'Plástico fosco', 'Plástico fosco.001', 'BlackGloss', 'BlackPlastic Matte'
}

for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for slot in obj.material_slots:
            if slot.material and slot.material.name in black_mats_to_replace:
                slot.material = master_black_mat

# 4. Consolidate edge paper materials into one
master_paper_mat = bpy.data.materials.get("edge paper")
if master_paper_mat:
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            for slot in obj.material_slots:
                if slot.material and slot.material.name.startswith("edge paper."):
                    slot.material = master_paper_mat

# 5. Purge unreferenced data blocks
for _ in range(4):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# 6. Count remaining textures and materials
used_mats = set()
used_images = set()
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for slot in obj.material_slots:
            if slot.material:
                used_mats.add(slot.material.name)
                if slot.material.node_tree:
                    for n in slot.material.node_tree.nodes:
                        if n.type == 'TEX_IMAGE' and n.image:
                            used_images.add(n.image.name)

print("\n=======================================================")
print(f"REMAINING ACTIVE MATERIALS: {len(used_mats)}")
print(f"REMAINING ACTIVE TEXTURES: {len(used_images)}")
print("=======================================================")
for im in sorted(used_images):
    print(f"  * {im}")

bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
