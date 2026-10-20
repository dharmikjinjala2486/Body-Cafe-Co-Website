import bpy,math,os
from mathutils import Vector,Matrix
OUT=os.path.abspath('web/models')
keys={'IRON':'iron-bisglycinate','LTHEANINE':'l-theanine','D3K2':'vitamin-d3-k2','OMEGA3':'omega-3-fish-oil','MYO_DCHIRO':'myo-d-chiro-inositol','CREATINE':'creatine-chews','PSYLLIUM':'psyllium-husk'}
webscene=bpy.data.scenes.new('WEB_EXPORT_ONLY')
bpy.context.window.scene=webscene
def source_world(ob):
 return source_world(ob.parent) @ ob.matrix_parent_inverse @ ob.matrix_basis if ob.parent else ob.matrix_basis.copy()
# Work on duplicates in this disposable background process. Never save the source blend.
for key,slug in keys.items():
 root=bpy.data.objects['F_FINAL_'+key+'_ROOT']
 originals=[c for c in root.children if c.type=='MESH']
 corners=[source_world(o)@Vector(v) for o in originals for v in o.bound_box]
 low=Vector([min(v[i] for v in corners) for i in range(3)])
 high=Vector([max(v[i] for v in corners) for i in range(3)])
 center=(low+high)*.5
 sf=3.2/(high.z-low.z)
 bpy.ops.object.select_all(action='DESELECT')
 copies=[]
 for orig in originals:
  ob=orig.copy();ob.data=orig.data.copy();bpy.context.scene.collection.objects.link(ob)
  ob.parent=None;ob.hide_render=False;ob.hide_viewport=False;ob.hide_set(False)
  ob.matrix_world=Matrix.Scale(sf,4)@Matrix.Translation(-center)@source_world(orig)
  ob.modifiers.clear()
  old=orig.material_slots[0].material
  mat=bpy.data.materials.new('WEB_'+slug+'_'+orig.name.split('_')[-1]);mat.use_nodes=True
  bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
  bs.inputs['Base Color'].default_value=old.diffuse_color
  bs.inputs['Roughness'].default_value=.34 if 'CAP' in orig.name else .48
  bs.inputs['Metallic'].default_value=0
  if orig.name.endswith('_LABEL'):
   source=next(n.image for n in old.node_tree.nodes if n.type=='TEX_IMAGE' and n.image and n.image.name.endswith('_ART'))
   img=source.copy();ratio=2048/img.size[0];img.scale(2048,round(img.size[1]*ratio));img.file_format='JPEG';img.filepath_raw=os.path.abspath('.local/motion-rd/'+slug+'.jpg');img.save();img.pack()
   tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=img
   mat.node_tree.links.new(tex.outputs['Color'],bs.inputs['Base Color'])
   bs.inputs['Roughness'].default_value=.5
  ob.data.materials.clear();ob.data.materials.append(mat)
  ob.select_set(True);bpy.context.view_layer.objects.active=ob
  # Preserve the source normals and label shell: aggressive decimation creates print artifacts.
  copies.append(ob)
 for ob in copies:ob.select_set(True)
 bpy.context.view_layer.objects.active=copies[0]
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,slug+'.glb'),export_format='GLB',use_selection=True,use_active_scene=True,export_apply=True,export_image_format='JPEG',export_jpeg_quality=88,export_materials='EXPORT',export_animations=False,export_cameras=False,export_lights=False,export_extras=False)
 print('WEB_EXPORT',slug,os.path.getsize(os.path.join(OUT,slug+'.glb')),sum(len(o.data.polygons) for o in copies))
 for ob in copies:bpy.data.objects.remove(ob,do_unlink=True)
