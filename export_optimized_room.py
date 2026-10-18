import bpy
import os

out_dir = r"d:\Blender\blender-club-3d-studio\public\models"
os.makedirs(out_dir, exist_ok=True)

# 1. Resize all images over 1024 to 1024 to dramatically improve loading speed and frame rate
print("Resizing high-res textures to 1024...")
for img in bpy.data.images:
    try:
        w, h = img.size
        if w > 1024 or h > 1024:
            new_w = min(w, 1024)
            new_h = min(h, 1024)
            # keep aspect ratio
            if w > h:
                new_h = int(h * (1024 / w))
                new_w = 1024
            else:
                new_w = int(w * (1024 / h))
                new_h = 1024
            img.scale(max(new_w, 64), max(new_h, 64))
            print(f"Resized {img.name} from {w}x{h} to {img.size[0]}x{img.size[1]}")
    except Exception as e:
        print(f"Could not resize {img.name}: {e}")

# Center of room floor in Blender coordinates:
# floor center: X = 5.0, Y = -4.94, Z = 0.0
# We want this scene exported cleanly
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.type in ['MESH', 'CURVE']:
        obj.select_set(True)

path = os.path.join(out_dir, "gaming_room_full.glb")
print(f"Exporting optimized {path}...")
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True,
    export_image_format='JPEG',
    export_jpeg_quality=85
)
print("Finished exporting gaming_room_full.glb!")
