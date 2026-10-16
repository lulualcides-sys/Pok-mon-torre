#!/usr/bin/env python3
"""V111 Poison moves: four individual GBA-pixel animated spritesheets.
Original 32x32 battle sparkle from the user's sprite gallery, with
hand-pixelled venom needles, glints and shocks. No runtime CSS/Canvas paths.
Pillow bakes separate lossless WebP atlases (4 × 12/16 frames).
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import hashlib, json, math
BASE=Path(__file__).resolve().parents[1]
GALLERY=BASE/'effects/moves/v108-fighting/source-gallery-pixels.png'
OUT=BASE/'effects/moves/v111-poison/sheets';OUT.mkdir(parents=True,exist_ok=True)
source=Image.open(GALLERY).convert('RGBA')
assert source.size==(128,32)
spark=source.crop((64,0,96,32))
box=spark.getchannel('A').getbbox()
assert box
spark=spark.crop(box)
N=48;W=96
INK=(17,13,32,255)
VIOLET=(135,53,198,255)
LILAC=(228,152,255,255)
CORE=(255,239,253,255)
PINK=(252,92,177,255)
DEEP=(79,26,137,255)
def img():return Image.new('RGBA',(N,N))
def coloured(asset,palette):
 a=asset.copy();pix=[]
 for r,g,b,alpha in a.getdata():
  if not alpha:pix.append((0,0,0,0));continue
  lum=(r*3+g*5+b*2)/2550
  z=min(.5+lum*.75,1)
  pix.append(tuple(round(c*z) for c in palette)+(alpha,))
 a.putdata(pix);return a
purple_spark=coloured(spark,(191,95,251))
white_spark=coloured(spark,(255,218,253))
def paste_center(dst,asset,x,y,size,alpha=1,rotation=0):
 h=max(1,round(asset.height/asset.width*size))
 art=asset.resize((size,h),Image.Resampling.NEAREST)
 if rotation:art=art.rotate(rotation,resample=Image.Resampling.NEAREST,expand=True)
 if alpha!=1:art.putalpha(art.getchannel('A').point(lambda z:int(z*alpha)))
 dst.alpha_composite(art,(round(x-art.width/2),round(y-art.height/2)))
def needle(d,x,y,width=17,twist=0,c=VIOLET):
 # Real small pixel silhouette with black ink contour and light edge.
 d.polygon([(x-width,y+4+twist),(x+width*.56,y-3+twist),
  (x+width,y+twist),(x+width*.32,y+3+twist),
  (x-width*.82,y+7+twist)],fill=INK)
 d.polygon([(x-width*.78,y+3+twist),(x+width*.63,y-1+twist),
  (x+width*.77,y+twist),(x-width*.35,y+4+twist)],fill=c)
 d.line([(x-width*.58,y+3+twist),(x+width*.44,y+twist)],fill=CORE,width=1)
def drop(d,x,y,r=5):
 d.ellipse((x-r-1,y-r-1,x+r+1,y+r+1),fill=INK)
 d.ellipse((x-r+1,y-r+1,x+r-1,y+r-1),fill=VIOLET)
 d.ellipse((x-r+2,y-r+2,x-1,y-1),fill=LILAC)
def toxic_stab(frame,n):
 out=img();d=ImageDraw.Draw(out)
 u=frame/(n-1);threshold=.53
 if u>=threshold:
  p=(u-threshold)/(1-threshold);strength=max(.16,1-p*.8)
  size=round(7+15*math.sin(math.pi*(.18+p*.7)))
  paste_center(out,purple_spark,24,25,size,strength)
  if p<.82:
   needle(d,20,20,round(8+8*(1-p)),0,PINK)
   needle(d,26,29,round(7+5*(1-p)),2,DEEP)
  if .15<p<.84:
   for k in range(3):
    px=18+k*7;py=17+((frame+k*3)%5)*3
    drop(d,px,py,2)
 return out
def poison_sting(frame,n):
 out=img();d=ImageDraw.Draw(out)
 u=frame/(n-1)
 if u<.78:
  x=6+min(29,round(u/.67*30))
  needle(d,x,24,width=12-(frame%3),c=VIOLET)
  if frame>=3:drop(d,x-9,24+(-3 if frame%2 else 3),2)
 else:
  p=(u-.78)/.22
  paste_center(out,white_spark,39,24,round(10+11*(1-p)),1-p*.6)
  for k in range(3):drop(d,35+k*4,20+(k%2)*7,2)
 return out
def venom_shock(frame,n):
 out=img();d=ImageDraw.Draw(out)
 u=frame/(n-1)
 if u>=.48:
  p=(u-.48)/.52
  extent=max(.1,(1-p)**.64)
  for k in range(4):
   ang=math.pi*2*k/4+.38
   radius=round(6+10*math.sin(min(1,p)*math.pi))
   px=24+round(math.cos(ang)*radius);py=24+round(math.sin(ang)*radius*.8)
   drop(d,px,py,max(2,round((7-k%2*2)*extent)))
  paste_center(out,white_spark,24,24,round(10+15*extent),extent*.85)
 return out
def venom_fang(frame,n):
 out=img();d=ImageDraw.Draw(out);u=frame/(n-1)
 if u<.70:
  x=4+round(u/.70*33);y=27-round(math.sin(u*math.pi)*6)
  needle(d,x,y,round(16-u*4),-2,DEEP)
  if frame>1:needle(d,x-9,y+5,6,0,LILAC)
 else:
  p=(u-.70)/.3
  paste_center(out,purple_spark,39,22,round(8+13*(1-p)),max(.1,1-p))
  if p<.9:needle(d,37,25,round(11-5*p),1,VIOLET)
 return out
DATA={'picadatoxica':(12,toxic_stab),'picadavenenosa':(12,poison_sting),
      'venoshock':(16,venom_shock),'ferraovenenoso':(12,venom_fang)}
manifest={'version':'111.0','source':'sprite sparkle from original user GBA gallery; original needle pixel animation',
  'width':W,'height':W,'moves':{}}
for name,(n,fn) in DATA.items():
 atlas=Image.new('RGBA',(W*n,W));distinct=set();count=[]
 for f in range(n):
  frame=fn(f,n).resize((W,W),Image.Resampling.NEAREST)
  distinct.add(hashlib.sha256(frame.tobytes()).digest())
  atlas.alpha_composite(frame,(W*f,0))
  count.append(sum(v>32 for v in frame.getchannel('A').getdata()))
 assert len(distinct)>=n//2,(name,len(distinct))
 assert max(count)>100,(name,'empty')
 dest=OUT/(name+'.webp');atlas.save(dest,'WEBP',lossless=True,method=4,exact=True)
 assert Image.open(dest).size==(W*n,W)
 manifest['moves'][name]={'frames':n,'painted':count,'bytes':dest.stat().st_size,
  'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()}
 print('PASS V111',name,n,'frames',len(distinct),'unique painted')
(OUT.parent/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
