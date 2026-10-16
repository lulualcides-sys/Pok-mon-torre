#!/usr/bin/env python3
"""V108 authentic compact Fighting sprites from user-supplied GBA pixel gallery.
Actual pre-rendered frame atlases. Cross Chop V107 kept, scaled by renderer.
"""
from pathlib import Path
from PIL import Image
import hashlib,json
R=Path(__file__).resolve().parents[1];B=R/'effects/moves/v108-fighting'
P=B/'source-gallery-pixels.png';OUT=B/'sheets';OUT.mkdir(parents=True,exist_ok=True)
S=Image.open(P).convert('RGBA')
assert S.size==(128,32),'Gallery source invalid'
PALM,FINGER,SPARK,ROCK=[S.crop((i*32,0,(i+1)*32,32)) for i in range(4)]
SIZE=48; FRAME=96
SHOE=['....................','.dddddd.............','.dwwwwwd............',
'.dwwwwwdd...........','.ddwwwmmmdd.........','..dddmmmmmmdd.......',
'....ddmmmmmmdd......','.....dmmmmmmmdd.....','......dmmmwwmmdddd..',
'......dmmwwwwwmmmd..','......ddmmmmmmmmmmdd.','.......dgggggggggggd.',
'.......dddddddddddddd.','....................']
COL={'.':None,'d':'11111c','w':'f6d6a0','m':'aa6f46','g':'fbb551'}
shoe=Image.new('RGBA',(max(map(len,SHOE)),len(SHOE)))
for y,row in enumerate(SHOE):
 for x,s in enumerate(row):
  if COL[s]:shoe.putpixel((x,y),tuple(bytes.fromhex(COL[s]))+(255,))
def base():return Image.new('RGBA',(SIZE,SIZE))
def resized(src,width,height=None,angle=0):
 height=height or round(width*src.height/src.width)
 res=src.resize((width,height),Image.Resampling.NEAREST)
 return res.rotate(angle,expand=True,resample=Image.Resampling.NEAREST) if angle else res
def put(dst,img,x,y,opacity=1):
 if opacity<1:
  img=img.copy();img.putalpha(img.getchannel('A').point(lambda a:int(a*max(0,opacity))))
 dst.alpha_composite(img,(int(x),int(y)))
def hit(b,x,y,stage,opacity=1):
 frame=resized(SPARK,18 if stage<3 else 14)
 put(b,frame,x-frame.width//2,y-frame.height//2,opacity)
def kick(i):
 b=base();coords=[(0,18),(4,17),(9,16),(13,16),(18,16),(20,16),(14,18),(6,19)]
 x,y=coords[i];put(b,resized(shoe,36,25),x-4,y,.98 if i<7 else .68)
 if 3<=i<=6:hit(b,36,27,i-3,[.70,.98,.73,.42][i-3])
 return b
def karate(i):
 b=base();phases=[(1,18,0),(3,17,0),(6,16,0),(9,15,0),(12,14,-5),(15,13,-10),
 (19,13,-9),(18,14,-5),(15,15,0),(11,16,0),(7,17,0),(3,18,0)]
 x,y,angle=phases[i];put(b,resized(FINGER,29,29,-70+angle),x,y,1 if i<=8 else max(.12,1-(i-8)*.27))
 if 5<=i<=9:hit(b,32,22,i-5,[.54,1,.80,.51,.18][i-5])
 return b
def brick(i):
 b=base();ys=[-19,-16,-13,-8,-4,0,5,10,14,16,13,11,9,7,5,2]
 put(b,resized(PALM,31,31,180),10,ys[i],max(.22,1-max(0,i-10)*.14))
 if 7<=i<=13:
  hit(b,27,25,i-7,max(.1,1-(i-8)*.13))
  for k in range(3):
   layer=resized(ROCK,12-k*2);j=min(5,i-7)
   put(b,layer,24+(-15,7,17)[k]+j*(-1,1,2)[k],25+(6,-2,13)[k]+j*(1,-1,1)[k],max(.22,1-j*.17))
 return b
info={'version':'108.0','gallery':'user GBA Ruby Sapphire original crops, Neslug','width':FRAME,'height':FRAME,'moves':{}}
for name,n,fn in [('chute',8,kick),('karate',12,karate),('brick',16,brick)]:
 strip=Image.new('RGBA',(n*FRAME,FRAME));distinct=set();ink=[]
 for i in range(n):
  frame=fn(i).resize((FRAME,FRAME),Image.Resampling.NEAREST)
  strip.alpha_composite(frame,(i*FRAME,0));distinct.add(hashlib.sha256(frame.tobytes()).digest())
  ink.append(sum(a>40 for a in frame.getchannel('A').getdata()))
 assert len(distinct)>=n-1 and min(ink)>95,(name,len(distinct),ink)
 dest=OUT/(name+'.webp');strip.save(dest,'WEBP',lossless=True,method=6,exact=True)
 assert Image.open(dest).size==(n*FRAME,FRAME)
 info['moves'][name]={'frames':n,'painted':ink,'bytes':dest.stat().st_size}
 print('PASS V108',name,n,'distinct real pixel frames')
(B/'manifest.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
