"""Render top-of-pack details from the user's supplied Blender source.

Load the source with --background --disable-autoexec, then run this script.
Only duplicated objects in a new scene are rendered; no .blend is saved.
Full-label front probes are local analysis files, never delivery assets.
"""
import bpy
import json
import os
import numpy as np
from mathutils import Matrix, Vector

OUT = os.path.abspath('.local/variant-5/product-details')
ONLY = os.environ.get('BCC_DETAIL_ONLY')
os.makedirs(OUT, exist_ok=True)
PRODUCTS = {
    'IRON': 'iron-bisglycinate', 'LTHEANINE': 'l-theanine',
    'D3K2': 'vitamin-d3-k2', 'OMEGA3': 'omega-3-fish-oil',
    'MYO_DCHIRO': 'myo-d-chiro-inositol', 'CREATINE': 'creatine-chews',
    'PSYLLIUM': 'psyllium-husk',
}


def source_world(ob):
    if ob.parent:
        return source_world(ob.parent) @ ob.matrix_parent_inverse @ ob.matrix_basis
    return ob.matrix_basis.copy()


scene = bpy.data.scenes.new('V5_TOP_OF_PACK_DETAILS_ONLY')
bpy.context.window.scene = scene
q = source_world(bpy.data.objects['CAM_F_LINEUP_FINAL_LABEL_Main']).to_quaternion()
camera = bpy.data.objects.new('V5_detail_camera', bpy.data.cameras.new('V5_detail_camera'))
scene.collection.objects.link(camera)
scene.camera = camera
camera.data.type = 'ORTHO'
camera.rotation_euler = q.to_euler()

for name, position, energy, size in [
    ('Key', (-3, 3, 4), 650, 4), ('Fill', (3, 1, 3), 180, 3), ('Rim', (1, 3, -2), 350, 2.5)
]:
    data = bpy.data.lights.new('V5_' + name, 'AREA')
    data.energy, data.size, data.shape = energy, size, 'DISK'
    light = bpy.data.objects.new(data.name, data)
    scene.collection.objects.link(light)
    light.location = q @ Vector(position)
    light.rotation_euler = (-light.location).to_track_quat('-Z', 'Y').to_euler()

scene.world = bpy.data.worlds.new('V5_neutral_studio')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.7, .74, .76, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .4
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'AgX'
records = []

for key, slug in PRODUCTS.items():
    if ONLY and slug != ONLY:
        continue
    originals = [ob for ob in bpy.data.objects['F_FINAL_' + key + '_ROOT'].children if ob.type == 'MESH']
    corners = [source_world(ob) @ Vector(v) for ob in originals for v in ob.bound_box]
    low = Vector([min(v[i] for v in corners) for i in range(3)])
    high = Vector([max(v[i] for v in corners) for i in range(3)])
    centre = (low + high) * .5
    factor = 3.2 / (high.z - low.z)
    copies = []
    for original in originals:
        ob = original.copy()
        ob.data = original.data.copy()
        scene.collection.objects.link(ob)
        ob.parent = None
        ob.matrix_world = Matrix.Scale(factor, 4) @ Matrix.Translation(-centre) @ source_world(original)
        ob.hide_render = ob.hide_viewport = False
        ob.hide_set(False)
        copies.append(ob)

    # Locate the dark original brand mark in a small front probe, excluding
    # the lower product-name/benefit area and both side panels.
    camera.data.ortho_scale = 4.25
    camera.location = q @ Vector((0, 0, 8))
    scene.render.resolution_x, scene.render.resolution_y = 900, 1200
    probe_path = os.path.join(OUT, slug + '-analysis-front.png')
    scene.render.filepath = probe_path
    bpy.ops.render.render(write_still=True)
    image = bpy.data.images.load(probe_path, check_existing=False)
    w, h = image.size
    pixels = np.empty(w * h * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    pixels = pixels.reshape(h, w, 4)
    x0, x1 = round(w * .20), round(w * .60)
    y0, y1 = round(h * .35), round(h * .80)
    crop = pixels[y0:y1, x0:x1]
    maximum = crop[:, :, :3].max(axis=2)
    minimum = crop[:, :, :3].min(axis=2)
    mask = (maximum < .42) & ((maximum - minimum) < .08) & (crop[:, :, 3] > .95)
    ys, xs = np.nonzero(mask)
    if len(xs) < 100:
        raise RuntimeError('Brand mark needs manual framing: ' + slug)
    left = ((x0 + xs.min()) / w - .5) * 4.25 * w / h
    right = ((x0 + xs.max()) / w - .5) * 4.25 * w / h
    bottom = ((y0 + ys.min()) / h - .5) * 4.25
    top = ((y0 + ys.max()) / h - .5) * 4.25
    logo_height, logo_width = top - bottom, right - left
    height = max(logo_height + .5, logo_width / .8 / .75)
    target_x = left + height * .75 * .44
    target_y = (bottom + top) * .5 + .15
    target = q @ Vector((target_x, target_y, 0))
    camera.data.ortho_scale = height
    camera.location = target + q @ Vector((0, 0, 8))
    scene.render.resolution_x, scene.render.resolution_y = 1800, 2400
    scene.render.filepath = os.path.join(OUT, slug + '-detail.png')
    bpy.ops.render.render(write_still=True)
    records.append({'product': slug, 'source_root': 'F_FINAL_' + key + '_ROOT', 'mark_bounds': [left, bottom, right, top], 'camera_target': [target_x, target_y], 'frame_height': height, 'original_materials': True, 'needs_visual_review': True})
    bpy.data.images.remove(image)
    for ob in copies:
        bpy.data.objects.remove(ob, do_unlink=True)
    manifest_name = 'render-manifest-' + ONLY + '.json' if ONLY else 'render-manifest.json'
    with open(os.path.join(OUT, manifest_name), 'w') as f:
        json.dump(records, f, indent=2)
    print('TOP_DETAIL_COMPLETE', slug, flush=True)
