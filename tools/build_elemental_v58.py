#!/usr/bin/env python3
"""Pokémon Torre V58: ORIGINAL sprite atlas authoring for eight water/ice effects.
Inspired by user-provided sprite references. Does not erase/copy watermarks.
No existing approved assets are replaced. Deterministic independent frames.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math, random, argparse

DEST=Path(__file__).resolve().parents[1]/"effects"/"elements"
KINDS=("kraken","ice-crystal","waterball","ice-spike","snowflake","water-drop","water-hurricane","geyser")
TILE=144
S=2
TAU=math.tau
def pt(p):return tuple(round(v*S) for v in p)
def poly(d,pts,color,outline=None,w=2):
    pp=[pt(p) for p in pts]
    d.polygon(pp,fill=color)
    if outline:d.line(pp+[pp[0]],fill=outline,width=round(w*S),joint="curve")
def stroke(d,pts,color,w=2):
    d.line([pt(p) for p in pts],fill=color,width=max(1,round(w*S)),joint="curve")
def orb(d,x,y,r,fill,outline):
    d.ellipse((round((x-r)*S),round((y-r)*S),round((x+r)*S),round((y+r)*S)),fill=fill,outline=outline,width=2*S)
def shard(d,x,y,r,h,angle=0):
    # Angular six-sided translucent crystal, sharply inked and white-faced.
    ca,sa=math.cos(angle),math.sin(angle)
    def rot(xx,yy):return (x+xx*ca-yy*sa,y+xx*sa+yy*ca)
    p=[rot(0,-h),rot(r*.82,-h*.30),rot(r*.69,h*.68),rot(0,h),rot(-r*.78,h*.57),rot(-r*.82,-h*.33)]
    poly(d,p,(22,127,239,242),(10,35,80,255),1.7)
    poly(d,[p[0],p[1],rot(0,h*.55),rot(0,-h*.56)],(160,238,255,225))
    stroke(d,[p[0],rot(0,h*.55),p[3]],(238,255,255,234),1.1)
def snowstar(d,x,y,r,phase=0):
    for j in range(6):
        a=j*TAU/6+phase
        v=(math.cos(a),math.sin(a))
        end=(x+v[0]*r,y+v[1]*r)
        stroke(d,[(x,y),end],(9,68,139,255),4.5)
        stroke(d,[(x,y),end],(176,247,255,255),1.9)
        for k in (.55,.80):
            xx=x+v[0]*r*k;yy=y+v[1]*r*k
            for side in (-1,1):
                aa=a+math.pi+side*.63
                stroke(d,[(xx,yy),(xx+math.cos(aa)*r*.22,yy+math.sin(aa)*r*.22)],(134,219,254,240),1.15)
    orb(d,x,y,2.4,(255,255,255,255),(105,218,255,255))
def spray(d,x,y,rng,power=1,blue=True):
    for k in range(int(8+14*power)):
        a=rng.random()*TAU
        rr=(9+rng.random()*49)*power
        xx=x+math.cos(a)*rr
        yy=y+math.sin(a)*rr*.66
        rad=.65+rng.random()*2.1
        fill=(56,180,251,230) if blue else (223,250,255,238)
        orb(d,xx,yy,rad,fill,(12,51,121,190))
def render(kind,phase):
    rng=random.Random(12113+phase*301+KINDS.index(kind)*1781)
    img=Image.new("RGBA",(TILE*S,TILE*S),(0,0,0,0))
    d=ImageDraw.Draw(img,"RGBA")
    u=phase/7
    intensity=[.17,.38,.61,.82,1,.91,.63,.21][phase]
    if kind=="ice-crystal":
        for j in range(5):
            x=72+(j-2)*14
            r=(8+j%3*3)*intensity
            h=(19+8*(j%3))*intensity
            shard(d,x,92-(1-intensity)*15,r,h,.11*(j-2))
        spray(d,72,95,rng,.53*intensity,False)
    elif kind=="ice-spike":
        for j in range(4):
            x=41+j*21
            height=(26+11*(j%2)+8*intensity)*intensity
            shard(d,x,107-height*.65,(6+j%2*3)*intensity,height,.04*(j-1))
        stroke(d,[(23,109),(112,109)],(29,146,244,175),1.6)
        spray(d,72,107,rng,.46*intensity)
    elif kind=="snowflake":
        snowstar(d,72,72,8+44*intensity,phase*.09)
        for j in range(2+phase%3):
            xx=72+rng.randrange(-51,52);yy=72+rng.randrange(-51,52)
            snowstar(d,xx,yy,rng.uniform(3,9)*intensity,phase*.20)
    elif kind=="waterball":
        x=72+6*math.sin(phase*.8);y=72
        r=9+27*intensity
        for j in range(6):
            a=TAU*j/6+phase*.24
            rr=r+7+rng.randrange(0,7)
            orb(d,x-rr*.8,y+math.sin(a)*rr*.53,1.3+intensity*1.7,(32,173,252,180),(9,65,145,180))
        orb(d,x,y,r,(14,120,223,255),(4,37,94,255))
        orb(d,x-r*.13,y-r*.15,r*.74,(59,201,255,245),(10,101,207,230))
        for j in range(3):
            a=-1.5+j*.70+phase*.2
            stroke(d,[(x+math.cos(a)*r*.64,y+math.sin(a)*r*.66),
              (x+math.cos(a+.36)*r*.71,y+math.sin(a+.36)*r*.74)],(218,255,255,255),1.7)
        spray(d,x,y,rng,.25+intensity*.35)
    elif kind=="water-drop":
        if phase<=3:
            r=4+phase*5
            for j in range(4):
                x=72+(j-1.5)*12
                y=19+phase*12+(j%2)*9
                poly(d,[(x,y-r),(x-r*.68,y+r*.5),(x,y+r),(x+r*.68,y+r*.5)],
                    (53,185,255,250),(8,56,130,255),1.4)
        else:
            r=12+13*(1-u)
            for j in range(10):
                a=TAU*j/10+phase*.24
                x=72+math.cos(a)*(r+10);y=85+math.sin(a)*(r*.60+8)
                orb(d,x,y,rng.uniform(1.5,3.9),(92,219,255,225),(5,55,136,245))
            for j in range(3):
                xx=72+(j-1)*18
                stroke(d,[(xx-10,89),(xx,83-j*2),(xx+11,90)],(129,233,255,238),2.9)
            spray(d,72,89,rng,.55*intensity)
    elif kind=="water-hurricane":
        # 3D corkscrew vortex: multiple distinct crossing ribbons, not a recolored circle.
        for arm in range(3):
            pts=[]
            for k in range(45):
                h=k/44
                yy=108-75*h
                rad=(20+17*h)*intensity
                angle=arm*TAU/3+h*TAU*2.35+phase*.47
                xx=72+math.cos(angle)*rad
                pts.append((xx,yy))
            stroke(d,pts,(8,52,121,230),7*intensity)
            stroke(d,pts,(20+arm*16,144+arm*22,241,245),4.9*intensity)
            stroke(d,pts,((154,234,255,240) if arm==1 else (82,206,255,239)),1.6*intensity)
        spray(d,72,101,rng,.68*intensity)
    elif kind=="geyser":
        height=19+75*intensity
        b=110-height
        poly(d,[(57,106),(59,b+9),(65,b),(72,b-5),(80,b),(85,b+9),(88,106)],
             (21,134,223,238),(5,50,104,255),2)
        stroke(d,[(65,103),(67,b+11),(73,b),(79,b+12),(81,102)],(189,245,255,250),3.4)
        for j in range(5):
            a=-math.pi+j*math.pi/4
            rr=(17+j%2*10)*intensity
            x=72+math.cos(a)*rr;y=b+math.sin(a)*rr*.60
            stroke(d,[(72,b+3),(x,y)],(86,222,255,230),3.2)
        spray(d,72,b,rng,.57*intensity)
    else: # kraken: distinct swirling aquatic summon with curling liquid tendrils.
        scale=.28+.72*intensity
        for arm in range(6):
            angle=TAU*arm/6+phase*.24
            pts=[]
            for k in range(18):
                h=k/17
                radius=8+h*49*scale
                wobble=math.sin(h*TAU*1.4+phase*.45+arm)*11*h
                pts.append((72+math.cos(angle)*radius-math.sin(angle)*wobble,
                            67+math.sin(angle)*radius*.77+math.cos(angle)*wobble))
            stroke(d,pts,(10,40,110,239),7.5*scale)
            stroke(d,pts,(42,168,251,255),4.5*scale)
            stroke(d,pts,(179,244,255,244),1.45*scale)
        orb(d,72,67,14*scale,(18,135,236,255),(9,48,118,255))
        shard(d,72,53,6*scale,14*scale)
        spray(d,72,90,rng,.60*intensity)
    # subtle blue bloom with crisp inner pixel edges
    glow=img.filter(ImageFilter.GaussianBlur(3.8*S))
    glow.putalpha(glow.getchannel("A").point(lambda a:int(a*.23)))
    glow.alpha_composite(img)
    return glow.resize((TILE,TILE),Image.Resampling.LANCZOS)
def build(selected):
    for kind in selected:
        folder=DEST/("ice" if kind in ("ice-crystal","ice-spike","snowflake") else "water")/kind
        folder.mkdir(parents=True,exist_ok=True)
        frames=[render(kind,i) for i in range(8)]
        assert len({im.tobytes() for im in frames})==8
        strip=Image.new("RGBA",(TILE*8,TILE),(0,0,0,0))
        for i,im in enumerate(frames):strip.paste(im,(i*TILE,0),im if False else None)
        strip.save(folder/"atlas.png",optimize=True)
        print(kind, "eight unique 144x144 frames", (folder/"atlas.png").stat().st_size)
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--effect",choices=("all",)+KINDS,default="all")
    choice=parser.parse_args().effect
    build(KINDS if choice=="all" else [choice])
