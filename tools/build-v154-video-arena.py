#!/usr/bin/env python3
"""V154: video-matched blue pixel-art material reconstruction; each image is an editable pixel-art tile/prop.
No video frame, third-party sprite, CSS art or pre-rendered whole-room background.
The game composes these independent textures in PixiJS/WebGL during battle.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import random, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/arena-blue-v154'
OUT.mkdir(parents=True,exist_ok=True)
R=random.Random(15488)
def new(w,h):return Image.new('RGBA',(w,h),(0,0,0,0))
def save(im,n):im.save(OUT/n,optimize=True)
def draw_floor():
 atlas=new(512,512)
 for k in range(16):
  tile=new(128,128);p=tile.load();r=random.Random(15480+k)
  offset=r.randint(-6,6)
  spots=[(r.randrange(128),r.randrange(128),r.randrange(10,38),r.choice((-9,-6,6,10))) for z in range(8)]
  for y in range(128):
   for x in range(128):
    grain=r.gauss(0,1.85)
    cloud=sum(v*math.exp(-((x-sx)**2+(y-sy)**2)/(2*radius*radius)) for sx,sy,radius,v in spots)
    n=grain+cloud+(math.sin((x+k*19)*.038)+math.cos(y*.07))*1.35+offset
    light=4*(1-y/128)
    p[x,y]=(round(max(0,37+n+light*.3)),round(max(0,67+n*1.1+light*.55)),round(max(0,137+n*1.15+light)),255)
  d=ImageDraw.Draw(tile,'RGBA')
  d.line(((0,0),(127,0)),fill=(10,22,52,255),width=2)
  d.line(((0,0),(0,127)),fill=(11,24,52,255),width=2)
  d.line(((1,2),(125,2)),fill=(95,127,184,66),width=1)
  d.line(((2,2),(2,125)),fill=(97,136,185,43),width=1)
  d.line(((127,3),(127,127)),fill=(12,27,57,195),width=1)
  d.line(((3,127),(127,127)),fill=(10,23,54,185),width=1)
  if k%3!=2:
   x=63+r.randint(-12,12);y=69+r.randint(-9,9)
   d.line(((x-16,y-4),(x,y+3),(x+16,y-4)),fill=(129,185,237,37),width=2)
   d.line(((x-14,y-2),(x,y+5),(x+14,y-2)),fill=(15,40,84,27),width=1)
  for z in range(90):
   x=r.randrange(5,123);y=r.randrange(5,123)
   d.point((x,y),fill=(170,205,246,r.randrange(10,49)) if r.random()>.5 else (4,19,50,r.randrange(14,65)))
  atlas.alpha_composite(tile,(k%4*128,k//4*128))
 save(atlas,'floor-atlas.png')
def draw_wall():
 rr=random.Random(154451)
 wall=new(960,256);p=wall.load()
 for y in range(256):
  for x in range(960):
   n=rr.gauss(0,2.3);edge=-8 if y>220 else 0
   p[x,y]=(round(max(0,22+n*.6)),round(max(0,43+n+edge*.7)),round(max(0,91+n*1.8+edge)),255)
 d=ImageDraw.Draw(wall,'RGBA')
 for row,y in enumerate(range(-19,260,27)):
  for i in range(-1,16):
   x=i*69+(row%2)*34;v=rr.randint(-7,6)
   d.rectangle((x+1,y+1,x+67,y+26),fill=(23+v,45+v,94+v,255))
   d.line(((x+1,y+1),(x+64,y+1)),fill=(112,155,218,36),width=1)
   d.line(((x+1,y+26),(x+67,y+26)),fill=(10,28,64,115),width=2)
   for z in range(17):
    xx=x+rr.randrange(5,61);yy=y+rr.randrange(4,24)
    d.point((xx,yy),fill=(164,197,230,rr.randrange(12,65)))
 for start in (68,338,654,914):
  gen=random.Random(start+77);x=start;y=30;points=[(x,y)]
  while y<220:
   x+=gen.choice((-12,-9,-2,5,8,11));y+=gen.randrange(12,22)
   points.append((x,y))
  light=new(960,256);brush=ImageDraw.Draw(light,'RGBA')
  brush.line(points,fill=(53,144,246,160),width=9)
  wall=Image.alpha_composite(wall,light.filter(ImageFilter.GaussianBlur(7)))
  d=ImageDraw.Draw(wall,'RGBA')
  d.line(points,fill=(74,159,238,103),width=3)
  d.line(points,fill=(170,221,255,149),width=1)
 save(wall,'back-wall.png')
def crystal(name,shift):
 r=random.Random(45+shift)
 im=new(128,198);d=ImageDraw.Draw(im,'RGBA')
 tip=12+shift*2;bottom=181;cx=62
 d.ellipse((34,bottom-4,100,bottom+12),fill=(3,13,31,85))
 d.polygon(((cx,tip),(40,78),(37,bottom-12),(cx+2,bottom-2)),fill=(109,204,241,245))
 d.polygon(((cx,tip),(89,83),(88,bottom-12),(cx+2,bottom-2)),fill=(55,137,203,242))
 d.polygon(((cx,tip),(49,83),(53,bottom-9),(62,bottom-6)),fill=(201,247,255,248))
 d.polygon(((cx+1,tip),(70,81),(73,bottom-13),(66,bottom-3)),fill=(115,210,244,245))
 d.line(((cx,tip+7),(63,bottom-13)),fill=(242,255,255,239),width=2)
 d.line(((42,89),(39,bottom-19)),fill=(236,250,255,137),width=1)
 for i in range(20):
  x=r.randrange(54,73);y=r.randrange(85,bottom-14)
  d.point((x,y),fill=(238,255,255,r.randrange(55,150)))
 save(im,name)
def props():
 im=new(96,84);d=ImageDraw.Draw(im,'RGBA')
 d.ellipse((11,68,92,81),fill=(0,5,19,125))
 d.polygon(((12,31),(43,14),(83,24),(67,44)),fill=(176,127,63,255))
 d.polygon(((12,31),(40,44),(40,68),(13,61)),fill=(86,58,39,255))
 d.polygon(((40,44),(83,24),(81,59),(40,68)),fill=(41,34,30,255))
 d.line(((17,36),(41,47),(74,29)),fill=(205,154,76,210),width=4)
 d.polygon(((34,37),(48,35),(50,49),(40,55),(34,49)),fill=(255,217,104,255))
 save(im,'chest.png')
 im=new(85,68);d=ImageDraw.Draw(im,'RGBA')
 d.ellipse((4,45,79,65),fill=(1,6,19,105))
 d.polygon(((6,49),(18,20),(41,9),(68,20),(80,43),(62,56),(14,57)),fill=(25,41,69,255))
 d.polygon(((6,49),(18,20),(41,9),(42,34),(25,48)),fill=(97,127,159,255))
 d.polygon(((41,9),(68,20),(80,43),(42,34)),fill=(48,72,106,255))
 d.line(((18,22),(40,11),(67,22)),fill=(178,195,214,125),width=2)
 save(im,'rock.png')
 gl=new(128,128);p=gl.load()
 for y in range(128):
  for x in range(128):
   rr=math.hypot((x-63.5)/63.5,(y-63.5)/63.5);t=max(0,1-rr)
   p[x,y]=(103,208,255,round(160*t*t*(3-2*t)))
 save(gl,'glow.png')
 ring=new(128,128);d=ImageDraw.Draw(ring,'RGBA')
 for rad,alpha in ((58,20),(54,27),(49,42),(45,63),(41,32)):
  d.ellipse((64-rad,64-rad,64+rad,64+rad),outline=(117,222,255,alpha),width=2)
 save(ring,'magic-ring.png')
if __name__=='__main__':
 draw_floor();draw_wall();crystal('crystal-a.png',0);crystal('crystal-b.png',10);props()
 assert len(list(OUT.glob('*.png')))==8
 print('V154: 8 original material textures exported', OUT)
