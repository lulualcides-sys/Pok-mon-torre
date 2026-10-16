#!/usr/bin/env python3
"""V112 preview ONLY: four distinct poisonous effects, using the player's own GBA spark source.
Pixel silhouettes are hand-composed by Pillow; no CSS, Canvas paths or static video.
The source and previously approved V111 atlases remain untouched.
"""
from PIL import Image, ImageDraw
from pathlib import Path
import math, hashlib, json, random
BASE=Path(__file__).resolve().parents[1]
SOURCE=BASE/'effects/moves/v108-fighting/source-gallery-pixels.png'
OUT=BASE/'effects/moves/v112-poison-preview'
assert SOURCE.is_file(), 'Original GBA gallery is missing'
gallery=Image.open(SOURCE).convert('RGBA')
assert gallery.size==(128,32)
spark=gallery.crop((64,0,96,32))
bounds=spark.getchannel('A').getbbox()
assert bounds, 'Original spark is blank'
spark=spark.crop(bounds)
INK=(17,12,33,255);WHITE=(255,237,253,255)
VIOLET=(132,53,186,255);LILAC=(214,134,248,255);DARK=(76,26,107,255)
MUD=(85,44,107,255);MUDLIGHT=(166,89,181,255);NEON=(178,245,84,255)
def canvas():return Image.new('RGBA',(64,64),(0,0,0,0))
def rng(i,salt):return random.Random(911+i*131+salt*83)
def blob(im,cx,cy,rx,ry,shade,seed,bulge=0):
 """Jagged pixel-ink outline around hand-shaped puddle/cloud forms."""
 d=ImageDraw.Draw(im);pts=[];r=rng(seed,cx+cy)
 for j in range(12):
  a=j*math.pi/6;factor=[1,.88,1.08,.86,1.07,.9,1.1,.85,.98,1.1,.91,1.04][j]
  factor+=bulge*math.sin(a*2+seed)
  pts.append((round(cx+math.cos(a)*rx*factor),round(cy+math.sin(a)*ry*factor)))
 d.polygon(pts,fill=INK)
 ins=[(round(cx+(x-cx)*.81),round(cy+(y-cy)*.79)) for x,y in pts]
 d.polygon(ins,fill=shade)
 d.line([(round(cx-rx*.36),round(cy-ry*.37)),(round(cx+rx*.03),round(cy-ry*.52))],fill=WHITE,width=1)
def pixel_line(d,coords,width,color,highlight=None):
 d.line(coords,fill=INK,width=width+4,joint='curve')
 d.line(coords,fill=color,width=width,joint='curve')
 if highlight:
  d.line([(x,y-2) for x,y in coords],fill=highlight,width=max(1,width//4))
def sparks(im,frame,count=2,x=32,y=32):
 cut=spark.resize((10,10),Image.Resampling.NEAREST)
 pix=cut.load()
 for b in range(10):
  for a in range(10):
   R,G,B,A=pix[a,b]
   if A>30:pix[a,b]=(min(255,90+R//2),min(255,40+G//2),min(255,125+B//2),A)
 for j in range(count):
  rx=rng(frame,j+10);dx=rx.randint(-21,20);dy=rx.randint(-18,15)
  im.alpha_composite(cut,(int(x+dx-5),int(y+dy-5)))
def fog(i,n):
 im=canvas();t=i/(n-1);grow=min(1,(t+.06)*2.2);fade=min(1,(1-t)*5)
 if t>.86:grow*=1.0-(t-.86)*.7
 for j in range(7):
  a=j*2.4+i*.26
  xx=32+math.sin(a)*18*grow;yy=34+math.cos(a*.71)*11*grow+(j%2)*2
  sz=(8+(j%3)*3)*grow*(.85+.15*math.sin(i*.7+j))
  blob(im,xx,yy,max(3,sz),max(3,sz*.82),[DARK,VIOLET,LILAC][j%3],i+j*7,.06)
 d=ImageDraw.Draw(im)
 for j in range(9):
  ang=j*2.5+i*.27;rad=5+j%4*5
  x=round(32+math.cos(ang)*rad);y=round(30+math.sin(ang)*rad*.8)
  d.rectangle((x,y,x+2,y+2),fill=NEON if j%4==0 else LILAC)
 if 2<i<n-2:sparks(im,i,2,35,29)
 if fade<1:im.putalpha(im.getchannel('A').point(lambda v:int(v*fade)))
 return im
def jab(i,n):
 im=canvas();t=i/(n-1)
 d=ImageDraw.Draw(im)
 if t<.70:
  extent=.08+.92*min(1,t/.68)
  reach=round(42*extent)
  pixel_line(d,[(8,40),(14+reach*.4,36),(12+reach,23)],8,VIOLET,LILAC)
  # pointed visible purple venom lance is PART of the arm strike, not a detached hand.
  tip=(12+reach,23)
  d.polygon([(tip[0]-11,tip[1]-2),(tip[0]-4,tip[1]-10),
   (tip[0]+9,tip[1]-17),(tip[0]+2,tip[1]-4),(tip[0]-4,tip[1]+4)],fill=INK)
  d.polygon([(tip[0]-7,tip[1]-3),(tip[0]-3,tip[1]-8),
   (tip[0]+6,tip[1]-14),(tip[0],tip[1]-3)],fill=NEON)
 else:
  burst=max(0,1-(t-.70)/.30)
  for j in range(6):
   a=j*math.pi/3+i*.08
   sx=32+round(math.cos(a)*9);sy=28+round(math.sin(a)*7)
   ex=32+round(math.cos(a)*(11+15*burst));ey=28+round(math.sin(a)*(9+15*burst))
   pixel_line(d,[(sx,sy),(ex,ey)],max(1,int(3*burst)),LILAC,WHITE)
  blob(im,32,28,11*burst+2,10*burst+2,VIOLET,i,.02)
  if i< n-2:sparks(im,i,1,34,31)
 return im
def acid(i,n):
 im=canvas();t=i/(n-1);d=ImageDraw.Draw(im)
 if t<.66:
  span=14+round(t/.66*33)
  # Continuous anisotropic acid stream with animated suspended liquid droplets.
  pts=[(10,35),(17,28-i%4),(23,33),(30,29+(i%3)),(span+6,32)]
  pixel_line(d,pts,9,(87,157,46,255),NEON)
  for j in range(4):
   x=round(8+(j+1)*span/5);y=26+(j%2)*16+i%3
   blob(im,x,y,3+j%2,3,(110,190,67,255),i+j*3)
 else:
  crash=(t-.66)/.34
  size=max(1,(1-crash)*20)
  blob(im,38,31,12+size*.4,7+size*.23,(103,177,53,255),i,.04)
  for j in range(7):
   a=j*math.pi/3.5+i*.06
   px=38+round(math.cos(a)*(13+20*crash))
   py=31+round(math.sin(a)*(8+11*crash))
   blob(im,px,py,max(2,5*(1-crash)),max(2,4*(1-crash)),NEON if j%2 else (113,170,47,255),i+j)
  if crash<.6:sparks(im,i,1,35,31)
 return im
def sludge(i,n):
 im=canvas();t=i/(n-1);d=ImageDraw.Draw(im)
 if t<.56:
  step=t/.56
  x=round(14+step*27);y=round(40-13*math.sin(step*math.pi))
  blob(im,x,y,10+4*step,8+3*step,MUD,i,.1)
  blob(im,x-8,y+7,5,4,DARK,i+7)
  blob(im,x-13,y+11,3,3,MUDLIGHT,i+11)
 else:
  q=(t-.56)/.44;reach=1+q*1.15
  blob(im,39,39,17*reach*(1-q*.6),11*reach*(1-q*.5),MUD,i,.07)
  for j in range(8):
   a=j*math.pi/4+i*.12
   x=39+round(math.cos(a)*(15+14*q));y=38+round(math.sin(a)*(9+10*q))
   blob(im,x,y,max(2,7*(1-q)),max(2,5*(1-q)),
    MUDLIGHT if j%2 else DARK,i+j)
  d.line([(20,44),(29,40),(36,41),(42,38)],fill=NEON,width=2)
  if q<.7:sparks(im,i,1,42,33)
 return im
MOTIONS={'nevoavenenosa':(16,fog),'poisonjab':(16,jab),
         'acido':(12,acid),'lamacorrosiva':(16,sludge)}
info={'version':'112.0-preview','gallery_source':str(SOURCE.relative_to(BASE)),
      'frame_size':96,'moves':{}}
for key,(count,func) in MOTIONS.items():
 directory=OUT/key/'sprites';directory.mkdir(parents=True,exist_ok=True)
 atlas=Image.new('RGBA',(96*count,96));distinct=set();painted=[]
 for i in range(count):
  frame=func(i,count).resize((96,96),Image.Resampling.NEAREST)
  mask=frame.getchannel('A')
  distinct.add(hashlib.sha256(frame.tobytes()).hexdigest())
  painted.append(sum(1 for b in mask.getdata() if b>32))
  atlas.alpha_composite(frame,(i*96,0))
 assert len(distinct)>=count-2,(key,len(distinct))
 assert max(painted)>400,(key,'missing ink')
 path=directory/(key+'.webp')
 atlas.save(path,'WEBP',lossless=True,method=5,exact=True)
 assert Image.open(path).size==(96*count,96)
 info['moves'][key]={'frames':count,'distinct':len(distinct),
   'painted_pixels':painted,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
 print('PASS V112 sprite',key,count,'frames',len(distinct),'distinct',path.stat().st_size,'bytes')
(OUT/'manifest.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
