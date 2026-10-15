#!/usr/bin/env python3
"""V83 single-move test sprites. Transparent 8x480x240 WebP (alpha).
Reuses the original project's outlined vine/leaf/impact SVG source art.
Offline authoring only: at runtime PixiJS/WebGL displays these textures.
The V82 assets and all approved moves are untouched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import importlib.util, math, random

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location('pokemon_v82_grass', ROOT/'tools/build-v82-equipped-grass.py')
v82=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(v82)
OUT=ROOT/'effects/moves/chicote-de-vinha/v83-preview/sprites'
W,H,S=480,240,2

def vine_stroke(surface,i,extent,y,flip=False,op=1):
    if extent<=0:return
    # Individual hand-authored source sprite variant, revealed progressively:
    # two broad, black-outlined vines instead of a flat line or green beam.
    v82.vine(surface,i,max(.02,extent),y=y,opacity=op,flip=flip,tilt=0,width=365)

def ring(surface,x,y,r,amount,seed):
    if amount<=0:return
    overlay=v82.img();draw=ImageDraw.Draw(overlay,'RGBA')
    # Organic coiling stems around the origin: dark outline, mid-green body,
    # emerald highlight. The PNG/WebP atlas bakes these paths offline.
    for phase in range(2):
        pts=[]
        for k in range(42):
            th=(-.75+1.52*k/41)*math.pi + phase*.85
            rr=r*(.62+(.35 if phase else .16)*k/41)
            pts.append((v82.px(x+math.cos(th)*rr),
                        v82.px(y+math.sin(th)*rr*.63)))
        draw.line(pts,fill=(7,23,16,int(238*amount)),width=v82.px(10))
        draw.line(pts,fill=(46,129,35,int(255*amount)),width=v82.px(7))
        draw.line(pts,fill=(140,244,68,int(220*amount)),width=v82.px(2.4))
    surface.alpha_composite(overlay)
    v82.leaves(surface,x,y,4+int(4*amount),seed,max(12,r*.76),amount*.82)

def impact(surface,strength,seed=113):
    # Bright hit flash with fine outline, leaves and wood fragments.
    v82.burst(surface,404,119,strength,seed)
    if strength>.3:
        draw=ImageDraw.Draw(surface,'RGBA');rng=random.Random(seed)
        for k in range(9):
            a=rng.random()*math.tau
            rad=(12+rng.random()*29)*strength
            cx=404+math.cos(a)*rad;cy=119+math.sin(a)*rad*.68
            w=1.5+rng.random()*2.1
            draw.polygon([(v82.px(cx-w),v82.px(cy-w)),
                          (v82.px(cx+w),v82.px(cy-w)),
                          (v82.px(cx+w*.75),v82.px(cy+w)),
                          (v82.px(cx-w*.75),v82.px(cy+w))],
                         fill=(65,96,39,int(180*strength)))

def make_frame(i):
    im=v82.img()
    # 0 charge; 1 roots coil; 2 vines travel; 3 tips touch; 4 REAL damage
    # + high-energy shock; 5 pullback; 6 scattering leaves; 7 cleanup.
    lengths=[(0,0),(.17,.14),(.48,.38),(.96,.89),(1,1),(.65,.52),(.23,.17),(0,0)]
    upper,lower=lengths[i]
    charge=[1,1,1,.55,.2,.18,.08,.02][i]
    if i<7:
        v82.charge(im,charge,seed=204+i)
    if i<=2:
        ring(im,86,120,18+i*10,.8+i*.10,seed=213+i)
    if upper:
        vine_stroke(im,i%7,upper,36,False,.96 if i<6 else .57)
    if lower:
        vine_stroke(im,(i+3)%7,lower,77,True,.96 if i<6 else .55)
    if i==2:
        # Speed lines subtly accentuate the advancing vine tips.
        v82.leaves(im,80+upper*215,112,9,223,41,.85)
    if i==3:
        impact(im,.25,seed=251)  # CONTACT: no mechanical HP loss yet
    if i==4:
        impact(im,1.0,seed=252)  # IMPACT: exactly one native HP hit
        v82.leaves(im,402,117,15,253,62,.98)
    if i==5:
        impact(im,.38,seed=254)
        v82.leaves(im,313,108,10,255,47,.7)
    if i==6:
        v82.leaves(im,256,125,11,256,96,.53)
        v82.leaves(im,88,120,6,257,31,.54)
    if i==7:
        # Almost-gone floating motes, not a repeated charge frame.
        v82.leaves(im,201,108,5,258,90,.16)
        v82.sparkle(im,86,117,3.2,.18,seed=259)
    return im


def make_razor(i):
    im=v82.img()
    if i<=5:v82.charge(im,min(1,(i+2)/3),seed=306+i)
    # Eight distinctly advancing banks of individually outlined, pointed leaves.
    progress=[.04,.16,.42,.65,.84,1,.68,.08][i]
    for wave in range(2):
        if i < wave:continue
        u=max(0,progress-wave*.13)
        if u<=0:continue
        for k in range(6):
            q=max(.015,min(1,u-k*.055))
            x=70+337*q
            y=118+(k-2.5)*13+math.sin(q*5.2+k*.67+wave)*7.3
            if i<6:
                blade=v82.scale(v82.LEAF,24+8*(k%2),15+4*(k%3))
                blade=blade.rotate(-19+k*9+wave*11,Image.Resampling.BICUBIC,expand=True)
                v82.composite(im,blade,x-blade.width/(2*S),y-blade.height/(2*S),.96)
            if q>.10 and i<6:
                draw=ImageDraw.Draw(im,'RGBA')
                draw.line((v82.px(x-19),v82.px(y+2),v82.px(x-7),v82.px(y)),
                    fill=(17,44,22,177),width=v82.px(3))
                draw.line((v82.px(x-19),v82.px(y+2),v82.px(x-7),v82.px(y)),
                    fill=(166,245,70,210),width=v82.px(1))
    if i==3:
        v82.leaves(im,389,116,10,340,41,.92)  # orbiting slashes near target
    if i==4:
        v82.burst(im,408,114,.35,341) # visible slices, no HP change yet
    if i==5:
        v82.burst(im,408,114,1.0,342) # native damage at exact onset of this frame
        v82.leaves(im,397,114,18,343,61,.98)
    if i==6:v82.leaves(im,388,115,14,344,74,.47)
    if i==7:v82.leaves(im,330,112,5,345,68,.13)
    return im

def make_area(i):
    im=v82.img()
    if i<=5:v82.charge(im,min(1,(i+2)/3),seed=414+i)
    # Three separate heavyweight vines emerge from the soil, each at a
    # different height. They are NOT copies of the single-target Vine Whip.
    spans=[
        (0,0,0),(.20,.10,0),(.38,.29,.20),(.79,.65,.56),
        (1,.95,.88),(1,1,1),(.53,.41,.35),(.07,.05,.04)
    ][i]
    if 1<=i<=6:
        draw=ImageDraw.Draw(im,'RGBA')
        rng=random.Random(464+i)
        for j in range(10):
            x=80+rng.random()*90
            y=160+rng.random()*12
            rad=rng.random()*6+2
            draw.polygon([(v82.px(x-rad),v82.px(y)),
               (v82.px(x+rad),v82.px(y-rad*.5)),
               (v82.px(x+rad*.6),v82.px(y+rad*.8))],
                fill=(59,75,35,230))
    for j,span in enumerate(spans):
        if span<=0:continue
        v82.vine(im,(i+j+2)%7,span,y=13+j*46,opacity=.93 if i<7 else .17,
            flip=(j==2),tilt=[-13,0,12][j],width=364)
        if 1<=i<=6:v82.leaves(im,150+j*74,90+j*14,3+j,505+j+i,42,.42)
    if i==3:v82.burst(im,390,85,.33,523)
    if i==4:
        v82.burst(im,408,115,.55,524)
        v82.burst(im,385,133,.32,525)
    if i==5:
        v82.burst(im,405,115,1,526) # center of all-area visual impact
        v82.burst(im,372,104,.58,527)
        v82.leaves(im,392,110,19,528,63,1)
    if i==6:v82.leaves(im,295,118,15,529,76,.54)
    if i==7:v82.leaves(im,241,112,5,530,80,.12)
    return im

def make_vine(i):
    im=v82.img()
    # A SINGLE thick, cinematic lash: coils, reaches the face, crack,
    # retracts, glows off. Distinct from the double-chicote variation.
    length=[0,.13,.52,.98,1,.55,.18,0][i]
    if i<=5:v82.charge(im,min(1,(i+1)/2),seed=608+i)
    if i<=2:ring(im,86,116,22+i*12,.96,seed=615+i)
    if length>0:
        v82.vine(im,(i+4)%7,length,y=56,opacity=1 if i<6 else .50,width=370)
    if i==2:v82.leaves(im,260,105,9,621,44,.95)
    if i==3:v82.burst(im,409,119,.23,622) # first contact
    if i==4:
        v82.burst(im,409,119,1.0,623)
        v82.leaves(im,410,118,13,624,54,.97)
    if i==5:v82.burst(im,405,119,.35,625)
    if i==6:v82.leaves(im,280,121,10,626,67,.39)
    if i==7:v82.leaves(im,193,107,5,627,54,.12)
    return im

def main():
    generators=[
        ('chicote-de-vinha',make_frame),
        ('folha-navalha',make_razor),
        ('chicotes-em-area',make_area),
        ('vine-whip',make_vine)
    ]
    for name,creator in generators:
        folder=ROOT/'effects/moves'/name/'v83-preview/sprites'
        folder.mkdir(parents=True,exist_ok=True)
        atlas=Image.new('RGBA',(W*8,H),(0,0,0,0))
        unique=[]
        for n in range(8):
            frame=creator(n).resize((W,H),Image.Resampling.LANCZOS)
            if not frame.getchannel('A').getbbox():
                raise RuntimeError('Blank '+name+' stage '+str(n+1))
            unique.append(frame.tobytes())
            atlas.alpha_composite(frame,(n*W,0))
        assert len(set(unique))==8,name+' must have eight unique stages'
        path=folder/(name+'.webp')
        atlas.save(path,'WEBP',lossless=True,method=6,exact=True)
        probe=Image.open(path)
        assert probe.size==(3840,240) and probe.mode=='RGBA'
        assert probe.getchannel('A').getextrema()[0]==0
        print('PASS V83',name,'transparent RGBA, eight unique stages,',path.stat().st_size,'bytes')
    leaf=ROOT/'effects/moves/v83-preview/sprites/leaf.webp'
    leaf.parent.mkdir(parents=True,exist_ok=True)
    v82.LEAF.resize((64,64),Image.Resampling.LANCZOS).save(
        leaf,'WEBP',lossless=True,method=6,exact=True)

if __name__=='__main__':main()
