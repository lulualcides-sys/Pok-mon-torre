#!/usr/bin/env python3
"""Generate four editable eight-frame raster VFX atlases for the in-game Atelier.
Offline Pillow raster artwork; gameplay NEVER paints these effects with Canvas.
Original approved move sprites and the combat system are left unchanged.
Each output is an 8-column RGBA PNG spritesheet (frame size 480x240).
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math, random
W,H,S=480,240,2
TW,TH=W*S,H*S
T=math.tau
OUT=Path(__file__).resolve().parents[1]/'effects/atelier-v70/sprites'
def color(h,a=255):
 h=h.lstrip('#');return (int(h[:2],16),int(h[2:4],16),int(h[4:6],16),max(0,min(255,int(a))))
def pix(p):return (int(p[0]*S),int(p[1]*S))
def new():return Image.new('RGBA',(TW,TH))
def line(im,pts,c,w):
 ImageDraw.Draw(im,'RGBA').line([pix(p) for p in pts],fill=c,width=max(1,int(w*S)),joint='curve')
def ellipse(im,x,y,rx,ry,c):
 ImageDraw.Draw(im,'RGBA').ellipse((int((x-rx)*S),int((y-ry)*S),int((x+rx)*S),int((y+ry)*S)),fill=c)
def flare(im,x,y,r,h,a=230):
 line(im,[(x-r,y),(x+r,y)],color(h,a),max(1,r*.18))
 line(im,[(x,y-r*.8),(x,y+r*.8)],color(h,a),max(1,r*.18))
 ellipse(im,x,y,max(.6,r*.2),max(.6,r*.2),color('#ffffff',a))
def sparks(im,x,y,r,n,colors,seed,opacity=1):
 rng=random.Random(seed)
 for i in range(n):
  a=rng.random()*T; rr=r*(.18+.84*rng.random())
  px=x+math.cos(a)*rr;py=y+math.sin(a)*rr*.8
  length=.8+3.3*rng.random()
  if rng.random()<.55:flare(im,px,py,length,colors[i%len(colors)],230*opacity)
  else:
   m=ImageDraw.Draw(im,'RGBA')
   pts=[(px-length,py),(px,py-length*1.6),(px+length,py),(px,py+length*.75)]
   m.polygon([pix(p) for p in pts],fill=color(colors[i%len(colors)],215*opacity))
def glow(base,layer,blur=10,alpha=.8):
 b=layer.filter(ImageFilter.GaussianBlur(S*blur))
 if alpha!=1:b.putalpha(b.getchannel('A').point(lambda a:round(a*alpha)))
 base.alpha_composite(b)
def finish(soft,hard,shine,dim=1):
 base=new()
 glow(base,soft,12,.85);glow(base,hard,4,.52)
 base.alpha_composite(soft);base.alpha_composite(hard);base.alpha_composite(shine)
 if dim!=1:base.putalpha(base.getchannel('A').point(lambda a:round(a*dim)))
 return base.resize((W,H),Image.Resampling.LANCZOS)
def bezier(p0,p1,p2,p3,n=40):
 out=[]
 for i in range(n+1):
  t=i/n;u=1-t
  out.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
              u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
 return out
def blade(hard,soft,x,y,ang,amount,hue,seed):
 if amount<=0:return
 ux,uy=math.cos(ang),math.sin(ang);vx,vy=-uy,ux
 def v(u,d):return (x+ux*u+vx*d,y+uy*u+vy*d)
 pts=bezier(v(-115,-47),v(-30,57),v(42,28),v(120,-34))
 pts=pts[:max(3,int(len(pts)*amount))]
 line(soft,pts,color(hue,135),34)
 line(hard,pts,color('#060919',230),26)
 line(hard,pts,color(hue,250),20)
 line(hard,pts,color('#eafff0' if hue=='#96f624' else '#eec9ff',250),7)
 line(hard,pts,color('#ffffff',200),2.1)
 if len(pts)>4:flare(hard,*pts[-1],5,hue)
def pulse(i):
 a,b,c=new(),new(),new()
 x0,y=65,121;end=414
 phase=i/7
 if i<=5:
  for j in range(6):
   pts=[]
   for k in range(25):
    z=k/24*2.7+j*1.05+i*.30;r=(22+i%3*5)+j*1.15
    pts.append((x0+math.cos(z)*r,y+math.sin(z)*r*.79))
   line(a,pts,color('#8c21f5',100),7)
   line(b,pts,color('#d94bff',200),2.5)
   if j%2==0:line(c,pts[7:18],color('#ffe1ff',160),1)
  ellipse(b,x0,y,17,17,color('#160526',245))
  flare(c,x0,y,12,'#fdf3ff',244)
 if 2<=i<=6:
  fraction={2:.31,3:.63,4:.89,5:1,6:.90}[i];x1=x0+(end-x0)*fraction
  main=[]
  for k in range(31):
   p=k/30;main.append((x0+(x1-x0)*p,y+math.sin(p*16+i*.45)*1.9))
  line(a,main,color('#a21bfa',155),64)
  line(b,main,color('#aa19f4',240),30)
  line(b,main,color('#e456ff',230),17)
  line(c,main,color('#fff2fc',255),6)
  for j in range(11):
   pts=[]
   for k in range(19):
    p=k/18
    off=math.sin(p*20+i*.6+j*1.7)*(9+(j%3)*3)
    pts.append((x0+(x1-x0)*p,y+off))
   line(a,pts,color('#9e23f2',83),5)
   line(b,pts,color('#ea80fc',160),1.2)
  for j in range(5):
   u=(j+.8)/5*fraction
   if u>.12:
    x=x0+(end-x0)*u;r=19+(j%3)*5
    ring=[(x+math.cos(k/36*T+i*.2)*r*.3,y+math.sin(k/36*T+i*.2)*r) for k in range(37)]
    line(b,ring,color('#d85cff',235),3)
    line(c,ring[8:26],color('#ffe4ff',205),1.4)
  sparks(b,x0+(x1-x0)*.62,y,72,49,['#fae1ff','#a65cff','#df55fd'],30+i,.8)
 if i>=5:
  strength={5:.28,6:1,7:.53}[i]
  for j in range(28):
   angle=j/28*T+i*.04;r=(22+67*strength)*(.72+.25*math.sin(j*3)**2)
   pts=[(end-8,y), (end-8+math.cos(angle)*r*.47,y+math.sin(angle)*r*.46),
        (end-8+math.cos(angle)*r,y+math.sin(angle)*r)]
   line(a,pts,color('#be1eff',120*strength),14)
   line(b,pts,color('#f96dff',235*strength),4)
   if j%3==0:line(c,pts,color('#fff1ff',205*strength),1.6)
  sparks(b,end-8,y,94,91,['#efc0ff','#a832f5','#ffffff'],400+i,strength)
  flare(c,end-8,y,27*strength,'#fff0ff',240*strength)
 return finish(a,b,c,.69 if i==7 else 1)
def sphere(i):
 a,b,c=new(),new(),new()
 x0=74;y=121;amount=min(1,max(0,(i-1)/4))
 x=x0+(407-x0)*amount;y+=math.sin(i*1.1)*3
 r=23+min(i,2)*6
 if 2<=i<=5:
  for j in range(24):
   u=j/24;tx=x0+(x-x0)*u;ty=121+math.sin(u*25+i)*9
   ellipse(a,tx,ty,15*(1-u*.8),10*(1-u*.8),color('#087efa',65*(1-u)))
   if j%3==0:flare(c,tx,ty,2.7,'#8be9ff',170*(1-u))
 if i<=5:
  ellipse(a,x,y,r*1.6,r*1.6,color('#1464ff',155))
  ellipse(b,x,y,r+5,r+5,color('#07133f',239))
  ellipse(b,x,y,r,r,color('#076ddd',255))
  ellipse(c,x-4,y-4,r*.72,r*.72,color('#65cfff',250))
  ellipse(c,x-6,y-5,r*.39,r*.39,color('#f1ffff',250))
  for j in range(5):
   pts=[]
   for k in range(30):
    z=i*.68+j*T/5+k/29*1.92
    rr=r*1.44*(.89+.13*math.sin(z*3+i))
    pts.append((x+math.cos(z)*rr,y+math.sin(z)*rr*.83))
   line(a,pts,color('#1579ff',100),8)
   line(b,pts,color('#3baaff',230),2.5)
   line(c,pts[8:20],color('#d7ffff',185),1.0)
  sparks(b,x,y,r*2.1,35,['#d6ffff','#4098ff','#82eeff'],i+12,.8)
 if i>=5:
  power={5:.25,6:1,7:.48}[i]
  for j in range(3):
   r2=20+power*(31+j*25)
   pts=[(407+math.cos(k/36*T)*r2,121+math.sin(k/36*T)*r2*.80) for k in range(37)]
   line(a,pts,color('#197dff',120*power),10)
   line(b,pts,color('#58d0ff',238*power),3.4)
   line(c,pts[5:22],color('#ecffff',195*power),1.3)
  sparks(b,407,121,90,78,['#deffff','#53d8ff','#147def'],i+130,power)
  flare(c,407,121,26*power,'#f1ffff',245*power)
 return finish(a,b,c,.66 if i==7 else 1)
def scissor(i,dragon=False):
 a,b,c=new(),new(),new()
 colors=('#9544e9','#f0cbff') if dragon else ('#96f624','#ecff9b')
 center=(343,121)
 if i<=3:
  for j in range(15):
   y=121+(j-7)*8
   x=35+j*4+(i+1)*42
   line(a,[(x-67,y+6),(x+20,y-5)],color(colors[0],100),2.2)
 if dragon:
  for j in range(3):
   q=max(0,min(1,(i-1-j*.72)/3))
   blade(b,a,center[0]+j*4,center[1]+(j-1)*19,.80,q,colors[0],i+j)
   if q>.2:sparks(b,center[0],center[1]+(j-1)*19,36*q,18,[colors[0],colors[1]],i*13+j,.4)
 else:
  q=max(0,min(1,(i-1)/2.5));r=max(0,min(1,(i-2)/2.5))
  blade(b,a,*center,.8,q,colors[0],i)
  blade(b,a,*center,-.83,r,colors[0],i+8)
 if i>=5:
  strength={5:.32,6:1,7:.43}[i]
  sparks(b,*center,106,103,[colors[0],colors[1],'#ffffff'],101+i,strength)
  for j in range(18):
   ang=j*T/18+i*.1;rr=(18+strength*68)*(.8+.2*math.sin(j*.6)**2)
   line(a,[center,(center[0]+math.cos(ang)*rr,center[1]+math.sin(ang)*rr*.78)],color(colors[0],115*strength),9)
   line(b,[center,(center[0]+math.cos(ang)*rr,center[1]+math.sin(ang)*rr*.78)],color(colors[1],210*strength),2.5)
  flare(c,*center,29*strength,'#fafffd' if not dragon else '#fff0ff',245*strength)
 return finish(a,b,c,.65 if i==7 else 1)
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 for name,render in [('dragon-pulse',pulse),('aura-sphere',sphere),('x-scissor',lambda n:scissor(n)),
                     ('dragon-claw',lambda n:scissor(n,True))]:
  atlas=Image.new('RGBA',(W*8,H))
  for i in range(8):
   frame=render(i)
   assert frame.size==(W,H) and frame.getbbox(),(name,i)
   atlas.alpha_composite(frame,(W*i,0))
  path=OUT/(name+'.png');atlas.save(path,optimize=True)
  print(name,atlas.size,path.stat().st_size,'bytes')
if __name__=='__main__':main()
