"""Render an original empty studio set for Variant 5.2.

Run in a disposable background Blender process with --factory-startup.
No supplied scene, geometry, label or product image is changed. Product
photographs remain independent layers so the authoritative artwork is retained.
"""
import bpy
import math
import os
import sys
from mathutils import Vector

MOBILE = '--mobile' in sys.argv
OUTPUT = os.path.abspath('.local/variant-5/private-residence-set-mobile.png' if MOBILE else '.local/variant-5/private-residence-set.png')
scene = bpy.context.scene
for ob in list(scene.objects):
    bpy.data.objects.remove(ob, do_unlink=True)


def material(name, colour, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bs = mat.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value = (*colour, 1)
    bs.inputs['Roughness'].default_value = roughness
    return mat, bs


plaster, plaster_bs = material('Clay rose mineral plaster', (.56, .36, .29), .88)
nodes = plaster.node_tree.nodes
links = plaster.node_tree.links
noise = nodes.new('ShaderNodeTexNoise')
noise.inputs['Scale'].default_value = 7
noise.inputs['Detail'].default_value = 4
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].position = .1
ramp.color_ramp.elements[0].color = (.46, .29, .24, 1)
ramp.color_ramp.elements[1].position = .9
ramp.color_ramp.elements[1].color = (.65, .46, .38, 1)
links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
links.new(ramp.outputs['Color'], plaster_bs.inputs['Base Color'])
fine = nodes.new('ShaderNodeTexNoise')
fine.inputs['Scale'].default_value = 180
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = .2
bump.inputs['Distance'].default_value = .006
links.new(fine.outputs['Fac'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], plaster_bs.inputs['Normal'])

walnut, walnut_bs = material('Oiled walnut ledge', (.07, .035, .021), .43)
nodes = walnut.node_tree.nodes
links = walnut.node_tree.links
coordinates = nodes.new('ShaderNodeTexCoord')
mapping = nodes.new('ShaderNodeVectorMath')
mapping.operation = 'MULTIPLY'
mapping.inputs[1].default_value = (1.4, 95, 65)
grain = nodes.new('ShaderNodeTexNoise')
grain.inputs['Scale'].default_value = 4
grain.inputs['Detail'].default_value = 3
links.new(coordinates.outputs['Generated'], mapping.inputs[0])
links.new(mapping.outputs[0], grain.inputs['Vector'])
ramp = nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (.028, .012, .007, 1)
ramp.color_ramp.elements[1].color = (.14, .065, .029, 1)
links.new(grain.outputs['Fac'], ramp.inputs['Fac'])
links.new(ramp.outputs['Color'], walnut_bs.inputs['Base Color'])
bump = nodes.new('ShaderNodeBump')
bump.inputs['Strength'].default_value = .1
bump.inputs['Distance'].default_value = .0015
links.new(grain.outputs['Fac'], bump.inputs['Height'])
links.new(bump.outputs['Normal'], walnut_bs.inputs['Normal'])


def box(name, location, dimensions, mat, bevel=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    ob = bpy.context.object
    ob.name = name
    ob.dimensions = dimensions
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    ob.data.materials.append(mat)
    if bevel:
        mod = ob.modifiers.new('Natural edge', 'BEVEL')
        mod.width = bevel
        mod.segments = 4
    return ob


box('Continuous plaster wall', (0, .24, 2.4), (14, .14, 8), plaster)
box('Continuous walnut ledge', (0, -.07, .88), (14, .54, .055), walnut, .006)

scene.world = bpy.data.worlds.new('Diffuse studio ambient')
scene.world.use_nodes = True
scene.world.node_tree.nodes['Background'].inputs[0].default_value = (.77, .82, .88, 1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value = .32


def light(name, position, aim, energy, size, colour):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = energy
    data.shape = 'DISK'
    data.size = size
    data.color = colour
    ob = bpy.data.objects.new(name, data)
    scene.collection.objects.link(ob)
    ob.location = position
    ob.rotation_euler = (Vector(aim) - ob.location).to_track_quat('-Z', 'Y').to_euler()
    return ob


light('Large window at camera left', (-3.2, -3.8, 5.2), (.3, .24, 1.7), 800, 2.4, (1, .9, .8))
light('Quiet fill', (3, -4, 2.8), (0, 0, 1.4), 90, 4, (.83, .9, 1))

# Physical window mullions cast a restrained, imperfect shadow. The window
# itself is outside the camera; this is a designed studio set, not a real store.
shade, _ = material('Window frame outside camera', (.2, .2, .2), .8)
box('Window vertical mullion', (-1.1, -1.1, 3.55), (.035, .05, .7), shade)
box('Window horizontal mullion', (-1.1, -1.1, 3.45), (2.3, .05, .04), shade)

data = bpy.data.cameras.new('Straight studio camera')
camera = bpy.data.objects.new(data.name, data)
scene.collection.objects.link(camera)
camera.location = (0, -8, 1.35)
camera.rotation_euler = (Vector((0, 0, 1.35)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
data.type = 'ORTHO'
data.ortho_scale = 3.5 if MOBILE else 5.6
scene.camera = camera
scene.render.engine = 'BLENDER_EEVEE'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_x = 900 if MOBILE else 2200
scene.render.resolution_y = 1500 if MOBILE else 1375
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = OUTPUT
scene.view_settings.view_transform = 'AgX'
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
bpy.ops.render.render(write_still=True)
