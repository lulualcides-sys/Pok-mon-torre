#!/usr/bin/env python3
"""Build true staged 8-frame V77 WebP sprites from the approved V72 artwork.
The official V75 battle sprites are left intact. Run AFTER build-v72-battle.py.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'effects/moves/v72-battle/sprites'
DST=ROOT/'effects/moves/v77-preview/sprites'
W,H,N=480,240,8
MOVES=('dragon-claw','x-scissor','dragon-pulse','aura-sphere')

def fade(img, opacity):
    p=img.copy()
    p.putalpha(p.getchannel('A').point(lambda a:round(a*opacity)))
    return p

def claw(src,number):
    # The 3 claws are arranged left-to-right in APPROVED source frame 5.
    # V76 wrongly masked horizontal rows; all claws remained visible.
    frame=src.crop((4*W,0,5*W,H))
    left,right=((4,184),(154,331),(301,479))[number]
    part=frame.crop((left,0,right,H))
    matte=Image.new('L',part.size,0)
    ImageDraw.Draw(matte).rectangle((7,0,part.width-8,H),fill=255)
    matte=matte.filter(ImageFilter.GaussianBlur(5))
    part.putalpha(ImageChops.multiply(part.getchannel('A'),matte))
    out=Image.new('RGBA',(W,H))
    center=W//2+(-24,0,24)[number]
    out.alpha_composite(part,(center-part.width//2,0))
    return out

def impact(src):
    src=src.crop((6*W,0,7*W,H))
    smaller=src.resize((W//2,H//2),Image.Resampling.LANCZOS)
    out=Image.new('RGBA',(W,H))
    out.alpha_composite(smaller,((W-smaller.width)//2,(H-smaller.height)//2))
    return out

def stages(name,atlas):
    a=[atlas.crop((i*W,0,(i+1)*W,H)) for i in range(N)]
    if name=='dragon-claw':
        return [fade(a[0],.32),impact(atlas),fade(a[7],.08),
                claw(atlas,0),claw(atlas,1),claw(atlas,2),
                a[4],fade(a[7],.70)]
    if name=='x-scissor':
        return [fade(a[0],.55),a[1],fade(a[7],.10),a[2],
                a[3],a[4],fade(a[5],.80),fade(a[7],.65)]
    return [fade(a[0],.52),*a[1:7],fade(a[7],.72)]

def main():
    DST.mkdir(parents=True,exist_ok=True)
    for name in MOVES:
        source=SRC/(name+'.webp')
        if not source.is_file():raise SystemExit('Missing approved art: '+str(source))
        image=Image.open(source).convert('RGBA')
        if image.size!=(W*N,H):raise SystemExit('Invalid approved atlas: '+name)
        frames=stages(name,image)
        if len(frames)!=N:raise SystemExit('Wrong frame count: '+name)
        output=Image.new('RGBA',(W*N,H))
        for i,p in enumerate(frames):
            if p.size!=(W,H) or not p.getbbox():
                raise SystemExit('Blank or wrong frame: '+name+' '+str(i))
            output.alpha_composite(p,(W*i,0))
        target=DST/(name+'.webp')
        output.save(target,'WEBP',quality=94,method=5)
        print('V77',name,'8 actual stages',target.stat().st_size,'bytes')
if __name__=='__main__':main()
