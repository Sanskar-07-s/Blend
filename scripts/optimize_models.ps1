$ErrorActionPreference = "Stop"

Write-Host "--- 1. EXPORTING FROM BLENDER ---"
& "D:\2nd Year\Blender\blender.exe" "d:\Blender\blender-club-3d-studio\GamingRoom.blend" --background --python "d:\Blender\blender-club-3d-studio\export_models.py"

Write-Host "--- 2. CONVERTING TEXTURES TO WEBP ---"
npx @gltf-transform/cli webp public/models/room.glb public/models/room.webp.glb

Write-Host "--- 3. SIMPLIFYING ROOM.GLB (ratio 0.35) ---"
npx @gltf-transform/cli simplify public/models/room.webp.glb public/models/room.temp.glb --ratio 0.35 --error 0.003

Write-Host "--- 4. MESHOPT COMPRESSION (ROOM.GLB) ---"
npx @gltf-transform/cli meshopt public/models/room.temp.glb public/models/room.glb

Write-Host "--- 5. CREATING MOBILE VERSION (ratio 0.22, 512px textures) ---"
npx @gltf-transform/cli simplify public/models/room.webp.glb public/models/room.mobile.temp.glb --ratio 0.22 --error 0.005
npx @gltf-transform/cli resize public/models/room.mobile.temp.glb public/models/room.mobile.temp.glb --width 512 --height 512
npx @gltf-transform/cli meshopt public/models/room.mobile.temp.glb public/models/room.mobile.glb

Write-Host "--- 6. CLEANING UP TEMP FILES ---"
Remove-Item public/models/room.webp.glb, public/models/room.temp.glb, public/models/room.mobile.temp.glb -ErrorAction SilentlyContinue

Write-Host "Done!"
