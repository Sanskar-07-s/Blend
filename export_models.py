import bpy
import os

out_dir = r"d:\Blender\blender-club-3d-studio\public\models"
os.makedirs(out_dir, exist_ok=True)

# Helper function to deselect all and select a collection's objects
def select_collection_objects(col_name):
    bpy.ops.object.select_all(action='DESELECT')
    if col_name in bpy.data.collections:
        col = bpy.data.collections[col_name]
        for obj in col.all_objects:
            if obj.type in ['MESH', 'EMPTY', 'CURVE']:
                obj.select_set(True)
        return True
    return False

# 1. Export Room Shell (Collection: 'Collection' -> floor, walls, roof)
if select_collection_objects('Collection'):
    path = os.path.join(out_dir, "room.glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_format='GLB',
        export_apply=True
    )
    print("Exported room.glb")

# 2. Export Monitor (Samsung Odyssey G8 + Dell monitor)
bpy.ops.object.select_all(action='DESELECT')
for col_name in ['Samsung Odyssey G8 Monitor 34inch', 'Dell monitor 24 inch S2421HN']:
    if col_name in bpy.data.collections:
        for obj in bpy.data.collections[col_name].all_objects:
            if obj.type in ['MESH', 'EMPTY', 'CURVE']:
                obj.select_set(True)
path = os.path.join(out_dir, "monitor.glb")
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True
)
print("Exported monitor.glb")

# 3. Export Workstation (Desk + Mousepad + Keyboard + Mouse + Headset + Laptop)
bpy.ops.object.select_all(action='DESELECT')
for col_name in [
    'Gaming Desk With Monitor Shelf',
    'Gaming Mousepad 01',
    'rgb gaming keyboard',
    'Gaming Mouse',
    'Razer kraken headset gaming',
    'Acer Nitro 7 Gaming Laptop'
]:
    if col_name in bpy.data.collections:
        for obj in bpy.data.collections[col_name].all_objects:
            if obj.type in ['MESH', 'EMPTY', 'CURVE']:
                obj.select_set(True)
path = os.path.join(out_dir, "workstation.glb")
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True
)
print("Exported workstation.glb")

# 4. Export PC Case ('Gaming Computer Case')
if select_collection_objects('Gaming Computer Case'):
    path = os.path.join(out_dir, "pc.glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        use_selection=True,
        export_format='GLB',
        export_apply=True
    )
    print("Exported pc.glb")

# 5. Export Gaming Chair ('Gaming chair/chair' or 'Next generation gaming chair concept')
bpy.ops.object.select_all(action='DESELECT')
for col_name in ['Gaming chair/chair', 'Next generation gaming chair concept']:
    if col_name in bpy.data.collections:
        for obj in bpy.data.collections[col_name].all_objects:
            if obj.type in ['MESH', 'EMPTY', 'CURVE']:
                obj.select_set(True)
path = os.path.join(out_dir, "chair.glb")
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True
)
print("Exported chair.glb")

# 6. Export Shelves & Gaming Decor ('Wooden Display Shelf', 'Geometric Display Shelf', 'Cloud shelf', 'Framed gaming art', 'Gamer neon  sign')
bpy.ops.object.select_all(action='DESELECT')
for col_name in [
    'Wooden Display Shelf',
    'Geometric Display Shelf',
    'Cloud shelf',
    'Framed gaming art',
    'Gamer neon  sign',
    'Game Cases Pack 5',
    'PS5 games',
    'Xbox one games',
    'Books',
    'Modern Design Book Pack',
    'Individual Book Collection 1',
    'Stacked set of books'
]:
    if col_name in bpy.data.collections:
        for obj in bpy.data.collections[col_name].all_objects:
            if obj.type in ['MESH', 'EMPTY', 'CURVE']:
                obj.select_set(True)
path = os.path.join(out_dir, "shelf.glb")
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True
)
print("Exported shelf.glb")

# 7. Export full merged room for ultra-rich aesthetic
bpy.ops.object.select_all(action='DESELECT')
for obj in bpy.data.objects:
    if obj.type in ['MESH', 'CURVE']:
        obj.select_set(True)
path = os.path.join(out_dir, "gaming_room_full.glb")
bpy.ops.export_scene.gltf(
    filepath=path,
    use_selection=True,
    export_format='GLB',
    export_apply=True
)
print("Exported gaming_room_full.glb")
print("ALL EXPORTS COMPLETED!")
