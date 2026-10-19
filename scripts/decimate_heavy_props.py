import bpy

print("\n--- DECIMATING TOP HEAVY PROPS IN GAMINGROOM.BLEND ---")

# Ensure all objects in editable state
if bpy.ops.object.mode_set.poll():
    bpy.ops.object.mode_set(mode='OBJECT')

targets = {
    "Cylinder.007": 0.05, # Razer kraken headset from 106k -> ~5k
    "base": 0.04,         # Dell monitor base from 29k -> ~1.1k
    "backplane": 0.06,    # Desk backplane from 33k -> ~2k
    "Cube.029": 0.20,     # Chair from 32k -> ~6.5k
    "Cube.022": 0.20,     # Chair concept from 39k -> ~7.8k
    "Cloud shelf": 0.18,  # Cloud shelf from 35k -> ~6.3k
    "Plane.005": 0.30,    # Acer laptop from 16.5k -> ~5k
}

for name, ratio in targets.items():
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        initial_tris = len(obj.data.polygons)
        print(f"Decimating {name} (initial polygons: {initial_tris}) with ratio {ratio}...")
        
        # Add decimate modifier
        mod = obj.modifiers.new(name="TargetDecimate", type='DECIMATE')
        mod.ratio = ratio
        mod.use_collapse_triangulate = True
        
        # Apply modifier
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
        
        final_tris = len(obj.data.polygons)
        print(f" -> {name} reduced to {final_tris} polygons.")

# Save modified blend file
bpy.ops.wm.save_mainfile()
print("Saved GamingRoom.blend successfully!\n")
