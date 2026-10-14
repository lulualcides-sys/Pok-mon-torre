#!/usr/bin/env python3
"""Author and rasterize actual transparent electric VFX keyframes, once at build."""
import math, random, pathlib
import cairosvg
ROOT=pathlib.Path(__file__).resolve().parent.parent/'effects'/'moves'
MOVES=['faisca','discharge','tempestade-de-raios','trovao']
def start():
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 320" width="280" height="320"><defs><filter id="g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter><radialGradient id="f"><stop stop-color="white"/><stop offset=".2" stop-color="#fffa93" stop-opacity=".97"/><stop offset=".7" stop-color="#ffb62e" stop-opacity=".21"/><stop offset="1" stop-color="#ff9314" stop-opacity="0"/></radialGradient></defs>'
def d(p):return 'M'+' L'.join(f'{x:.2f} {y:.2f}' for x,y in p)
def bolt(x1,y1,x2,y2,seed,w=6,branch=True):
 r=random.Random(seed);dx=x2-x1;dy=y2-y1;L=max(1,math.hypot(dx,dy));nx=-dy/L;ny=dx/L
 steps=max(5,int(L/22));pts=[(x1,y1)]
 for i in range(1,steps):
  u=i/steps;j=(r.random()*2-1)*min(11,L*.14)*math.sin(u*math.pi)
  pts.append((x1+dx*u+nx*j,y1+dy*u+ny*j))
 pts.append((x2,y2));p=d(pts)
 layers=[('#ffe4a0',2.8,.70,'filter="url(#g)"'),('#080815',1.95,1,''),('#bc560d',1.50,1,''),('#ffc727',1.12,1,''),('#fff5a3',.74,1,''),('#ffffff',.40,1,'')]
 out=''.join(f'<path d="{p}" fill="none" stroke="{c}" stroke-width="{w*k:.1f}" stroke-linejoin="miter" opacity="{a}" {opt}/>' for c,k,a,opt in layers)
 if branch and L>46:
  for k in [max(2,int(steps*.4)),max(3,int(steps*.7))]:
   if k>=len(pts)-1:continue
   x,y=pts[k];side=-1 if k%2 else 1;a=math.atan2(dy,dx)+side*(.7+r.random()*.4);size=min(40,L*.2)
   out+=bolt(x,y,x+math.cos(a)*size,y+math.sin(a)*size,seed*11+k,w*.35,False)
 return out
def ring(x,y,rx,ry,seed,a=.8):
 r=random.Random(seed);p=[]
 for i in range(25):
  angle=i*math.tau/24;w=.93+r.random()*.14;p.append((x+math.cos(angle)*rx*w,y+math.sin(angle)*ry*w))
 line=d(p)
 return f'<path d="{line}" fill="none" stroke="#0b0919" stroke-width="8" opacity="{a}"/><path d="{line}" fill="none" stroke="#ffbf27" stroke-width="4" opacity="{a}"/><path d="{line}" fill="none" stroke="#fffbd0" stroke-width="1.6" opacity="{a}"/>'
def spark(x,y,rad,seed,n=7,power=1):
 r=random.Random(seed);out=''
 for i in range(n):
  a=i*math.tau/n+r.random()*.2;L=rad*(.6+.3*r.random())
  out+=bolt(x+math.cos(a)*L*.25,y+math.sin(a)*L*.25,x+math.cos(a)*L,y+math.sin(a)*L,seed+i,2.6*power,False)
 return out
def impact(x,y,seed,size=1):
 r=random.Random(seed);out=f'<ellipse cx="{x}" cy="{y}" rx="{size*58}" ry="{size*50}" fill="url(#f)"/>'
 for i in range(12):
  a=(i+r.random()*.22)*math.tau/12
  t=[(x+math.cos(a)*size*9+math.sin(a)*size*5,y+math.sin(a)*size*9-math.cos(a)*size*5),(x+math.cos(a)*size*(31+r.random()*24),y+math.sin(a)*size*(31+r.random()*24)),(x+math.cos(a)*size*9-math.sin(a)*size*4,y+math.sin(a)*size*9+math.cos(a)*size*4)]
  pts=' '.join(f'{px:.1f},{py:.1f}' for px,py in t);out+=f'<polygon points="{pts}" fill="#ffbf29" stroke="#100a14" stroke-width="2.2"/>'
 out+=f'<ellipse cx="{x}" cy="{y}" rx="{size*18}" ry="{size*14}" fill="#fff5a0"/><ellipse cx="{x}" cy="{y}" rx="{size*10}" ry="{size*8}" fill="#fff"/>'
 return out+spark(x,y,50*size,seed+27,8)
def cloud(x,y,seed):
 r=random.Random(seed);out=''
 for j in range(7):
  xx=x+(j-3)*19;yy=y+r.uniform(-10,3);rr=20+(j%3)*4
  out+=f'<circle cx="{xx:.1f}" cy="{yy:.1f}" r="{rr}" fill="#202033" stroke="#0c0916" stroke-width="3"/>'
  out+=f'<path d="M{xx-rr*.7:.1f} {yy-7:.1f} Q{xx:.1f} {yy-rr*.7:.1f} {xx+rr*.8:.1f} {yy-8:.1f}" fill="none" stroke="#5f557c" stroke-width="2" opacity=".6"/>'
 return out
def frame(name,i):
 n=MOVES.index(name);seed=n*400+i*37+51;e=start();cx=140
 if name=='faisca':
  cy=165
  if i<3:
   e+=ring(cx,cy+35,25+i*7,8+i*3,seed);e+=spark(cx,cy,27+i*13,seed,5+i*2,.9)
  elif i<5:
   dist=85+(i-3)*73
   for j in range(4):e+=bolt(cx-dist,cy+(j-1.5)*13,cx+61,cy+(j-1.5)*5,seed+j,7-j*.9)
   e+=spark(cx+60,cy,29,seed,6)
  elif i==5:e+=impact(174,166,seed,1.20);e+=bolt(36,175,169,166,seed+4,8)
  elif i==6:e+=impact(174,166,seed,.8)
  else:e+=spark(174,166,28,seed,6,.5)
 elif name=='discharge':
  cy=168;r=[22,34,54,74,96,111,72,23][i]
  e+=ring(cx,cy,r,r*.74,seed,.46 if i==7 else .91)
  if i<6:
   num=min(10,4+i*2)
   for j in range(num):
    a=j*math.tau/num
    e+=bolt(cx+math.cos(a)*15,cy+math.sin(a)*15,cx+math.cos(a)*r,cy+math.sin(a)*r*.77,seed+j,4.5)
   if i>=4:e+=impact(cx,cy,seed,.57)
  elif i==6:e+=spark(cx,cy,66,seed,8,.63)
  else:e+=spark(cx,cy,20,seed,4,.3)
 elif name=='tempestade-de-raios':
  e+=cloud(cx,91,seed)
  if i<2:e+=ring(cx,273,28+i*12,12+i*3,seed);e+=spark(cx,154,12+i*14,seed,3+i,.7)
  elif i<=6:
   offsets=[-23,13,26,-18,0];x=cx+offsets[i-2]
   e+=bolt(x-6,111,x,271 if i>2 else 227,seed,5.2 if i<5 else 8.4)
   if i>2:e+=impact(x,269,seed,.60 if i<5 else 1.10)
   if i in (4,5):e+=bolt(cx+41,117,cx+43,268,seed+7,5);e+=impact(cx+43,268,seed+8,.59)
  else:e+=spark(cx,269,38,seed,6,.4)
 else:
  e+=cloud(cx,85,seed)
  if i<3:e+=ring(cx,272,22+i*12,11+i*4,seed);e+=spark(cx,126,13+i*7,seed,4,.55)
  elif i<=6:
   e+=bolt(cx-8,111,cx+2,226 if i==3 else 276,seed,6.5 if i==3 else 13.5 if i<6 else 5.5)
   if i in (4,5):
    e+=bolt(cx+2,226,cx-44,261,seed+13,5);e+=bolt(cx+2,226,cx+47,262,seed+17,5)
    e+=impact(cx+2,276,seed,1 if i==4 else 1.4)
   if i==6:e+=impact(cx+2,276,seed,.72)
  else:e+=ring(cx,278,41,15,seed,.5);e+=spark(cx,274,42,seed,7,.45)
 return e+'</svg>'
def build():
 total=0
 for name in MOVES:
  for i in range(8):
   p=ROOT/name/'sprites'/f'frame_{i+1:02}.png';p.parent.mkdir(parents=True,exist_ok=True)
   cairosvg.svg2png(bytestring=frame(name,i).encode(),write_to=str(p))
   total+=1
  for i,power in enumerate([.48,1.0,.70,.21]):
   p=ROOT/name/'impact'/f'hit_{i+1:02}.png';p.parent.mkdir(parents=True,exist_ok=True)
   cairosvg.svg2png(bytestring=(start()+impact(140,160,999+MOVES.index(name)*100+i*7,power)+'</svg>').encode(),write_to=str(p))
   total+=1
 print(f'{total} real transparent PNG sprite frames generated')
if __name__=='__main__':build()
