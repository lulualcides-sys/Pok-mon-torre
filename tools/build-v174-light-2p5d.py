#!/usr/bin/env python3
"""V174 lightweight fake-2.5D: pre-bake perspective room ONCE in CI, not per battle.
Uses pre-existing user-project pixel materials from V167; no 3D or extra GPU context.
The normal approved native Pokémon, water attacks and Flamethrower stay unchanged.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageEnhance,ImageFilter
import random,math
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'arena-v167'
OUT=ROOT/'assets'/'arena-v174'
OUT.mkdir(parents=True,exist_ok=True)
W,H=960,600
def main():
    required=['floor-atlas.png','back-wall.png','horizon-rail.png','side-rail.png',
              'pillar.png','arch.png']
    for file in required: assert (SRC/file).is_file(), 'Missing V167 material '+file
    atlas=Image.open(SRC/'floor-atlas.png').convert('RGBA')
    wall=Image.open(SRC/'back-wall.png').convert('RGBA')
    rail=Image.open(SRC/'horizon-rail.png').convert('RGBA')
    trim=Image.open(SRC/'side-rail.png').convert('RGBA')
    pillar=Image.open(SRC/'pillar.png').convert('RGBA')
    arch=Image.open(SRC/'arch.png').convert('RGBA')
    im=Image.new('RGBA',(W,H),(8,15,37,255))
    d=ImageDraw.Draw(im,'RGBA')
    for y in range(0,H,2):
        top=min(1,y/H)
        d.rectangle((0,y,W,y+1),fill=(int(10+13*top),int(20+23*top),int(48+26*top),255))
    horizon=191
    # Far wall, recessed doorway and original stone relief.
    wall=wall.resize((W,horizon+11),Image.Resampling.NEAREST)
    im.alpha_composite(wall,(0,0))
    # Ceiling darkens toward near ceiling, but brick pixels remain visible.
    ceiling=Image.new('RGBA',(W,70));dc=ImageDraw.Draw(ceiling,'RGBA')
    for y in range(70):
        dc.line([(0,y),(W,y)],fill=(1,4,13,int(142*(1-y/70))))
    im.alpha_composite(ceiling,(0,0))
    im.alpha_composite(arch.resize((286,166),Image.Resampling.NEAREST),(W//2-143,horizon-151))
    im.alpha_composite(pillar.resize((78,196),Image.Resampling.NEAREST),(54,horizon-176))
    im.alpha_composite(pillar.resize((78,196),Image.Resampling.NEAREST),(W-128,horizon-176))
    # Single offline-perspective floor image: no runtime sprite grids or geometry.
    d=ImageDraw.Draw(im,'RGBA')
    d.rectangle((0,horizon,W,H),fill=(21,32,66,255))
    rng=random.Random(1742026)
    tiles=[atlas.crop((i%4*128,i//4*128,(i%4+1)*128,(i//4+1)*128)) for i in range(16)]
    rows=13
    proj=lambda u:horizon+(H+24-horizon)*(u**1.38)
    for j in range(rows):
        z0=j/rows;z1=(j+1)/rows
        y0=int(proj(z0));y1=int(proj(z1))+1
        a0=.56+.44*z0
        a1=.56+.44*z1
        left0=W/2-a0*W*.54;left1=W/2-a1*W*.54
        n=15
        for k in range(n):
            x0=left0+(k/n)*a0*W*1.08
            x1=left0+((k+1)/n)*a0*W*1.08
            x2=left1+((k+1)/n)*a1*W*1.08
            x3=left1+(k/n)*a1*W*1.08
            xleft=int(min(x0,x3));xright=int(max(x1,x2))
            if xright<=xleft or y1<=y0:continue
            selection=(j*9+k*13+rng.randint(0,5))%16
            tile=tiles[selection].resize((xright-xleft+1,y1-y0+1),Image.Resampling.NEAREST)
            depth=.76+.30*z1
            tile=ImageEnhance.Brightness(tile).enhance(depth)
            mask=Image.new('L',tile.size,0);dm=ImageDraw.Draw(mask)
            points=[(int(x0-xleft),0),(int(x1-xleft),0),
                    (int(x2-xleft),y1-y0),(int(x3-xleft),y1-y0)]
            dm.polygon(points,fill=255)
            im.paste(tile,(xleft,y0),mask)
            d=ImageDraw.Draw(im,'RGBA')
            d.line([(x0,y0),(x3,y1)],fill=(5,14,39,110),width=2)
            d.line([(x1,y0),(x2,y1)],fill=(5,14,39,110),width=2)
        d=ImageDraw.Draw(im,'RGBA')
        d.line([(0,y1),(W,y1)],fill=(5,11,30,180),width=2)
        d.line([(0,y0),(W,y0)],fill=(103,138,193,int(56+z0*40)),width=1)
    # Low cost baked lighting: diffuse pools, small glints; no live GPU shadows.
    lights=Image.new('RGBA',(W,H));gl=ImageDraw.Draw(lights,'RGBA')
    for x,y,rx,ry,color in [
        (180,398,165,90,(30,123,217,55)),(788,404,160,90,(58,129,236,55)),
        (480,335,350,170,(59,91,181,27))]:
        gl.ellipse((x-rx,y-ry,x+rx,y+ry),fill=color)
    lights=lights.filter(ImageFilter.GaussianBlur(33))
    im.alpha_composite(lights)
    # Backlit parapet, blue edge light and bevel to suggest physical height.
    im.alpha_composite(rail.resize((W,31),Image.Resampling.NEAREST),(0,horizon-16))
    edgeL=trim.resize((30,H-horizon),Image.Resampling.NEAREST)
    im.alpha_composite(edgeL,(0,horizon+1))
    edgeR=edgeL.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    im.alpha_composite(edgeR,(W-30,horizon+1))
    d=ImageDraw.Draw(im,'RGBA')
    for edge in [23,W-23]:
        d.line((edge,horizon+8,edge,H),fill=(53,167,231,118),width=2)
    # Distant pillars and foliage stay OUTSIDE combat center.
    d.rectangle((0,H-14,W,H),fill=(7,15,41,255))
    d.line([(0,H-14),(W,H-14)],fill=(76,182,230,190),width=2)
    # Preserve crisp sprite pixel edges.
    stage=im.convert('RGB')
    path=OUT/'arena-light-2p5d.png'
    stage.save(path,optimize=True)
    assert path.stat().st_size>20000
    print('V174 static perspective arena',path,path.stat().st_size,'bytes',stage.size)
if __name__=='__main__': main()
