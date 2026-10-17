#!/usr/bin/env python3
"""V153 authored environment textures; each image is an editable pixel-art tile/prop.
No video frame, third-party sprite, CSS art or pre-rendered whole-room background.
The game composes these independent textures in PixiJS/WebGL during battle.
"""
from PIL import Image, ImageDraw
from pathlib import Path
import random, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/arena-blue-v153'
OUT.mkdir(parents=True,exist_ok=True)
R=random.Random(15370)
def new(w,h):return Image.new('RGBA',(w,h),(0,0,0,0))
def save(im,n):im.save(OUT/n,optimize=True)
def draw_floor():
 atlas=new(384,384)
 for k in range(16):
  im=new(96,96);pix=im.load();v=R.randint(-11,10)
  for y in range(96):
   for x in range(96):
    c=(R.random()-.5)*17+v+(math.sin(x*.08+k)+math.sin(y*.11+k*2.4)+math.sin((x+y)*.055))*3
    pix[x,y]=(int(max(8,39+c)),int(max(20,68+c*1.2)),int(max(43,124+c*1.5)),255)
  d=ImageDraw.Draw(im,'RGBA')
  d.rectangle((0,0,95,2),fill=(7,20,47,235));d.rectangle((0,0,2,95),fill=(8,23,51,235))
  d.rectangle((94,1,95,95),fill=(10,25,54,245));d.rectangle((1,94,95,95),fill=(9,21,47,245))
  d.line(((3,3),(92,3)),fill=(131,181,220,112),width=1)
  d.line(((5,92),(93,92)),fill=(8,18,37,95),width=2)
  for j in range(120):
   x,y=R.randrange(5,92),R.randrange(5,92)
   d.point((x,y),fill=(171,208,235,R.randrange(20,108)) if R.random()>.48 else (3,12,30,R.randrange(20,110)))
  if k%3==0:
   x,y=35+R.randrange(-8,8),40+R.randrange(-8,8)
   d.line(((x-13,y-5),(x,y+1),(x+13,y-5)),fill=(97,173,225,62),width=2)
  if k%4==0:
   x,y=R.randrange(15,77),R.randrange(15,71);pts=[(x,y)]
   for j in range(4):x+=R.randrange(-8,8);y+=R.randrange(2,9);pts.append((x,y))
   d.line(pts,fill=(5,18,43,120),width=1)
  atlas.alpha_composite(im,((k%4)*96,(k//4)*96))
 save(atlas,'floor-atlas.png')
def draw_wall():
 im=new(960,256);pix=im.load()
 for y in range(256):
  for x in range(960):
   v=(R.random()-.5)*13+math.sin(x*.09)*4
   t=max(0,1-abs(x-480)/750)
   pix[x,y]=(int(11+v*.5),int(23+v+t*8),int(47+v+t*20),255)
 d=ImageDraw.Draw(im,'RGBA')
 for row,y in enumerate(range(-12,250,36)):
  for col in range(-1,17):
   x=col*74+(row%2)*37+R.randint(-3,3);v=R.randrange(-6,8)
   d.rectangle((x+2,y+2,x+71,y+32),fill=(24+v,42+v,78+v,205))
   d.line(((x+3,y+3),(x+66,y+3)),fill=(102,143,184,48),width=2)
   d.line(((x+3,y+32),(x+71,y+32)),fill=(2,10,31,165),width=3)
   for i in range(15):d.point((x+R.randrange(4,67),y+R.randrange(5,30)),fill=(140,176,207,R.randrange(18,90)))
 for a in (61,198,375,632,838,931):
  rr=random.Random(a+200);x=a;y=24;pts=[]
  while y<224:x+=rr.choice((-8,-4,2,3,9));y+=rr.randrange(9,19);pts.append((x,y))
  for color,w in (((14,91,176,100),10),((48,161,244,145),4),((183,242,255,210),1)):
   d.line(pts,fill=color,width=w)
 d.rounded_rectangle((405,25,554,232),radius=13,fill=(5,13,31,230),outline=(87,128,182,130),width=6)
 d.rounded_rectangle((425,47,534,228),radius=6,fill=(5,13,27,175),outline=(38,61,102,120),width=3)
 for x in (71,260,660,849):
  d.polygon(((x-32,0),(x+23,0),(x+26,248),(x-30,248)),fill=(13,32,67,240))
  d.polygon(((x-32,0),(x-23,0),(x-19,246),(x-30,246)),fill=(84,125,172,112))
  d.rectangle((x-38,0,x+32,17),fill=(60,91,135,245))
  d.rectangle((x-38,221,x+35,246),fill=(41,71,115,245))
  d.line(((x-30,17),(x-30,220)),fill=(136,188,238,65),width=3)
 save(im,'back-wall.png')
def crystal(n,shift):
 im=new(128,185);d=ImageDraw.Draw(im,'RGBA')
 d.ellipse((17,167,117,183),fill=(0,6,18,120))
 d.polygon(((27,166),(36,155),(94,155),(113,169),(99,178),(32,178)),fill=(27,58,97,255))
 d.polygon(((48,150),(63,22+shift),(82,150),(67,175)),fill=(60,143,216,255))
 d.polygon(((48,150),(63,22+shift),(59,150),(67,175)),fill=(161,238,255,255))
 d.polygon(((63,22+shift),(82,150),(67,175)),fill=(45,106,174,255))
 d.polygon(((59,41+shift),(64,24+shift),(66,148),(60,158)),fill=(242,255,255,242))
 for ax,ay,w,h in ((32,102,23,68),(90,91,24,73),(102,131,12,37)):
  d.polygon(((ax+w//2,ay),(ax,ay+h//3),(ax+2,ay+h),(ax+w-2,ay+h),(ax+w,ay+h//3)),fill=(53,143,212,255))
  d.polygon(((ax+w//2,ay),(ax,ay+h//3),(ax+2,ay+h)),fill=(168,239,253,255))
  d.line(((ax+w//2,ay+7),(ax+w//2,ay+h-8)),fill=(226,253,255,190),width=2)
 for i in range(60):
  x=R.randrange(50,78);y=R.randrange(53,158)
  d.point((x,y),fill=(226,252,255,R.randrange(60,235)))
 save(im,n)
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
 assert len(list(OUT.glob('*.png')))==7
 print('V153: 7 original materials and objects exported', OUT)
