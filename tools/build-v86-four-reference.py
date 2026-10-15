#!/usr/bin/env python3
"""Pokemon Torre V86: 4 ORIGINAL battle references, authored 8-frame RGBA atlases.
Roots=Frenzy Plant-inspired; frost=original terrain hazard; icy breath=Frost
Breath-inspired; double whip=two sequential vine lashes. No full-screen video,
CSS, or runtime Canvas painting. PixiJS/WebGL animates the authored stages.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import hashlib, math, random
ROOT=Path(__file__).resolve().parents[1]
W,H,N=480,240,8
names=('raizes-violentas','geada-persistente','sopro-congelante','chicote-duplo')
P=[0,.16,.38,.67,.9,1,.57,.08]
def img():return Image.new('RGBA',(W,H),(0,0,0,0))
def path_curve(a,b,c,d,steps=35):
 out=[]
 for i in range(steps+1):
  t=i/steps;u=1-t
  out.append((int(u**3*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t**3*d[0]),
              int(u**3*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t**3*d[1])))
 return out
def clipped(curve,q):
 if q<=0:return []
 return curve[:max(2,min(len(curve),1+round(q*(len(curve)-1))))]
def stroke(im,pts,thick,edge,body,light,opacity=255):
 if len(pts)<2:return
 d=ImageDraw.Draw(im,'RGBA')
 for width,col in ((thick+6,(*edge,opacity)),(thick,(*body,opacity)),
                   (max(2,int(thick*.27)),(*light,opacity))):
  d.line(pts,fill=col,width=width,joint='curve')
 # Botanical stem vein rings: black hairline bark details, not pure rectangles
 for k in range(7,len(pts)-3,7):
  x,y=pts[k];d.arc((x-5,y-6,x+5,y+7),-30,95,fill=(*edge,int(opacity*.6)),width=2)
def shard(d,x,y,r,alpha=245):
 d.polygon([(x,y-r*1.45),(x+r*.76,y-r*.18),
            (x+r*.48,y+r*.96),(x-r*.25,y+r*.57),
            (x-r*.76,y-r*.2)],fill=(115,221,238,alpha))
 d.line([(x,y-r*1.45),(x+r*.76,y-r*.18),
            (x+r*.48,y+r*.96),(x-r*.25,y+r*.57),
            (x-r*.76,y-r*.2),(x,y-r*1.45)],fill=(13,43,64,int(alpha*.87)),width=2)
 d.line([(x,y-r),(x,y+r*.56)],fill=(241,251,255,alpha),width=1)
def leaf(d,x,y,r,alpha=235):
 d.ellipse((x-r*1.6,y-r*.8,x+r*1.6,y+r*.8),fill=(63,166,61,alpha),outline=(13,48,24,alpha),width=2)
 d.line([(x-r,y),(x+r,y)],fill=(187,240,117,alpha),width=1)
def roots(i):
 im=img();d=ImageDraw.Draw(im,'RGBA');q=P[i]
 # Cracks open below opponent; THREE different heavy BROWN roots emerge
 if i>0:
  for j in range(5):
   x=294+j*31
   d.line([(x,193),(x-16,196+(j%2)*3),(x-25,203)],fill=(16,22,14,210),width=3)
   d.line([(x,193),(x-16,196+(j%2)*3)],fill=(98,81,47,180),width=1)
 for j in range(3):
  t=max(0,min(1,(q-j*.08)/(1-j*.08)))
  x=300+j*53
  top=(337+j*22,81+(j%2)*18)
  curve=path_curve((x,203),(x-30+j*8,161),(x+54-j*28,101),top,43)
  pts=clipped(curve,t)
  stroke(im,pts,15+j*3,(22,23,18),(117-j*8,85-j*6,48),(204,159,84),int((.99 if i<7 else .28)*255))
  if len(pts)>6:
   # Thorns grow from the living bark.
   for k in range(9,len(pts)-4,11):
    cx,cy=pts[k]
    d.polygon([(cx-3,cy+5),(cx-14-(j%2)*4,cy-7),(cx+4,cy-3)],
      fill=(64,78,40,229),outline=(10,33,16,239))
 if i in (4,5,6):
  rng=random.Random(8600+i)
  for k in range(21):
   x=325+rng.randint(-35,109);y=141+rng.randint(-43,40)
   if k%3:leaf(d,x,y,2+rng.randint(1,4),210 if i<6 else 105)
   else:d.ellipse((x-3,y-2,x+3,y+2),fill=(124,101,69,155))
 return im
def frost(i):
 im=img();d=ImageDraw.Draw(im,'RGBA');q=P[i]
 cx,cy=355,178;radius=16+q*115
 if i>0:
  d.ellipse((cx-radius,cy-radius*.38,cx+radius,cy+radius*.38),
    fill=(56,154,180,int(48+q*100)),outline=(15,52,81,int(100+q*140)),width=3)
  for j in range(3):
   r=radius*(.36+j*.19)
   d.arc((cx-r,cy-r*.38,cx+r,cy+r*.38),184,356,
     fill=(183,239,253,int(87+125*q)),width=2)
 for j in range(14):
  angle=j*2.399;dx=math.cos(angle)*(22+q*(j%5*17));dy=math.sin(angle)*(12+q*(j%4*8))
  x=int(cx+dx);y=int(cy+dy)
  if i>=2:shard(d,x,y,3+(j%4)*2+q*7,int(min(250,75+180*q)*(1 if i<7 else .4)))
 if i in (4,5,6):
  for j in range(14):
   x=298+j*9;y=160+int(math.sin(j*1.7+i)*7)
   shard(d,x,y-12,2+(j%3)*2,145)
 return im
def breath(i):
 im=img();d=ImageDraw.Draw(im,'RGBA')
 q=P[i];rng=random.Random(9110+i)
 if i>0:
  # A fan of independent icy wind strands; not a solid blue cylinder.
  for k in range(12):
   startx=82+rng.randint(-6,13);sy=115+(k-6)*2.2
   finx=80+331*q-rng.randint(0,24)
   ey=118+(k-5.5)*(4+q*4)
   pts=path_curve((startx,int(sy)),(startx+72*q,int(sy)+k-6),
     (startx+216*q,int(ey)+math.sin(k)*8),(int(finx),int(ey)),20)
   d.line(pts,fill=(10,44,68,180),width=6 if k%4==0 else 4)
   d.line(pts,fill=(98,218,252,215),width=3 if k%4==0 else 2)
   d.line(pts,fill=(231,248,255,178),width=1)
  for j in range(24):
   t=rng.random()*q
   x=int(76+315*t);y=int(117+(rng.random()-.5)*(14+85*t))
   shard(d,x,y,1+(j%4),180+(j%3)*18)
 if i in (5,6):
  for j in range(13):
   x=393+rng.randint(-22,30);y=119+rng.randint(-29,26)
   shard(d,x,y,3+(j%3)*3,220 if i==5 else 95)
 return im
def double(i):
 im=img();d=ImageDraw.Draw(im,'RGBA')
 # FIRST whip from above (frames 2-5), SECOND from below (frames 4-7).
 # Curves cross distinctly near foe, in a rhythm of TWO strikes.
 upper=[0,.29,.55,.88,1,.50,.14,0][i]
 lower=[0,0,.10,.39,.69,1,.53,.13][i]
 for j,q in enumerate((upper,lower)):
  if q<=0:continue
  sy=84 if j==0 else 160
  ey=98 if j==0 else 150
  ctrl1=(143,57 if j==0 else 201)
  ctrl2=(278,69 if j==0 else 185)
  curve=path_curve((74,sy),ctrl1,ctrl2,(416,ey),47)
  pts=clipped(curve,q)
  stroke(im,pts,13,(8,36,17),(35+17*j,133+16*j,48),(175+8*j,239,103),255 if i<7 else 105)
  for k in range(8,len(pts)-3,12):
   x,y=pts[k];leaf(d,x,y-6 if j==0 else y+6,3,160)
 if i in (4,5):
  center=(407,98 if i==4 else 150)
  for k in range(10):
   a=k*math.tau/10
   x=int(center[0]+math.cos(a)*13);y=int(center[1]+math.sin(a)*10)
   leaf(d,x,y,2+(k%3),196)
 return im
def main():
 for name,render in zip(names,(roots,frost,breath,double)):
  folder=ROOT/'effects/moves'/name/'v86-preview/sprites';folder.mkdir(parents=True,exist_ok=True)
  sheet=Image.new('RGBA',(W*N,H),(0,0,0,0));unique=set()
  for i in range(N):
   frame=render(i);assert frame.mode=='RGBA' and frame.getchannel('A').getbbox(),(name,i)
   unique.add(hashlib.sha256(frame.tobytes()).hexdigest())
   sheet.alpha_composite(frame,(W*i,0))
  assert len(unique)==8,('Repeated frames',name)
  out=folder/(name+'.webp')
  sheet.save(out,'WEBP',lossless=True,method=5,exact=True)
  probe=Image.open(out)
  assert probe.mode=='RGBA' and probe.size==(3840,240)
  print('PASS V86',name,'8 unique frames transparent',out.stat().st_size)
if __name__=='__main__':main()
