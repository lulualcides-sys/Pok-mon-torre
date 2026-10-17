#!/usr/bin/env python3
"""V167: original pixel-art materials inspired by the supplied battle videos.
All outputs are self-authored assets for the isolated V167 experiment only.
The official arena, V165 assets and approved attacks are never overwritten.
"""
from pathlib import Path
from PIL import Image,ImageDraw
import math,random,shutil
ROOT=Path(__file__).resolve().parents[1]
OLD=ROOT/"assets"/"arena-v165"
OLD_FX=ROOT/"assets"/"battle-v165"
ROOM=ROOT/"assets"/"arena-v167"
FX=ROOT/"assets"/"battle-v167"
ROOM.mkdir(parents=True,exist_ok=True)
FX.mkdir(parents=True,exist_ok=True)
PI=math.pi
TAU=math.tau

def darkline(draw,coords,base=(7,14,37,238),w=2):
    draw.line(coords,fill=base,width=w,joint="curve")
    draw.line([(x+1,y-1) for x,y in coords],fill=(97,113,153,92),width=1,joint="curve")

def floor_tile(seed):
    rng=random.Random(seed)
    im=Image.new("RGBA",(128,128),(30,39,71,255))
    d=ImageDraw.Draw(im,"RGBA")
    tint=rng.randint(-8,10)
    d.rectangle((0,0,127,127),fill=(34+tint,45+tint,80+tint,255))
    d.polygon([(3,3),(124,1),(127,114),(122,126),(4,125),(0,11)],
              fill=(48+tint,58+tint,89+tint,255),outline=(13,22,47,255),width=2)
    d.line([(4,4),(119,4)],fill=(88,101,147,190),width=2)
    d.line([(4,4),(4,118)],fill=(89,103,145,115),width=1)
    d.line([(7,121),(122,122)],fill=(13,20,41,224),width=2)
    # Persistent non-repeating hairline fissures, chipped stone and scattered gravel.
    for chain in range(rng.randint(1,3)):
        x=rng.randint(15,112);y=rng.randint(13,112)
        coords=[(x,y)]
        for i in range(rng.randint(3,8)):
            x=max(9,min(116,x+rng.randint(-16,16)))
            y=max(8,min(116,y+rng.randint(5,14)*rng.choice([-1,1])))
            coords.append((x,y))
        darkline(d,coords,w=rng.choice([1,2]))
        if rng.random()<.65:
            xx,yy=coords[len(coords)//2]
            darkline(d,[(xx,yy),(xx+rng.randint(-10,11),yy+rng.randint(5,16))],w=1)
    for j in range(125):
        x=rng.randrange(9,119);y=rng.randrange(9,118)
        color=(6,16,41,rng.randrange(38,123)) if j%4 else (132,146,187,rng.randrange(23,90))
        d.rectangle((x,y,x+rng.choice([0,1,2]),y+rng.choice([0,1])),
                    fill=color)
    for j in range(rng.randrange(1,5)):
        x=rng.randrange(9,117);y=rng.randrange(12,113);s=rng.randrange(2,7)
        d.polygon([(x,y),(x+s,y-2),(x+s+2,y+s//2),(x+1,y+s)],
            fill=(20,29,55,255),outline=(105,111,142,150),width=1)
    return im

def build_floor():
    atlas=Image.new("RGBA",(512,512))
    for k in range(16):atlas.alpha_composite(floor_tile(16729+k*337),(k%4*128,k//4*128))
    atlas.save(ROOM/"floor-atlas.png",optimize=True)

def build_wall():
    rnd=random.Random(167003)
    im=Image.new("RGBA",(960,256),(14,25,50,255))
    d=ImageDraw.Draw(im,"RGBA")
    for row in range(9):
        y=row*30
        for col in range(-1,18):
            x=col*61+(row%2)*31
            shade=rnd.randint(-8,8)
            d.polygon([(x+1,y+3),(x+59,y+1),(x+62,y+24),(x+55,y+28),(x+2,y+26)],
                    fill=(25+shade,40+shade,72+shade,255),
                    outline=(7,15,34,255),width=2)
            d.line([(x+3,y+3),(x+56,y+3)],fill=(72,98,151,150),width=2)
            for t in range(7):
                px=x+rnd.randint(4,57);py=y+rnd.randint(6,24)
                d.point((px,py),fill=(126,154,181,rnd.randint(25,95)))
    # Ornate recessed door and double lintel align with 2.5D chamber video.
    d.polygon([(339,68),(361,37),(600,37),(623,70),(616,249),(342,249)],fill=(6,14,35,255),outline=(65,92,143,255),width=4)
    for x in [343,610]:
        d.rectangle((x,72,x+8,248),fill=(39,60,109,255))
        d.line([(x+2,74),(x+2,241)],fill=(108,148,197,225),width=2)
    d.polygon([(369,75),(591,75),(581,226),(379,226)],fill=(10,21,48,255))
    for y in [106,143,180,212]:
        d.line([(377,y),(583,y)],fill=(48,75,126,205),width=3)
    d.line([(342,42),(610,42)],fill=(133,164,210,214),width=3)
    for x in [209,751]:
        d.polygon([(x-30,18),(x+30,18),(x+22,237),(x-22,237)],fill=(7,18,43,255),outline=(70,101,159,255),width=3)
        for yy in range(39,225,28):
            d.line([(x-24,yy),(x+24,yy)],fill=(43,71,130,224),width=2)
    im.save(ROOM/"back-wall.png",optimize=True)

def build_edge():
    # Neon-cut front rail: fragmented turquoise stone, not a CSS border.
    glow=Image.new("RGBA",(960,66))
    d=ImageDraw.Draw(glow,"RGBA")
    rng=random.Random(1674)
    d.rectangle((0,12,959,43),fill=(12,29,64,255))
    for k in range(0,960,39):
        j=rng.randint(-5,5)
        d.polygon([(k,11+j),(k+20,14+j),(k+38,10+j),(k+38,40),(k,42)],
            fill=(31,66,110,238),outline=(10,26,54,255),width=2)
    d.line([(0,13),(176,10),(353,16),(523,12),(736,12),(959,16)],fill=(38,151,218,255),width=6)
    d.line([(0,8),(190,7),(359,10),(524,7),(737,7),(959,10)],fill=(121,230,252,234),width=2)
    for k in range(28):
        x=rng.randrange(4,957);y=rng.randrange(21,46)
        d.rectangle((x,y,x+1,y+1),fill=(67,196,233,rng.randrange(90,225)))
    glow.save(ROOM/"horizon-rail.png",optimize=True)
    side=Image.new("RGBA",(64,512))
    d=ImageDraw.Draw(side,"RGBA")
    for y in range(0,512,33):
        d.polygon([(0,y+1),(55,y+2),(62,y+29),(7,y+31)],
            fill=(22,46,88,242),outline=(6,19,46,255),width=2)
        d.line([(42,y+3),(43,y+29)],fill=(26,117,196,210),width=3)
        d.line([(47,y+6),(48,y+24)],fill=(101,220,245,220),width=1)
    side.save(ROOM/"side-rail.png",optimize=True)
    
def build_rune():
    im=Image.new("RGBA",(256,128))
    d=ImageDraw.Draw(im,"RGBA")
    for a in range(0,360,35):
        rad=math.radians(a)
        x=128+math.cos(rad)*86;y=62+math.sin(rad)*34
        d.arc((128-88,62-37,128+88,62+37),a,a+21,fill=(59,162,236,106),width=3)
        d.line([(int(x),int(y)),(int(128+math.cos(rad)*96),int(62+math.sin(rad)*38))],fill=(115,230,246,125),width=2)
    d.arc((70,41,185,90),0,360,fill=(143,204,245,89),width=2)
    im.save(ROOM/"floor-rune.png",optimize=True)

def effect_frame(kind,i,n=16,cell=128):
    f=Image.new("RGBA",(cell,cell))
    d=ImageDraw.Draw(f,"RGBA")
    rng=random.Random(167000+i*11)
    cx=cy=64;t=i/(n-1)
    ang=t*TAU*1.25
    if kind=="shadow":
        # Jagged rolling plasma and deep dark heart, not a uniform glowing ball.
        for j in range(11):
            a=ang+j*TAU/11
            r=33+4*math.sin(j*.9+ang*3)
            p=[(cx+math.cos(a-.17)*r*.73,cy+math.sin(a-.17)*r*.73),
               (cx+math.cos(a)*(r+13),cy+math.sin(a)*(r+13)),
               (cx+math.cos(a+.19)*r*.70,cy+math.sin(a+.19)*r*.70)]
            d.polygon(p,fill=(36,11,55,242),outline=(7,5,15,255),width=2)
        d.ellipse((26,27,102,103),fill=(19,7,36,255),outline=(3,1,10,255),width=4)
        d.ellipse((37,36,91,91),fill=(61,15,90,255),outline=(93,39,141,244),width=3)
        d.arc((31,30,97,97),i*24,i*24+166,fill=(180,81,226,253),width=4)
        d.arc((41,41,87,87),200-i*18,340-i*18,fill=(24,2,47,255),width=6)
        for k in range(8):
            a=k*TAU/8+ang
            r=47+k%3*3
            d.rectangle((int(cx+math.cos(a)*r),int(cy+math.sin(a)*r),
                        int(cx+math.cos(a)*r)+3,int(cy+math.sin(a)*r)+3),
                        fill=(167,74,221,185))
    elif kind=="psychic":
        for k in range(4):
            r=18+k*12
            a0=ang*(1 if k%2 else -1)+k*.25
            points=[(int(cx+math.cos(a0+j*TAU/22)*r),int(cy+math.sin(a0+j*TAU/22)*r*.69)) for j in range(22)]
            d.line(points+[points[0]],fill=[(18,8,36,220),(94,47,157,235),(184,106,236,238),(245,186,255,255)][k],width=[4,3,3,2][k],joint="curve")
        d.polygon([(64,27),(93,64),(64,103),(35,64)],fill=(97,36,172,120),outline=(226,170,255,240),width=4)
        d.polygon([(64,41),(82,64),(64,86),(45,64)],fill=(244,220,255,210),outline=(42,18,74,230),width=2)
        # Three asymmetric travelling lens sparks. Their orbit supplies 16
        # DISTINCT states rather than recycling a 6-frame symmetrical ring.
        for spark in range(3):
            a=(i*TAU/16)+spark*2.3
            px=int(cx+math.cos(a)*(27+spark*11))
            py=int(cy+math.sin(a)*(19+spark*8))
            d.rectangle((px-2,py-2,px+2,py+2),fill=(247,204,255,250))
            d.line([(px-5,py),(px+5,py)],fill=(144,79,224,214),width=1)

    elif kind=="fire":
        # Three-tone curling fire tongues with thick black contour.
        for k in range(9):
            a=-PI/2+((k-4)/9)*PI
            x=cx+(k-4)*7+int(math.sin(t*TAU+k)*5)
            tip=15+((k*7+i*3)%17)
            flame=[(x-10,95),(x-10,65),(x-5,43),(x,tip),(x+8,48),(x+13,72),(x+10,97)]
            d.polygon(flame,fill=(222,53,12,246),outline=(16,7,20,255),width=3)
        for k in range(6):
            x=36+k*11
            d.polygon([(x-5,90),(x-4,68),(x,47+(i*2+k*7)%16),(x+6,68),(x+8,92)],
                      fill=(255,137,29,246),outline=(177,49,22,240),width=2)
        d.polygon([(54,88),(58,64),(65,51+(i%4)*2),(73,68),(77,89)],fill=(255,239,121,255))
    elif kind=="electric":
        # Broken, angular zigzags (lightning must never look like a circle).
        for k in range(6):
            a=ang+k*TAU/6
            mid=(cx+int(math.cos(a)*20),cy+int(math.sin(a)*20))
            to=(cx+int(math.cos(a)*51),cy+int(math.sin(a)*51))
            elbow=(cx+int(math.cos(a)*34-math.sin(a)*11),cy+int(math.sin(a)*34+math.cos(a)*11))
            d.line([(cx,cy),mid,elbow,to],fill=(10,20,31,255),width=8,joint="curve")
            d.line([(cx,cy),mid,elbow,to],fill=(255,207,65,255),width=5,joint="curve")
            d.line([(cx,cy),mid,elbow,to],fill=(255,252,196,255),width=2,joint="curve")
        d.ellipse((53,53,75,75),fill=(255,248,183,255),outline=(24,18,11,255),width=2)
    elif kind=="impact":
        radius=8+int(t*45)
        alpha=max(0,int(250*(1-t)))
        if alpha:
            for k in range(12):
                a=k*TAU/12+t*.38
                x=cx+int(math.cos(a)*(radius+6));y=cy+int(math.sin(a)*(radius+6)*.70)
                d.line([(cx,cy),(x,y)],fill=(180,105,239,alpha),width=max(1,4-i//4))
            d.ellipse((cx-radius,cy-radius*.62,cx+radius,cy+radius*.62),outline=(242,207,255,max(0,alpha-38)),width=3)
    return f

def build_fx():
    variants={"shadow-ball-16.png":"shadow","psychic-wave-16.png":"psychic",
              "fire-burst-16.png":"fire","electric-arc-16.png":"electric",
              "impact-12.png":"impact"}
    for filename,kind in variants.items():
        n=12 if kind=="impact" else 16
        atlas=Image.new("RGBA",(512,math.ceil(n/4)*128))
        for i in range(n):
            tile=effect_frame(kind,i,n)
            atlas.alpha_composite(tile,(i%4*128,i//4*128))
        atlas.save(FX/filename,optimize=True)

def main():
    for name in ("crystal-a","crystal-b","chest","rock","glow","magic-ring","pillar","arch"):
        shutil.copyfile(OLD/(name+".png"),ROOM/(name+".png"))
    build_floor();build_wall();build_edge();build_rune();build_fx()
    required=[ROOM/(n+".png") for n in ("floor-atlas","back-wall","side-rail","horizon-rail","floor-rune")]
    required += [FX/n for n in ("shadow-ball-16.png","psychic-wave-16.png","fire-burst-16.png","electric-arc-16.png","impact-12.png")]
    assert all(f.exists() and f.stat().st_size>200 for f in required)
    print("V167 original layered pixel art built:",len(required),"assets")
if __name__=="__main__":main()
