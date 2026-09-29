import json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1]
units=json.loads((root/'source/plan-extraction.json').read_text())
f2={}
def add(ids,area,w,d=None,note=''):
 for n in ids:
  dd=d if d is not None else area*.09290304/w
  mismatch=abs(w*dd/(area*.09290304)-1)>.10 if area else True
  f2[str(n)]={'id':'F2-'+str(n),'floor':2,'label':'Floor 2 · unit '+str(n),'area':area,'sqm':round(area*.09290304,4),'poly':[[0,0],[w,0],[w,dd],[0,dd]],'source':'3003 Mez 2(1).pdf','dimensionSource':'Labelled dimensions' if d is not None else 'One labelled side; other side derived from area','eligible':not note and not mismatch,'note':note or ('Area and dimension labels disagree; confirmation needed.' if mismatch else '')}
add([1],77.7,2.724,2.560);add(range(2,12),50.2,1.823,2.560);add([12],77.7,2.746,2.560)
add([13],46.5,1.729,2.495);add([14,15,16,18],25.1,1.729,1.349)
add([17],77.7,1.729,1.349)
add([19,20],26.2,1.729,1.410);add([21,22],55.4,1.827,2.819);add(range(23,29),75,2.472,2.819)
add([29],27.8,1.993,1.294);add([30],51.2,1.993,2.389);add([31],81.5,1.993,3.978)
add([32],49.5,3.047);add([33],25.9,1.575);add(range(34,42),35.5,2.185,1.510);add(range(42,56),25.5,1.570,1.510)
add([56],50.4,1.720,2.720);add([57,58],30.4,1.720,1.641)
for i in range(59,64):add([str(i)+'-1',str(i)+'-2'],11.8,1.720,note='Split/stacked unit labels: individual clear height and footprint need confirmation.')
add([64,65],25.1,1.720,1.353);add([66],25,1.720,1.908);add([67,68],25.1,1.720,1.346);add([69],35.9,1.720,1.934)
add(range(70,90),35.7,1.745,1.900);add([90],26.3,2.187,1.117);add([91],35.8,2.187,1.523);add(range(92,97),51.2,1.800,2.640)
add(['97-1','97-2'],0,0,0,note='No readable area label; excluded from recommendations.')
add(range(98,102),75.8,2.498,2.819);add([102],55.5,1.829,2.819);add([103,104],27.8,1.830,1.410)
add([105,106],25.8,1.422);add([107,108,109,110],34.8,1.919)
add(range(111,123),50,2.031,2.288);add([123],34.8,1.729,1.872);add([124,125],25.1,1.729,1.349);add(range(126,146),50,2.031,2.285)
assert len(f2)==151,len(f2)
units.extend(f2.values())
for u in units:
 u['w']=round(max(p[0] for p in u['poly']),4);u['d']=round(max(p[1] for p in u['poly']),4)
(root/'dist/units.json').write_text(json.dumps(units,separators=(',',':')))
(root/'source/README.md').write_text('''# PurpleBox plan data\n\nGround and Floor 1: all red unit polygons matched to their area labels using PDF vector paths and text positions. Outlines scaled to the stated area; no operational unit IDs appear in these drawings, so generated identifiers are plan references only. Floor 2: manually transcribed unit numbers, areas and dimensional labels from the supplied raster plan. Where one side is missing, that side is inferred from labelled area.\n\n305 plan records: Ground 48, Floor 1 106, Floor 2 151 including split references. This is not a verified operational unit count or live availability. 15 records excluded: Floor 1 zero-area label; Floor 2 units 17 and 66 conflicting dimensions/area, 59–63 split-unit clear dimensions/height unknown, 97-1 and 97-2 missing areas.\n\nAll usable heights are unverified. Packing uses a provisional 2.4 m maximum height and stacks only identical cartons, up to three high and 1.8 m total. Furniture is never stacked. Access mode reserves a full-width 0.6 m strip on the model front, whose orientation is illustrative because door locations are not integrated. Columns and door clearance are not modelled. Recommendations are estimates from a deterministic multi-order packing heuristic, not a guaranteed optimal fit.\n\nNo external calculator, API service, or paid dependency. Three.js is locally vendored under its MIT license. Text entry uses an explicit catalogue parser and asks the user to resolve unknown items.\n''')
print(len(units),'plan records;',sum(u['eligible'] for u in units),'eligible;',[(u['id'],u['note']) for u in units if not u['eligible']])
