import bpy
import bmesh
import math
import os
import json
import numpy as np

print("===================================================================")
print("     BLENDER CLUB - REPLACE MONITOR & APPLY COLOR PALETTE          ")
print("===================================================================")

def hex_to_linear(hex_str):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    def to_lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (to_lin(r), to_lin(g), to_lin(b), 1.0)

# Colors
C_FLOOR_WALL = hex_to_linear("#0B0716")
C_PANEL = hex_to_linear("#14102A")
C_PRIMARY_VIOLET = hex_to_linear("#7C3AED")
C_BRIGHT_ACCENT = hex_to_linear("#A78BFA")
C_MAGENTA = hex_to_linear("#D946EF")
C_CYAN = hex_to_linear("#22D3EE")
C_WARM_WHITE = hex_to_linear("#F5F3FF")

# 1. DELETE BRAND LOGOS ACROSS THE SCENE
print("[1/5] Removing brand marks and logos...")
logos_to_remove = [
    'Samsung_Odyssey_Logo',
    'Logo',
    'Logo ',
    'razer logo',
]

for name in logos_to_remove:
    obj = bpy.data.objects.get(name)
    if obj:
        print(f"  Removing logo object: {name}")
        bpy.data.objects.remove(obj, do_unlink=True)

# 2. REMOVE OLD SAMSUNG MONITOR PARTS
print("[2/5] Removing old Samsung Odyssey monitor mesh components...")
samsung_parent = bpy.data.objects.get('Samsung Odyssey G8 Monitor 34inch')
if samsung_parent:
    # Delete all children of Samsung Odyssey G8 Monitor 34inch
    children = [c for c in bpy.data.objects if c.parent == samsung_parent]
    for c in children:
        sub_children = [sc for sc in bpy.data.objects if sc.parent == c]
        for sc in sub_children:
            sub_sub = [ssc for ssc in bpy.data.objects if ssc.parent == sc]
            for ssc in sub_sub:
                bpy.data.objects.remove(ssc, do_unlink=True)
            bpy.data.objects.remove(sc, do_unlink=True)
        bpy.data.objects.remove(c, do_unlink=True)
    print("  Removed all old Samsung monitor child meshes.")

# 3. BUILD GENERIC 34-INCH CURVED ULTRAWIDE GAMING MONITOR
print("[3/5] Constructing generic unbranded 34-inch curved gaming monitor...")

# Create materials
def get_or_create_mat(name, base_color, metallic=0.0, roughness=0.4, emission=None, emission_strength=1.0):
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

mat_chassis = get_or_create_mat("Generic_Monitor_Chassis", C_PANEL, metallic=0.3, roughness=0.35)
mat_stand = get_or_create_mat("Generic_Monitor_Stand", hex_to_linear("#120E1F"), metallic=0.9, roughness=0.25)
mat_rgb_ring = get_or_create_mat("Generic_Monitor_RGB_Ring", C_BRIGHT_ACCENT, emission=C_PRIMARY_VIOLET, emission_strength=1.2)

# Generate Procedural Wallpaper Texture for Screen
tex_name = "Generic_Wallpaper_Texture"
img = bpy.data.images.get(tex_name)
if not img:
    img = bpy.data.images.new(tex_name, width=1024, height=512, alpha=False, float_buffer=True)

# Generate Wallpaper: dark violet-to-indigo gradient with thin glowing neon ring & faint grid floor
w, h = 1024, 512
y_coords, x_coords = np.mgrid[0:h, 0:w]
norm_y = y_coords / (h - 1) # 0 (bottom) to 1 (top)
norm_x = x_coords / (w - 1) # 0 (left) to 1 (right)

# 1. Base gradient: #0B0716 (bottom) to #1E103A (top)
r_bot, g_bot, b_bot = 0.043, 0.027, 0.086
r_top, g_top, b_top = 0.117, 0.062, 0.227

r_plane = r_bot + (r_top - r_bot) * (norm_y ** 1.2)
g_plane = g_bot + (g_top - g_bot) * (norm_y ** 1.2)
b_plane = b_bot + (b_top - b_bot) * (norm_y ** 1.2)

# 2. Glowing neon ring centered at (0.5, 0.52)
cx, cy = 0.5, 0.52
dx = (norm_x - cx) * 2.0 # aspect ratio correction
dy = (norm_y - cy)
dist_sq = dx**2 + (dy * 1.5)**2
dist = np.sqrt(dist_sq)
target_r = 0.38
ring_mask = np.exp(-((dist - target_r) ** 2) / (2 * (0.012 ** 2))) # sharp thin ring
ring_glow = np.exp(-((dist - target_r) ** 2) / (2 * (0.055 ** 2))) * 0.45 # soft glow

# Add ring color: #A78BFA (bright violet) & #D946EF (magenta hint)
r_plane += (0.65 * ring_mask + 0.35 * ring_glow)
g_plane += (0.45 * ring_mask + 0.20 * ring_glow)
b_plane += (0.95 * ring_mask + 0.55 * ring_glow)

# 3. Faint cyber grid in lower 40% (norm_y < 0.40)
lower_mask = (norm_y < 0.40).astype(float)
persp_y = 0.40 - norm_y # 0 at horizon, 0.4 at bottom
persp_depth = 1.0 / (persp_y + 0.04)

# Horizontal lines
h_lines = np.abs(np.sin(persp_depth * 0.8)) > 0.88
# Vertical perspective lines
persp_x = (norm_x - 0.5) * persp_depth
v_lines = np.abs(np.sin(persp_x * 4.0)) > 0.90
grid = np.logical_or(h_lines, v_lines).astype(float) * lower_mask * 0.18

# Add grid in subtle cyan #22D3EE
r_plane += grid * 0.13
g_plane += grid * 0.82
b_plane += grid * 0.93

# Clamp to max 1.0
r_plane = np.clip(r_plane, 0.0, 1.0)
g_plane = np.clip(g_plane, 0.0, 1.0)
b_plane = np.clip(b_plane, 0.0, 1.0)
a_plane = np.ones((h, w), dtype=float)

rgba = np.stack([r_plane, g_plane, b_plane, a_plane], axis=-1).astype(np.float32).flatten()
img.pixels.foreach_set(rgba)
img.update()

# Create Screen Material with Emissive Texture
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
s_bsdf.inputs['Roughness'].default_value = 0.15
mat_screen.node_tree.links.new(s_tex.outputs['Color'], s_bsdf.inputs['Base Color'])
if 'Emission Color' in s_bsdf.inputs:
    mat_screen.node_tree.links.new(s_tex.outputs['Color'], s_bsdf.inputs['Emission Color'])
    s_bsdf.inputs['Emission Strength'].default_value = 1.1 # Max 1.2
mat_screen.node_tree.links.new(s_bsdf.outputs['BSDF'], s_out.inputs['Surface'])

# Geometry Parameters in local coordinates of parent (scale 1.43)
# Local Desk Z is 0. Screen center Z is 0.34m. Width is ~0.80m, height ~0.34m.
half_w = 0.402
half_h = 0.170
center_z = 0.340
curve_radius = 1.8 # 1800R curve

# 3A. BUILD CURVED CHASSIS & BEZEL
mesh_chassis = bpy.data.meshes.new("Generic_Monitor_Chassis_Mesh")
bm = bmesh.new()

# Create curved front bezel vertices and rear panel vertices
segments = 32
front_verts = []
rear_verts = []

for i in range(segments + 1):
    u = i / segments # 0 to 1
    x = (u - 0.5) * (half_w * 2.0)
    # Circle arc for 1800R curve
    angle = math.asin(min(max(x / curve_radius, -0.99), 0.99))
    y_front = curve_radius * (1.0 - math.cos(angle))
    y_rear = y_front - 0.022 # 22mm chassis depth

    # Front outer: top and bottom
    v_f_top = bm.verts.new((x, y_front, center_z + half_h))
    v_f_bot = bm.verts.new((x, y_front, center_z - half_h))
    # Rear: top and bottom
    v_r_top = bm.verts.new((x * 0.96, y_rear, center_z + half_h * 0.95))
    v_r_bot = bm.verts.new((x * 0.96, y_rear, center_z - half_h * 0.95))

    front_verts.append((v_f_top, v_f_bot))
    rear_verts.append((v_r_top, v_r_bot))

bm.verts.ensure_lookup_table()

# Stitch quads along curve
for i in range(segments):
    ft1, fb1 = front_verts[i]
    ft2, fb2 = front_verts[i+1]
    rt1, rb1 = rear_verts[i]
    rt2, rb2 = rear_verts[i+1]

    # Top surface
    bm.faces.new((ft1, ft2, rt2, rt1))
    # Bottom surface
    bm.faces.new((fb2, fb1, rb1, rb2))
    # Rear backplate
    bm.faces.new((rt2, rt1, rb1, rb2))

# Side caps
bm.faces.new((front_verts[0][0], rear_verts[0][0], rear_verts[0][1], front_verts[0][1]))
bm.faces.new((front_verts[-1][1], rear_verts[-1][1], rear_verts[-1][0], front_verts[-1][0]))

bm.to_mesh(mesh_chassis)
bm.free()

obj_chassis = bpy.data.objects.new("Generic_Monitor_Chassis", mesh_chassis)
obj_chassis.data.materials.append(mat_chassis)
bpy.context.scene.collection.objects.link(obj_chassis)
obj_chassis.parent = samsung_parent

# 3B. BUILD CURVED SCREEN
mesh_screen = bpy.data.meshes.new("Generic_Monitor_Screen_Mesh")
bm = bmesh.new()

scr_half_w = half_w - 0.004 # 4mm border
scr_half_h = half_h - 0.005 # 5mm border
scr_verts = []

for i in range(segments + 1):
    u = i / segments
    x = (u - 0.5) * (scr_half_w * 2.0)
    angle = math.asin(min(max(x / curve_radius, -0.99), 0.99))
    y = curve_radius * (1.0 - math.cos(angle)) + 0.001 # slightly proud of chassis front

    v_top = bm.verts.new((x, y, center_z + scr_half_h))
    v_bot = bm.verts.new((x, y, center_z - scr_half_h))
    scr_verts.append((v_top, v_bot))

bm.verts.ensure_lookup_table()

# Face quads and UV unwrapping
uv_layer = bm.loops.layers.uv.new("UVMap")
for i in range(segments):
    t1, b1 = scr_verts[i]
    t2, b2 = scr_verts[i+1]
    f = bm.faces.new((t1, t2, b2, b1))
    u1 = i / segments
    u2 = (i + 1) / segments
    f.loops[0][uv_layer].uv = (u1, 1.0)
    f.loops[1][uv_layer].uv = (u2, 1.0)
    f.loops[2][uv_layer].uv = (u2, 0.0)
    f.loops[3][uv_layer].uv = (u1, 0.0)

bm.to_mesh(mesh_screen)
bm.free()

obj_screen = bpy.data.objects.new("Screen", mesh_screen)
obj_screen.data.materials.append(mat_screen)
bpy.context.scene.collection.objects.link(obj_screen)
obj_screen.parent = samsung_parent

# 3C. REAR RGB RING LIGHT
mesh_ring = bpy.data.meshes.new("Generic_Monitor_RGB_Ring_Mesh")
bm = bmesh.new()
ring_r_outer = 0.075
ring_r_inner = 0.060
ring_z = center_z
ring_y = -0.024
ring_segs = 24

ring_v_out = []
ring_v_in = []
for i in range(ring_segs):
    th = (i / ring_segs) * 2 * math.pi
    rx_o = math.cos(th) * ring_r_outer
    rz_o = math.sin(th) * ring_r_outer
    rx_i = math.cos(th) * ring_r_inner
    rz_i = math.sin(th) * ring_r_inner

    vo = bm.verts.new((rx_o, ring_y, ring_z + rz_o))
    vi = bm.verts.new((rx_i, ring_y, ring_z + rz_i))
    ring_v_out.append(vo)
    ring_v_in.append(vi)

bm.verts.ensure_lookup_table()
for i in range(ring_segs):
    next_i = (i + 1) % ring_segs
    bm.faces.new((ring_v_out[i], ring_v_out[next_i], ring_v_in[next_i], ring_v_in[i]))

bm.to_mesh(mesh_ring)
bm.free()

obj_ring = bpy.data.objects.new("Rear_RGB_Ring", mesh_ring)
obj_ring.data.materials.append(mat_rgb_ring)
bpy.context.scene.collection.objects.link(obj_ring)
obj_ring.parent = samsung_parent

# 3D. STAND WITH SLIM V-SHAPED FOOT & COLUMN
mesh_stand = bpy.data.meshes.new("Generic_Monitor_Stand_Mesh")
bm = bmesh.new()

# V-Foot on desk (Z = 0.005)
foot_z = 0.005
foot_thick = 0.008
foot_half_w = 0.010
leg_len = 0.18
angle_rad = math.radians(34)

# Central hub
vh1 = bm.verts.new((-0.035, -0.05, foot_z))
vh2 = bm.verts.new((0.035, -0.05, foot_z))
vh3 = bm.verts.new((0.020, -0.01, foot_z))
vh4 = bm.verts.new((-0.020, -0.01, foot_z))

# Left leg tip
lx = -math.sin(angle_rad) * leg_len - 0.02
ly = math.cos(angle_rad) * leg_len - 0.01
vl_tip = bm.verts.new((lx, ly, foot_z))
vl_tip_r = bm.verts.new((lx + 0.016, ly - 0.008, foot_z))

# Right leg tip
rx = math.sin(angle_rad) * leg_len + 0.02
ry = math.cos(angle_rad) * leg_len - 0.01
vr_tip = bm.verts.new((rx, ry, foot_z))
vr_tip_l = bm.verts.new((rx - 0.016, ry - 0.008, foot_z))

# Upright Neck column up to monitor attachment (Z = 0.34)
col_b1 = bm.verts.new((-0.018, -0.060, foot_z + 0.01))
col_b2 = bm.verts.new((0.018, -0.060, foot_z + 0.01))
col_b3 = bm.verts.new((0.018, -0.040, foot_z + 0.01))
col_b4 = bm.verts.new((-0.018, -0.040, foot_z + 0.01))

col_t1 = bm.verts.new((-0.016, -0.045, center_z))
col_t2 = bm.verts.new((0.016, -0.045, center_z))
col_t3 = bm.verts.new((0.016, -0.026, center_z))
col_t4 = bm.verts.new((-0.016, -0.026, center_z))

# Create column faces
bm.faces.new((col_b1, col_b2, col_t2, col_t1))
bm.faces.new((col_b2, col_b3, col_t3, col_t2))
bm.faces.new((col_b3, col_b4, col_t4, col_t3))
bm.faces.new((col_b4, col_b1, col_t1, col_t4))

# Left V-leg faces
bm.faces.new((vh4, vh1, vl_tip, vl_tip_r))
# Right V-leg faces
bm.faces.new((vh2, vh3, vr_tip_l, vr_tip))
# Hub center
bm.faces.new((vh1, vh2, vh3, vh4))

# Extrude slightly for thickness
bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=foot_thick)

bm.to_mesh(mesh_stand)
bm.free()

obj_stand = bpy.data.objects.new("Stand", mesh_stand)
obj_stand.data.materials.append(mat_stand)
bpy.context.scene.collection.objects.link(obj_stand)
obj_stand.parent = samsung_parent

print("  Successfully built replacement generic 34-inch curved gaming monitor.")

# 4. COLOR PALETTE APPLICATION ACROSS THE SCENE
print("[4/5] Applying strict color palette across scene materials...")
for mat in bpy.data.materials:
    if not mat.node_tree:
        continue

    # Black metal -> #0B0716 (base walls & floor)
    if mat.name == 'Black metal':
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_FLOOR_WALL
                n.inputs['Roughness'].default_value = 0.55
                n.inputs['Metallic'].default_value = 0.2

    # Wood -> deep dark panel #14102A
    if mat.name in ['Wood', 'Material.001', 'desk']:
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_PANEL
                n.inputs['Roughness'].default_value = 0.45

    # Cloud shelf LEDs ('Luz', 'Material.011') -> calibrated violet #7C3AED with 0.6 max strength
    if mat.name in ['Luz', 'Material.011']:
        for n in mat.node_tree.nodes:
            if n.type == 'EMISSION':
                n.inputs['Color'].default_value = C_BRIGHT_ACCENT
                n.inputs['Strength'].default_value = 0.55
            elif n.type == 'BSDF_PRINCIPLED':
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_BRIGHT_ACCENT
                    n.inputs['Emission Strength'].default_value = 0.55

    # Neon blue strips ('emissions.blue') -> cyan accent #22D3EE with 1.4 strength
    if mat.name == 'emissions.blue':
        for n in mat.node_tree.nodes:
            if n.type == 'EMISSION':
                n.inputs['Color'].default_value = C_CYAN
                n.inputs['Strength'].default_value = 1.3
            elif n.type == 'BSDF_PRINCIPLED':
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_CYAN
                    n.inputs['Emission Strength'].default_value = 1.3

    # PlayStation Neon Buttons -> strict palette: #7C3AED, #A78BFA, #D946EF, #22D3EE (no raw green/yellow)
    if mat.name == 'Triangel': # was green -> set to cyan #22D3EE
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_CYAN
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_CYAN
                    n.inputs['Emission Strength'].default_value = 1.8
    elif mat.name == 'square': # magenta #D946EF
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_MAGENTA
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_MAGENTA
                    n.inputs['Emission Strength'].default_value = 1.8
    elif mat.name == 'O': # bright violet #A78BFA
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_BRIGHT_ACCENT
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_BRIGHT_ACCENT
                    n.inputs['Emission Strength'].default_value = 1.8
    elif mat.name == 'X': # primary violet #7C3AED
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Base Color'].default_value = C_PRIMARY_VIOLET
                if 'Emission Color' in n.inputs:
                    n.inputs['Emission Color'].default_value = C_PRIMARY_VIOLET
                    n.inputs['Emission Strength'].default_value = 1.8

# Save the updated blend file
save_path = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bak_path = save_path + "@"
if os.path.exists(bak_path):
    try:
        os.remove(bak_path)
    except Exception:
        pass
bpy.ops.wm.save_as_mainfile(filepath=save_path, check_existing=False)
print(f"[5/5] Saved updated scene to {save_path}")
print("Process completed successfully.")
