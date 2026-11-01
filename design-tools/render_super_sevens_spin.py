# Super Sevens turntables: 24 frames per bottle (15° steps) from the web GLBs, transparent WebP.
# Run from the repository root:
#   /Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python design-tools/render_super_sevens_spin.py [-- slug ...]
import bpy, math, os, sys
from mathutils import Vector
SLUGS = ['iron-bisglycinate','l-theanine','vitamin-d3-k2','omega-3-fish-oil','myo-d-chiro-inositol','creatine-chews','psyllium-husk']
argv = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if argv: SLUGS = [s for s in SLUGS if s in argv]
FRAMES = int(os.environ.get("SPIN_FRAMES", "24"))
OUT = os.path.abspath('web/media/spin')
os.makedirs(OUT, exist_ok=True)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 48
    sc.cycles.use_denoising = True
    try: sc.cycles.device = 'GPU'
    except Exception: pass
    sc.render.film_transparent = True
    sc.render.resolution_x, sc.render.resolution_y = 520, 860
    sc.render.image_settings.file_format = 'WEBP'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.render.image_settings.quality = 82
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.view_settings.exposure = 0.55
    w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.96, 0.95, 0.93, 1); bg.inputs[1].default_value = 0.24
    return sc

def light(name, loc, energy, size, rot):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = energy; d.size = size
    o = bpy.data.objects.new(name, d); o.location = loc; o.rotation_euler = rot
    bpy.context.scene.collection.objects.link(o)

for slug in SLUGS:
    sc = reset()
    bpy.ops.import_scene.gltf(filepath=os.path.abspath('web/models/'+slug+'.glb'))
    meshes = [o for o in sc.objects if o.type == 'MESH']
    for m in bpy.data.materials:
        b = m.node_tree and next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if b: b.inputs['Roughness'].default_value = max(0.58, b.inputs['Roughness'].default_value)
    pivot = bpy.data.objects.new('PIVOT', None); sc.collection.objects.link(pivot)
    pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
    ctr = (lo+hi)/2
    roots = [o for o in sc.objects if o.parent is None and o is not pivot]
    for o in roots:
        o.location -= ctr
        o.parent = pivot
    # Up axis: glTF imports Y-up as Z-up in Blender, so the bottle height is along Z.
    height = hi.z - lo.z
    cam_d = bpy.data.cameras.new('C'); cam_d.lens = 70
    cam = bpy.data.objects.new('C', cam_d); sc.collection.objects.link(cam); sc.camera = cam
    dist = height * 2.55
    cam.location = (0, -dist, height*0.42)
    cam.rotation_euler = (math.radians(90 - math.degrees(math.atan2(height*0.42, dist))), 0, 0)
    light('Key', (-dist*0.7, -dist*0.6, height*1.1), 150*height*height, height*1.6, (math.radians(55), 0, math.radians(-45)))
    light('Fill', (dist*0.8, -dist*0.5, height*0.3), 70*height*height, height*2.2, (math.radians(80), 0, math.radians(55)))
    light('Rim', (0, dist*0.8, height*0.9), 110*height*height, height*1.2, (math.radians(-60), 0, 0))
    for f in range(FRAMES):
        pivot.rotation_euler = (0, 0, math.radians(-f * 360 / FRAMES))
        sc.render.filepath = os.path.join(OUT, '%s-%02d.webp' % (slug, f))
        bpy.ops.render.render(write_still=True)
    print('SPIN_DONE', slug)
