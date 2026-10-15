#!/usr/bin/env python3
"""Six individually authored Haze smoke-wisp textures.
Run offline at build time; PixiJS independently animates 36 mist layers.
Not a static fullscreen PNG, video, or Canvas rendering in-game.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import math, random,hashlib
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"effects/moves/haze/v85-preview/sprites/haze-wisps.webp"
W,H,N,S=160,112,6,2
OUT.parent.mkdir(parents=True,exist_ok=True)
sheet=Image.new("RGBA",(W*N,H),(0,0,0,0))
seen=set()
for stage in range(N):
    rng=random.Random(8531+stage*131)
    canvas=Image.new("RGBA",(W*S,H*S),(0,0,0,0))
    density=Image.new("L",canvas.size,0)
    p=ImageDraw.Draw(density)
    for j in range(11):
        a=j/10*math.tau + stage*.32
        x=(W*.26+stage*2.8)+W*.40*j/10 + math.cos(a)*7
        y=H*.52 + math.sin(a)*9 + rng.uniform(-6,6)
        radx=16+rng.uniform(7,22)
        rady=13+rng.uniform(3,10)
        p.ellipse(((x-radx)*S,(y-rady)*S,(x+radx)*S,(y+rady)*S),fill=min(210,92+j*10))
    density=density.filter(ImageFilter.GaussianBlur(8*S))
    shell=density.filter(ImageFilter.MaxFilter(5))
    # Thin deep-indigo edging outlines the flowing cloud; soft interior fades.
    rim=Image.new("RGBA",canvas.size,(14,13,33,0));rim.putalpha(shell.point(lambda a:int(a*.36)))
    canvas.alpha_composite(rim)
    fog=Image.new("RGBA",canvas.size,(82+stage*4,91+stage*4,129+stage*2,0))
    fog.putalpha(density.point(lambda a:int(a*.79)))
    canvas.alpha_composite(fog)
    hi=Image.new("RGBA",canvas.size,(160,177,204,0))
    light=Image.new("L",canvas.size,0);d=ImageDraw.Draw(light)
    d.ellipse((W*.28*S,H*.29*S,W*.78*S,H*.55*S),fill=108)
    light=light.filter(ImageFilter.GaussianBlur(12*S))
    from PIL import ImageChops
    hi.putalpha(ImageChops.multiply(light,density).point(lambda a:int(a*.85)))
    canvas.alpha_composite(hi)
    # Sparse outlined flecks caught inside the mist.
    speck=ImageDraw.Draw(canvas)
    for j in range(7):
        x=int((35+rng.uniform(0,90))*S);y=int((29+rng.uniform(0,53))*S)
        r=rng.choice([1,1,2])*S
        speck.ellipse((x-r-1,y-r-1,x+r+1,y+r+1),outline=(20,20,42,85),width=1*S)
        speck.ellipse((x-r,y-r,x+r,y+r),fill=(181,209,232,90))
    frame=canvas.resize((W,H),Image.Resampling.LANCZOS)
    assert frame.getchannel("A").getextrema()[0]==0
    digest=hashlib.sha256(frame.tobytes()).hexdigest()
    assert digest not in seen
    seen.add(digest);sheet.alpha_composite(frame,(stage*W,0))
sheet.save(OUT,"WEBP",lossless=True,method=6,exact=True)
check=Image.open(OUT)
assert check.size==(960,112) and check.mode=="RGBA"
print("PASS Haze V85:",N,"unique soft-wisp sprites, transparency, bytes",OUT.stat().st_size)
