#!/usr/bin/env python3
"""Pokemon Torre V55: four separately choreographed golden electric animations.
Offline authored transparent sprites. No procedural lightning is drawn at runtime.
Preserves engine damage, collision, position, cooldown, and other moves.
Reference direction: approved 8-frame golden-white Pokémon Torre storyboard and
transient hit impacts. Art only: existing game sprites own Mewtwo and Pikachu.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math, random

ROOT=Path(__file__).resolve().parents[1]/"effects"/"moves"
W,H,S=280,320,2
TAU=math.tau
MOVES=("faisca","discharge","tempestade-de-raios","trovao")
DARK=(16,9,17)
COOL=(255,180,24)
VIOLET=(255,125,16)
WHITE=(255,255,238)

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
    # Sharp, angular, tapering lightning. Do not render circular/capsule joints.
    n=len(pts)-1
    for j in range(n):
        t=j/max(1,n)
        k=(.94-.56*t)
        ww=max(1,round(width*S*k))
        draw.line([point(pts[j]),point(pts[j+1])],fill=fill,width=ww)

def bolt(im,a,b,seed,width=5,power=1,branches=3,rough=.24,shade=True):
    if power<=.015:return
    pts=fractal(a,b,seed,rough,5)
    broad=mask(im.width//S,im.height//S);core=mask(im.width//S,im.height//S)
    broadDraw=ImageDraw.Draw(broad);coreDraw=ImageDraw.Draw(core)
    tapered(broadDraw,pts,width*.78,255)
    tapered(coreDraw,pts,max(1.0,width*.42),255)
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
        tapered(broadDraw,fork,max(.7,width*.20),190)
        tapered(coreDraw,fork,max(.55,width*.11),200)
    blur(im,broad,(255,107,8),7,power*.22)
    blur(im,broad,(255,199,44),4.5,power*.38)
    blur(im,core,(255,252,182),2.5,power*.76)
    if shade:composite(im,broad.filter(ImageFilter.MaxFilter(3)),DARK,power*.61)
    composite(im,broad,(255,170,22),power*.90)
    composite(im,core,(255,242,128),power*.96)
    # Peak white core must be visible on phone-sized displays.
    fine=mask(im.width//S,im.height//S)
    tapered(ImageDraw.Draw(fine),pts,max(.9,width*.28),255)
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
        blur(im,p,(255,144,21),3,power*.52)
        composite(im,p,(255,233,115),power*.85)

def energy(im,x,y,radius,power):
    if power<=.03:return
    m=mask(im.width//S,im.height//S)
    ImageDraw.Draw(m).ellipse((round((x-radius)*S),round((y-radius)*S),
                              round((x+radius)*S),round((y+radius)*S)),fill=255)
    blur(im,m,(255,95,20),radius*.40,power*.11)
    blur(im,m,(255,206,43),radius*.28,power*.18)
    core=mask(im.width//S,im.height//S)
    rad=max(1.6,radius*.28)
    ImageDraw.Draw(core).ellipse((round((x-rad)*S),round((y-rad)*S),
                                 round((x+rad)*S),round((y+rad)*S)),fill=255)
    blur(im,core,(255,252,205),radius*.19,power*.45)
    composite(im,core,(255,246,166),power*.53)

def impact(im,x,y,power=1,seed=0,spread=40):
    if power<=0:return
    energy(im,x,y,max(5,spread*.16),power*.58)
    r=random.Random(seed+1099)
    for i in range(7):
        a=TAU*i/7+r.uniform(-.33,.33)
        d=spread*r.uniform(.60,1.25)
        ox=x+r.uniform(-5,5);oy=y+r.uniform(-4,4)
        bolt(im,(ox,oy),(x+math.cos(a)*d,y+math.sin(a)*d*.75),seed*43+i,
             width=r.uniform(1.1,2.2),power=power*(.68+r.random()*.27),
             branches=1,rough=.20)
    sparks(im,x,y,15,spread*1.4,seed+51,power)
    # No cartoon spiky polygon, no elliptical shield.


def cloud(im,x,y,power,seed):
    """Storm cloud made of uneven dark masses, not a UI icon or circular shield."""
    if power<.01:return
    rng=random.Random(seed)
    shadow=mask(im.width//S,im.height//S)
    lobes=ImageDraw.Draw(shadow)
    for j in range(14):
        xx=x+rng.uniform(-65,65)
        yy=y+rng.uniform(-10,16)
        rx=rng.uniform(12,30)
        ry=rng.uniform(7,19)
        lobes.ellipse((int((xx-rx)*S),int((yy-ry)*S),int((xx+rx)*S),int((yy+ry)*S)), fill=rng.randrange(105,210))
    blur(im,shadow,(5,4,14),5,power*.56)
    composite(im,shadow.filter(ImageFilter.GaussianBlur(2.7*S)),(48,39,70),power*.72)
    rim=mask(im.width//S,im.height//S)
    d=ImageDraw.Draw(rim)
    for j in range(8):
        xx=x+(j-3.5)*16+rng.uniform(-6,6)
        yy=y-8+rng.uniform(-4,4)
        d.arc((int((xx-13)*S),int((yy-7)*S),int((xx+13)*S),int((yy+10)*S)),195,340,fill=150,width=max(1,round(1.1*S)))
    blur(im,rim,(166,137,204),3,power*.14)
    composite(im,rim,(157,139,194),power*.32)

def targeting(im,x,y,power,seed,spread=42):
    """Thin concentric arena-floor target ellipse; never shield around actor."""
    for mul,opacity in [(1.0,.64),(.80,.28)]:
        m=mask(im.width//S,im.height//S)
        ImageDraw.Draw(m).ellipse((int((x-spread*mul)*S),int((y-spread*.23*mul)*S),
            int((x+spread*mul)*S),int((y+spread*.23*mul)*S)),outline=225,width=max(1,round(1.3*S)))
        blur(im,m,(255,166,26),2.5,power*opacity*.45)
        composite(im,m,(255,211,55),power*opacity)

def gold_impact(im,x,y,power,seed,spread=44,debris=False):
    if power<.01:return
    impact(im,x,y,power,seed,spread)
    rng=random.Random(seed+1177)
    raymask=mask(im.width//S,im.height//S)
    draw=ImageDraw.Draw(raymask)
    for j in range(13):
        a=TAU*j/13+rng.uniform(-.16,.16)
        short=spread*rng.uniform(.20,.42)
        far=spread*rng.uniform(.82,1.45)
        ux=math.cos(a); uy=math.sin(a)
        dx=uy*max(1.2,spread*.065)
        dy=-ux*max(1.2,spread*.065)
        p1=point((x+ux*short+dx,y+uy*short+dy))
        p2=point((x+ux*far,y+uy*far))
        p3=point((x+ux*short-dx,y+uy*short-dy))
        draw.polygon([p1,p2,p3],fill=255)
    blur(im,raymask,(255,157,29),4,power*.49)
    composite(im,raymask.filter(ImageFilter.MaxFilter(3)),(21,12,19),power*.64)
    composite(im,raymask,(255,191,44),power*.91)
    core=mask(im.width//S,im.height//S)
    d=ImageDraw.Draw(core);r=max(3,spread*.12)
    d.ellipse((int((x-r)*S),int((y-r)*S),int((x+r)*S),int((y+r)*S)),fill=255)
    blur(im,core,(255,243,154),5,power*.61)
    composite(im,core,(255,255,240),power*.91)
    if debris:
        rockmask=mask(im.width//S,im.height//S)
        rocks=ImageDraw.Draw(rockmask)
        for j in range(11):
            angle=TAU*j/11+rng.uniform(-.28,.28)
            dist=spread*rng.uniform(.66,1.55)
            xx=x+math.cos(angle)*dist
            yy=y+math.sin(angle)*dist*.67
            radius=rng.uniform(2.4,6.8)
            pts=[point((xx+math.cos(angle+k*TAU/5)*radius,
                        yy+math.sin(angle+k*TAU/5)*radius*.80)) for k in range(5)]
            rocks.polygon(pts,fill=255)
        composite(im,rockmask.filter(ImageFilter.MaxFilter(3)),(243,177,51),power*.81)
        composite(im,rockmask,(33,26,37),power*.94)

def faisca(i):
    """Charge → crouch → dash → trailing sparks → enemy collision → recovery."""
    im=canvas()
    power=[.30,.47,.73,.90,1,1,.54,.17][i]
    cx,cy=125,165
    if i<=2:
        sparks(im,cx,cy,7+i*5,27+i*9,110+i,power)
        for j in range(4+i):
            a=TAU*j/(4+i)+i*.31
            x=cx+math.cos(a)*23;y=cy+math.sin(a)*30
            bolt(im,(x,y),(x+math.cos(a)*24,y+math.sin(a)*19),
                 501+i*51+j,2.1+i*.20,power,2,.22)
        targeting(im,cx,210,power*.5,105+i,35+i*8)
    elif i<=4:
        for j in range(5):
            y=143+j*13
            bolt(im,(19,143+j*11),(233+(i-3)*16,y+(j-2)*3),
                 900+i*67+j,4.4 if j==2 else 2.0,power,3,.13)
        sparks(im,216,164,17,51,900+i,power)
    elif i==5:
        for j in range(5):
            bolt(im,(42,149+j*8),(198,164+j*3),1302+j,
                 4.6 if j==2 else 1.5,power,2,.11)
        gold_impact(im,199,168,1,884,58)
    elif i==6:
        gold_impact(im,197,170,.53,894,38)
    else:sparks(im,194,176,14,40,925,.26)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def discharge(i):
    """Electrical charge around the body, then exploding branches in 360 degrees."""
    im=canvas(); cx,cy=140,165
    levels=[.18,.39,.64,.84,1,.88,.47,.16]
    rad=[19,34,53,79,114,122,82,30][i]
    if i<=2:targeting(im,cx,218,levels[i],i+23,42+i*12)
    count=[4,6,8,12,15,13,9,4][i]
    rng=random.Random(454+i*111)
    for j in range(count):
        a=TAU*j/count+rng.uniform(-.14,.14)+i*.095
        radius=rad*rng.uniform(.71,1.15)
        end=(cx+math.cos(a)*radius,cy+math.sin(a)*radius*.88)
        start=(cx+rng.uniform(-10,10),cy+rng.uniform(-10,10))
        bolt(im,start,end,1600+i*71+j,
             width=2.6 if i<=2 else 3.7 if i>=4 else 3.0,
             power=levels[i],branches=1+(i>=3),rough=.18)
    if i==4:
        bolt(im,(139,14),(142,192),2841,6.2,.90,6,.20)
        gold_impact(im,cx,cy,.92,2780,46)
    elif i==5:
        gold_impact(im,cx,cy,.58,2788,32)
    sparks(im,cx,cy,8+i*3,rad*.9,1520+i,levels[i])
    return im.resize((W,H),Image.Resampling.LANCZOS)

def tempestade(i):
    """Storm cloud forms, successive vertical strikes, multi-bolt peak and fade."""
    im=canvas();power=[.37,.53,.68,.82,.93,1,.51,.21][i]
    cloud(im,140,57,power,200+i*13)
    if i<=1:
        targeting(im,140,266,power,205+i,31+i*10)
        sparks(im,140,265,6+i*5,39,210+i,power*.4)
    elif i<=6:
        offsets=[-18,15,-12,24,0]
        count=[1,1,2,3,2][i-2]
        for j in range(count):
            shift=offsets[i-2]+(j-(count-1)/2)*28
            xx=140+shift
            hitY=196 if i==2 else 269
            bolt(im,(xx+9,81),(xx,hitY),300+i*27+j,
                 width=4.6 if i<5 else 6.8,
                 power=power,branches=3+(i>=4),rough=.16)
            if i>=3:
                gold_impact(im,xx,267,power*(.48 if i<5 else .87),
                            400+i*19+j,39 if i==5 else 24,debris=i==5)
        if i==6:sparks(im,140,267,22,83,478,.45)
    else:sparks(im,140,264,11,40,490,.21)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def trovao(i):
    """Target indicator → single colossal lightning column → debris + aftershock."""
    im=canvas()
    power=[.25,.38,.56,.77,1,.96,.50,.17][i]
    if i<=2:
        targeting(im,140,268,power,i+600,35+i*6)
    if i>=1:
        cloud(im,139,55,power,670+i*13)
    if i==2:
        bolt(im,(140,72),(144,185),830,3.2,power,3,.13)
    elif i==3:
        bolt(im,(130,70),(144,269),850,6.1,power,5,.15)
        gold_impact(im,144,267,.46,932,24)
    elif i in (4,5):
        bolt(im,(129,72),(142,269),940+i,
             12 if i==4 else 10.3,power,7,.17)
        bolt(im,(145,189),(101,242),980+i,4.0,power,3,.14)
        bolt(im,(142,215),(178,246),995+i,3.3,power,3,.15)
        gold_impact(im,143,269,1 if i==4 else .89,
                    1100+i,63 if i==4 else 57,True)
    elif i==6:
        bolt(im,(148,164),(149,272),1156,2.8,.47,2,.14)
        gold_impact(im,145,269,.48,1200,34,True)
    elif i==7:
        sparks(im,141,269,16,77,1222,.30)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def arc(i):
    """Four moving golden plasma lines reaching the tracked enemy (Discharge)."""
    w,h=384,144; im=canvas(w,h)
    levels=[.12,.30,.60,.81,1,.91,.47,.18]
    if i>=2:
        for j in range(4):
            y=72+(j-1.5)*12
            a=(8,y); b=(371,y+(j-1.5)*5)
            bolt(im,a,b,1340+i*27+j,
                 width=4.2 if j==1 else 2.0,
                 power=levels[i]*(1 if j==1 else .61),
                 branches=4 if j==1 else 2,rough=.13)
    else:sparks(im,20,72,6,18,982+i,levels[i])
    sparks(im,360,72,9,19,1430+i,levels[i])
    return im.resize((w,h),Image.Resampling.LANCZOS)

def impact_frame(move,i):
    im=canvas()
    level=[.31,1,.60,.18][i]
    gold_impact(im,140,160,level,2000+len(move)*43+i,
                [24,54,39,16][i],debris=(move=="trovao" and i in (1,2)))
    return im.resize((W,H),Image.Resampling.LANCZOS)

def build(selected_moves=MOVES):
    factories={'faisca':faisca,'discharge':discharge,
               'tempestade-de-raios':tempestade,'trovao':trovao}
    for move in selected_moves:
        if move not in factories:raise ValueError('Unknown move '+move)
        root=ROOT/move
        (root/'sprites').mkdir(parents=True,exist_ok=True)
        (root/'impact').mkdir(parents=True,exist_ok=True)
        for i in range(8):factories[move](i).save(root/'sprites'/f'frame_{i+1:02}.png')
        for i in range(4):impact_frame(move,i).save(root/'impact'/f'hit_{i+1:02}.png')
    if 'discharge' in selected_moves:
        (ROOT/'discharge'/'arcs').mkdir(parents=True,exist_ok=True)
        for i in range(8):arc(i).save(ROOT/'discharge'/'arcs'/f'arc_{i+1:02}.png')
    print('PASS V55 golden frames: '+', '.join(selected_moves))
if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument('--move',choices=('all',)+MOVES,default='all')
    args=parser.parse_args()
    build(MOVES if args.move=='all' else (args.move,))
