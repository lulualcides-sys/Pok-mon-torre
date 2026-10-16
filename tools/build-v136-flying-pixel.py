#!/usr/bin/env python3
"""V141 — hand-authored pixel-art Flying battle spritesheets for PixiJS WebGL.

12 or 16 individually animated 64x64 frames, nearest-neighbour indexed-style
RGBA, 8 atlas columns. No CSS VFX, Canvas 2D, blur, or black-filled shapes.
Frames can be opened and refined in LibreSprite/Aseprite. Not a still PNG effect.
"""
from pathlib import Path
from math import sin, cos, pi
from PIL import Image, ImageDraw

ROOT=Path('effects/moves/v136-flying-pixel')
SIZE=64
COLS=8
INK=(28,69,89,255)
DEEP=(61,119,151,255)
SKY=(117,188,207,255)
ICE=(180,232,240,255)
WHITE=(244,252,249,255)
PEARL=(219,244,238,255)
GOLD=(249,218,131,255)
AMBER=(225,160,81,255)
LEAF=(145,224,187,255)
CLEAR=(0,0,0,0)

def p(d,x,y,color,r=1):
    x,y=round(x),round(y)
    d.rectangle((x,y,x+r-1,y+r-1),fill=color)

def line(d,points,base,thick=2,edge=INK):
    points=[(round(x),round(y)) for x,y in points]
    if len(points)<2:return
    if edge:d.line(points,fill=edge,width=thick+2,joint='curve')
    d.line(points,fill=base,width=thick,joint='curve')

def poly(d,points,color,edge=INK):
    pts=[(round(x),round(y)) for x,y in points]
    d.polygon(pts,fill=color)
    if edge:d.line(pts+[pts[0]],fill=edge,width=1,joint='curve')

def spark(d,x,y,c=WHITE,n=3):
    p(d,x,y,c)
    p(d,x-1,y,c)
    p(d,x+1,y,c)
    p(d,x,y-1,c)
    p(d,x,y+1,c)
    if n>3:
        p(d,x-2,y,SKY)
        p(d,x+2,y,SKY)
        p(d,x,y-2,SKY)
        p(d,x,y+2,SKY)

def feather(d,x,y,tilt=0,gold=False):
    fill=GOLD if gold else WHITE
    poly(d,[(x-2+tilt,y-4),(x+1+tilt,y-3),(x+3,y),
            (x+1-tilt,y+4),(x-2,y+2),(x-3,y-1)],fill,DEEP)
    line(d,[(x+1,y-3),(x,y+2)],PEARL if gold else ICE,1,None)

def roost(frame,total,d):
    t=frame/(total-1)
    # Feather fans fold inward during the restorative golden pulse.
    fold=max(0,min(1,(t-.23)/.49))
    lift=round(3*sin(pi*t))
    for direction in (-1,1):
        x=32+direction*3
        extent=24-12*fold
        wing=[(x,35+lift),(x+direction*6,25+lift),
              (x+direction*(extent-5),20+lift+6*fold),
              (x+direction*extent,25+lift+9*fold),
              (x+direction*(extent-4),36+lift+3*fold),
              (x+direction*9,40+lift)]
        poly(d,wing,PEARL)
        line(d,[(x+direction*6,30+lift),
                (x+direction*(extent-7),28+lift+5*fold)],WHITE,2,None)
        for k in range(3):
            u=8+k*5
            p(d,x+direction*u,32+lift+int(2*sin(u*.3+frame*.38)),ICE,2)
    if .14<t<.95:
        phase=min(1,(t-.14)/.6)
        ringy=42-round(11*phase)
        for k in range(11):
            angle=pi*k/10
            x=32+round((9+4*phase)*cos(angle))
            y=ringy+round((4+2*phase)*sin(angle))
            p(d,x,y,GOLD,2 if k%3==0 else 1)
        spark(d,32,30-round(3*phase),WHITE,5)
    for j in range(8):
        x=6+((j*11+frame*3)%52)
        y=6+((j*9+frame*4)%43)
        if (j+frame)%3==0:feather(d,x,y,(-1,0,1)[j%3],j%4==0)
        else:p(d,x,y,WHITE if j%2 else GOLD)

def gust(frame,total,d):
    t=frame/(total-1)
    # Three independent moving wind-stream ribbons, each with soft white core
    # and one-pixel blue-ink edge: gust, not circles or CSS bars.
    for k in range(3):
        phase=frame*.42+k*1.37
        cy=15+14*k
        pts=[]
        for x in range(5,59,3):
            warp=6*sin(x/10.2-phase)+2*sin(x/4.1+phase*.68)
            taper=.64+.36*sin(pi*x/64)
            pts.append((x,cy+warp*taper))
        line(d,pts,ICE if k==1 else SKY,3,INK)
        line(d,pts[3:-2],WHITE,1,None)
        endx,endy=pts[-1]
        poly(d,[(endx-5,endy-3),(endx+3,endy),(endx-5,endy+3)],WHITE,DEEP)
    for k in range(3):
        x=8+((frame*5+k*20)%44)
        y=10+k*16+round(3*sin(frame*.6+k))
        line(d,[(x-7,y+3),(x,y),(x+8,y-3)],PEARL,1,DEEP)
    for j in range(9):
        x=5+((j*17+frame*4)%55)
        y=7+((j*9+frame*3)%49)
        p(d,x,y,WHITE if j%3==0 else SKY,2 if j%4==0 else 1)

def crescent(d,cx,cy,r,angle,body=ICE):
    # Sharp, right-facing arc with two tapered tips and luminescent leading edge.
    outer=[];inner=[]
    for j in range(25):
        a=-1.02+2.04*j/24
        x=r*cos(a)
        y=r*.98*sin(a)
        outer.append((cx+x*cos(angle)-y*sin(angle),cy+x*sin(angle)+y*cos(angle)))
    for j in range(24,-1,-1):
        a=-1.02+2.04*j/24
        rr=r*(.45+.17*(abs(j-12)/12))
        x=rr*cos(a)
        y=rr*.98*sin(a)
        inner.append((cx+x*cos(angle)-y*sin(angle),cy+x*sin(angle)+y*cos(angle)))
    poly(d,outer+inner,body,INK)
    line(d,outer[2:-2],WHITE,2,None)
    line(d,inner[3:-3],SKY,1,None)

def airslash(frame,total,d):
    t=frame/(total-1)
    dx=round(5*sin(pi*min(t/.87,1)))
    tilt=-.31+sin(t*pi)*.12
    crescent(d,22+dx,30,27,tilt)
    if .16<t<.82:
        crescent(d,8+dx,39,14,tilt-.09,PEARL)
    if .46<t<.95:
        power=(t-.46)/.49
        for j in range(7):
            a=2*pi*j/7+frame*.47
            x=49+(4+power*8)*cos(a)
            y=31+(5+power*7)*sin(a)
            p(d,x,y,WHITE if j%2 else SKY,2)
    for j in range(7):
        x=5+((j*8+frame*3)%46)
        y=7+((j*15+frame*2)%49)
        p(d,x,y,WHITE if j%2 else ICE)

def peck(frame,total,d):
    t=frame/(total-1)
    # Golden tip on pearlescent feathered impact, physically travelling to foe.
    thrust=max(0,sin(pi*min(1,t/.75)))
    dx=round(13*thrust)
    poly(d,[(7+dx,33),(14+dx,24),(29+dx,23),
            (37+dx,30),(26+dx,41),(13+dx,39)],PEARL,DEEP)
    for j in range(4):
        line(d,[(12+dx+j*4,30+j*2),(5+dx+j*3,25+j*2)],ICE,1,DEEP)
    poly(d,[(23+dx,28),(31+dx,26),(56+dx,31),
            (32+dx,35),(23+dx,34)],GOLD,INK)
    poly(d,[(28+dx,28),(46+dx,30),(51+dx,31),(30+dx,31)],WHITE,None)
    line(d,[(27+dx,34),(44+dx,33),(54+dx,31)],AMBER,1,None)
    if .45<t<.91:
        burst=5+10*max(0,1-abs(t-.66)/.3)
        for j in range(8):
            a=2*pi*j/8
            x=51+burst*cos(a)
            y=31+burst*.7*sin(a)
            p(d,x,y,WHITE if j%2 else GOLD,2 if j%3==0 else 1)
    for j in range(4):
        p(d,7+dx-j*2,19+j*8,ICE)

def build(slug,frames,draw_fn):
    folder=ROOT/slug
    folder.mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(SIZE*COLS,SIZE*((frames+COLS-1)//COLS)),CLEAR)
    for i in range(frames):
        frame=Image.new('RGBA',(SIZE,SIZE),CLEAR)
        d=ImageDraw.Draw(frame)
        draw_fn(i,frames,d)
        # Copy exactly, preserving binary transparency for nearest-neighbour.
        atlas.paste(frame,((i%COLS)*SIZE,(i//COLS)*SIZE))
    out=folder/'spritesheet.png'
    atlas.save(out,optimize=True)
    assert out.stat().st_size<120000,(out,out.stat().st_size)
    print('V141',slug,frames,atlas.size,out.stat().st_size)

if __name__=='__main__':
    build('roost',12,roost)
    build('gust',16,gust)
    build('air-slash',16,airslash)
    build('peck',12,peck)
