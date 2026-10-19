import bpy

print("===================================================================")
print("     DECIMATING HEAVY MESHES IN BLENDER                            ")
print("===================================================================")

decimate_plan = {
    "Cylinder.007": 0.1,             # Headset: 106k -> ~10k
    "base": 0.15,                    # Monitor base: 28k -> ~4k
    "backplane": 0.15,               # Desk backplane: 27k -> ~4k
    "Acer Nitro 7 Gaming Laptop": 0.3, # Laptop: 16k -> ~5k
    "Cube.022": 0.35,                # Chair 1: 7.8k -> ~2.7k
    "Cube.029": 0.35,                # Chair 2: 6.5k -> ~2.2k
    "Cloud shelf": 0.25,             # Cloud shelf: 6.3k -> ~1.5k
    "Plane.028": 0.25,               # Wall art: 4.2k -> ~1k
    "frame": 0.25,                   # Frame: 4.0k -> ~1k
    "DCinput": 0.25,                 # DC input: 3.7k -> ~0.9k
    "keys": 0.3,                     # Keyboard keys: 3.7k -> ~1.1k
    "ControlPanel": 0.3,             # PC panel: 3.1k -> ~0.9k
    "fan": 0.2,                      # PC fans (interior)
    "fan.001": 0.2,
    "fan.002": 0.2,
    "fan.003": 0.2,
    "fan.004": 0.2,
}

for name, ratio in decimate_plan.items():
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        poly_count = len(obj.data.polygons)
        print(f"Decimating '{name}' (polygons: {poly_count}) by ratio {ratio}...")
        
        # If multi-user mesh, make single-user so we can apply
        if obj.data.users > 1:
            obj.data = obj.data.copy()
            
        mod = obj.modifiers.new(name="Perf_Decimate", type='DECIMATE')
        mod.ratio = ratio
        bpy.context.view_layer.objects.active = obj
        try:
            bpy.ops.object.modifier_apply(modifier="Perf_Decimate")
            new_poly = len(obj.data.polygons)
            print(f"  -> Successfully reduced to {new_poly} polygons")
        except Exception as e:
            print(f"  -> Error applying decimate to {name}: {e}")

dg = bpy.context.evaluated_depsgraph_get()
final_tris = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.data:
        eval_obj = obj.evaluated_get(dg)
        final_tris += sum(len(p.vertices) - 2 for p in eval_obj.data.polygons)

print(f"\nTOTAL TRIANGLES IN BLENDER AFTER DECIMATION: {final_tris:,}")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
