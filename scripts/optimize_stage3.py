import bpy
import os

print("===================================================================")
print("     OPTIMIZE STAGE 3: TARGET < 250K TRIS & < 50 MESHES            ")
print("===================================================================")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.open_mainfile(filepath=blend_file)

# 1. Decimate high-poly meshes
targets_s3 = {
    "Cylinder.007": 0.1,    # Headset from 135k -> ~13k tris
    "base": 0.25,            # Dell monitor from 45k -> ~11k tris
    "MouseThermaltakeBlack": 0.2, # Mouse from 23k -> ~4.5k tris
    "MicroUSB": 0.1,
    "Led": 0.1,
    "Hinge": 0.1,
    "PowerButton": 0.1,
    "USB-C": 0.1,
    "USB-C.001": 0.1,
    "ConicRing": 0.1,
    "Acer Nitro 7 Gaming Laptop": 0.4
}

for name, ratio in targets_s3.items():
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        print(f"Decimating {name} by {ratio}...")
        dec = obj.modifiers.new("Decimate_S3", 'DECIMATE')
        dec.ratio = ratio
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier="Decimate_S3")

# 2. Join remaining compound objects
# 2a. Desk: join shelves and backplane to desk
desk_parts = ["backplane", "Shelf Left", "Shelf Right", "Shelf Middle", "K-Legs", "Tabletop"]
desk_objs = [bpy.data.objects.get(n) for n in desk_parts if bpy.data.objects.get(n) and bpy.data.objects.get(n).type == 'MESH']
if len(desk_objs) > 1:
    print(f"Joining {len(desk_objs)} desk parts...")
    bpy.ops.object.select_all(action='DESELECT')
    for o in desk_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = desk_objs[0]
    try:
        bpy.ops.object.join()
        print("  -> Joined desk parts successfully!")
    except Exception as e:
        print(f"  -> Desk join failed: {e}")

# 2b. Chairs: join child meshes
for chair_root_name in ['Gaming chair/chair', 'Next generation gaming chair concept']:
    root_obj = bpy.data.objects.get(chair_root_name)
    if not root_obj:
        continue
    child_meshes = [c for c in root_obj.children_recursive if c.type == 'MESH']
    if root_obj.type == 'MESH':
        child_meshes.append(root_obj)
    if len(child_meshes) > 1:
        print(f"Joining {len(child_meshes)} parts for {chair_root_name}...")
        bpy.ops.object.select_all(action='DESELECT')
        for m in child_meshes:
            m.select_set(True)
        # Choose one mesh as active target
        active_target = child_meshes[0]
        bpy.context.view_layer.objects.active = active_target
        try:
            bpy.ops.object.join()
            print(f"  -> Joined chair parts into {active_target.name}")
            # decimate joined chair mesh slightly
            dec = active_target.modifiers.new("Decimate_Chair", 'DECIMATE')
            dec.ratio = 0.5
            bpy.ops.object.modifier_apply(modifier="Decimate_Chair")
        except Exception as e:
            print(f"  -> Chair join failed: {e}")

# 2c. Small laptop loose parts (MicroUSB, Hinge, PowerButton, etc.)
laptop_loose = ["MicroUSB", "Led", "Hinge", "PowerButton", "USB-C", "USB-C.001", "ConicRing", "SpeakerGrill", "OuterRing", "MiniDisplayPort"]
laptop_objs = [bpy.data.objects.get(n) for n in laptop_loose if bpy.data.objects.get(n) and bpy.data.objects.get(n).type == 'MESH']
laptop_main = bpy.data.objects.get("Acer Nitro 7 Gaming Laptop")
if laptop_main and laptop_objs:
    print(f"Joining {len(laptop_objs)} loose laptop parts into Acer Nitro 7...")
    bpy.ops.object.select_all(action='DESELECT')
    for o in laptop_objs:
        o.select_set(True)
    laptop_main.select_set(True)
    bpy.context.view_layer.objects.active = laptop_main
    try:
        bpy.ops.object.join()
        print("  -> Joined laptop parts!")
    except Exception as e:
        print(f"  -> Laptop parts join failed: {e}")

# 3. Clean up textures in Blender
print("\nDownscaling textures: max 1024, monitor screen max 2048...")
for img in bpy.data.images:
    try:
        w, h = img.size
        if w == 0 or h == 0:
            continue
        # Check if monitor screen
        is_screen = "screen" in img.name.lower() or "wallpaper" in img.name.lower()
        max_dim = 2048 if is_screen else 1024
        if w > max_dim or h > max_dim:
            ratio = float(max_dim) / max(w, h)
            nw = max(int(w * ratio), 64)
            nh = max(int(h * ratio), 64)
            img.scale(nw, nh)
            print(f"  Resized {img.name} from {w}x{h} to {nw}x{nh}")
    except Exception as e:
        pass

# 4. Remove unreferenced data
for _ in range(3):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# 5. Report new metrics
dg = bpy.context.evaluated_depsgraph_get()
final_tris = 0
mesh_count = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.data:
        mesh_count += 1
        eval_obj = obj.evaluated_get(dg)
        final_tris += sum(len(p.vertices) - 2 for p in eval_obj.data.polygons)

print(f"\n=======================================================")
print(f"STAGE 3 FINAL RESULT:")
print(f"TOTAL MESH OBJECTS: {mesh_count}")
print(f"TOTAL TRIANGLES (Evaluated): {final_tris:,}")
print(f"=======================================================\n")

bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
