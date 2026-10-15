#!/usr/bin/env python3
"""V72: Turn approved V71 cinematic preview art into transparent battle-only
spritesheets. Does not replace source art or alter any pre-approved effects.
Output: 4 eight-frame WebP atlases, 3840x240 RGBA, transparent background.
"""
from pathlib import Path
from PIL import Image
import sys

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'effects/atelier-v71/atlases'
DST = ROOT / 'effects/moves/v72-battle/sprites'
MOVES = {'dragon-pulse':'purple', 'aura-sphere':'blue',
         'x-scissor':'green', 'dragon-claw':'purple'}

def clamp(value):
    return max(0.,min(1.,value))

def alpha(c,kind):
    r,g,b = c
    high=max(c);low=min(c)
    if kind == 'purple':
        score=max((r-g)*1.18+(b-g)*.74, (b-g)*1.05+(r-g)*.48)
        peak=clamp((score-32)/125)*clamp((high-40)/90)
    elif kind == 'blue':
        score=(b-r)*.9+(b-g)*.45+(g-r)*.28
        peak=clamp((score-10)/102)*clamp((high-48)/100)
    else:
        score=(g-b)*.93+(r-b)*.32
        peak=clamp((score-32)/170)*clamp((high-72)/95)
    white=clamp((low-150)/70)*clamp((high-170)/64)
    t=max(peak,white)
    t=t*t*(3-2*t)
    return round(t*255) if t*255>7 else 0

def main():
    DST.mkdir(parents=True,exist_ok=True)
    for name,kind in MOVES.items():
        source=SRC/(name+'.webp')
        im=Image.open(source).convert('RGB')
        if im.size!=(3840,240):
            raise SystemExit('Unexpected source dimensions: '+str(source)+' '+str(im.size))
        out=Image.new('RGBA',im.size)
        # Pixel treatment is intentionally limited to masking away the original
        # infographics/background, without procedurally redrawing the move.
        out.putdata([(*p,alpha(p,kind)) for p in im.getdata()])
        path=DST/(name+'.webp')
        out.save(path,'WEBP',quality=92,method=4)
        check=Image.open(path)
        if check.size!=(3840,240) or check.getchannel('A').getextrema()[0]>8:
            raise SystemExit('Invalid transparent V72 sprite: '+str(path))
        print(f'V72 {name}: {path.stat().st_size} bytes, transparent 8 frames')
if __name__=='__main__': main()
