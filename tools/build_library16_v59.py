#!/usr/bin/env python3
"""Pokemon Torre V59: sixteen ORIGINAL cinematic spell atlases, 8 frames each.
Painted afresh inspired by the user's V59 sprite references. Does not copy
commercial watermarked artwork or overwrite any approved game sprite.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math,random,argparse
S=2
N=160
TAU=math.tau
OUT=Path(__file__).resolve().parents[1]/"effects/elements/v59"
EFFECTS=("fire_attack","firewall","explosion","sun_strike","lightning","lightning_ball",
"tornado","water_attack","spikes","shield","black_hole","hypnosis","magic_arrow",
"midas_touch","cloud","time")
PALETTES={
"fire_attack":((255,88,19,245),(255,218,69,250),(28,12,41,255)),
"firewall":((242,56,28,248),(255,184,43,255),(31,14,40,255)),
"explosion":((255,100,49,250),(255,239,124,255),(37,24,44,255)),
"sun_strike":((247,144,30,252),(255,242,149,255),(77,37,62,255)),
"lightning":((50,126,255,248),(238,252,255,255),(17,28,85,255)),
"lightning_ball":((96,83,253,252),(230,244,255,255),(24,17,96,255)),
"tornado":((95,199,247,245),(224,251,255,255),(30,66,116,255)),
"water_attack":((21,138,252,245),(187,249,255,255),(12,53,126,255)),
"spikes":((113,117,169,255),(240,235,255,255),(30,24,63,255)),
"shield":((56,192,246,190),(230,255,255,255),(13,49,112,255)),
"black_hole":((98,61,197,255),(236,125,248,250),(13,8,42,255)),
"hypnosis":((154,78,255,244),(255,220,255,255),(46,19,94,255)),
"magic_arrow":((147,80,241,248),(248,219,255,255),(42,19,104,255)),
"midas_touch":((252,162,24,252),(255,249,154,255),(85,49,24,255)),
"cloud":((104,183,60,235),(215,251,92,252),(37,54,43,255)),
"time":((59,202,215,242),(255,243,184,255),(28,46,92,255))}
def P(x,y):return (round(x*S),round(y*S))
def line(d,points,color,width=2):
 d.line([P(*p) for p in points],fill=color,width=max(1,round(width*S)),joint="curve")
def poly(d,pts,fill,outline=None,width=1.5):
 xy=[P(*p) for p in pts]
 d.polygon(xy,fill=fill)
 if outline:line(d,pts+[pts[0]],outline,width)
def ell(d,x,y,rx,ry,color,outline=None,w=2):
 d.ellipse([P(x-rx,y-ry),P(x+rx,y+ry)],fill=color,outline=outline,width=max(1,round(w*S)))
def star(d,x,y,r,col,white):
 pts=[]
 for j in range(10):
  a=j*TAU/10-math.pi/2
  m=r if j%2==0 else r*.24
  pts.append((x+math.cos(a)*m,y+math.sin(a)*m))
 poly(d,pts,col,None)
 ell(d,x,y,r*.15,r*.15,white)
def burst(d,x,y,power,main,light,dark,seed,arms=9):
 rg=random.Random(seed)
 for j in range(arms):
  a=TAU*j/arms+rg.uniform(-.12,.12)
  r=(13+35*power)*rg.uniform(.77,1.25)
  inner=11*power
  v=(math.cos(a),math.sin(a))
  w=(-v[1],v[0])
  poly(d,[(x+v[0]*inner+w[0]*3.8,y+v[1]*inner+w[1]*3.8),
    (x+v[0]*r,y+v[1]*r),
    (x+v[0]*inner-w[0]*3.8,y+v[1]*inner-w[1]*3.8)],main,dark,1)
 ell(d,x,y,6+7*power,6+7*power,light,dark,1)
def sparks(d,x,y,amount,r,main,light,seed):
 rg=random.Random(seed)
 for i in range(amount):
  a=rg.random()*TAU
  dist=rg.uniform(4,r)
  p=(x+math.cos(a)*dist,y+math.sin(a)*dist*.85)
  if i%3==0:star(d,*p,rg.uniform(1.7,3.8),light,light)
  else:ell(d,*p,rg.uniform(1.0,2.9),rg.uniform(1,2.7),main)
def bolt(d,origin,dest,seed,width,main,light,dark,branches=2):
 rg=random.Random(seed)
 dx=dest[0]-origin[0];dy=dest[1]-origin[1]
 perp=(-dy,dx);mag=max(1,math.hypot(dx,dy))
 pts=[origin]
 for k in range(1,9):
  t=k/9
  jag=rg.uniform(-1,1)*min(15,mag*.15)*math.sin(math.pi*t)
  pts.append((origin[0]+dx*t+perp[0]/mag*jag,origin[1]+dy*t+perp[1]/mag*jag))
 pts.append(dest)
 line(d,pts,dark,width+4)
 line(d,pts,main,width+1.6)
 line(d,pts,light,max(1.5,width*.42))
 for j in range(branches):
  at=2+j*2
  if at>=len(pts)-1:continue
  a=pts[at]
  v=(dx*.18+rg.uniform(-28,28),dy*.19+rg.uniform(-15,15))
  end=(a[0]+v[0],a[1]+v[1])
  line(d,[a,(a[0]+v[0]*.45+rg.uniform(-6,6),a[1]+v[1]*.50),end],main,max(1.5,width*.4))
def flame(d,x,y,height,w,main,light,dark,phase):
 height=max(4,height)
 p=[(x-w*.60,y),(x-w*.56,y-height*.43),(x-w*.27,y-height*.33),
 (x-w*.10,y-height*.95),(x+w*.14,y-height*.61),(x+w*.39,y-height*.78),
 (x+w*.39,y-height*.43),(x+w*.69,y-height*.28),(x+w*.47,y)]
 poly(d,p,main,dark,2)
 inner=[(x-w*.28,y),(x-w*.18,y-height*.33),(x,y-height*(.54+.04*math.sin(phase))),
 (x+w*.18,y-height*.26),(x+w*.28,y)]
 poly(d,inner,light,None)
def diamond(d,x,y,rx,ry,main,light,dark,angle=0):
 ca,sa=math.cos(angle),math.sin(angle)
 coords=[(0,-ry),(rx*.72,-ry*.30),(rx*.65,ry*.7),(0,ry),(-rx*.73,ry*.65),(-rx*.68,-ry*.3)]
 def rotate(a,b):return (x+a*ca-b*sa,y+a*sa+b*ca)
 pts=[rotate(a,b) for a,b in coords]
 poly(d,pts,main,dark,1.8)
 poly(d,[pts[0],pts[1],rotate(0,ry*.25),rotate(0,-ry*.50)],light,None)
 line(d,[pts[0],rotate(0,ry*.25),pts[3]],light,1.2)
def swirl(d,cx,cy,rx,ry,a0,turns,main,light,dark,width=4):
 pts=[]
 for k in range(94):
  t=k/93
  a=a0+t*TAU*turns
  r=.1+.9*t
  pts.append((cx+math.cos(a)*rx*r,cy+math.sin(a)*ry*r))
 line(d,pts,dark,width+3)
 line(d,pts,main,width)
 line(d,pts[11:58],light,max(.9,width*.30))
def draw_frame(kind,i):
 main,light,dark=PALETTES[kind]
 im=Image.new("RGBA",(N*S,N*S))
 d=ImageDraw.Draw(im,"RGBA")
 rg=random.Random(9801+EFFECTS.index(kind)*331+i*101)
 t=i/7
 power=[.22,.40,.65,.85,1,.94,.66,.27][i]
 x,y=80,85
 a=i*.35
 if kind=="fire_attack":
  flame(d,x,y+20,59*power,31*power,main,light,dark,a)
  for j in range(4):
   flame(d,x+rg.randrange(-27,28)*power,y+23+rg.randrange(-11,12),rg.uniform(13,31)*power,rg.uniform(6,12)*power,main,light,dark,a+j)
  sparks(d,x,y,15,55*power,main,light,200+i)
 elif kind=="firewall":
  for j in range(7):
   xx=28+j*17
   flame(d,xx,129,rg.uniform(44,93)*power,20*power,main,light,dark,a+j)
  line(d,[(22,129),(139,129)],light,2.8)
  sparks(d,80,67,21,75*power,main,light,1321+i)
 elif kind=="explosion":
  burst(d,x,y,1.3*power,main,light,dark,134+i,13)
  for j in range(4):ell(d,x+rg.randrange(-31,31)*power,y+rg.randrange(-21,21)*power,11*power,8*power,main,dark)
  sparks(d,x,y,29,69*power,main,light,209+i)
 elif kind=="sun_strike":
  ell(d,x,53,26*power,26*power,main,dark,2.6)
  for j in range(12):
   ang=TAU*j/12+i*.06
   r=25*power
   line(d,[(x+math.cos(ang)*r,53+math.sin(ang)*r),
           (x+math.cos(ang)*(r+14*power),53+math.sin(ang)*(r+14*power))],light,3)
  poly(d,[(68,67),(91,67),(112,134),(52,134)],main,dark,2)
  poly(d,[(76,65),(87,65),(91,133),(70,133)],light,None)
  burst(d,80,131,power,main,light,dark,230+i,8)
 elif kind=="lightning":
  bolt(d,(60,9),(101,135),400+i,7.8*power,main,light,dark,4)
  bolt(d,(114,25),(86,121),830+i,3.4*power,main,light,dark,3)
  sparks(d,98,127,17,42*power,main,light,101+i)
 elif kind=="lightning_ball":
  for j in range(6):
   ang=TAU*j/6+a
   bolt(d,(x+math.cos(ang)*12,y+math.sin(ang)*12),
     (x+math.cos(ang)*(21+40*power),y+math.sin(ang)*(21+40*power)),510+i*7+j,3.6*power,main,light,dark,1)
  ell(d,x,y,22*power,22*power,main,dark,3)
  ell(d,x-4,y-6,11*power,11*power,light,None)
  sparks(d,x,y,17,62*power,main,light,70+i)
 elif kind=="tornado":
  for arm in range(3):
   pts=[]
   for k in range(38):
    v=k/37
    yy=131-v*98*power
    radius=(11+38*v)*power
    ang=arm*TAU/3+v*TAU*2.1+a
    pts.append((x+math.cos(ang)*radius,yy))
   line(d,pts,dark,10*power)
   line(d,pts,main,7.0*power)
   line(d,pts,light,1.8*power)
  sparks(d,x,120,14,63*power,main,light,220+i)
 elif kind=="water_attack":
  # Crest of the splash, pointed waves and distinct flying droplets.
  for k in range(5):
   xx=31+k*25
   curve=[(xx-14,113),(xx,78-rg.randrange(5,33)*power),(xx+11,106),(xx+21,123)]
   line(d,curve,dark,12*power)
   line(d,curve,main,8*power)
   line(d,curve,light,2.7*power)
  ell(d,79,122,51*power,12*power,main,dark,2)
  sparks(d,78,80,21,73*power,main,light,551+i)
 elif kind=="spikes":
  for k in range(6):
   xx=23+k*23
   h=(32+(k%3)*13)*power
   diamond(d,xx,122-h*.65,9*power,h,main,light,dark,(k-2)*.11)
  line(d,[(10,129),(151,129)],dark,3)
  sparks(d,x,109,12,67*power,main,light,333+i)
 elif kind=="shield":
  rad=30+34*power
  pts=[(x+rad*math.cos(a+TAU*j/6),y+rad*math.sin(a+TAU*j/6)) for j in range(6)]
  poly(d,pts,(32,117,196,55),dark,3.8)
  line(d,pts+[pts[0]],main,5)
  inner=[(x+rad*.80*math.cos(a+TAU*j/6),y+rad*.80*math.sin(a+TAU*j/6)) for j in range(6)]
  line(d,inner+[inner[0]],light,2)
  line(d,[(55,96),(73,114),(108,57)],light,4)
  sparks(d,x,y,12,rad,main,light,223+i)
 elif kind=="black_hole":
  for z in range(4):
   swirl(d,x,y,52*power+z*4,32*power+z*3,a+z*TAU/4,1.06,main,light,dark,5.5*power)
  ell(d,x,y,21*power,18*power,(7,2,22,255),(215,91,245,255),2.7)
  sparks(d,x,y,18,66*power,main,light,226+i)
 elif kind=="hypnosis":
  for j in range(3):
   swirl(d,x,y,(29+j*15)*power,(29+j*15)*power,a+j*TAU/3,1,main,light,dark,3.5*power)
  for j in range(6):
   ang=TAU*j/6+a
   star(d,x+math.cos(ang)*44*power,y+math.sin(ang)*44*power,5*power,light,light)
 elif kind=="magic_arrow":
  poly(d,[(19,109),(106,61),(95,51),(138,43),(124,87),(117,73),(31,123)],main,dark,2)
  poly(d,[(29,111),(113,63),(112,57),(126,51),(119,66)],light,None)
  line(d,[(14,125),(55,96)],light,4*power)
  sparks(d,82,79,16,62*power,main,light,301+i)
 elif kind=="midas_touch":
  for j in range(7):
   ang=j*TAU/7+a*.30
   xx=x+math.cos(ang)*35*power;yy=y+math.sin(ang)*31*power
   diamond(d,xx,yy,8*power,18*power,main,light,dark,ang)
  burst(d,x,y,.8*power,main,light,dark,700+i,9)
  sparks(d,x,y,21,70*power,main,light,47+i)
 elif kind=="cloud":
  for j in range(15):
   xx=x+rg.randrange(-46,47)*power
   yy=y+rg.randrange(-30,31)*power
   r=rg.randrange(14,29)*power
   ell(d,xx,yy,r,r*.70,main,dark,2.4)
   ell(d,xx-3,yy-4,r*.48,r*.26,light,None)
  for j in range(5):ell(d,x+rg.randrange(-53,54)*power,110+rg.randrange(0,32),3.0*power,5.0*power,light,None)
 elif kind=="time":
  rad=27+31*power
  for j in range(4):
   pts=[]
   for k in range(44):
    theta=a+TAU*(k/43)*(1.0-j*.08)+j*.13
    r=rad*(1.10-.14*j)
    pts.append((x+math.cos(theta)*r,y+math.sin(theta)*r))
   line(d,pts,dark,5.6)
   line(d,pts,main if j%2 else light,2.2)
  for k in range(12):
   ang=TAU*k/12
   r=rad*.83
   line(d,[(x+math.cos(ang)*r,y+math.sin(ang)*r),
     (x+math.cos(ang)*(r-5),y+math.sin(ang)*(r-5))],light,1.6)
  line(d,[(x,y),(x+math.sin(a)*rad*.53,y-math.cos(a)*rad*.53)],light,3.4)
  line(d,[(x,y),(x+math.cos(a)*rad*.29,y+math.sin(a)*rad*.29)],light,3)
  star(d,x,y,6*power,main,light)
 # Filmic glow behind sharp inked edges; transparent source PNG 8 actual frames.
 blurred=im.filter(ImageFilter.GaussianBlur(4*S))
 blurred.putalpha(blurred.getchannel("A").point(lambda alpha:int(alpha*.17)))
 blurred.alpha_composite(im)
 return blurred.resize((N,N),Image.Resampling.LANCZOS)
def build(effects):
 for name in effects:
  folder=OUT/name
  folder.mkdir(parents=True,exist_ok=True)
  atlas=Image.new("RGBA",(8*N,N))
  unique=set()
  for n in range(8):
   frame=draw_frame(name,n)
   unique.add(frame.tobytes())
   atlas.paste(frame,(n*N,0))
  assert len(unique)==8,(name,"frames must differ")
  atlas.save(folder/"atlas.png",optimize=True)
  print("PASS",name,"8 RGBA frames", (folder/"atlas.png").stat().st_size)
if __name__=="__main__":
 p=argparse.ArgumentParser()
 p.add_argument("--effect",choices=["all",*EFFECTS],default="all")
 args=p.parse_args()
 build(EFFECTS if args.effect=="all" else [args.effect])
