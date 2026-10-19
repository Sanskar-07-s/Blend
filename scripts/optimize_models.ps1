$ErrorActionPreference = "Stop"

Write-Host "--- 1. EXPORTING FROM BLENDER ---"
& "D:\2nd Year\Blender\blender.exe" "d:\Blender\blender-club-3d-studio\GamingRoom.blend" --background --python "d:\Blender\blender-club-3d-studio\export_models.py"

Write-Host "--- 2. CONVERTING TEXTURES TO WEBP ---"
npx @gltf-transform/cli webp public/models/room.glb public/models/room.webp.glb

Write-Host "--- 3. MESHOPT COMPRESSION (ROOM.GLB) ---"
npx @gltf-transform/cli meshopt public/models/room.webp.glb public/models/room.glb

Write-Host "--- 4. CREATING MOBILE VERSION (512px textures) ---"
npx @gltf-transform/cli resize public/models/room.webp.glb public/models/room.mobile.temp.glb --width 512 --height 512
npx @gltf-transform/cli meshopt public/models/room.mobile.temp.glb public/models/room.mobile.glb

Write-Host "--- 5. CLEANING UP TEMP FILES ---"
Remove-Item public/models/room.webp.glb, public/models/room.mobile.temp.glb, public/models/test_walls.glb -ErrorAction SilentlyContinue

Write-Host "Done!"
