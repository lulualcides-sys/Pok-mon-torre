#!/usr/bin/env python3
"""Pokémon Torre V60: four targeted 8-frame spell sequences.
Only Tempestade de Neve, Nevasca, Faísca do Pikachu and Volt Tackle.
Original artwork, transparent 256px atlas frames. No commercial artwork copied.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math,random,argparse

SIZE=256
AA=2
TAU=math.tau
ROOT=Path(__file__).resolve().parents[1]/"effects/moves/v60-four"
MOVES=('tempestade-de-neve','nevasca','faisca-do-pikachu','volt-tackle')
ICE=(72,181,250,248)
ICY=(221,252,255,255)
NAVY=(5,33,75,252)
BLUE=(24,112,212,254)
GOLD=(255,178,28,255)
YELLOW=(255,241,124,255)
INK=(61,29,14,250)
AQUA=(23,207,244,255)
def p(xy):return tuple(round(v*AA) for v in xy)
def line(d,pts,fill,w=2):
 d.line([p(x) for x in pts],fill=fill,width=max(1,round(w*AA)),joint="curve")
def polygon(d,pts,col,outline=None,width=2):
 px=[p(v) for v in pts];d.polygon(px,fill=col)
 if outline:line(d,pts+[pts[0]],outline,width)
def orb(d,x,y,rx,ry,col,out=None,width=2):
 d.ellipse([p((x-rx,y-ry)),p((x+rx,y+ry))],fill=col,outline=out,width=max(1,round(width*AA)))
def ellipse_line(d,x,y,rx,ry,col,w=2):
 d.ellipse([p((x-rx,y-ry)),p((x+rx,y+ry))],outline=col,width=max(1,round(w*AA)))
def spark(d,x,y,r,col=ICY):
 for a in range(4):
  theta=a*math.pi/4
  vx,vy=math.cos(theta),math.sin(theta)
  line(d,[(x-vx*r,y-vy*r),(x+vx*r,y+vy*r)],NAVY,2.5)
  line(d,[(x-vx*r,y-vy*r),(x+vx*r,y+vy*r)],col,1.4)
 orb(d,x,y,max(1,r*.14),max(1,r*.14),col)
def crystal(d,x,y,w,h,angle=0,blue=False):
 ca,sa=math.cos(angle),math.sin(angle)
 def rot(a,b):return (x+a*ca-b*sa,y+a*sa+b*ca)
 pts=[rot(0,-h),rot(w*.72,-h*.36),rot(w*.60,h*.70),rot(0,h),rot(-w*.73,h*.62),rot(-w*.72,-h*.37)]
 polygon(d,pts,BLUE if blue else ICE,NAVY,1.7)
 polygon(d,[pts[0],pts[1],rot(0,h*.35),rot(0,-h*.28)],ICY)
 polygon(d,[pts[2],pts[3],rot(0,h*.35)],AQUA)
 line(d,[pts[0],rot(0,h*.35),pts[3]],ICY,1)
def snowflake(d,x,y,r,seed,opacity=1):
 rot=(seed%7)*.05
 for j in range(6):
  ang=TAU*j/6+rot;vx,vy=math.cos(ang),math.sin(ang)
  tip=(x+vx*r,y+vy*r)
  line(d,[(x,y),tip],NAVY,4.2)
  line(d,[(x,y),tip],ICY,2.15)
  for t in (.57,.80):
   cx,cy=x+vx*r*t,y+vy*r*t
   for side in (-1,1):
    a=ang+math.pi+side*.68
    line(d,[(cx,cy),(cx+math.cos(a)*r*.25,cy+math.sin(a)*r*.25)],AQUA,1.4)
 orb(d,x,y,2.6,2.6,ICY,NAVY,1)
def streak(d,rng,x,y,dx,scale,color,out):
 pts=[(x,y),(x+dx*.24,y-rng.uniform(3,13)*scale),(x+dx*.65,y+rng.uniform(-7,7)*scale),(x+dx,y)]
 line(d,pts,out,5*scale)
 line(d,pts,color,2.5*scale)
def lightning(d,start,end,rng,width=8,branches=3,color=GOLD,core=YELLOW):
 dx,dy=end[0]-start[0],end[1]-start[1]
 mag=max(1,math.hypot(dx,dy));nx,ny=-dy/mag,dx/mag
 pts=[start]
 for k in range(1,7):
  t=k/7;jag=rng.uniform(-.30,.30)*mag*math.sin(math.pi*t)
  pts.append((start[0]+dx*t+nx*jag,start[1]+dy*t+ny*jag))
 pts.append(end)
 line(d,pts,INK,width+4)
 line(d,pts,color,width)
 line(d,pts,core,max(1.5,width*.40))
 for j in range(branches):
  a=pts[(j+1)%5+1]
  b=(a[0]+rng.uniform(-26,26),a[1]+rng.uniform(-28,28))
  line(d,[a,((a[0]+b[0])*.5+rng.uniform(-6,6),(a[1]+b[1])*.5),b],INK,max(2,width*.47)+2)
  line(d,[a,((a[0]+b[0])*.5+rng.uniform(-6,6),(a[1]+b[1])*.5),b],color,max(1.5,width*.4))
def flecks(d,rng,x,y,spread,count,colors):
 for j in range(count):
  a=rng.uniform(0,TAU);r=rng.uniform(7,spread)
  px,py=x+math.cos(a)*r,y+math.sin(a)*r*.70
  if j%7==0:spark(d,px,py,rng.uniform(2,6),colors[j%len(colors)])
  else:orb(d,px,py,rng.uniform(.9,3.2),rng.uniform(1,3.6),colors[j%len(colors)])
def gust(d,rng,cx,cy,reach,strength,blue=True,phase=0):
 for j in range(6):
  py=cy+(j-3)*18+rng.uniform(-6,6)
  x0=cx-105+((j+phase)%3)*14
  x1=x0+reach*(.7+.14*(j%3))
  # sweeping snowy contrails, tapering and slightly curved
  pts=[(x0,py),(x0+reach*.22,py-rng.uniform(7,18)),(x0+reach*.61,py-6),(x1,py+9)]
  line(d,pts,NAVY,strength+3)
  line(d,pts,ICE if blue else ICY,strength)
  line(d,pts[1:3],ICY,max(1.5,strength*.25))
def flare(d,x,y,r,rng,blue):
 for i in range(15):
  a=TAU*i/15+rng.uniform(-.09,.09)
  rr=r*rng.uniform(.76,1.15)
  v=(math.cos(a),math.sin(a));n=(-v[1],v[0])
  pts=[(x+v[0]*r*.22+n[0]*4,y+v[1]*r*.22+n[1]*4),
  (x+v[0]*rr,y+v[1]*rr),
  (x+v[0]*r*.22-n[0]*4,y+v[1]*r*.22-n[1]*4)]
  polygon(d,pts,ICE if blue else GOLD,NAVY if blue else INK,1.3)
 orb(d,x,y,r*.27,r*.27,ICY if blue else YELLOW,NAVY if blue else INK,2)
def draw(kind,i):
 rng=random.Random(8051+MOVES.index(kind)*2351+i*683)
 im=Image.new('RGBA',(SIZE*AA,SIZE*AA))
 d=ImageDraw.Draw(im,'RGBA')
 progress=i/7
 energy=(.22,.39,.66,.89,1,.95,.68,.27)[i]
 cx,cy=128,132
 if kind=='tempestade-de-neve':
  # Fast blizzard wind spirals and separate crystalline snowfall.
  for j in range(3):
   gust(d,rng,cx,cy-22+j*15,110+75*energy,2.5+1.8*energy,phase=i+j)
  for j in range(25+int(35*energy)):
   x=rng.uniform(10,245);y=rng.uniform(18,216)
   r=rng.uniform(1.4,4.1)*energy
   orb(d,x,y,r,r,ICY if j%3 else ICE)
  for j in range(4):
   theta=TAU*j/4+i*.32
   x=cx+math.cos(theta)*(42+37*energy)
   y=cy+math.sin(theta)*37
   snowflake(d,x,y,(7+10*energy)*(1.2 if j==0 else .8),i*13+j)
  if i>=3:
   for j in range(6):
    x=cx+rng.uniform(-47,48);y=135+rng.uniform(-33,35)
    crystal(d,x,y,rng.uniform(5,10)*energy,rng.uniform(14,26)*energy,rng.uniform(-.6,.6))
  if i in (4,5,6):
   ellipse_line(d,cx,190,45+26*energy,13+4*energy,AQUA,2.5)
   flecks(d,rng,cx,cy,75,23,[ICE,ICY,AQUA])
 elif kind=='nevasca':
  # More violent than snowfall: thick crossing hail fronts, crystalline impact.
  for j in range(7):
   x=cx-100+(j%4)*11
   y=47+j*26
   streak(d,rng,x,y,90+75*energy,energy*.8+0.3,ICE,NAVY)
  for j in range(12):
   x=rng.uniform(25,230);y=rng.uniform(17,203)
   crystal(d,x,y,rng.uniform(3,8),rng.uniform(8,20)*energy,rng.uniform(-.9,.9),j%3==0)
  if i>=2:
   # Tall angular shards slam down to the grounded impact marker.
   for j in range(5):
    x=74+j*27
    h=(20+43*energy)*(1 if j%2 else .8)
    crystal(d,x,198-h*.65,9+6*energy,h,rng.uniform(-.25,.25))
   flare(d,cx,185,23+48*energy,rng,True)
  for j in range(4):
   gust(d,rng,cx,105+j*11,100+72*energy,1.3+2.4*energy,phase=i+j)
  if i>3:
   ellipse_line(d,cx,196,41+40*energy,16+6*energy,ICY,3.5)
   flecks(d,rng,cx,155,89,30,[ICE,ICY,AQUA])
 elif kind=='faisca-do-pikachu':
  # Electric rush wraps attacker in a distinct irregular corona. End: contact burst.
  ellipse_line(d,cx,175,39+23*energy,12, GOLD,3)
  for j in range(5):
   ang=TAU*j/5+i*.21
   rr=44+36*energy
   dest=(cx+math.cos(ang)*rr,cy+math.sin(ang)*rr*.91)
   start=(cx+math.cos(ang)*(13+9*energy),cy+math.sin(ang)*(13+9*energy))
   lightning(d,start,dest,rng,5+3*energy,2,GOLD,YELLOW)
  if i in (2,3,4,5):
   for j in range(4):
    y=87+j*30+rng.uniform(-6,6)
    streak(d,rng,10,y,95+35*energy,1.0,GOLD,INK)
  flecks(d,rng,cx,cy,44+39*energy,15+int(18*energy),[GOLD,YELLOW,(255,250,206,255)])
  if i in (4,5,6):flare(d,cx+20,cy,28+55*energy,rng,False)
  else:orb(d,cx,cy,15*energy,15*energy,YELLOW,INK,2)
 elif kind=='volt-tackle':
  # Physical electric tackle — pointed golden armor wave, body-length trails,
  # and a big collision blast before retracting, not a distant static bolt.
  for j in range(7):
   y=64+j*20+rng.uniform(-5,6)
   streak(d,rng,8,y,98+74*energy,1.25,GOLD,INK)
  polygon(d,[(44,125),(77,105),(65,87),(121,104),(155,73),(169,108),
       (216,126),(168,155),(151,193),(122,164),(63,175),(86,148)],
      GOLD,INK,4)
  polygon(d,[(83,122),(114,108),(107,100),(145,119),(177,124),(148,143),(110,157)],
      YELLOW,None)
  for j in range(5):
   lightning(d,(cx+rng.uniform(-30,20),cy+rng.uniform(-32,34)),
       (cx+rng.uniform(-102,102),cy+rng.uniform(-74,74)),rng,6+3*energy,3,GOLD,YELLOW)
  if i in (4,5,6):
   flare(d,180,cy,38+49*energy,rng,False)
   flecks(d,rng,190,cy,57,26,[GOLD,YELLOW,(255,255,236,255)])
  else:flecks(d,rng,126,cy,60,16,[GOLD,YELLOW])
 else:raise KeyError(kind)
 bloom=im.filter(ImageFilter.GaussianBlur(4*AA))
 bloom.putalpha(bloom.getchannel('A').point(lambda a:int(a*.22)))
 bloom.alpha_composite(im)
 return bloom.resize((SIZE,SIZE),Image.Resampling.LANCZOS)
def main(selected):
 for kind in selected:
  dest=ROOT/kind
  dest.mkdir(parents=True,exist_ok=True)
  atlas=Image.new('RGBA',(8*SIZE,SIZE))
  pixels=set()
  for i in range(8):
   frame=draw(kind,i)
   assert frame.getbbox(),(kind,i,'blank')
   pixels.add(frame.tobytes())
   atlas.paste(frame,(i*SIZE,0))
  assert len(pixels)==8,kind
  atlas.save(dest/'atlas.png',optimize=True)
  print('PASS',kind,'eight frames', (dest/'atlas.png').stat().st_size)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--move',choices=('all',)+MOVES,default='all')
 sel=ap.parse_args().move
 main(MOVES if sel=='all' else (sel,))
