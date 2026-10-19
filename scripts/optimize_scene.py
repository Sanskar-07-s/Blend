import bpy
import os
import math

print("===================================================================")
print("     OPTIMIZE GAMINGROOM.BLEND - GEOMETRY & MODIFIER CLEANUP       ")
print("===================================================================")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.open_mainfile(filepath=blend_file)

# 1. REMOVE OR STRIP SUBSURF & UNNECESSARY MODIFIERS
print("\n[1/5] Removing SUBSURF and heavy modifiers on props...")
for obj in list(bpy.data.objects):
    if obj.type != 'MESH':
        continue
    
    # Check modifiers
    for mod in list(obj.modifiers):
        if mod.type == 'SUBSURF':
            print(f"  - Removing SUBSURF on: {obj.name}")
            obj.modifiers.remove(mod)
        elif mod.type == 'BEVEL':
            # clamp bevel segments to 1
            if mod.segments > 1:
                mod.segments = 1
                mod.width = min(mod.width, 0.01)
        elif mod.type == 'SOLIDIFY':
            # clamp solidify thickness if excessive
            pass

# 2. SPECIFIC HEAVY MESH REDUCTIONS
print("\n[2/5] Decimating massive raw geometry meshes...")

# 2a. Headset grid (2.5M tris -> low-poly disc)
grid_obj = bpy.data.objects.get("grid")
if grid_obj and grid_obj.type == 'MESH':
    print(f"  - Decimating headset grid (polys: {len(grid_obj.data.polygons):,})...")
    dec = grid_obj.modifiers.new("Decimate", 'DECIMATE')
    dec.ratio = 0.002 # from 1.2M down to ~2,400 polys
    bpy.context.view_layer.objects.active = grid_obj
    bpy.ops.object.modifier_apply(modifier="Decimate")
    print(f"    New grid polys: {len(grid_obj.data.polygons):,}")

# 2b. Cloud shelf (1.4M tris -> ~20k tris)
cloud_obj = bpy.data.objects.get("Cloud shelf")
if cloud_obj and cloud_obj.type == 'MESH':
    print(f"  - Decimating Cloud shelf (polys: {len(cloud_obj.data.polygons):,})...")
    dec = cloud_obj.modifiers.new("Decimate", 'DECIMATE')
    dec.ratio = 0.025 # from 700k down to ~17k polys
    bpy.context.view_layer.objects.active = cloud_obj
    bpy.ops.object.modifier_apply(modifier="Decimate")
    print(f"    New Cloud shelf polys: {len(cloud_obj.data.polygons):,}")

# 2c. Dell monitor components
dell_names = ["Housing", "usb", "usb2", "Stand", "suport", "Power jack"]
for dname in dell_names:
    d_obj = bpy.data.objects.get(dname)
    if d_obj and d_obj.type == 'MESH' and len(d_obj.data.polygons) > 1000:
        print(f"  - Decimating {dname} (polys: {len(d_obj.data.polygons):,})...")
        dec = d_obj.modifiers.new("Decimate", 'DECIMATE')
        dec.ratio = 0.1
        bpy.context.view_layer.objects.active = d_obj
        bpy.ops.object.modifier_apply(modifier="Decimate")

# 2d. Chair parts
chair_high_poly = [
    "Plane.017", "Plane.015", "Plane.013", "Plane.024", "Plane.027",
    "Cube.029", "Cube.037", "Cube.027",
    "Cylinder.009", "Cylinder.010", "Cylinder.011", "Cylinder.012", "Cylinder.013"
]
for cname in chair_high_poly:
    c_obj = bpy.data.objects.get(cname)
    if c_obj and c_obj.type == 'MESH':
        poly_count = len(c_obj.data.polygons)
        if poly_count > 2000:
            print(f"  - Decimating chair part {cname} (polys: {poly_count:,})...")
            dec = c_obj.modifiers.new("Decimate", 'DECIMATE')
            dec.ratio = min(0.15, 1500.0 / poly_count)
            bpy.context.view_layer.objects.active = c_obj
            bpy.ops.object.modifier_apply(modifier="Decimate")

# 2e. Laptop and other props
laptop = bpy.data.objects.get("Acer Nitro 7 Gaming Laptop")
if laptop and laptop.type == 'MESH':
    print(f"  - Decimating Laptop (polys: {len(laptop.data.polygons):,})...")
    dec = laptop.modifiers.new("Decimate", 'DECIMATE')
    dec.ratio = 0.15
    bpy.context.view_layer.objects.active = laptop
    bpy.ops.object.modifier_apply(modifier="Decimate")

# 2f. Game cases & Books
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        pname = obj.parent.name if obj.parent else ""
        if "games" in pname.lower() or "book" in pname.lower() or "cases" in pname.lower():
            if len(obj.data.polygons) > 2000:
                print(f"  - Decimating {obj.name} under {pname} (polys: {len(obj.data.polygons):,})...")
                dec = obj.modifiers.new("Decimate", 'DECIMATE')
                dec.ratio = min(0.1, 500.0 / len(obj.data.polygons))
                bpy.context.view_layer.objects.active = obj
                bpy.ops.object.modifier_apply(modifier="Decimate")

# 3. Apply any remaining Decimate or WeightedNormal modifiers so mesh data is final
print("\n[3/5] Applying remaining non-subsurf modifiers on all meshes...")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for mod in list(obj.modifiers):
            if mod.type in ['DECIMATE', 'MIRROR', 'SOLIDIFY']:
                try:
                    bpy.context.view_layer.objects.active = obj
                    bpy.ops.object.modifier_apply(modifier=mod.name)
                except Exception as e:
                    pass

# 4. MEASURE NEW TRIANGLE COUNT
dg = bpy.context.evaluated_depsgraph_get()
new_total_tris = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.data:
        eval_obj = obj.evaluated_get(dg)
        new_total_tris += sum(len(p.vertices) - 2 for p in eval_obj.data.polygons)

print(f"\n=======================================================")
print(f"NEW EVALUATED TRIANGLE COUNT: {new_total_tris:,}")
print(f"=======================================================\n")

# Save cleaned blend file
bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved cleaned GamingRoom.blend successfully!")
