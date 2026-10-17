#!/usr/bin/env python3
"""V155 Mew x Mewtwo stage, entirely original pixel-art materials.
Renders the playable preview's floor and transparent effect sprites at build
time with Pillow. No frames from the reference video are distributed.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import random, math
SEED=155107
rng=random.Random(SEED)
OUT=Path(__file__).resolve().parents[1]/"assets"/"battle-v155"
OUT.mkdir(parents=True,exist_ok=True)
W,H=360,640
def signed(a,b): return max(0,min(255,round(a+b)))
# A violet stone surface close to the video: irregular dark mineral grain,
# fine *branching* cracks and chips; NO square-grid / CSS tiles.
im=Image.new("RGBA",(W,H));pix=im.load()
spots=[(rng.uniform(-30,390),rng.uniform(-20,660),rng.uniform(17,80),rng.uniform(-17,14)) for _ in range(58)]
for y in range(H):
 for x in range(W):
  cloud=sum(d*math.exp(-((x-a)**2+(y-b)**2)/(2*s*s)) for a,b,s,d in spots)
  grain=rng.gauss(0,1.5)+2.7*math.sin(x*.045+y*.012)
  tone=cloud+grain+math.sin(y*.008)*5
  light=4*(1-math.hypot((x-180)/210,(y-350)/455))
  pix[x,y]=(signed(102,tone+light*.65),signed(87,tone*.9+light*.45),signed(142,tone+light),255)
d=ImageDraw.Draw(im,"RGBA")
for i in range(108):
 x=rng.randrange(-20,380);y=rng.randrange(94,635)
 if rng.random()<.40:y=rng.randrange(165,630)
 length=rng.randrange(15,100);vx=rng.uniform(-1.1,1.1);vy=rng.uniform(.4,1.5)
 pts=[(x,y)]
 for k in range(rng.randrange(3,8)):
  x+=vx*rng.randrange(6,14)+rng.randrange(-6,7);y+=vy*rng.randrange(5,12)
  pts.append((int(x),int(y)))
 # Thin cracks, shadow and single-pixel edge light.
 d.line([(u+1,v+1) for u,v in pts],fill=(151,137,185,45),width=1)
 d.line(pts,fill=(41,34,82,rng.randrange(115,196)),width=1)
 if rng.random()>.57:
  bx,by=pts[rng.randrange(len(pts))]
  d.line(((bx,by),(bx+rng.randint(-16,16),by+rng.randint(10,23))),fill=(49,40,88,124),width=1)
for i in range(345):
 x=rng.randrange(0,W);y=rng.randrange(150,H)
 r=rng.choice((1,1,2,2,3))
 if rng.random()<.73:
  # Craters and cut rock debris with beveled light edges.
  d.ellipse((x-r,y-r*.5,x+r*1.6,y+r*.65),fill=(48,37,83,100))
  d.rectangle((x-r,y-r,x+r,y+r//2),fill=(73,59,110,155))
  d.line((x-r,y-r,x+r,y-r),fill=(191,164,219,92),width=1)
  d.line((x+r,y-r,x+r,y+r),fill=(35,29,73,96),width=1)
 else:
  d.point((x,y),fill=(207,178,238,rng.randrange(30,110)))
# Far edge: irregular boulders and shock-blue seam, from the reference.
rockrng=random.Random(15517)
topline=[]
x=-10
while x<W+35:
 h=rockrng.randint(20,62);w=rockrng.randint(15,54)
 y=105+rockrng.randint(-20,19)
 d.ellipse((x-8,y-h,x+w+12,y+15),fill=(37,29,73,255))
 d.polygon(((x,y-12),(x+w//3,y-h),(x+w,y-h//3),(x+w+5,y+8),(x-5,y+9)),fill=(46,35,82,255))
 d.line(((x,y-12),(x+w//3,y-h),(x+w,y-h//3)),fill=(83,65,119,145),width=2)
 topline.append((x,y+11));x+=w-2
for x in range(-10,W+20,2):
 y=144+math.sin(x*.022)*5+math.sin(x*.088)*2
 d.line(((x,int(y)),(x+2,int(y+math.sin(x*.19)*2))),fill=(41,181,253,170),width=3)
 d.point((x,int(y)-1),fill=(188,236,255,160))
# Border shadows and sparkles
for i in range(52):
 x=rng.randrange(W);y=rng.randint(141,H-7)
 if rng.random()>.6:d.point((x,y),fill=(228,210,255,rng.randrange(120,220)))
# Upscale with hard pixel edges, web renderer uses NEAREST.
im.resize((720,1280),Image.Resampling.NEAREST).save(OUT/"violet-stone-arena.png",optimize=True)
def blank(s=160):return Image.new("RGBA",(s,s),(0,0,0,0))
def write(im,n):im.save(OUT/n,optimize=True)
circ=blank(192);cd=ImageDraw.Draw(circ,"RGBA")
for r,alpha,col in [(79,60,(241,202,255)),(75,170,(255,219,255)),(70,105,(180,96,244)),(63,135,(243,187,254))]:
 cd.ellipse((96-r,96-r,96+r,96+r),outline=(*col,alpha),width=3)
for i in range(12):
 a=2*math.pi*i/12;rr=66
 x,y=int(96+rr*math.cos(a)),int(96+rr*math.sin(a))
 cd.ellipse((x-3,y-3,x+3,y+3),fill=(255,216,255,155))
cd.line([(96+int(math.cos(i*2*math.pi/5)*49),96+int(math.sin(i*2*math.pi/5)*49)) for i in (0,2,4,1,3,0)],fill=(226,167,246,77),width=2)
write(circ,"psychic-ring.png")
orb=blank(128);o=ImageDraw.Draw(orb,"RGBA")
for rad,a,color in [(56,26,(195,73,252)),(48,47,(155,50,224)),(38,88,(105,44,184)),(29,232,(49,28,88)),(20,236,(95,43,158)),(11,222,(205,117,246))]:
 o.ellipse((64-rad,64-rad,64+rad,64+rad),fill=(*color,a))
for i in range(14):
 a=i*2*math.pi/14;rad=36+rng.randrange(-4,8);x=int(64+rad*math.cos(a));y=int(64+rad*math.sin(a))
 o.line(((x,y),(x+int(12*math.cos(a+.7)),y+int(12*math.sin(a+.7)))),fill=(218,121,255,170),width=2)
write(orb,"shadow-orb.png")
hit=blank(192);h=ImageDraw.Draw(hit,"RGBA")
for i in range(18):
 a=i*math.tau/18
 r=rng.randint(47,82);xa,ya=96+int(r*.24*math.cos(a)),96+int(r*.24*math.sin(a))
 xb,yb=96+int(r*math.cos(a)),96+int(r*math.sin(a))
 h.line((xa,ya,xb,yb),fill=(243,171,255,rng.randint(90,215)),width=rng.randint(1,4))
for r in (18,33,45,59):
 h.ellipse((96-r,96-r,96+r,96+r),outline=(244,209,255,150 if r<40 else 78),width=2)
write(hit,"psychic-impact.png")
for n in ("violet-stone-arena.png","psychic-ring.png","shadow-orb.png","psychic-impact.png"):
 from PIL import Image as I
 img=I.open(OUT/n)
 assert img.mode=="RGBA" and img.getbbox(),n
print("V155",[(p.name,p.stat().st_size) for p in OUT.glob("*.png")])
