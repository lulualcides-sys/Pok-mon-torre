#!/usr/bin/env python3
"""V109: three compact native pixel-art impact animations.
Unlike V108, no isolated hand/foot icon is pasted onto the opposing Pokemon.
Frames are baked from the user's GBA gallery into transparent lossless WebP.
Chute 8f, Golpe de Karatê 12f, Brick Break 16f. Cross Chop untouched.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import hashlib, math, json
ROOT=Path(__file__).resolve().parents[1]
GALLERY=ROOT/'effects/moves/v108-fighting/source-gallery-pixels.png'
OUT=ROOT/'effects/moves/v109-fighting/sheets';OUT.mkdir(parents=True,exist_ok=True)
SRC=Image.open(GALLERY).convert('RGBA')
assert SRC.size==(128,32),'GBA user gallery missing'
SPARK=SRC.crop((64,0,96,32))
ROCK=SRC.crop((96,0,128,32))
N=80;TILE=128
DARK=(15,17,27,255)
WHITE=(255,252,244,255)
def crop(im):
 box=im.getchannel('A').getbbox()
 return im.crop(box) if box else im
SPARK=crop(SPARK);ROCK=crop(ROCK)
def sprite(img,size,angle=0,alpha=1):
 im=img.resize((size,max(1,round(size*img.height/img.width))),Image.Resampling.NEAREST)
 if angle:im=im.rotate(angle,expand=True,resample=Image.Resampling.NEAREST)
 if alpha!=1:im.putalpha(im.getchannel('A').point(lambda a:round(a*max(0,min(1,alpha)))))
 return im
def paste(b,im,x,y):
 b.alpha_composite(im,(int(x-im.width/2),int(y-im.height/2)))
def poly(d,pts,col,border=DARK):
 d.polygon(pts,fill=border)
 cx=sum(x for x,y in pts)/len(pts);cy=sum(y for x,y in pts)/len(pts)
 pts2=[(round(cx+(x-cx)*.82),round(cy+(y-cy)*.82)) for x,y in pts]
 d.polygon(pts2,fill=col)
def comet(d,cx,cy,length,width,color):
 p=[(cx-length,cy-width*.35),(cx-length*.45,cy-width*.75),
    (cx+length*.35,cy-width*.60),(cx+length,cy),
    (cx+length*.30,cy+width*.58),(cx-length*.40,cy+width*.66)]
 poly(d,p,color)
 d.polygon([(cx-length*.38,cy-width*.15),(cx+length*.42,cy-width*.15),
    (cx+length*.68,cy),(cx+length*.27,cy+width*.18)],fill=WHITE)
def blade(d,cx,cy,extent,wide,orient,col):
 a=orient;dx=math.cos(a);dy=math.sin(a);nx=-dy;ny=dx
 ps=[(cx-dx*extent-nx*wide*.52,cy-dy*extent-ny*wide*.52),
     (cx+dx*extent*.40-nx*wide*.66,cy+dy*extent*.40-ny*wide*.66),
     (cx+dx*extent+nx*wide*.18,cy+dy*extent+ny*wide*.18),
     (cx+dx*extent*.30+nx*wide*.65,cy+dy*extent*.30+ny*wide*.65),
     (cx-dx*extent*.88+nx*wide*.45,cy-dy*extent*.88+ny*wide*.45)]
 poly(d,ps,col)
 d.polygon([(cx-dx*extent*.50,cy-dy*extent*.50),
     (cx+dx*extent*.50-nx*wide*.15,cy+dy*extent*.50-ny*wide*.15),
     (cx+dx*extent*.60+nx*wide*.04,cy+dy*extent*.60+ny*wide*.04),
     (cx-dx*extent*.28+nx*wide*.12,cy-dy*extent*.28+ny*wide*.12)],fill=WHITE)
def kick(i):
 b=Image.new('RGBA',(N,N));d=ImageDraw.Draw(b)
 charge=[.0,.15,.26,.52,1,.83,.44,.14][i]
 if i>=2:
  x=34+min(13,(i-2)*4)
  comet(d,x,40,8+13*charge,7+10*charge,(252,150,62,255))
 if 3<=i<=6:
  paste(b,sprite(SPARK,round(15+25*charge),alpha=charge*.98),48,40)
  for k,(dx,dy) in enumerate([(13,-16),(17,11),(-10,-15),(-6,16)]):
   off=charge*(1+1.1*k)
   poly(d,[(46+dx*off-2,40+dy*off-2),(46+dx*off+4,40+dy*off),
    (46+dx*off,40+dy*off+4)],(255,220,128,255))
 return b
def karate(i):
 b=Image.new('RGBA',(N,N));d=ImageDraw.Draw(b)
 intensity=max(.05,min(1,(i-1)/6,(12-i)/5))
 if i>=2:
  at=40+int((i-5)*.9)
  blade(d,43,at,12+22*intensity,8+15*intensity,-.93,(186,109,240,255))
 if 5<=i<=9:
  paste(b,sprite(SPARK,round(14+25*intensity),angle=-38,alpha=intensity*.86),48,37)
 return b
def brick(i):
 b=Image.new('RGBA',(N,N));d=ImageDraw.Draw(b)
 if i<3:
  d.polygon([(39+i*2,30+i*2),(41+i*2,29+i*2),(43+i*2,35+i*2)],fill=(215,148,81,135+i*35))
 if i>12:
  paste(b,sprite(ROCK,max(4,10-(i-13)*2),alpha=max(.2,1-(i-12)*.23)),52+(i-13)*4,63-(i-13)*2)
 if 3<=i<=12:
  hit=max(.10,1-abs(i-8)/5.5)
  if i<7:blade(d,40,22+(i-3)*5,12,8,-math.pi/2,(224,149,68,255))
  if i>=7:
   paste(b,sprite(SPARK,round(18+22*hit),alpha=hit),43,49)
   for k,a in enumerate([-2.42,-1.46,-.45,.22,1.10,2.51]):
    dist=6+(i-7)*(2.5+k*.24)
    x=40+math.cos(a)*dist;y=48+math.sin(a)*dist*.76
    shard=sprite(ROCK,max(5,13-((i+k)%3)),angle=k*35,alpha=hit)
    paste(b,shard,x,y)
   poly(d,[(19,57),(34,53),(37,58),(49,49),(59,55),
    (69,53),(57,62),(44,59),(35,65)],(155,111,67,255))
 return b
DATA={'chute':(8,kick),'karate':(12,karate),'brick':(16,brick)}
info={'version':'109.0','source':'User-supplied GBA pixel gallery',
 'width':TILE,'height':TILE,'moves':{}}
for name,(n,fn) in DATA.items():
 strip=Image.new('RGBA',(n*TILE,TILE));hashes=set();paint=[]
 for i in range(n):
  frame=fn(i).resize((TILE,TILE),Image.Resampling.NEAREST)
  strip.alpha_composite(frame,(i*TILE,0))
  hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())
  paint.append(sum(a>35 for a in frame.getchannel('A').getdata()))
 assert len(hashes)>=n-1,(name,len(hashes))
 assert max(paint)>1200,(name,paint)
 path=OUT/(name+'.webp')
 strip.save(path,'WEBP',lossless=True,exact=True,method=1)
 info['moves'][name]={'frames':n,'size':path.stat().st_size,'painted':paint,
  'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
 print('PASS V109',name,n,'unique pixel frames, impact',max(paint))
(OUT.parent/'manifest.json').write_text(json.dumps(info,indent=2)+'\n')
