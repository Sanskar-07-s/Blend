import bpy

print("===================================================================")
print("     STRIP UNUSED PBR MAPS (HEIGHT, SPECULAR, DISPLACEMENT, AO)    ")
print("===================================================================")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.open_mainfile(filepath=blend_file)

# 1. Remove displacement and height/bump/specular nodes across all materials
for mat in bpy.data.materials:
    if not mat.node_tree:
        continue
    nodes = mat.node_tree.nodes
    for n in list(nodes):
        if n.type == 'DISPLACEMENT':
            nodes.remove(n)
        elif n.type == 'TEX_IMAGE' and n.image:
            iname = n.image.name.lower()
            # Remove displacement, height, specular, alpha, and unused secondary maps
            if any(term in iname for term in ['disp', 'height', 'specular', 'bump', 'alpha', 'fov', 'pubg']):
                print(f"Removing unneeded map '{n.image.name}' from '{mat.name}'")
                nodes.remove(n)

# 2. For metal, carbonfiber, and keyboard: keep only base color (and normal if needed), remove duplicate maps
for mat in bpy.data.materials:
    if not mat.node_tree:
        continue
    mname = mat.name.lower()
    if any(k in mname for k in ['metal', 'carbon', 'key', 'base', 'chip', 'mane', 'screw', 'rubber']):
        nodes = mat.node_tree.nodes
        for n in list(nodes):
            if n.type == 'TEX_IMAGE' and n.image:
                iname = n.image.name.lower()
                if 'rough' in iname or 'metal' in iname or 'orm' in iname or 'emission' in iname:
                    print(f"  Removing extra PBR texture '{n.image.name}' from '{mat.name}'")
                    nodes.remove(n)

# 3. Replace any Dell screen wallpaper with a dark procedural texture or shared wallpaper
dell_screen_mat = bpy.data.materials.get("screen matte") or bpy.data.materials.get("Screen")
screen_wallpaper_img = bpy.data.images.get("Generic_Wallpaper_Texture") or bpy.data.images.get("Wallpaper.jpg")
if dell_screen_mat and screen_wallpaper_img:
    if dell_screen_mat.node_tree:
        for n in dell_screen_mat.node_tree.nodes:
            if n.type == 'TEX_IMAGE':
                n.image = screen_wallpaper_img

# 4. Purge unused images & datablocks
for _ in range(4):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# 5. Count active images in scene
used_images = set()
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        for slot in obj.material_slots:
            if slot.material and slot.material.node_tree:
                for n in slot.material.node_tree.nodes:
                    if n.type == 'TEX_IMAGE' and n.image:
                        used_images.add(n.image.name)

print("\n=======================================================")
print(f"FINAL REMAINING TEXTURES IN SCENE: {len(used_images)}")
print("=======================================================")
for im in sorted(used_images):
    img_obj = bpy.data.images.get(im)
    dims = f"{img_obj.size[0]}x{img_obj.size[1]}" if img_obj else "unknown"
    print(f"  * {im:<40} ({dims})")

bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
