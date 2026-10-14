#!/usr/bin/env python3
"""Pokémon Torre V60: four targeted 8-frame spell sequences.
Only Tempestade de Neve, Nevasca, Faísca do Pikachu and Volt Tackle.
Original artwork, transparent 256px atlas frames. No commercial artwork copied.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math,random,argparse

SIZE=256
AA=3
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
def fine_wind(d,rng,cy,energy,phase,quantity=10):
 # Multiple perspective winds with thin luminous threads and dark undertone.
 for j in range(quantity):
  y=cy+(j-(quantity-1)/2)*12+rng.uniform(-5,5)
  x=10+rng.uniform(-9,25)
  ln=145+70*energy+rng.uniform(-25,24)
  lift=rng.uniform(-12,10)
  pts=[(x,y),(x+ln*.24,y-6+lift),(x+ln*.60,y+lift*.6),(x+ln,y+lift*.2)]
  width=.4+1.05*energy*(1 if j%3==0 else .50)
  line(d,pts,NAVY,width+.65)
  line(d,pts,(186,228,245,175) if j%2 else ICY,width)
  if j%3==0:line(d,pts[1:],(71,170,221,130),.5)
def shard_rain(d,rng,x,y,size,angle,light=True):
 # Thin translucent ice needles with etched edges, not cartoon diamonds.
 ux,uy=math.cos(angle),math.sin(angle)
 vx,vy=-uy,ux
 tip=(x+ux*size,y+uy*size)
 root=(x-ux*size*.60,y-uy*size*.60)
 side=(x+vx*size*.12,y+vy*size*.12)
 polygon(d,[tip,(root[0]+vx*size*.12,root[1]+vy*size*.12),
  root,(root[0]-vx*size*.08,root[1]-vy*size*.08)],(43,132,193,170),NAVY,.6)
 line(d,[root,tip],(224,252,255,238) if light else (131,213,248,195),.9)
 line(d,[side,tip],(124,214,246,185),.65)
def plasma_branch(d,rng,start,end,thick=7,level=2,white=True):
 dx,dy=end[0]-start[0],end[1]-start[1]
 dist=max(1,math.hypot(dx,dy))
 nx,ny=-dy/dist,dx/dist
 pts=[start]
 for n in range(1,9):
  t=n/9
  skew=rng.uniform(-.18,.18)*dist*math.sin(math.pi*t)
  pts.append((start[0]+dx*t+nx*skew,start[1]+dy*t+ny*skew))
 pts.append(end)
 line(d,pts,(35,24,23,232),thick+3.5)
 line(d,pts,(255,156,21,250),thick)
 line(d,pts,(255,253,186,255) if white else (255,215,81,255),max(1,thick*.37))
 if level:
  for j in range(level):
   n=min(8,2+j*2)
   origin=pts[n]
   bx=origin[0]+rng.uniform(-26,36)
   by=origin[1]+rng.uniform(-28,26)
   line(d,[origin,((bx+origin[0])*.5+rng.uniform(-9,9),(by+origin[1])*.5),(bx,by)],(64,31,20,198),max(2,thick*.35+2))
   line(d,[origin,((bx+origin[0])*.5+rng.uniform(-5,5),(by+origin[1])*.5),(bx,by)],(255,218,64,220),max(1.0,thick*.28))
def arc(d,cx,cy,rx,ry,angle0,angle1,col,w=2):
 pts=[]
 for j in range(55):
  a=angle0+(angle1-angle0)*j/54
  pts.append((cx+rx*math.cos(a),cy+ry*math.sin(a)))
 line(d,pts,col,w)
def micro_particles(d,rng,amount,energy,ice):
 for j in range(amount):
  x=rng.uniform(8,248);y=rng.uniform(15,235)
  r=rng.uniform(.4,1.9)*max(.4,energy)
  if ice:
   if j%3==0:line(d,[(x-2.5*r,y-r*.9),(x+2.5*r,y+r*.9)],(222,248,255,220),.8)
   else:orb(d,x,y,r,r,(173,225,249,215))
  else:
   if j%5==0:spark(d,x,y,2.1*r,(255,244,155,240))
   else:orb(d,x,y,r,r,(255,217,96,220))

def draw(kind,i):
 rng=random.Random(8051+MOVES.index(kind)*2351+i*683)
 im=Image.new('RGBA',(SIZE*AA,SIZE*AA))
 d=ImageDraw.Draw(im,'RGBA')
 progress=i/7
 energy=(.22,.39,.66,.89,1,.95,.68,.27)[i]
 cx,cy=128,132
 if kind=='tempestade-de-neve':
  # Cold, dense snow vortex; fine crosswinds, volumetric depths and grain.
  fine_wind(d,rng,cy-16,energy,i,13)
  for j in range(6):
   yy=45+j*29+rng.uniform(-5,5)
   arc(d,cx,yy,55+55*energy,17+9*energy,i*.24+j*.2,i*.24+j*.2+math.pi*1.12,
    (115,206,248,138) if j%2 else (232,251,255,192),.75+energy*.35)
  for j in range(13+int(22*energy)):
   x=rng.uniform(10,245)
   y=rng.uniform(15,225)
   shard_rain(d,rng,x,y,rng.uniform(5,18)*energy,rng.uniform(-.95,-.35),j%4==0)
  micro_particles(d,rng,70+int(60*energy),energy,True)
  if i>=3:
   for j in range(7):
    shard_rain(d,rng,rng.uniform(67,194),rng.uniform(115,201),
      rng.uniform(10,24)*energy,rng.uniform(-.9,.9))
  if i in (4,5,6):
   arc(d,cx,178,40+33*energy,12+12*energy,0,math.pi*2,(202,245,255,130),1.0)
   for j in range(9):
    a=TAU*j/9
    line(d,[(cx+math.cos(a)*20,cy+math.sin(a)*18),
        (cx+math.cos(a)*(60+23*energy),cy+math.sin(a)*(42+20*energy))],
       (204,248,255,126),.7)
 elif kind=='nevasca':
  # Hail cuts: diagonal white streaks and sharp, partially transparent splinters.
  fine_wind(d,rng,cy-20,energy,i,9)
  for j in range(32+int(19*energy)):
   xx=rng.uniform(5,254)
   yy=rng.uniform(4,213)
   length=rng.uniform(8,23)*(0.5+energy)
   line(d,[(xx-length*.6,yy-length*.7),(xx+length*.6,yy+length*.7)],
     (24,61,106,135),1.65)
   line(d,[(xx-length*.6,yy-length*.7),(xx+length*.6,yy+length*.7)],
     (214,250,255,203),.7)
  for j in range(13+int(14*energy)):
   shard_rain(d,rng,rng.uniform(28,238),rng.uniform(12,219),
      rng.uniform(7,29)*energy,rng.uniform(.25,1.8),j%3!=0)
  if i>=3:
   for j in range(12):
    xx=39+j*16
    height=(17+rng.uniform(0,25))*energy
    shard_rain(d,rng,xx,196-height*.55,height,rng.uniform(-1.7,-1.4))
   arc(d,cx,197,39+40*energy,9+6*energy,0,TAU,(235,253,255,194),1.0)
   for j in range(14):
    xx=cx+rng.uniform(-73,73);yy=192+rng.uniform(-20,9)
    line(d,[(xx,yy),(xx+rng.uniform(-17,12),yy-rng.uniform(8,35)*energy)],
     (168,227,247,190),.9)
  micro_particles(d,rng,51+int(30*energy),energy,True)
 elif kind=='faisca-do-pikachu':
  # Pikachu's short electric attack: one readable zig-zag, branching at
  # the target. White-hot core with fine black edging, no radial blob.
  travel=(.04,.17,.35,.57,.79,1,.96,.74)[i]
  charge=(.18,.32,.55,.73,1,.95,.64,.20)[i]
  head=(72+119*travel,124-11*math.sin(math.pi*travel))
  tip=(min(242,head[0]+22+12*charge),head[1]+rng.uniform(-7,7))
  if i<7:
   plasma_branch(d,rng,(63,130),head,2.5+3.2*charge,2)
   plasma_branch(d,rng,(head[0]-5,head[1]),tip,2.7+2.2*charge,3)
   if i in (3,4,5):
    plasma_branch(d,rng,(86,141),(head[0]-6,head[1]+9),1.5+1.6*charge,1)
  for j in range(5+int(8*charge)):
   xx=rng.uniform(max(22,head[0]-30),min(245,head[0]+30))
   yy=head[1]+rng.uniform(-32,32)
   r=rng.uniform(1.5,5.5)*charge
   line(d,[(xx-r,yy-r*.6),(xx+r,yy+r*.6)],(50,35,20,155),2)
   line(d,[(xx-r,yy-r*.6),(xx+r,yy+r*.6)],(254,243,165,235),.7)
  if i>=4:
   # A compact off-center 6-spoke impact, not a cartoon lightning ball.
   x,y=min(234,head[0]+8),head[1]
   for j in range(6):
    angle=TAU*(j+.13)/6
    reach=(9+25*charge)*rng.uniform(.78,1.2)
    line(d,[(x+math.cos(angle)*5,y+math.sin(angle)*5),
     (x+math.cos(angle)*reach,y+math.sin(angle)*reach)],
     (35,25,20,170),3.1)
    line(d,[(x+math.cos(angle)*5,y+math.sin(angle)*5),
     (x+math.cos(angle)*reach,y+math.sin(angle)*reach)],
     (255,249,185,239),1.25)
 elif kind=='volt-tackle':
  # A BODY-TRACKING electrical charge, deliberately transparent in the
  # middle so the Pokémon remains visible beneath the thin crackling aura.
  # Backward speed lines and an offset forward collision show real travel.
  run=(.06,.18,.38,.61,.82,1,.96,.70)[i]
  force=(.18,.38,.61,.84,1,.96,.61,.22)[i]
  for j in range(11):
   yy=55+j*14+rng.uniform(-3,3)
   xx=rng.uniform(0,26)
   endx=65+rng.uniform(25,68)*run
   line(d,[(xx,yy),(endx,yy+rng.uniform(-8,8))],(42,30,24,133),2.8)
   line(d,[(xx,yy),(endx,yy+rng.uniform(-8,8))],(255,220,107,191),.9)
  # Three incomplete shells are not a ring/solid yellow polygon.
  for j in range(3):
   angle=(-2.5+j*1.37)+.10*i
   arc(d,118,129,44+8*force,57+7*force,angle,angle+1.01,
      (254,188,34,225),1.6+1.7*force)
   arc(d,118,129,41+8*force,53+7*force,angle,angle+.74,
      (255,249,183,216),.65+.55*force)
  for j in range(7):
   ang=(TAU*j/7)+i*.17
   begin=(118+math.cos(ang)*29,129+math.sin(ang)*37)
   endp=(118+math.cos(ang)*(51+15*force),
         129+math.sin(ang)*(68+6*force))
   plasma_branch(d,rng,begin,endp,2+2.9*force,1)
  # Forward focused electric spear: connected to charge, not free-floating.
  front=(145,126)
  impact=(175+50*run,127+rng.uniform(-11,11))
  plasma_branch(d,rng,front,impact,4+5.3*force,4)
  plasma_branch(d,rng,(140,153),(impact[0]-4,impact[1]+4),2.6+3.9*force,2)
  if i>=3:
   x,y=min(240,impact[0]+3),impact[1]
   for j in range(9):
    ang=TAU*j/9+rng.uniform(-.13,.13)
    reach=(11+33*force)*rng.uniform(.67,1.17)
    start=(x+math.cos(ang)*8,y+math.sin(ang)*8)
    endp=(x+math.cos(ang)*reach,y+math.sin(ang)*reach)
    line(d,[start,endp],(34,25,21,165),3.7)
    line(d,[start,endp],(255,234,110,224),1.5)
  for j in range(17+int(14*force)):
   x=rng.uniform(31,236)
   y=rng.uniform(50,213)
   r=rng.uniform(.6,2.8)*force
   if j%4:orb(d,x,y,r,r,(255,219,88,219))
   else:spark(d,x,y,2*r,(255,252,205,243))
 else:raise KeyError(kind)
 bloom=im.filter(ImageFilter.GaussianBlur((2.0 if kind in ('nevasca','tempestade-de-neve') else 2.4)*AA))
 bloom.putalpha(bloom.getchannel('A').point(lambda a:int(a*(.06 if kind in ('nevasca','tempestade-de-neve') else .09))))
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
