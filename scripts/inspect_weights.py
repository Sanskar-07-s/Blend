import bpy
import json
import os

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
print("Loading blend file...")
bpy.ops.wm.open_mainfile(filepath=blend_file)

# 1. Analyze meshes in Blender scene
mesh_data = []
total_tris = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.data:
        # evaluate with modifiers to see active geometry
        dg = bpy.context.evaluated_depsgraph_get()
        eval_obj = obj.evaluated_get(dg)
        eval_mesh = eval_obj.data
        poly_count = len(eval_mesh.polygons)
        # approximate triangle count
        tri_count = sum(len(p.vertices) - 2 for p in eval_mesh.polygons)
        total_tris += tri_count
        mats = [m.name for m in obj.data.materials if m]
        mods = [f"{m.type}:{m.name}" for m in obj.modifiers if m.show_viewport or m.show_render]
        
        # parent group
        p = obj.parent
        parent_name = p.name if p else "None"
        
        mesh_data.append({
            "name": obj.name,
            "parent": parent_name,
            "triangles": tri_count,
            "polygons": poly_count,
            "materials": mats,
            "modifiers": mods,
            "users": obj.data.users
        })

mesh_data.sort(key=lambda x: x["triangles"], reverse=True)

print(f"\n=======================================================")
print(f"TOTAL OBJECTS: {len(mesh_data)}")
print(f"TOTAL TRIANGLES (Evaluated): {total_tris:,}")
print(f"=======================================================\n")

print("TOP 25 MESHES BY TRIANGLE COUNT:")
print(f"{'Rank':<4} | {'Object Name':<30} | {'Parent':<18} | {'Triangles':<10} | {'Modifiers'}")
print("-" * 90)
for idx, m in enumerate(mesh_data[:25], 1):
    mods_str = ", ".join(m["modifiers"]) if m["modifiers"] else "None"
    print(f"{idx:<4} | {m['name'][:30]:<30} | {m['parent'][:18]:<18} | {m['triangles']:<10,d} | {mods_str}")

# 2. Analyze images
images_data = []
for img in bpy.data.images:
    w, h = img.size
    if w > 0 and h > 0:
        mem = int(w * h * 4 * 1.33)
        images_data.append({
            "name": img.name,
            "width": w,
            "height": h,
            "memory": mem,
            "memory_mb": round(mem / (1024 * 1024), 2),
            "filepath": img.filepath,
            "users": img.users
        })

images_data.sort(key=lambda x: x["memory"], reverse=True)

print(f"\n=======================================================")
print(f"TOTAL IMAGES: {len(images_data)}")
total_img_mem = sum(img["memory"] for img in images_data)
print(f"TOTAL TEXTURE VRAM: {round(total_img_mem / (1024 * 1024), 2)} MB")
print(f"=======================================================\n")

print("TOP 15 TEXTURES BY MEMORY (w x h x 4 x 1.33):")
print(f"{'Rank':<4} | {'Image Name':<35} | {'Dimensions':<12} | {'Est. VRAM (MB)':<14} | {'Users'}")
print("-" * 80)
for idx, im in enumerate(images_data[:15], 1):
    dim_str = f"{im['width']}x{im['height']}"
    print(f"{idx:<4} | {im['name'][:35]:<35} | {dim_str:<12} | {im['memory_mb']:<14} | {im['users']}")

# 3. Categorize triangles by group / category
cat_tris = {}
for m in mesh_data:
    cat = m["parent"]
    cat_tris[cat] = cat_tris.get(cat, 0) + m["triangles"]

print(f"\n=======================================================")
print("TRIANGLES PER PARENT / GROUP:")
print(f"=======================================================")
for cat, tris in sorted(cat_tris.items(), key=lambda x: x[1], reverse=True):
    print(f"{cat:<25}: {tris:<12,d} ({round(tris/total_tris*100, 1)}%)")
