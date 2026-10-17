#!/usr/bin/env python3
"""V156: 3 original ANIMATED pixel-art effects (16/16/12 frames).
Production sheets; never static attack PNGs or Canvas/CSS drawing.
Made for one PixiJS/WebGL battle stage using Pillow only at BUILD time.
"""
from pathlib import Path
from PIL import Image, ImageDraw
import random, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"assets"/"battle-v156"
OUT.mkdir(parents=True,exist_ok=True)
TAU=math.tau
def arc_poly(cx,cy,rx,ry,a,b,n=15):
 return [(round(cx+rx*math.cos(a+(b-a)*i/n)),
          round(cy+ry*math.sin(a+(b-a)*i/n))) for i in range(n+1)]
def rotate_star(cx,cy,r,ang,points=6):
 pts=[]
 for i in range(points*2):
  a=ang+i*math.pi/points
  rr=r if i%2==0 else r*.42
  pts.append((round(cx+math.cos(a)*rr),round(cy+math.sin(a)*rr)))
 return pts
def framesheet(name, size, count, painter):
 cols=4; rows=math.ceil(count/cols)
 sheet=Image.new("RGBA",(cols*size,rows*size),(0,0,0,0))
 for i in range(count):
  # Render at HALF the eventual frame resolution to preserve crisp authored pixels.
  half=size//2
  frame=Image.new("RGBA",(half,half),(0,0,0,0))
  painter(ImageDraw.Draw(frame,"RGBA"),i,count,half,random.Random(156000+i))
  sheet.alpha_composite(frame.resize((size,size),Image.Resampling.NEAREST),
                        ((i%cols)*size,(i//cols)*size))
 out=OUT/name
 sheet.save(out,optimize=True)
 print(name,sheet.size,out.stat().st_size)
def shadow(d,i,n,S,rng):
 p=i/n; cx=cy=S/2
 # Black-violet nucleus, three hand-drawn swirling trails + electrical cracks.
 pulse=1+.10*math.sin(p*TAU*2)
 rr=19*pulse
 d.ellipse((cx-rr-5,cy-rr-5,cx+rr+5,cy+rr+5),fill=(119,54,181,61))
 for k in range(3):
  angle=p*TAU*1.25+k*TAU/3
  x=cx+math.cos(angle)*rr*1.08;y=cy+math.sin(angle)*rr*1.08
  trail=arc_poly(cx,cy,rr+5,rr*.91,angle-.93,angle+.25,11)
  d.line(trail,fill=(126+25*k,63+33*k,218,211),width=3)
  d.polygon(rotate_star(x,y,3.6,angle),fill=(215,149,255,195))
 d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),
           fill=(24,12,42,255),outline=(144,68,210,255),width=2)
 d.ellipse((cx-rr+5,cy-rr+5,cx+rr-5,cy+rr-5),
           fill=(58,21,109,255),outline=(94,41,161,234),width=2)
 d.polygon([(cx-10,cy-7),(cx-4,cy-13),(cx+7,cy-6),
            (cx+12,cy+4),(cx+2,cy+13),(cx-9,cy+7)],
           fill=(112,41,180,211))
 d.line([(cx-10,cy-5),(cx-2,cy-10),(cx+4,cy-5)],
        fill=(220,136,247,225),width=2)
 for k in range(5):
  a=p*TAU*1.6+k*TAU/5
  t=rr+8+(k%2)*5
  x=cx+math.cos(a)*t;y=cy+math.sin(a)*t
  d.line((x,y,x+math.cos(a+.45)*7,y+math.sin(a+.45)*7),
         fill=(164,87,249,163),width=1)
def psychic(d,i,n,S,rng):
 p=i/n; cx=cy=S/2; spin=p*TAU*1.6
 # A genuinely distinct psychic glyph / rings, NOT a recoloured shadow ball.
 for ring,radius in enumerate((15,24,34)):
  phase=spin*(-1 if ring%2 else 1)+ring*.61
  opacity=180-ring*35
  for s in range(4):
   start=phase+s*TAU/4
   d.line(arc_poly(cx,cy,radius,radius*.82,start,start+.79,13),
       fill=(239-18*ring,158+18*ring,255,opacity),width=max(1,3-ring))
  for s in range(6):
   a=phase+s*TAU/6
   x=cx+math.cos(a)*radius;y=cy+math.sin(a)*radius*.82
   d.ellipse((x-1.3,y-1.3,x+1.3,y+1.3),fill=(249,227,255,198))
 d.line(rotate_star(cx,cy,17,spin,5)+[rotate_star(cx,cy,17,spin,5)[0]],
        fill=(246,180,255,155),width=2)
 d.ellipse((cx-9,cy-9,cx+9,cy+9),
           fill=(182,91,220,141),outline=(238,184,255,240),width=2)
 d.polygon(rotate_star(cx,cy,7,-spin*1.9,5),fill=(249,221,255,245))
def impact(d,i,n,S,rng):
 p=i/(n-1);cx=cy=S/2
 radius=5+p*38; fade=round((1-p)**1.7*255)
 for j in range(16):
  a=TAU*j/16+i*.035
  length=radius*(.70+(j%3)*.18)
  x0=cx+math.cos(a)*radius*.18;y0=cy+math.sin(a)*radius*.18
  x1=cx+math.cos(a)*length;y1=cy+math.sin(a)*length
  d.line((x0,y0,x1,y1),
         fill=(235,151+(j%3)*20,255,round(fade*.65)),width=max(1,3-i//5))
 for off in (0,8):
  r=max(2,radius-off)
  d.ellipse((cx-r,cy-r,cx+r,cy+r),outline=(248,211,255,round(fade*.82)),width=2)
 if i<3:
  r=(3-i)*9
  d.ellipse((cx-r,cy-r,cx+r,cy+r),fill=(255,239,255,round(fade*.60)))
if __name__=="__main__":
 framesheet("shadow-ball-16.png",128,16,shadow)
 framesheet("psychic-glyph-16.png",160,16,psychic)
 framesheet("impact-12.png",128,12,impact)
