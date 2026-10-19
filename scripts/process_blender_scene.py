import bpy
import bmesh
import math
import os
import json
import numpy as np

print("===================================================================")
print("     BLENDER CLUB - STUDIO PALETTE & READABLE LIGHTING UPDATE     ")
print("===================================================================")

def hex_to_linear(hex_str):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    def to_lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_lin(r), to_lin(g), to_lin(b), 1.0)

# Colors from src/config/palette.ts (Studio Preset)
C_WALL_MAIN = hex_to_linear("#2B3038")       # Graphite blue-gray
C_WALL_FEATURE = hex_to_linear("#343A44")    # Back/feature wall
C_WALL_TRIM = hex_to_linear("#1B1E24")       # Trim / baseboards / ceiling
C_FLOOR_OAK = hex_to_linear("#3A2C22")       # Warm dark oak
C_DESK_MAT = hex_to_linear("#1D2026")        # Rug / desk mat
C_FURNITURE_BASE = hex_to_linear("#1A1D22")  # Lift near-black furniture
C_ACCENT_ORANGE = hex_to_linear("#F28C28")   # Blender orange
C_ACCENT_SOFT = hex_to_linear("#FFB765")     # Soft accent orange
C_WARM_3000K = hex_to_linear("#FFC98A")      # Warm desk/shelf light
C_COOL_RIM = hex_to_linear("#9CC3FF")        # Cool secondary rim

def get_or_create_mat(name, base_color, metallic=0.0, roughness=0.5, emission=None, emission_strength=1.0):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    node_out = nodes.new(type='ShaderNodeOutputMaterial')
    node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    node_bsdf.inputs['Base Color'].default_value = base_color
    node_bsdf.inputs['Metallic'].default_value = metallic
    node_bsdf.inputs['Roughness'].default_value = roughness
    if emission:
        if 'Emission Color' in node_bsdf.inputs:
            node_bsdf.inputs['Emission Color'].default_value = emission
            node_bsdf.inputs['Emission Strength'].default_value = emission_strength
    mat.node_tree.links.new(node_bsdf.outputs['BSDF'], node_out.inputs['Surface'])
    return mat

# 1. REMOVE LOGOS & SURPLUS NEON
print("[1/6] Cleaning up logos and surplus emissive objects...")
unwanted_names = [
    'Samsung_Odyssey_Logo', 'Logo', 'Logo ', 'razer logo',
    'Ceiling_LED', 'Wall_Strip', 'Neon_Pillar'
]
removed_objects = []
for name in unwanted_names:
    obj = bpy.data.objects.get(name)
    if obj:
        print(f"  Removing: {name}")
        bpy.data.objects.remove(obj, do_unlink=True)
        removed_objects.append(name)

# 2. UPDATE OR CREATE RETINTED WALLPAPER FOR SCREEN
print("[2/6] Generating Blender orange retinted wallpaper texture...")
tex_name = "Generic_Wallpaper_Texture"
img = bpy.data.images.get(tex_name)
if not img:
    img = bpy.data.images.new(tex_name, width=1024, height=512, alpha=False, float_buffer=True)

w, h = 1024, 512
y_coords, x_coords = np.mgrid[0:h, 0:w]
norm_y = y_coords / (h - 1)
norm_x = x_coords / (w - 1)

# Base dark neutral gradient: #0F1115 (bottom) to #1A1D24 (top)
r_bot, g_bot, b_bot = 0.059, 0.067, 0.082
r_top, g_top, b_top = 0.102, 0.114, 0.141

r_plane = r_bot + (r_top - r_bot) * (norm_y ** 1.1)
g_plane = g_bot + (g_top - g_bot) * (norm_y ** 1.1)
b_plane = b_bot + (b_top - b_bot) * (norm_y ** 1.1)

# Centered elegant geometric arc / Blender orange ring
cx, cy = 0.5, 0.52
dx = (norm_x - cx) * 2.0
dy = (norm_y - cy)
dist = np.sqrt(dx**2 + (dy * 1.5)**2)
target_r = 0.38
ring_mask = np.exp(-((dist - target_r) ** 2) / (2 * (0.010 ** 2)))
ring_glow = np.exp(-((dist - target_r) ** 2) / (2 * (0.050 ** 2))) * 0.40

# Color in Blender orange #F28C28 and soft #FFB765
r_plane += (0.95 * ring_mask + 0.60 * ring_glow)
g_plane += (0.55 * ring_mask + 0.35 * ring_glow)
b_plane += (0.16 * ring_mask + 0.10 * ring_glow)

# Subtle horizontal hairline horizon in lower section
lower_mask = (norm_y < 0.35).astype(float)
persp_y = 0.35 - norm_y
persp_depth = 1.0 / (persp_y + 0.04)
h_lines = np.abs(np.sin(persp_depth * 0.7)) > 0.94
persp_x = (norm_x - 0.5) * persp_depth
v_lines = np.abs(np.sin(persp_x * 3.0)) > 0.95
grid = np.logical_or(h_lines, v_lines).astype(float) * lower_mask * 0.12

r_plane += grid * 0.95
g_plane += grid * 0.55
b_plane += grid * 0.16

r_plane = np.clip(r_plane, 0.0, 1.0)
g_plane = np.clip(g_plane, 0.0, 1.0)
b_plane = np.clip(b_plane, 0.0, 1.0)
a_plane = np.ones((h, w), dtype=float)

rgba = np.stack([r_plane, g_plane, b_plane, a_plane], axis=-1).astype(np.float32).flatten()
img.pixels.foreach_set(rgba)
img.update()

# Update Screen Material
mat_screen = bpy.data.materials.get("Generic_Screen_Wallpaper")
if not mat_screen:
    mat_screen = bpy.data.materials.new("Generic_Screen_Wallpaper")
mat_screen.use_nodes = True
s_nodes = mat_screen.node_tree.nodes
s_nodes.clear()
s_out = s_nodes.new(type='ShaderNodeOutputMaterial')
s_bsdf = s_nodes.new(type='ShaderNodeBsdfPrincipled')
s_tex = s_nodes.new(type='ShaderNodeTexImage')
s_tex.image = img
s_bsdf.inputs['Roughness'].default_value = 0.20
mat_screen.node_tree.links.new(s_tex.outputs['Color'], s_bsdf.inputs['Base Color'])
if 'Emission Color' in s_bsdf.inputs:
    mat_screen.node_tree.links.new(s_tex.outputs['Color'], s_bsdf.inputs['Emission Color'])
    s_bsdf.inputs['Emission Strength'].default_value = 1.0  # Capped at 1.0
mat_screen.node_tree.links.new(s_bsdf.outputs['BSDF'], s_out.inputs['Surface'])

# Also update secondary Screen material if present
mat_screen_sec = bpy.data.materials.get("Screen")
if mat_screen_sec and mat_screen_sec.node_tree:
    for n in mat_screen_sec.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            if 'Emission Strength' in n.inputs:
                n.inputs['Emission Strength'].default_value = 1.0

# 3. CREATE / ASSIGN PALETTE MATERIALS FOR WALLS, FLOOR, ROOF, AND MAT
print("[3/6] Applying palette materials for walls, floor, ceiling, and desk mat...")

mat_wall_main = get_or_create_mat("Wall_Main", C_WALL_MAIN, metallic=0.0, roughness=0.85)
mat_wall_feature = get_or_create_mat("Wall_Feature", C_WALL_FEATURE, metallic=0.0, roughness=0.85)
mat_ceiling = get_or_create_mat("Ceiling_Material", C_WALL_TRIM, metallic=0.0, roughness=0.90)
mat_floor = get_or_create_mat("Floor_Dark_Oak", C_FLOOR_OAK, metallic=0.05, roughness=0.55)
mat_desk_mat = get_or_create_mat("DeskMat_Material", C_DESK_MAT, metallic=0.0, roughness=0.70)
mat_baseboard = get_or_create_mat("Wall_Trim_Baseboard", C_WALL_TRIM, metallic=0.1, roughness=0.60)

# Make unique mesh copies for room shell objects so they do not share data
for obj_name in ['leftwall', 'rightwall', 'backwall', 'roof', 'floor']:
    obj = bpy.data.objects.get(obj_name)
    if obj and obj.type == 'MESH' and obj.data:
        obj.data = obj.data.copy()
        obj.data.name = f"{obj_name}_Mesh"

# Assign to objects
for obj_name, target_mat in [
    ('leftwall', mat_wall_main),
    ('rightwall', mat_wall_main),
    ('backwall', mat_wall_feature),
    ('roof', mat_ceiling),
    ('floor', mat_floor),
    ('Gaming Mousepad 01', mat_desk_mat),
]:
    obj = bpy.data.objects.get(obj_name)
    if obj and obj.type == 'MESH':
        obj.data.materials.clear()
        obj.data.materials.append(target_mat)
        print(f"  Assigned {target_mat.name} -> {obj_name}")

# 4. LIFT NEAR-BLACK BASE COLORS ON FURNITURE AND PROPS
print("[4/6] Lifting near-black base colors on furniture and props...")

# Reconfigure 'Black plastic PL.003' to Principled BSDF with #1A1D22
mat_bp = bpy.data.materials.get('Black plastic PL.003')
if mat_bp:
    mat_bp.use_nodes = True
    nodes = mat_bp.node_tree.nodes
    nodes.clear()
    n_out = nodes.new(type='ShaderNodeOutputMaterial')
    n_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    n_bsdf.inputs['Base Color'].default_value = C_FURNITURE_BASE
    n_bsdf.inputs['Roughness'].default_value = 0.55
    n_bsdf.inputs['Metallic'].default_value = 0.05
    mat_bp.node_tree.links.new(n_bsdf.outputs['BSDF'], n_out.inputs['Surface'])
    print("  Upgraded 'Black plastic PL.003' to PBR #1A1D22 (roughness 0.55)")

# Reconfigure 'Black metal' to visible dark graphite
mat_bm = bpy.data.materials.get('Black metal')
if mat_bm and mat_bm.node_tree:
    for n in mat_bm.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = C_FURNITURE_BASE
            n.inputs['Roughness'].default_value = 0.50
            n.inputs['Metallic'].default_value = 0.50

# 5. MINIMIZE NEON & RETINT REMAINING EMISSIVE SHADERS
print("[5/6] Tuning emissive shaders: sign, desk LED, shelf, PC...")

# A. Gamer neon sign (O, square, Triangel, X) -> Blender orange #F28C28, cap 1.6
for sign_mat_name in ['O', 'square', 'Triangel', 'X']:
    mat = bpy.data.materials.get(sign_mat_name)
    if mat and mat.node_tree:
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_ACCENT_ORANGE
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_ACCENT_ORANGE
                    n.inputs['Emission Strength'].default_value = 1.6
        print(f"  Neon sign mat '{sign_mat_name}' -> Blender orange #F28C28 (cap 1.6)")

# B. Desk/monitor LED strip (Generic_Monitor_RGB_Ring) -> soft accent #FFB765, cap 0.5
mat_ring = bpy.data.materials.get('Generic_Monitor_RGB_Ring')
if mat_ring and mat_ring.node_tree:
    for n in mat_ring.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Base Color'].default_value = C_ACCENT_SOFT
            if 'Emission Color' in n.inputs:
                n.inputs['Emission Color'].default_value = C_ACCENT_SOFT
                n.inputs['Emission Strength'].default_value = 0.5
    print("  Desk/monitor LED ring -> soft orange #FFB765 (cap 0.5)")

# C. Cloud shelf ('Luz', 'Material.011') -> faint warm strip 3000K, cap 0.2
for shelf_mat in ['Luz', 'Material.011']:
    mat = bpy.data.materials.get(shelf_mat)
    if mat and mat.node_tree:
        for n in mat.node_tree.nodes:
            if n.type == 'EMISSION':
                n.inputs['Color'].default_value = C_WARM_3000K
                n.inputs['Strength'].default_value = 0.2
            elif n.type == 'BSDF_PRINCIPLED':
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_WARM_3000K
                    n.inputs['Emission Strength'].default_value = 0.2
        print(f"  Shelf mat '{shelf_mat}' -> warm strip #FFC98A (cap 0.2)")

# D. PC fans / chassis ('emissions.blue') -> subtle warm accent, cap 0.4
mat_fan = bpy.data.materials.get('emissions.blue')
if mat_fan and mat_fan.node_tree:
    for n in mat_fan.node_tree.nodes:
        if n.type == 'EMISSION':
            n.inputs['Color'].default_value = C_ACCENT_SOFT
            n.inputs['Strength'].default_value = 0.4
        elif n.type == 'BSDF_PRINCIPLED':
            if 'Emission Color' in n.inputs:
                n.inputs['Emission Color'].default_value = C_ACCENT_SOFT
                n.inputs['Emission Strength'].default_value = 0.4
    print("  PC fan emissive -> soft orange #FFB765 (cap 0.4)")

# E. Laptop ('Led') -> soft accent, cap 0.4
mat_led = bpy.data.materials.get('Led')
if mat_led and mat_led.node_tree:
    for n in mat_led.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            if 'Emission Color' in n.inputs:
                n.inputs['Emission Color'].default_value = C_ACCENT_SOFT
                n.inputs['Emission Strength'].default_value = 0.4

# 6. ADD BASEBOARDS TO ROOM WALLS
print("[6/6] Generating architectural baseboards for walls...")
baseboard_h = 0.12  # 12cm height
baseboard_t = 0.02  # 2cm thickness

# Helper function to create a baseboard box along a wall
def create_baseboard(name, min_x, max_x, min_y, max_y, parent_wall):
    old = bpy.data.objects.get(name)
    if old:
        bpy.data.objects.remove(old, do_unlink=True)
    
    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm = bmesh.new()
    
    # 8 corners of the baseboard box
    z0 = 0.0
    z1 = baseboard_h
    v000 = bm.verts.new((min_x, min_y, z0))
    v100 = bm.verts.new((max_x, min_y, z0))
    v110 = bm.verts.new((max_x, max_y, z0))
    v010 = bm.verts.new((min_x, max_y, z0))
    v001 = bm.verts.new((min_x, min_y, z1))
    v101 = bm.verts.new((max_x, min_y, z1))
    v111 = bm.verts.new((max_x, max_y, z1))
    v011 = bm.verts.new((min_x, max_y, z1))
    
    bm.verts.ensure_lookup_table()
    bm.faces.new((v000, v100, v101, v001)) # Front
    bm.faces.new((v100, v110, v111, v101)) # Right
    bm.faces.new((v110, v010, v011, v111)) # Back
    bm.faces.new((v010, v000, v001, v011)) # Left
    bm.faces.new((v001, v101, v111, v011)) # Top
    bm.faces.new((v000, v010, v110, v100)) # Bottom
    
    bm.to_mesh(mesh)
    bm.free()
    
    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat_baseboard)
    bpy.context.scene.collection.objects.link(obj)
    if parent_wall:
        obj.parent = parent_wall
    return obj

left_wall = bpy.data.objects.get('leftwall')
back_wall = bpy.data.objects.get('backwall')
right_wall = bpy.data.objects.get('rightwall')

# Left wall baseboard (along X = 0 to 0.02, Y = -9.9 to 0)
create_baseboard("Baseboard_Left", 0.0, 0.02, -9.89, -0.02, left_wall)
# Back wall baseboard (along X = 0 to 10.0, Y = -0.02 to 0.0)
create_baseboard("Baseboard_Back", 0.02, 9.98, -0.02, 0.0, back_wall)
# Right wall baseboard (along X = 9.98 to 10.0, Y = -9.9 to 0)
create_baseboard("Baseboard_Right", 9.98, 10.0, -9.89, -0.02, right_wall)
print("  Created Baseboard_Left, Baseboard_Back, Baseboard_Right parented to respective walls.")

# Save updated blend file
save_path = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.save_as_mainfile(filepath=save_path, check_existing=False)
print(f"SUCCESS: Scene updated and saved to {save_path}")
