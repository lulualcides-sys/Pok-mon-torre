#!/usr/bin/env python3
"""Three distinct V84.2 vines for the opt-in battle preview, not production.
Offline RGBA spritesheet authoring; 8 genuinely different frames per move.
No CSS drawing, Canvas2D, videos, full-image movie frames, or CSS effects.
Runtime: PixiJS samples individual transparent atlas frames.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import importlib.util
import hashlib
import math
import random

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "v82_grass_source", ROOT / "tools/build-v82-equipped-grass.py")
v82 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v82)
W, H, S = 480, 240, 2
TARGET = (406, 120)
# Each named move has a separate geometry/style/asset. No shared VINES[frame]
# bitmap is rendered by any of these three moves.
STYLES = {
    "chicote-de-vinha": "single-straight-centered-lash",
    "chicotes-em-area": "three-short-local-roots-around-enemy",
    "vine-whip": "single-hooked-crescent-whip",
}
FRAME_PROGRESS = [0, .14, .44, .94, 1.0, .61, .19, 0]

def cubic(a, b, c, d, t):
    u = 1-t
    return (u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0],
            u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1])

def points(segments, samples=20):
    out = []
    for a,b,c,d in segments:
        out.extend(cubic(a,b,c,d,i/samples) for i in range(samples+1))
    return out

def stroke(canvas, path, frac, *, heavy=17, dark=(5,24,11),
           primary=(41,139,47), rim=(180,241,91), seed=0, opacity=255):
    """Outlined curving stem with shaded body and fine living-vein markings."""
    if frac<=0 or len(path)<2:return
    count=max(2,min(len(path),round((len(path)-1)*frac)+1))
    part=path[:count]
    vertices=[(round(x*S),round(y*S)) for x,y in part]
    # Organic blurred glow is authored OFFLINE as a transparent RGBA asset.
    glow=Image.new("RGBA",canvas.size,(0,0,0,0))
    gd=ImageDraw.Draw(glow)
    gd.line(vertices,fill=(114,216,67,opacity//2),width=round((heavy+10)*S),
            joint="curve")
    canvas.alpha_composite(glow.filter(ImageFilter.GaussianBlur(8*S)))
    d=ImageDraw.Draw(canvas,"RGBA")
    d.line(vertices,fill=(*dark,opacity),width=round((heavy+4)*S),joint="curve")
    d.line(vertices,fill=(*primary,opacity),width=round(heavy*S),joint="curve")
    d.line(vertices,fill=(72,184,62,opacity),width=round((heavy-5)*S),joint="curve")
    # One side highlight, NEVER repeat the source art of the area move.
    shifted=[(x,y-round(heavy*S*.20)) for x,y in vertices]
    d.line(shifted,fill=(*rim,int(opacity*.78)),width=round(max(1,heavy*.19)*S),
           joint="curve")
    if frac>.27:
        for n in range(4,count-3,7):
            x,y=vertices[n]
            delta=(n+seed)%3
            d.line([(x-round(heavy*.10*S),y+round(heavy*.19*S)),
                    (x+round((3+delta)*S),y-round(heavy*.19*S))],
                   fill=(13,69,22,int(opacity*.86)),width=2*S)
    # Solid edged tapered tip with small flare.
    if frac>.08:
        x,y=vertices[-1];x0,y0=vertices[-2]
        ang=math.atan2(y-y0,x-x0)
        length=(heavy*.78)*S
        tip=(x+round(math.cos(ang)*length),y+round(math.sin(ang)*length))
        side=round(heavy*.45*S)
        corners=[(x+round(math.cos(ang+math.pi/2)*side),
                  y+round(math.sin(ang+math.pi/2)*side)),tip,
                 (x+round(math.cos(ang-math.pi/2)*side),
                  y+round(math.sin(ang-math.pi/2)*side))]
        d.polygon(corners,fill=(*dark,opacity))
        d.polygon([((px*2+x)//3,(py*2+y)//3) for px,py in corners],
                  fill=(*rim,int(opacity*.88)))

def tail_sparks(im, i, x=408,y=120,seed=300):
    # Keep the real damage hit visually on the declared impact stage only.
    if i==3:
        v82.sparkle(im,x,y,5.5,.23,seed)
    if i==4 or i==5:
        power=1.0 if i==4 else .26
        v82.burst(im,x,y,power,seed)
        v82.leaves(im,x-15,y,10 if i==4 else 5,seed+2,38,power)
    if i==6:v82.leaves(im,x-60,y+4,5,seed+3,39,.29)
    if i==7:v82.leaves(im,x-95,y,3,seed+4,70,.1)

def chicote(i):
    """ONE broad straight whip crossing center from attacker to opponent.
    It never sprouts 3 plants from the floor as the area move does.
    """
    im=v82.img()
    q=FRAME_PROGRESS[i]
    if i<=2:v82.charge(im,[.7,.9,1][i],seed=720+i)
    path=points([((75,120),(141,116),(245,125),(406,120))],38)
    stroke(im,path,q,heavy=17,seed=29,
           primary=(36,149,53),rim=(205,251,112),
           opacity=245 if i<6 else 130)
    if i in (2,3,4):
        v82.leaves(im,80+295*q,117,4,725+i,23,.65)
    tail_sparks(im,i,seed=730)
    return im

def vine_whip(i):
    """ONE curled hook, arcs UP and crashes DOWN. One stem, no area roots."""
    im=v82.img()
    q=FRAME_PROGRESS[i]
    if i<=2:v82.charge(im,[.6,.85,1][i],seed=800+i)
    # Start from lower attacker, huge looping S-hook along a single connected line.
    path=points([
        ((74,145),(105,124),(107,65),(166,60)),
        ((166,60),(231,41),(261,56),(306,85)),
        ((306,85),(346,109),(361,116),(406,120))
    ],26)
    stroke(im,path,q,heavy=14,seed=47,
           dark=(4,20,21),primary=(35,139,105),rim=(146,241,185),
           opacity=248 if i<6 else 130)
    if i in (2,3):
        v82.leaves(im,180+150*q,65+55*q,3,810+i,17,.55)
    tail_sparks(im,i,x=406,y=120,seed=817)
    return im

# Area effect is NOT a row of full-width whips. It is localized around enemy.
AREA_START=[(322,189),(379,192),(443,189)]
AREA_TIPS=[(378,103),(406,96),(424,110)]

def area(i):
    """THREE compact vines RISE around target, no long shafts from caster.
    Their compact battlefield geometry is unmistakable vs single whips.
    """
    im=v82.img()
    if i<=2:v82.charge(im,[.5,.7,.87][i],seed=896+i)
    phases=[0,.08,.29,.78,.98,1.0,.40,0]
    q=phases[i]
    if q>0:
        d=ImageDraw.Draw(im,"RGBA")
        for j,(start,end) in enumerate(zip(AREA_START,AREA_TIPS)):
            delay=j*.12
            local=max(0,min(1,(q-delay)/(1-delay)))
            if local<=0:continue
            sx,sy=start;ex,ey=end
            path=points([((sx,sy),
               (sx-26+j*22,sy-33),
               (ex-28+j*9,ey+42),
               (ex,ey))],24)
            stroke(im,path,local,heavy=12,seed=68+j,
                   primary=(35+j*7,118+j*5,51),
                   rim=(159,226,88),opacity=242 if i<6 else 120)
            if i in (3,4,5):
                v82.leaves(im,ex,ey,3,920+i+j,17,.64)
            # Distinct compact dark-soil crack at each vine's BASE only.
            d.ellipse(((sx-10)*S,(sy-3)*S,(sx+10)*S,(sy+4)*S),
                      fill=(20,38,23,150))
    # Area impact = frame 6, not 5. Before that, omit burst completely.
    if i==5:
        for j,(ex,ey) in enumerate(AREA_TIPS):
            v82.burst(im,ex,ey,.38 if j!=1 else .85,930+j)
        v82.leaves(im,407,116,11,937,43,.9)
    if i==6:v82.leaves(im,407,119,8,940,50,.4)
    if i==7:v82.leaves(im,405,118,3,941,50,.1)
    return im

def main():
    recipes={
        "chicote-de-vinha":chicote,
        "chicotes-em-area":area,
        "vine-whip":vine_whip,
    }
    signatures=set()
    for name,recipe in recipes.items():
        folder=ROOT/"effects/moves"/name/"v84-preview/sprites"
        folder.mkdir(parents=True,exist_ok=True)
        sheet=Image.new("RGBA",(W*8,H),(0,0,0,0))
        hashes=[]
        for i in range(8):
            image=recipe(i).resize((W,H),Image.Resampling.LANCZOS)
            assert image.mode=="RGBA" and image.getchannel("A").getbbox(), (name,i)
            digest=hashlib.sha256(image.tobytes()).hexdigest()
            hashes.append(digest)
            assert digest not in signatures,(name,i,"cross-move identical frame")
            signatures.add(digest)
            sheet.alpha_composite(image,(i*W,0))
        assert len(set(hashes))==8,(name,"duplicate frames")
        out=folder/(name+".webp")
        sheet.save(out,"WEBP",lossless=True,method=6,exact=True)
        check=Image.open(out)
        assert check.mode=="RGBA" and check.size==(3840,240), name
        assert check.getchannel("A").getextrema()[0]==0, name
        print("V84.2",name,STYLES[name],"unique eight stages",out.stat().st_size)

if __name__=="__main__":
    main()
