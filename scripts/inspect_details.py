import bpy

bpy.ops.wm.open_mainfile(filepath=r"d:\Blender\blender-club-3d-studio\GamingRoom.blend")

print("\n--- MODIFIERS IN SCENE ---")
for obj in bpy.data.objects:
    if obj.type == 'MESH' and len(obj.modifiers) > 0:
        mods = [f"{m.type}(name='{m.name}', active={m.show_viewport})" for m in obj.modifiers]
        print(f"{obj.name} (parent: {obj.parent.name if obj.parent else 'None'}, tris: {len(obj.data.polygons)} polys): {', '.join(mods)}")

print("\n--- OBJECTS WITH MORE THAN 10,000 POLYGONS ---")
for obj in bpy.data.objects:
    if obj.type == 'MESH':
        if len(obj.data.polygons) > 10000:
            print(f"{obj.name}: {len(obj.data.polygons):,} polys (parent: {obj.parent.name if obj.parent else 'None'})")

print("\n--- MATERIALS LIST ---")
print(f"Total materials: {len(bpy.data.materials)}")
for m in bpy.data.materials:
    print(f"  {m.name} (users: {m.users})")
