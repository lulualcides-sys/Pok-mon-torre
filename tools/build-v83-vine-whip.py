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

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(8*W,H),(0,0,0,0))
    signatures=[]
    for n in range(8):
        frame=make_frame(n).resize((W,H),Image.Resampling.LANCZOS)
        if not frame.getchannel('A').getbbox():
            raise RuntimeError('Blank stage '+str(n+1))
        signatures.append(frame.tobytes())
        atlas.alpha_composite(frame,(n*W,0))
    assert len(set(signatures))==8,'Eight animation stages must differ'
    atlas.save(OUT/'chicote-de-vinha.webp','WEBP',lossless=True,method=6,exact=True)
    leaf=v82.LEAF.resize((64,64),Image.Resampling.LANCZOS)
    leaf.save(OUT/'leaf.webp','WEBP',lossless=True,method=6,exact=True)
    probe=Image.open(OUT/'chicote-de-vinha.webp')
    assert probe.size==(3840,240) and probe.mode=='RGBA'
    assert probe.getchannel('A').getextrema()[0]==0
    print('PASS V83: transparent 3840x240 atlas, 8 distinct frames, leaf particle sprite')

if __name__=='__main__':main()
