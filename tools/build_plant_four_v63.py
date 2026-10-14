#!/usr/bin/env python3
"""Pokemon Torre V63 — original 8-frame sprite animations for the four
user-approved Grass/Status moves. No extracted or watermark-stripped assets.
Each transparent RGBA atlas contains eight separately rendered 192px tiles.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, random, argparse
S=192
AA=3
TAU=math.tau
ROOT=Path(__file__).resolve().parents[1]/'effects/moves/v63-plant'
NAMES=('stun-spore','po-do-sono','leech-seed','esporos')
PALETTES={
 'stun-spore':((245,226,91,250),(255,255,213,255),(110,204,85,234)),
 'po-do-sono':((106,229,110,230),(222,255,175,255),(54,159,99,208)),
 'leech-seed':((113,238,90,242),(238,255,175,255),(35,142,80,239)),
 'esporos':((205,224,74,241),(255,251,174,255),(95,174,80,235))}
def P(x,y):return (int(round(x*AA)),int(round(y*AA)))
def line(d,pts,color,width=1):
 d.line([P(*a) for a in pts],fill=color,width=max(1,int(width*AA)),joint='curve')
def ellipse(d,x,y,rx,ry,fill,outline=None,width=1):
 d.ellipse([P(x-rx,y-ry),P(x+rx,y+ry)],fill=fill,outline=outline,width=max(1,int(width*AA)))
def polygon(d,pts,fill,outline=None,width=1):
 p=[P(*q) for q in pts]
 d.polygon(p,fill=fill)
 if outline:line(d,pts+[pts[0]],outline,width)
def star(d,x,y,r,hot,dim):
 line(d,[(x-r,y),(x+r,y)],dim,1.3)
 line(d,[(x,y-r),(x,y+r)],hot,1.1)
 line(d,[(x-r*.50,y-r*.50),(x+r*.50,y+r*.50)],hot,.60)
 line(d,[(x-r*.5,y+r*.5),(x+r*.5,y-r*.5)],hot,.60)
 ellipse(d,x,y,max(.7,r*.19),max(.7,r*.19),hot)
def leaf(d,x,y,rx,ry,a,main,hot,dark):
 ca,sa=math.cos(a),math.sin(a)
 def rot(v,w):return (x+v*ca-w*sa,y+v*sa+w*ca)
 pts=[rot(-rx,0),rot(-rx*.34,-ry*.70),rot(rx*.65,-ry*.28),
  rot(rx,0),rot(rx*.30,ry*.80),rot(-rx*.28,ry*.48)]
 polygon(d,pts,main,dark,.75)
 line(d,[pts[0],pts[3]],hot,.7)
def mushroom(d,x,y,s,gold,bright,ink):
 # Small recognizable fungus silhouette, with stem and dotted cap.
 polygon(d,[(x-2*s,y),(x+2*s,y),(x+1.1*s,y-6*s),(x-1.3*s,y-6*s)],bright,ink,.6)
 ellipse(d,x,y-5.7*s,6*s,3.8*s,gold,ink,.7)
 ellipse(d,x-2.3*s,y-6.3*s,1.1*s,.9*s,bright)
 ellipse(d,x+1.9*s,y-5.2*s,.7*s,.7*s,bright)
def root(d,cx,cy,scale,phase,primary,highlight,outline):
 # Branching plant roots curling around a victim, not a static circle.
 for j in range(4):
  a=-2.6+j*.78+phase*.20
  length=(13+j%2*7)*scale
  pts=[]
  for k in range(11):
   t=k/10
   x=cx+math.cos(a)*length*t + math.sin(t*TAU+phase+j)*6*scale*t
   y=cy+math.sin(a)*length*t + math.sin(t*3+phase+j)*7*scale*t
   pts.append((x,y))
  line(d,pts,outline,3.2*scale)
  line(d,pts,primary,1.9*scale)
  line(d,pts[3:8],highlight,.7*scale)
  end=pts[-1]
  leaf(d,end[0],end[1],5*scale,2.5*scale,a+j*.7,primary,highlight,outline)
def cloud(d,rng,x,y,power,colors,count=13):
 a,b,c=colors
 for j in range(count):
  theta=TAU*j/count+rng.uniform(-.33,.33)
  radius=(7+32*power)*rng.uniform(.46,1.08)
  cx=x+math.cos(theta)*radius
  cy=y+math.sin(theta)*radius*.7
  rr=rng.uniform(3.7,10.5)*(.34+.66*power)
  ellipse(d,cx,cy,rr,rr*.73,(c[0],c[1],c[2],int(48+76*power)),None)
  if j%3==0:
   ellipse(d,cx-1.1,cy-1.1,rr*.48,rr*.39,(a[0],a[1],a[2],145),None)
def render(name,i):
 rng=random.Random(80519+NAMES.index(name)*2037+i*331)
 energy=(.10,.32,.58,.82,1,.93,.71,.30)[i]
 hot=PALETTES[name][1]
 main=PALETTES[name][0]
 dark=PALETTES[name][2]
 im=Image.new('RGBA',(S*AA,S*AA))
 d=ImageDraw.Draw(im,'RGBA')
 cx,cy=96,101
 if name=='stun-spore':
  # Launch, cloud, clinging amber grains, brief electric-botanic paralysis.
  shift=(-57,-36,-18,-4,6,3,0,0)[i]
  cloud(d,rng,cx+shift,cy,energy,(main,hot,dark),12)
  for j in range(29+int(57*energy)):
   ang=rng.uniform(0,TAU)
   dist=math.sqrt(rng.random())*(8+70*energy)
   xx=cx+shift+math.cos(ang)*dist
   yy=cy+math.sin(ang)*dist*.78
   radius=rng.uniform(.65,2.6)*(0.40+.75*energy)
   ellipse(d,xx,yy,radius,radius,main)
   if j%7==0:star(d,xx,yy,rng.uniform(2.8,5.5)*energy,hot,dark)
  if i>=4:
   for j in range(6):
    a=j*TAU/6+rng.uniform(-.15,.15)
    rr=(13+31*energy)*rng.uniform(.85,1.1)
    sx,sy=cx+math.cos(a)*rr,cy+math.sin(a)*rr
    star(d,sx,sy,4.5*energy,hot,main)
    if j%2==0:
     line(d,[(sx-6,sy+1),(sx,sy-4),(sx+6,sy+2)],hot,1.1)
 elif name=='po-do-sono':
  # Slow, delicate green dream mist and wind curves around the target.
  shift=(-55,-33,-14,0,2,1,0,0)[i]
  cloud(d,rng,cx+shift,cy+2,energy,(main,hot,dark),19)
  for j in range(52+int(43*energy)):
   a=rng.uniform(0,TAU)
   r=rng.random()*(14+66*energy)
   x=cx+shift+math.cos(a)*r
   y=cy+math.sin(a)*r*.70+rng.uniform(-7,7)
   ellipse(d,x,y,rng.uniform(.5,1.7),rng.uniform(.5,1.7),
      (main[0],main[1],main[2],int(98+108*energy)))
  if i>=3:
   for j in range(3):
    yy=cy-9+j*15
    pts=[(cx-43*energy,yy+6),(cx-18*energy,yy-7),
      (cx+7*energy,yy+2),(cx+39*energy,yy-5)]
    line(d,pts,(179,253,189,160),1.15)
  if i>=5:
   for j in range(i-3):
    x=cx+rng.uniform(-23,24)
    y=cy-37-rng.uniform(3,12)
    # minimal triple stroke suspended z without text fonts
    for q in range(2):
     z=4.5+q*2
     line(d,[(x,y),(x+z,y),(x,y+z),(x+z,y+z)],(220,255,207,228),1)
     x+=10;y-=8
 elif name=='leech-seed':
  # Single luminous seed travels to target; sprouting roots siphon light back.
  travel=(.04,.25,.47,.70,.94,1,1,1)[i]
  x=31+69*travel
  y=98-17*math.sin(travel*math.pi)
  ellipse(d,x,y,5+3*energy,7+4*energy,(34,99,36,248),dark,1)
  ellipse(d,x-1,y-2,3+2*energy,5+3*energy,hot)
  for j in range(8):
   u=j/8
   xx=35+(x-35)*u
   yy=99-14*math.sin(u*math.pi)+rng.uniform(-4,4)
   ellipse(d,xx,yy,2.2*(1-u)+1,1.4*(1-u)+1,
      (main[0],main[1],main[2],int(120+80*energy)))
  if i>=3:
   root(d,cx+7,cy+8,energy,i*.55,main,hot,(22,91,58,210))
  if i>=5:
   for j in range(9):
    t=j/8
    xx=(cx+8)*(1-t)+25*t
    yy=cy+6-14*math.sin(math.pi*t)+rng.uniform(-4,4)
    star(d,xx,yy,rng.uniform(2,4.5)*energy,hot,main)
 elif name=='esporos':
  # Dense luminous fungal burst from sender expanding around the foe.
  cloud(d,rng,cx,cy,energy,(main,hot,dark),18)
  for j in range(21+int(69*energy)):
   ang=rng.uniform(0,TAU)
   r=(8+73*energy)*math.sqrt(rng.random())
   px=cx+math.cos(ang)*r
   py=cy+math.sin(ang)*r*.79
   ellipse(d,px,py,rng.uniform(.8,2.65),rng.uniform(.8,2.65),hot if j%6==0 else main)
   if j%12==0:star(d,px,py,4*energy,hot,dark)
  if i>=3:
   for j in range(5+int(3*energy)):
    a=TAU*j/(5+int(3*energy))
    radius=13+40*energy
    x=cx+math.cos(a)*radius
    y=cy+math.sin(a)*radius*.7
    mushroom(d,x,y,.44+.31*energy,main,hot,(41,91,59,221))
  if i>=5:
   for j in range(6):
    a=TAU*j/6+i*.12
    x=cx+math.cos(a)*21*energy
    y=cy+math.sin(a)*18*energy
    ellipse(d,x,y,6*energy,4*energy,(165,234,97,160))
 bloom=im.filter(ImageFilter.GaussianBlur(2.4*AA))
 bloom.putalpha(bloom.getchannel('A').point(lambda z:int(z*.16)))
 bloom.alpha_composite(im)
 return bloom.resize((S,S),Image.Resampling.LANCZOS)
def generate(names):
 for name in names:
  target=ROOT/name
  target.mkdir(parents=True,exist_ok=True)
  atlas=Image.new('RGBA',(8*S,S))
  frames=set()
  for i in range(8):
   frame=render(name,i)
   assert frame.getbbox(),(name,i,'empty')
   frames.add(frame.tobytes())
   atlas.paste(frame,(i*S,0))
  assert len(frames)==8,(name,'duplicate frames')
  output=target/'atlas.png'
  atlas.save(output,optimize=True)
  print('PASS',name,atlas.size,'8 distinct RGBA frames',output.stat().st_size,'bytes')
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--move',choices=['all',*NAMES],default='all')
 chosen=ap.parse_args().move
 generate(NAMES if chosen=='all' else [chosen])
