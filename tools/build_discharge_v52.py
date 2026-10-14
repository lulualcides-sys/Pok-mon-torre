"""Discharge V52: animated radial arcs + independent long electrical linkage.
Uses the project's existing shaded/electric pixel effect functions; no runtime
Canvas strokes, CSS bolts or static ring effect. The other moves are untouched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import math
import random
import build_electric_v51_source as v

BASE=Path(__file__).resolve().parent.parent/'effects'/'moves'/'discharge'
CX,CY=140,160
S=v.S

def aura(im, x, y, size, power):
    if power<=0:return
    mask=v.mask()
    draw=ImageDraw.Draw(mask)
    draw.ellipse([(x-size)*S,(y-size*.8)*S,(x+size)*S,(y+size*.8)*S], fill=220)
    v.glow(im,mask,(255,172,24),12,power*.44)
    v.glow(im,mask,(255,230,92),5,power*.27)
    small=v.mask()
    ImageDraw.Draw(small).ellipse([(x-7)*S,(y-7)*S,(x+7)*S,(y+7)*S],fill=250)
    v.glow(im,small,(255,245,128),6,power*.42)
    v.use(im,small,(255,255,239),power*.68)

def cinematic_lightning(im, points, width=4, seed=1, branches=2, alpha=1):
    """Fine lightning with layered plasma bloom, soft shadow rim, and irregular forks.
    Unlike V51, the black edge is a narrow silhouette, not a wide pipe.
    """
    main=v.mask()
    core=v.mask()
    fine=v.mask()
    v.line(main,points,width)
    v.line(core,points,max(1.05,width*.60))
    v.line(fine,points,max(.6,width*.27))
    if branches:
        rng=random.Random(seed)
        for j in range(branches):
            idx=max(1,min(len(points)-2,int((j+1)*len(points)/(branches+1))))
            sx,sy=points[idx]
            ang=math.atan2(points[-1][1]-points[0][1],points[-1][0]-points[0][0])
            ang+=(1 if j%2==0 else -1)*rng.uniform(.55,1.32)
            length=rng.uniform(15,39)*(1.2 if width>5 else 1)
            endpoint=(sx+math.cos(ang)*length,sy+math.sin(ang)*length)
            fork=v.bolt_path((sx,sy),endpoint,seed*17+j,split=12,bend=5)
            v.line(main,fork,max(.8,width*.28))
            v.line(core,fork,max(.5,width*.12))
    # Soft luminous envelope; thin dark outer line is only a hint of definition.
    v.glow(im,main,(245,127,13),13,alpha*.46)
    v.glow(im,main,(255,208,26),6,alpha*.76)
    v.glow(im,core,(255,247,174),3,alpha*.71)
    v.use(im,main.filter(ImageFilter.MaxFilter(5)),(8,7,21),alpha*.78)
    v.use(im,main,(255,190,23),alpha*.98)
    v.use(im,core,(255,246,156),alpha)
    v.use(im,fine,(255,255,255),alpha)

def create_radial(frame):
    i=frame
    im=Image.new('RGBA',(v.W*S,v.H*S),(0,0,0,0))
    rng=random.Random(915+frame*140)
    # Actual charge -> expansion -> violent radial release -> fading sparks.
    radii=[15,30,59,94,129,141,90,44]
    counts=[3,5,7,10,13,13,9,4]
    levels=[.30,.56,.71,.91,1,.95,.48,.22]
    n=counts[i]
    radius=radii[i]
    aura(im,CX,CY,12+(i%5)*4,levels[i])
    for j in range(n):
        a=math.tau*j/n+(rng.random()-.5)*.27 +i*.039
        # The tips are not points on a circle: vary lengths and opening directions.
        reach=radius*(.76+rng.random()*.26)
        x=CX+math.cos(a)*reach
        y=CY+math.sin(a)*reach*.93
        start_dist=9+(i%3)*3
        x0=CX+math.cos(a)*start_dist
        y0=CY+math.sin(a)*start_dist
        center=v.bolt_path((x0,y0),(x,y),frame*101+17*j,split=10,bend=14 if i>2 else 6)
        width=(2.3 if i<3 else 3.6 if i<6 else 2.0)*(1.25 if j%4==0 else 1)
        cinematic_lightning(im,center,width=width,seed=180+frame*30+j,branches=2 if i>=3 else 1,alpha=levels[i])
        if i>=3 and i<=6 and j%3==0:
            fork=x0+(x-x0)*.63, y0+(y-y0)*.63
            end=x+math.cos(a+.45)*(17+8*rng.random())
            endy=y+math.sin(a+.45)*(14+9*rng.random())
            cinematic_lightning(im,v.bolt_path(fork,(end,endy),1000+frame*19+j,split=8,bend=7),2.4,seed=810+j+frame,branches=1,alpha=levels[i]*.60)
    v.motes(im,CX,CY,max(23,radius*.85),5+i*4,170+frame,alpha=levels[i])
    if i in (4,5):
        # Small white-hot impact at the center, not a huge cartoon wheel.
        aura(im,CX,CY,19 if i==4 else 14,.87)
    return im.resize((v.W,v.H),Image.Resampling.LANCZOS)

def create_arc(frame):
    # Separate transparent 384x144 frames, rotated toward the moving target
    # by the animation engine. Ends are connected to actual caster/target positions.
    w,h=384,144
    old_w,old_h=v.W,v.H
    v.W,v.H=w,h
    try:
        im=Image.new('RGBA',(w*S,h*S),(0,0,0,0))
        center=72
        rng=random.Random(1900+frame*44)
        charge=[.19,.43,.72,.87,1,.94,.59,.23][frame]
        last=372
        segments=[
            ((10,center),(last,center),4.4),
            ((17,center-9),(last-10,center-18),1.7),
            ((25,center+13),(last-17,center+15),1.4)
        ]
        for j,(start,end,width) in enumerate(segments):
            pts=v.bolt_path(start,end,340+frame*41+j*17,split=12,bend=9+j*5)
            cinematic_lightning(im,pts,width=width,seed=940+frame*14+j,branches=6 if j==0 else 3,alpha=charge*(1 if j==0 else .61))
        for k in range(5):
            tx=36+k*68+rng.randrange(15)
            ty=center+(rng.random()-.5)*38
            v.motes(im,tx,ty,16,3,frame*52+k,alpha=charge*.8)
        return im.resize((w,h),Image.Resampling.LANCZOS)
    finally:
        v.W,v.H=old_w,old_h

if __name__=='__main__':
    sprites=BASE/'sprites'
    arcs=BASE/'arcs'
    sprites.mkdir(parents=True,exist_ok=True)
    arcs.mkdir(parents=True,exist_ok=True)
    for i in range(8):
        create_radial(i).save(sprites/f'frame_{i+1:02}.png')
        create_arc(i).save(arcs/f'arc_{i+1:02}.png')
    print('Discharge V52: 8 detailed radial sprite frames and 8 long lightning arc frames.')
