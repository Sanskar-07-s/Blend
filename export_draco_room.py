import bpy
import os

print("[1/5] Opening GamingRoom.blend and preparing ultra-optimized export...")

# Step 1: Ensure all materials use double-sided rendering and emissive setup
for mat in bpy.data.materials:
    # Disable backface culling in Blender so both sides render
    mat.use_backface_culling = False
    
    # Check if this is the black metal wall / floor material
    if mat.name == 'Black metal' and mat.node_tree:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf:
            # Prevent pure black pitch darkness by lightening base color tint and adjusting roughness
            if 'Base Color' in bsdf.inputs and not bsdf.inputs['Base Color'].is_linked:
                bsdf.inputs['Base Color'].default_value = (0.08, 0.07, 0.12, 1.0)
            if 'Roughness' in bsdf.inputs and not bsdf.inputs['Roughness'].is_linked:
                bsdf.inputs['Roughness'].default_value = 0.4
    
    # Check PlayStation neon signs (O, square, Triangel, X)
    if mat.name in ['O', 'square', 'Triangel', 'X'] and mat.node_tree:
        bsdf = mat.node_tree.nodes.get('Principled BSDF')
        if bsdf and 'Emission Color' in bsdf.inputs:
            base_col = bsdf.inputs['Base Color'].default_value
            bsdf.inputs['Emission Color'].default_value = (base_col[0], base_col[1], base_col[2], 1.0)
            if 'Emission Strength' in bsdf.inputs:
                bsdf.inputs['Emission Strength'].default_value = 5.0

print("[2/5] Downscaling packed images to max 1024 to slash VRAM and boost FPS...")
# Step 2: Downscale all images to max 1024
for img in bpy.data.images:
    try:
        w, h = img.size
        if w > 1024 or h > 1024:
            scale_ratio = 1024.0 / max(w, h)
            new_w = max(int(w * scale_ratio), 64)
            new_h = max(int(h * scale_ratio), 64)
            img.scale(new_w, new_h)
            print(f"Resized {img.name} from {w}x{h} -> {new_w}x{new_h}")
    except Exception as e:
        print(f"Skip {img.name}: {e}")

print("[3/5] Selecting all mesh objects...")
# Step 3: Select all renderable mesh and curve objects
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.type in ['MESH', 'CURVE']:
        obj.select_set(True)

out_dir = r"d:\Blender\blender-club-3d-studio\public\models"
os.makedirs(out_dir, exist_ok=True)
path = os.path.join(out_dir, "gaming_room_full.glb")

print(f"[4/5] Exporting with Draco compression to {path}...")
# Step 4: Export with Draco compression to get file well under 50MB (fast load, github compatible, 60fps)
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_image_format='JPEG',
    export_jpeg_quality=80,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12
)

file_size_mb = os.path.getsize(path) / (1024 * 1024)
print(f"[5/5] SUCCESS! Exported {path} ({file_size_mb:.2f} MB)")
