import bpy
import os
import json

print("===================================================================")
print("           BLENDER CLUB 3D STUDIO - ROOM EXPORT & ANCHORS           ")
print("===================================================================")

out_dir = r"d:\Blender\blender-club-3d-studio\public\models"
os.makedirs(out_dir, exist_ok=True)
glb_path = os.path.join(out_dir, "room.glb")
anchors_path = os.path.join(out_dir, "anchors.json")

# 1. Ensure all materials render double-sided and have optimal emissive shaders
print("[1/6] Processing materials for double-sided rendering & neon...")
for mat in bpy.data.materials:
    mat.use_backface_culling = False
    
    # Boost neon Playstation buttons (O, square, Triangel, X)
    if mat.name in ['O', 'square', 'Triangel', 'X'] and mat.node_tree:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            if 'Emission Color' in bsdf.inputs:
                base_col = bsdf.inputs['Base Color'].default_value
                bsdf.inputs['Emission Color'].default_value = (base_col[0], base_col[1], base_col[2], 1.0)
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = 5.0

    # Ensure black metal does not vanish into pure black
    if mat.name == 'Black metal' and mat.node_tree:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            if 'Base Color' in bsdf.inputs and not bsdf.inputs['Base Color'].is_linked:
                bsdf.inputs['Base Color'].default_value = (0.09, 0.08, 0.14, 1.0)
            if 'Roughness' in bsdf.inputs and not bsdf.inputs['Roughness'].is_linked:
                bsdf.inputs['Roughness'].default_value = 0.45

# 2. Downscale textures to max 1024 to ensure 60fps & low memory usage
print("[2/6] Downscaling textures exceeding 1024 to 1024...")
for img in bpy.data.images:
    try:
        w, h = img.size
        if w > 1024 or h > 1024:
            scale_ratio = 1024.0 / max(w, h)
            new_w = max(int(w * scale_ratio), 64)
            new_h = max(int(h * scale_ratio), 64)
            img.scale(new_w, new_h)
    except Exception as e:
        print(f"Skipping {img.name}: {e}")

# 3. Compute true world-space bounding box for objects/collections converted to glTF coordinates
# Blender coordinates: X right, Y forward (into room), Z up
# glTF / Three.js coordinates: X = blend_X, Y = blend_Z, Z = -blend_Y
def blend_to_gltf(vec):
    return [round(vec[0], 3), round(vec[2], 3), round(-vec[1], 3)]

def get_obj_world_bbox(obj):
    objs = [obj] if obj.type == 'MESH' else []
    objs.extend([c for c in obj.children_recursive if c.type == 'MESH'])
    all_vs = []
    for o in objs:
        all_vs.extend([o.matrix_world @ v.co for v in o.data.vertices])
    if not all_vs:
        return None
    
    b_min = [min(v[i] for v in all_vs) for i in range(3)]
    b_max = [max(v[i] for v in all_vs) for i in range(3)]
    b_cen = [(b_min[i] + b_max[i]) / 2.0 for i in range(3)]

    # Convert bounding box min, max, center to glTF coordinates:
    # Notice that min and max for Z must invert because Z = -blend_Y:
    # gltf_min_z = -b_max[1], gltf_max_z = -b_min[1]
    gltf_min = [round(b_min[0], 3), round(b_min[2], 3), round(-b_max[1], 3)]
    gltf_max = [round(b_max[0], 3), round(b_max[2], 3), round(-b_min[1], 3)]
    gltf_cen = [round(b_cen[0], 3), round(b_cen[2], 3), round(-b_cen[1], 3)]
    size = [round(gltf_max[i] - gltf_min[i], 3) for i in range(3)]

    return {
        'blender_min': [round(x, 3) for x in b_min],
        'blender_max': [round(x, 3) for x in b_max],
        'blender_center': [round(x, 3) for x in b_cen],
        'min': gltf_min,
        'max': gltf_max,
        'center': gltf_cen,
        'size': size
    }

# Room bounds in Blender world space:
# floor X: ~ -0.01 to 10.0, Y: -9.89 to 0.00, Z: 0.00 to 6.98
room_min_b = [-0.1, -9.9, -0.1]
room_max_b = [10.1, 0.1, 7.0]

section_mapping = {
    'about': {
        'sectionName': 'ABOUT THE CLUB',
        'blenderObjectName': 'Samsung Odyssey G8 Monitor 34inch',
        'description': 'Dual Gaming Curved Display Station',
        'preferredSide': 'right'
    },
    'projects': {
        'sectionName': 'PROJECTS & SHOWCASE',
        'blenderObjectName': 'Gaming Computer Case',
        'description': 'Custom Liquid-Cooled RGB Rig',
        'preferredSide': 'left'
    },
    'events': {
        'sectionName': 'EVENTS & WORKSHOPS',
        'blenderObjectName': 'Cloud shelf',
        'description': 'Floating Cloud LED Shelf & Game Collection',
        'preferredSide': 'left'
    },
    'learning': {
        'sectionName': 'LEARNING & MENTORSHIP',
        'blenderObjectName': 'Geometric Display Shelf',
        'description': 'Modular Bookcase with 3D Design Library',
        'preferredSide': 'right'
    },
    'gallery': {
        'sectionName': 'COMMUNITY ART GALLERY',
        'blenderObjectName': 'Framed gaming art',
        'description': 'Framed Wall Art Showcase',
        'preferredSide': 'right'
    },
    'team': {
        'sectionName': 'LEADERSHIP & CREATORS',
        'blenderObjectName': 'Gaming chair/chair',
        'description': 'Ergonomic Creator Cockpit Chair',
        'preferredSide': 'right'
    },
    'community': {
        'sectionName': 'STUDIO COMMUNITY',
        'blenderObjectName': 'Next generation gaming chair concept',
        'description': 'Cyber Lounge Pod & Battle Station',
        'preferredSide': 'left'
    },
    'join': {
        'sectionName': 'JOIN THE MATRIX',
        'blenderObjectName': 'Gamer neon  sign',
        'description': 'PlayStation PlayStation Neon Light Wall',
        'preferredSide': 'right'
    }
}

print("[3/6] Computing world-space bounding boxes and room boundary checks...")
anchors_data = {
    'roomBounds': {
        'blender_min': room_min_b,
        'blender_max': room_max_b,
        'min': [round(room_min_b[0], 3), round(room_min_b[2], 3), round(-room_max_b[1], 3)],
        'max': [round(room_max_b[0], 3), round(room_max_b[2], 3), round(-room_min_b[1], 3)],
        'center': [5.0, 3.5, 4.95],
        'size': [10.0, 7.0, 9.9]
    },
    'sections': {}
}

print("\n" + "="*85)
print(f"{'SECTION':<12} | {'OBJECT NAME':<34} | {'BBOX CENTER (glTF)':<22} | {'INSIDE ROOM?'}")
print("="*85)

for sec_id, info in section_mapping.items():
    obj_name = info['blenderObjectName']
    obj = bpy.data.objects.get(obj_name)
    if not obj:
        print(f"WARNING: Object '{obj_name}' for section '{sec_id}' NOT FOUND!")
        anchors_data['sections'][sec_id] = {
            'exists': False,
            'blenderObjectName': obj_name,
            'sectionName': info['sectionName']
        }
        continue

    bbox = get_obj_world_bbox(obj)
    if not bbox:
        print(f"WARNING: No mesh geometry for '{obj_name}'!")
        continue

    bc = bbox['blender_center']
    inside = (
        room_min_b[0] <= bc[0] <= room_max_b[0] and
        room_min_b[1] <= bc[1] <= room_max_b[1] and
        room_min_b[2] <= bc[2] <= room_max_b[2]
    )

    cen_str = f"[{bbox['center'][0]:.2f}, {bbox['center'][1]:.2f}, {bbox['center'][2]:.2f}]"
    print(f"{sec_id:<12} | {obj_name:<34} | {cen_str:<22} | {'YES' if inside else 'NO (OUTSIDE)'}")

    anchors_data['sections'][sec_id] = {
        'exists': True,
        'blenderObjectName': obj_name,
        'sectionName': info['sectionName'],
        'description': info['description'],
        'preferredSide': info['preferredSide'],
        'bbox': bbox,
        'insideRoom': inside
    }

print("="*85 + "\n")

# Save anchors.json
with open(anchors_path, "w", encoding="utf-8") as f:
    json.dump(anchors_data, f, indent=2)
print(f"[4/6] Saved anchors to {anchors_path}")

# 4. Export room.glb containing the ENTIRE room in a single unified coordinate space
print("[5/6] Selecting all room objects and exporting room.glb...")
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.type in ['MESH', 'CURVE']:
        obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=glb_path,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_yup=True,
    export_image_format='JPEG',
    export_jpeg_quality=85,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12
)

size_mb = os.path.getsize(glb_path) / (1024 * 1024)
print(f"[6/6] SUCCESS! room.glb exported cleanly ({size_mb:.2f} MB)")
print("Export script execution completed.")
