import bpy
import os

print("===================================================================")
print("     OPTIMIZE STAGE 2: TARGET < 300K TRIS & < 70 MESHES            ")
print("===================================================================")

blend_file = r"d:\Blender\blender-club-3d-studio\GamingRoom.blend"
bpy.ops.wm.open_mainfile(filepath=blend_file)

# 1. Further decimate headset, mouse, chairs, unparented props
decimate_targets = {
    # Headset
    "grid": 0.05,
    "in": 0.08,
    "foam.001": 0.1,
    "foam": 0.1,
    "left,right": 0.1,
    "mid": 0.1,
    "left": 0.1,
    "right": 0.1,
    # Mouse
    "MouseThermaltakeBlack.003": 0.08,
    "MouseThermaltakeBlack.008": 0.1,
    "MouseThermaltakeBlack.015": 0.1,
    # Chairs
    "Plane.012": 0.15,
    "Plane.026": 0.15,
    "Plane.025": 0.15,
    "Cube.024": 0.15,
    "Cube.038": 0.15,
    "Bolt.002": 0.1,
    "case.001": 0.25,
    "K-Legs": 0.2,
    # Unparented
    "MiniDisplayPort": 0.1,
    "SpeakerGrill": 0.1,
    "OuterRing": 0.1,
    "frame": 0.15
}

for name, ratio in decimate_targets.items():
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        print(f"Decimating {name} (polys: {len(obj.data.polygons)}) by ratio {ratio}...")
        dec = obj.modifiers.new("Decimate_S2", 'DECIMATE')
        dec.ratio = ratio
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier="Decimate_S2")

# 2. Join prop hierarchies into merged meshes to drastically cut draw calls
# Important: preserve anchor root objects:
# - 'Samsung Odyssey G8 Monitor 34inch'
# - 'Gaming Computer Case'
# - 'Cloud shelf'
# - 'Geometric Display Shelf'
# - 'Framed gaming art'
# - 'Gaming chair/chair'
# - 'Next generation gaming chair concept'
# - 'Gamer neon  sign'

props_to_join = [
    'Razer kraken headset gaming',
    'Gaming Mouse',
    'Dell monitor 24 inch S2421HN',
    'Game Cases Pack 5',
    'PS5 games',
    'Xbox one games',
    'Individual Book Collection 1',
    'Stacked set of books',
    'Modern Design Book Pack',
    'Wooden Display Shelf',
    'Empty.011'
]

print("\nJoining prop child meshes into single objects per prop...")
for parent_name in props_to_join:
    parent_obj = bpy.data.objects.get(parent_name)
    if not parent_obj:
        continue
    
    # Collect all descendant mesh objects
    descendant_meshes = [c for c in parent_obj.children_recursive if c.type == 'MESH']
    if parent_obj.type == 'MESH':
        descendant_meshes.append(parent_obj)
        
    if len(descendant_meshes) <= 1:
        continue
        
    print(f"  * Joining {len(descendant_meshes)} meshes for '{parent_name}'...")
    
    # Convert all to mesh, apply scale/transforms
    bpy.ops.object.select_all(action='DESELECT')
    for m in descendant_meshes:
        m.select_set(True)
    
    # Make sure one active mesh
    target_mesh = None
    for m in descendant_meshes:
        if m.type == 'MESH':
            target_mesh = m
            break
            
    if target_mesh:
        bpy.context.view_layer.objects.active = target_mesh
        try:
            # Join selected meshes
            bpy.ops.object.join()
            print(f"    -> Joined into '{target_mesh.name}' (parent: {target_mesh.parent.name if target_mesh.parent else 'None'})")
        except Exception as e:
            print(f"    -> Join failed for {parent_name}: {e}")

# 3. Clean up unused materials and images
print("\nPurging unused data blocks...")
for i in range(3):
    bpy.ops.outliner.orphans_purge(do_local_ids=True, do_linked_ids=True, do_recursive=True)

# 4. Measure final triangle count and object count
dg = bpy.context.evaluated_depsgraph_get()
final_tris = 0
mesh_count = 0
for obj in bpy.data.objects:
    if obj.type == 'MESH' and obj.data:
        mesh_count += 1
        eval_obj = obj.evaluated_get(dg)
        final_tris += sum(len(p.vertices) - 2 for p in eval_obj.data.polygons)

print(f"\n=======================================================")
print(f"STAGE 2 RESULT:")
print(f"TOTAL MESH OBJECTS: {mesh_count}")
print(f"TOTAL TRIANGLES (Evaluated): {final_tris:,}")
print(f"=======================================================\n")

bpy.ops.wm.save_mainfile(filepath=blend_file)
print("Saved GamingRoom.blend successfully!")
