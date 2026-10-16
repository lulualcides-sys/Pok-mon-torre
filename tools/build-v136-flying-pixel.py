#!/usr/bin/env python3
"""Build genuine transparent *animated pixel sheets* for V136 Flying moves.

64x64 nearest-neighbour authored frames, 8 columns; PNG is a sprite atlas, NEVER
a static effect. Pure pixel positions and hand-tuned palettes are intentionally
editable by LibreSprite (.png import -> animation frames). No Canvas 2D or CSS.
"""
from PIL import Image, ImageDraw
from pathlib import Path
from math import sin,cos,pi
import random

ROOT=Path('effects/moves/v136-flying-pixel')
SIZE=64
COLS=8
BLACK=(17,28,40,255)
DEEP=(31,56,70,255)
MID=(80,140,165,255)
PALE=(152,206,218,255)
WHITE=(225,247,245,255)
FOG=(183,212,218,255)
BLUE=(58,111,144,255)
SILVER=(139,159,166,255)
BEAK=(181,154,103,255)
STONE=(90,121,140,255)

def line(d, coords, color, width=1):d.line([(round(x),round(y)) for x,y in coords],fill=color,width=width,joint='curve')
def closed(d, vertices, base, border=BLACK):
    pts=[(int(round(x)),int(round(y))) for x,y in vertices]
    d.polygon(pts,fill=base)
    d.line(pts+[pts[0]],fill=border,width=1)
def pix(d,x,y,col,s=1):d.rectangle((int(x),int(y),int(x)+s-1,int(y)+s-1),fill=col)

def wing(d,cx,cy,side,fold):
    # Individual feather silhouettes form an actual wing, not a white vector oval.
    width=(29-15*fold)*side
    outline=[(cx,cy),(cx+width*.21,cy-6),(cx+width*.55,cy-11+fold*8),
      (cx+width,cy-10+fold*15),(cx+width*.78,cy+2+fold*7),
      (cx+width*.57,cy+6+fold*5),(cx+width*.28,cy+7),(cx,cy+5)]
    closed(d,outline,DEEP)
    for i in range(5):
        u=(i+.7)/5
        x=cx+width*u
        y=cy-7*(1-fold)+fold*5+u*2
        line(d,[(x,y),(x+side*2,y+5)],PALE,2)
        pix(d,x,y,WHITE)

def roost(frame,total,d):
    t=frame/(total-1);fold=min(1,max(0,(t-.10)/.58))
    wing(d,32,31,-1,fold);wing(d,32,31,1,fold)
    # The Pokémon settles. Chunks of feathery recovery pixels fall beside it.
    for j in range(12):
        x=7+(j*13)%51+int(2*sin(t*12+j))
        y=int((j*7+t*39)%56)
        if 19< x <44 and y>22:continue
        if (j+frame)%3==0:
            closed(d,[(x,y-3),(x+2,y-1),(x+1,y+3),(x-1,y+1)],PALE)
            pix(d,x,y-1,WHITE)
        elif (j+frame)%4==0:pix(d,x,y,FOG)
    if 0.15<t<.9:
        rad=int(9+8*t)
        for j in range(14):
            a=pi*j/13
            pix(d,32+int(rad*cos(a)),48+int(4*sin(a)),PALE)

def gust(frame,total,d):
    # A dense twisting *pixel wind sprite*, every frame with moving pressure
    # striations. Pixel edges stay crisp and irregular, not Bézier paths.
    t=frame/(total-1)
    for stripe in range(5):
        yy=13+stripe*10
        phase=t*11+stripe*.91
        points=[]
        for x in range(3,62,2):
            u=x/64
            y=yy+int((5+stripe%3)*sin(u*9+phase))+int(3*cos(phase*1.4+u*4))
            points.append((x,y))
        line(d,points,BLACK,4 if stripe%2 else 5)
        line(d,points,MID if stripe%2 else PALE,2)
        for x,y in points[::5]:
            pix(d,x,y,WHITE,1)
    for j in range(24):
        x=(j*17+frame*7)%63
        y=(j*11+int(4*sin(frame*.63+j)))%61
        pix(d,x,y,BLUE if j%4 else WHITE,1)

def airslash(frame,total,d):
    t=frame/(total-1)
    # Two layers of *jagged crescent* cutting air; angular pixel tips,
    # concentrated dark rim and white inner cutting edge.
    for layer in range(2):
        cx=30-layer*8;cy=32+layer*8
        scale=(1+.12*sin(t*pi))*(1-.37*layer)
        points=[]
        for j in range(21):
            a=(-.82+(j/20)*1.60)*pi
            r=(24+int(2*sin(j*2.1+t*10)))*scale
            x=cx+r*cos(a)
            y=cy+(.67*r)*sin(a)
            points.append((x,y))
        # Irregular enclosed tapered band. All polygon rasterised as pixel art.
        inner=[]
        for j in range(20,-1,-1):
            a=(-.82+(j/20)*1.60)*pi
            r=(15+int(1.4*sin(j*1.2+t*8)))*scale
            inner.append((cx+r*cos(a),cy+.67*r*sin(a)))
        closed(d,points+inner,PALE)
        line(d,points[2:-2],WHITE,2)
        for j in range(4):
            a=(-.45+j*.28)*pi
            x=cx+(28+5*j)*scale*cos(a)
            y=cy+(20+3*j)*scale*sin(a)
            pix(d,x,y,FOG)
    for j in range(9):
        pix(d,8+((j*9+frame*4)%49),12+((j*7+frame*3)%40),
            WHITE if j%3==0 else BLUE)

def peck(frame,total,d):
    t=frame/(total-1)
    thrust=sin(min(.97,t/.77)*pi*.7)
    advance=round(13*thrust)
    # Closed beak drawn pixel by pixel: a pointed, physically striking beak
    # supported by feather/face mask, not a floating wind projectile.
    ox=advance-6
    closed(d,[(11+ox,31),(22+ox,23),(35+ox,23),(55+ox,32),
        (34+ox,39),(22+ox,38)],SILVER)
    closed(d,[(21+ox,26),(42+ox,29),(53+ox,32),(43+ox,32),
        (20+ox,30)],BEAK,DEEP)
    line(d,[(18+ox,35),(39+ox,36),(53+ox,32)],DEEP,2)
    line(d,[(19+ox,27),(30+ox,25),(43+ox,30)],WHITE,2)
    for j in range(4):
        x=8+ox-j*3;y=27+j*3
        line(d,[(x,y),(x-8,y-2)],PALE,1)
    if t>.50:
        for j in range(12):
            angle=j*2.4;rr=int(5+18*(t-.5))
            x=50+int(rr*cos(angle));y=31+int(rr*.7*sin(angle))
            pix(d,x,y,WHITE if j%3==0 else MID)

def build(slug,frames,draw_fn):
    folder=ROOT/slug
    folder.mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(SIZE*COLS,SIZE*((frames+COLS-1)//COLS)),(0,0,0,0))
    for i in range(frames):
        im=Image.new('RGBA',(SIZE,SIZE),(0,0,0,0));d=ImageDraw.Draw(im)
        draw_fn(i,frames,d)
        atlas.paste(im,(i%COLS*SIZE,i//COLS*SIZE),im)
    out=folder/'spritesheet.png'
    atlas.save(out,optimize=True)
    assert out.stat().st_size<120000,(out,out.stat().st_size)
    print(slug,frames,atlas.size,out.stat().st_size)

if __name__=='__main__':
    build('roost',12,roost)
    build('gust',16,gust)
    build('air-slash',16,airslash)
    build('peck',12,peck)
