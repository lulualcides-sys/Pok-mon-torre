#!/usr/bin/env python3
"""V110: ONLY physical contact sparks, original Pokémon GBA gallery pixels.
No isolated hands/feet, projectile, video, procedural CSS/canvas or windup art.
Chute = orange spark, Karate = white/violet spark, Brick Break = spark + pebbles.
All images are 8/12/16 separate transparent sprite frames, not static PNG.
"""
from pathlib import Path
from PIL import Image
import json, hashlib, math
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'effects/moves/v108-fighting/source-gallery-pixels.png'
OUT=ROOT/'effects/moves/v110-fighting/sheets'
OUT.mkdir(parents=True,exist_ok=True)
im=Image.open(SOURCE).convert('RGBA')
assert im.size==(128,32),'Original gallery 4-tile source missing'
def cut(index):
 p=im.crop((index*32,0,(index+1)*32,32))
 box=p.getchannel('A').getbbox()
 assert box,'Empty gallery tile'
 return p.crop(box)
spark=cut(2)
rock=cut(3)
W=96
specs={'chute':(8,.59,(255,168,82)),
       'karate':(12,.59,(239,234,255)),
       'brick':(16,.63,(255,222,148))}
def tinted(src,rgb):
 out=src.copy()
 px=[]
 for red,green,blue,a in out.getdata():
  intensity=(max(red,green,blue)/255)
  v=.47+.53*intensity
  px.append((round(rgb[0]*v),round(rgb[1]*v),round(rgb[2]*v),a))
 out.putdata(px)
 return out
def paste_center(canvas,icon,x,y,size,opacity=1,rotation=0):
 ww=size;hh=max(1,round(ww*icon.height/icon.width))
 frame=icon.resize((ww,hh),Image.Resampling.NEAREST)
 if rotation:frame=frame.rotate(rotation,expand=True,resample=Image.Resampling.NEAREST)
 if opacity!=1:frame.putalpha(frame.getchannel('A').point(lambda a:round(a*opacity)))
 canvas.alpha_composite(frame,(round(x-frame.width/2),round(y-frame.height/2)))
def make(name,frames,hit,color):
 source=tinted(spark,color)
 stone=tinted(rock,(177,147,115))
 strip=Image.new('RGBA',(W*frames,W))
 counts=[];hashes=[]
 first=next(i for i in range(frames) if (i+.5)/frames >= hit)
 for frame in range(frames):
  tile=Image.new('RGBA',(W,W))
  if frame>=first:
   u=(frame-first)/max(1,frames-first-1)
   # Contact-only cycle: bloom at strike, then sharp decay.
   strength=(1-u)**.65
   size=round(21+14*math.sin(math.pi*(.1+.70*u)))
   paste_center(tile,source,48,48,size,.96*strength)
   if name=='karate':
    # A second genuine pixel sparkle at contact, NOT a travelling slash.
    paste_center(tile,source,53,43,max(8,round(size*.52)),strength*.58,rotation=45)
   if name=='brick':
    for k in range(4):
     a=(k*.5+.20)*math.pi
     dist=6+u*(13+k%2*4)
     x=48+math.cos(a)*dist;y=50+math.sin(a)*dist*.82
     paste_center(tile,stone,round(x),round(y),max(5,round(10-3*u+k%2)),
                  .84*strength,rotation=k*45)
  # NEAREST-NEIGHBOR pixel lattice x2, no vector renderer at runtime.
  strip.alpha_composite(tile,(frame*W,0))
  counts.append(sum(a>32 for a in tile.getchannel('A').getdata()))
  hashes.append(hashlib.sha256(tile.tobytes()).hexdigest())
 assert all(x==0 for x in counts[:first]),(name,'early art')
 assert max(counts[first:])>80,(name,counts)
 assert len(set(hashes[first:]))>=2,(name,'not animated')
 path=OUT/(name+'.webp');strip.save(path,'WEBP',lossless=True,exact=True,method=4)
 assert Image.open(path).size==(frames*W,W)
 print('PASS V110',name,frames,'frames, contact starts',first,'visible',counts[first:])
 return {'frames':frames,'first_impact_frame':first,'painted':counts,
         'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
manifest={'version':'110.0','source':'original user GBA gallery sprites',
          'description':'only local hit spark, no wind-up art or physical limb image',
          'frameWidth':W,'frameHeight':W,'moves':{}}
for name,(n,hit,color) in specs.items():
 manifest['moves'][name]=make(name,n,hit,color)
(OUT.parent/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
