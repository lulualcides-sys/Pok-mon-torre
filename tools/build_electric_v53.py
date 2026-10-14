#!/usr/bin/env python3
"""Pokemon Torre V53: 4 distinct cinematic electric animations.
Offline authored transparent sprites. No procedural lightning is drawn at runtime.
Preserves engine damage, collision, position, cooldown, and other moves.
Reference direction: branching blue/violet plasma, bright white-hot core and
transient impact, with no cartoon rims, heavy circles or copied source imagery.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math, random

ROOT=Path(__file__).resolve().parents[1]/"effects"/"moves"
W,H,S=280,320,3
TAU=math.tau
MOVES=("faisca","discharge","tempestade-de-raios","trovao")
DARK=(9,7,30)
COOL=(45,170,255)
VIOLET=(139,89,255)
WHITE=(246,254,255)

def canvas(w=W,h=H):
    return Image.new("RGBA",(w*S,h*S),(0,0,0,0))

def mask(w=W,h=H):
    return Image.new("L",(w*S,h*S),0)

def point(p): return tuple(round(v*S) for v in p)
def composite(im,m,color,opacity=1):
    if opacity<=0:return
    a=m.point(lambda v:max(0,min(255,round(v*opacity))))
    layer=Image.new("RGBA",im.size,color+(0,))
    layer.putalpha(a)
    im.alpha_composite(layer)

def blur(im,m,color,radius,opacity=1):
    composite(im,m.filter(ImageFilter.GaussianBlur(max(.1,radius*S))),color,opacity)

def fractal(start,end,seed,rough=.21,generation=5):
    r=random.Random(seed);p=[start,end]
    for level in range(generation):
        q=[p[0]]
        for j in range(len(p)-1):
            x,y=p[j];xx,yy=p[j+1]
            dx=xx-x;dy=yy-y;dist=math.hypot(dx,dy)
            nxx=-dy/(dist or 1);nyy=dx/(dist or 1)
            off=(r.random()*2-1)*dist*rough*(.87 if level<=2 else .53)
            q.append(((x+xx)*.5+nxx*off,(y+yy)*.5+nyy*off))
            q.append((xx,yy))
        p=q
    return p

def tapered(draw,pts,width,fill):
    n=len(pts)-1
    for j in range(n):
        t=j/max(1,n)
        k=(1.03-.56*t)
        ww=max(1,round(width*S*k))
        draw.line([point(pts[j]),point(pts[j+1])],fill=fill,width=ww)
        rad=ww/2
        xx,yy=point(pts[j+1])
        draw.ellipse((xx-rad,yy-rad,xx+rad,yy+rad),fill=fill)

def bolt(im,a,b,seed,width=5,power=1,branches=3,rough=.24,shade=True):
    if power<=.015:return
    pts=fractal(a,b,seed,rough,5)
    broad=mask(im.width//S,im.height//S);core=mask(im.width//S,im.height//S)
    broadDraw=ImageDraw.Draw(broad);coreDraw=ImageDraw.Draw(core)
    tapered(broadDraw,pts,width,255)
    tapered(coreDraw,pts,max(1.4,width*.43),255)
    r=random.Random(seed+707)
    for k in range(branches):
        idx=max(2,min(len(pts)-4,int((.23+.57*(k+1)/(branches+1))*(len(pts)-1))))
        x,y=pts[idx]
        baseAngle=math.atan2(b[1]-a[1],b[0]-a[0])
        sign=(-1 if k%2 else 1)
        theta=baseAngle+sign*r.uniform(.65,1.48)
        length=r.uniform(14,44)*min(1.42,max(.7,width/5))
        tail=(x+length*math.cos(theta),y+length*math.sin(theta))
        fork=fractal((x,y),tail,seed*19+k,rough=.26,generation=3)
        tapered(broadDraw,fork,max(1.05,width*.29),200)
        tapered(coreDraw,fork,max(.7,width*.13),190)
    blur(im,broad,(71,56,224),6,power*.11)
    blur(im,broad,(17,132,255),4,power*.22)
    blur(im,core,(148,235,255),2.0,power*.73)
    if shade:composite(im,broad.filter(ImageFilter.MaxFilter(3)),DARK,power*.32)
    composite(im,broad,(55,139,254),power*.25)
    composite(im,core,(198,241,255),power*.94)
    # Peak white core must be visible on phone-sized displays.
    fine=mask(im.width//S,im.height//S)
    tapered(ImageDraw.Draw(fine),pts,max(.8,width*.19),255)
    composite(im,fine,WHITE,power*.97)

def sparks(im,x,y,count,radius,seed,power=1):
    r=random.Random(seed)
    for k in range(count):
        angle=r.random()*TAU
        rr=radius*math.sqrt(r.random())
        sx=x+math.cos(angle)*rr
        sy=y+math.sin(angle)*rr*.83
        reach=r.uniform(3,9)
        t=angle+r.uniform(-1.1,1.1)
        p=mask(im.width//S,im.height//S)
        d=ImageDraw.Draw(p)
        d.line([point((sx,sy)),point((sx+reach*math.cos(t),sy+reach*math.sin(t)))],fill=255,width=max(1,round(S*.85)))
        blur(im,p,(87,120,255),3,power*.42)
        composite(im,p,(231,251,255),power*.78)

def energy(im,x,y,radius,power):
    if power<=.03:return
    m=mask(im.width//S,im.height//S)
    ImageDraw.Draw(m).ellipse((round((x-radius)*S),round((y-radius)*S),
                              round((x+radius)*S),round((y+radius)*S)),fill=255)
    blur(im,m,(53,49,157),radius*.57,power*.07)
    blur(im,m,(47,151,238),radius*.27,power*.12)
    core=mask(im.width//S,im.height//S)
    rad=max(1.6,radius*.28)
    ImageDraw.Draw(core).ellipse((round((x-rad)*S),round((y-rad)*S),
                                 round((x+rad)*S),round((y+rad)*S)),fill=255)
    blur(im,core,(222,252,255),radius*.19,power*.40)
    composite(im,core,(236,253,255),power*.51)

def impact(im,x,y,power=1,seed=0,spread=40):
    if power<=0:return
    energy(im,x,y,max(5,spread*.16),power*.58)
    r=random.Random(seed+1099)
    for i in range(8):
        a=TAU*i/8+r.uniform(-.24,.24)
        d=spread*r.uniform(.60,1.25)
        ox=x+r.uniform(-5,5);oy=y+r.uniform(-4,4)
        bolt(im,(ox,oy),(x+math.cos(a)*d,y+math.sin(a)*d*.75),seed*43+i,
             width=r.uniform(1.5,3.3),power=power*(.68+r.random()*.27),
             branches=1,rough=.20)
    sparks(im,x,y,15,spread*1.4,seed+51,power)
    # No cartoon spiky polygon, no elliptical shield.

def storm_mist(im,x,y,power,seed):
    """Tiny high-altitude electrical ionization, never a solid cartoon cloud."""
    r=random.Random(seed)
    m=mask(im.width//S,im.height//S)
    d=ImageDraw.Draw(m)
    for i in range(6):
        xx=x+r.uniform(-45,45)
        yy=y+r.uniform(-7,6)
        length=r.uniform(8,21)
        d.line([point((xx-length,yy)),point((xx+length,yy+r.uniform(-2,2)))],
               fill=r.randint(60,140),width=max(1,round(S*.9)))
    blur(im,m,(52,62,188),7,power*.26)
    sparks(im,x,y+4,6,45,seed+99,power*.45)


def faisca(i):
    im=canvas();power=[.28,.54,.83,.99,.97,1,.48,.21][i]
    if i<=2:
        energy(im,109,164,15+i*6,power)
        sparks(im,109,166,9+i*4,20+i*10,100+i,power)
        for j in range(3+i):
            a=j*TAU/(3+i)+i*.24
            x=109+18*math.cos(a);y=164+21*math.sin(a)
            bolt(im,(x,y),(x+22*math.cos(a+.31),y+22*math.sin(a+.31)),
                 333+i*11+j,2.2,power,1)
    elif i<=4:
        for j in range(5):
            y=160+(j-2)*11
            bolt(im,(15, y-4*j),(188+i*12,y+(j-2)*5),220+i*19+j,
                 width=3.4 if j==2 else 1.6,power=power,branches=3)
        energy(im,190,160,18,power*.73)
        sparks(im,191,161,19,43,i+320,power)
    elif i==5:
        bolt(im,(35,167),(190,167),414,4.8,.86,4)
        impact(im,196,164,power,431,52)
    elif i==6:
        impact(im,192,162,.54,432,37)
    else:sparks(im,190,165,16,55,501,.33)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def discharge(i):
    im=canvas()
    power=[.29,.48,.71,.88,1,.93,.48,.20][i]
    radius=[18,27,43,75,105,124,85,41][i]
    energy(im,140,163,12+i%4*4,power*.88)
    r=random.Random(900+i*139)
    count=[3,5,7,10,14,14,9,5][i]
    for j in range(count):
        a=TAU*(j+.19)/count+i*.07+r.uniform(-.31,.31)
        end=radius*r.uniform(.61,1.12)
        x=140+end*math.cos(a)
        y=163+end*math.sin(a)*.89
        start=(140+r.uniform(-6,6),163+r.uniform(-6,6))
        bolt(im,start,(x,y),930+i*130+j,width=2.1+(i in (4,5))*.96,
             power=power*(.7+r.random()*.27),branches=1+(i>=3),rough=.26)
    sparks(im,140,163,12+i*3,radius*.91,i+440,power)
    if i in (4,5):impact(im,140,164,.55,772+i,24)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def tempestade(i):
    im=canvas()
    levels=[.35,.63,.83,.91,.98,1,.49,.21]
    storm_mist(im,140,69,levels[i],170+i)
    if i<=1:
        sparks(im,140,248,5+i*5,22+i*9,220+i,levels[i])
        energy(im,140,265,8+i*5,levels[i]*.41)
    elif i<=6:
        count=[1,1,2,3,2][i-2]
        offsets=[-30,23,-18,21,0]
        for j in range(count):
            x=140+offsets[i-2]+(j-(count-1)/2)*28
            tipy=194 if i==2 else 268
            bolt(im,(x+12,74),(x,tipy),311+i*31+j,3.5 if i!=5 else 4.7,
                 levels[i]*(.8+.15*j),branches=4,rough=.24)
            if i>=3:impact(im,x,265,.47+(i==5)*.40,405+i*13+j,25+(i==5)*13)
    else:sparks(im,140,270,14,58,702,.32)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def trovao(i):
    im=canvas()
    power=[.18,.40,.64,.85,1,.99,.49,.22][i]
    storm_mist(im,139,62,power,807+i)
    if i<=2:
        sparks(im,140,98,5+i*5,21+i*14,900+i,power)
        energy(im,141,266,8+i*4,power*.33)
    elif i<=6:
        progress=[0,0,0,.64,1,1,1][i]
        endy=80+192*progress
        bolt(im,(127,86),(143,endy),1400+i*37,width=4.8 if i==3 else 6.3 if i<=5 else 3.7,
             power=power,branches=4 if i==3 else 7,rough=.27)
        if i in (4,5):
            bolt(im,(141,199),(100,257),1780+i,3.8,power,2)
            bolt(im,(143,221),(183,261),1790+i,3.4,power,2)
            impact(im,142,272,.85 if i==4 else 1,821+i,44 if i==5 else 35)
        elif i==6:impact(im,142,272,.49,911,35)
    else:sparks(im,141,271,14,62,1044,.35)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def arc(i):
    w,h=384,144
    im=canvas(w,h)
    powers=[.14,.39,.64,.81,1,.96,.51,.18]
    power=powers[i]
    if i>=2:
        r=random.Random(610+i*111)
        for j in range(3):
            y=72+(j-1)*9
            a=(14,y+r.uniform(-6,6));b=(368,y+r.uniform(-9,9))
            bolt(im,a,b,2043+i*31+j,4.1 if j==1 else 1.8,power*(1 if j==1 else .65),5 if j==1 else 2,.17)
    else:energy(im,22,73,6+i*8,power)
    sparks(im,202,72,8,60,i+301,power*.65)
    return im.resize((w,h),Image.Resampling.LANCZOS)

def impact_frame(move,i):
    im=canvas()
    powers=[.35,1,.62,.18];power=powers[i]
    x,y=(140,160)
    impact(im,x,y,power,432+len(move)*11+i,spread=[24,47,33,15][i])
    return im.resize((W,H),Image.Resampling.LANCZOS)

def build():
    factories=dict(faisca=faisca,discharge=discharge,
                   **{"tempestade-de-raios":tempestade},trovao=trovao)
    for move in MOVES:
        sprites=ROOT/move/"sprites";impacts=ROOT/move/"impact"
        sprites.mkdir(parents=True,exist_ok=True);impacts.mkdir(parents=True,exist_ok=True)
        for i in range(8):factories[move](i).save(sprites/f"frame_{i+1:02}.png")
        for i in range(4):impact_frame(move,i).save(impacts/f"hit_{i+1:02}.png")
    arcs=ROOT/"discharge"/"arcs";arcs.mkdir(exist_ok=True)
    for i in range(8):arc(i).save(arcs/f"arc_{i+1:02}.png")
    print("PASS V53: 32 individual cinematic frames, 16 impacts, 8 directional arcs")
if __name__=="__main__":build()
