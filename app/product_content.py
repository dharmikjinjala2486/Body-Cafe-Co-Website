"""Variant E editorial and printed-label fields accepted by the product editor."""
try:
    from app.errors import Error
except ImportError:
    from errors import Error

TEXT_FIELDS = {'headline':300,'detail_title':300,'segment_name':160,'segment_description':3000,'product_intro':6000,'form_description':3000,'why_this_form':6000,
    'product_story':10000,'quality_summary':6000,'quality_note':3000,'keep_in_mind':3000,'home_highlight':100,
    'directions_tag':3000,'customer_care':3000,'pack_printed':3000}

def validate_content(raw):
    out = {}
    def text(value, limit):
        if not isinstance(value,str) or len(value)>limit: raise Error('Check the product label text.')
        return value.strip()
    def obj(value, fields):
        if not isinstance(value,dict): raise Error('Check the product label fields.')
        return {k:text(value.get(k,''),n) for k,n in fields.items()}
    def strings(value, count, limit):
        if not isinstance(value,list) or len(value)>count: raise Error('Too many product label entries.')
        return [text(x,limit) for x in value]
    for k,n in TEXT_FIELDS.items():
        if k in raw: out[k]=text(raw[k],n)
    if len(out.get('home_highlight','').split())>4: raise Error('Use at most four words for the homepage highlight.')
    if 'label_front' in raw: out['label_front']=obj(raw['label_front'],dict.fromkeys(['category','descriptor','claim','mark','barcode'],1000))
    if 'label_timing' in raw: out['label_timing']=obj(raw['label_timing'],dict.fromkeys(['morning','noon','night'],300))
    if 'label_badges' in raw: out['label_badges']=strings(raw['label_badges'],20,300)
    if 'supplement_facts' in raw:
        sf=raw['supplement_facts']
        if not isinstance(sf,dict) or not isinstance(sf.get('rows'),list) or len(sf['rows'])>40: raise Error('Use up to 40 supplement fact rows.')
        rows=[]
        for row in sf['rows']:
            r=obj(row,{'name':300,'amount':160,'rda':160})
            if not r['name'] or not r['amount']: raise Error('Complete each supplement fact name and amount.')
            if type(row.get('level',0))!=int or row.get('level',0) not in (0,1,2) or type(row.get('active',False))!=bool: raise Error('Check supplement fact row settings.')
            rows.append({**r,'level':row.get('level',0),'active':row.get('active',False)})
        out['supplement_facts']={'serving':text(sf.get('serving',''),300),'rows':rows,'notes':strings(sf.get('notes',[]),20,1000)}
    return out
