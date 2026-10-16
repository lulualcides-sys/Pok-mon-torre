#!/usr/bin/env python3
"""V114 preview ONLY: a low puddle of corrosive mud below the target.
Compose authentic Gunk Shot pixels from the user-supplied V113 sprite crops.
No ImageDraw, SVG, Canvas geometry, CSS FX, or edits to approved sprites.
"""
from pathlib import Path
from PIL import Image
from hashlib import sha256
import json,math
ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'effects/moves/v114-poison'
SRC=ROOT/'effects/moves/v113-poison-preview/source/poison-original-crops.webp'
EXPECTED='041f779f700d71a475de78aa1b92342a040ff4e52d62314835bc0d67d836c964'
assert SRC.is_file() and sha256(SRC.read_bytes()).hexdigest()==EXPECTED, 'Approved original Poison gallery missing/corrupt'
src=Image.open(SRC).convert('RGBA')
assert src.size==(688,272)
W=128
tiles=[]
for col in range(8):
    im=src.crop((col*86,3*68,(col+1)*86,4*68))
    bbox=im.getchannel('A').getbbox()
    assert bbox, ('empty original Gunk Shot frame',col)
    tiles.append(im.crop(bbox))
def stamp(dst,img,x,y,w,h,opacity=1):
    art=img.resize((max(1,round(w)),max(1,round(h))),Image.Resampling.NEAREST)
    if opacity<1: art.putalpha(art.getchannel('A').point(lambda a:round(a*opacity)))
    sheet=Image.new('RGBA',(W,W))
    sheet.paste(art,(round(x-art.width/2),round(y-art.height/2)),art)
    dst.alpha_composite(sheet)
def frame(i):
    p=i/15
    grow=min(1,(i+1)/8)
    tail=max(.12,min(1,(16-i)/3))
    out=Image.new('RGBA',(W,W))
    phase=(i%8)
    # Wide and shallow: an animated puddle, NOT a travelling purple projectile.
    width=round(26+80*grow)
    height=round(7+13*grow)
    stamp(out,tiles[phase],64,76,width,height,tail)
    if i>=3:
        stamp(out,tiles[(phase+3)%8],48,74,round(width*.42),round(height*.77),tail*.80)
        stamp(out,tiles[(phase+6)%8],83,77,round(width*.43),round(height*.73),tail*.85)
    if i>=7 and i<=13:
        # Real small sludge sprites produce tiny surface bubbling, still on the floor.
        stamp(out,tiles[(phase+2)%8],61+(i%3-1)*8,67,round(9+2*math.sin(i)),round(6+(i%2)),.55)
    return out
atlas=Image.new('RGBA',(W*16,W))
distinct=set();visible=[]
for i in range(16):
    shot=frame(i)
    atlas.alpha_composite(shot,(W*i,0))
    distinct.add(sha256(shot.tobytes()).hexdigest())
    visible.append(shot.getchannel('A').getbbox() is not None)
assert len(distinct)>=14 and sum(visible)==16
dest=BASE/'lamacorrosiva/sprites';dest.mkdir(parents=True,exist_ok=True)
asset=dest/'lamacorrosiva.webp'
atlas.save(asset,'WEBP',lossless=True,exact=True,method=4)
assert Image.open(asset).size==(2048,128)
manifest={'version':'114.0-preview','move':'Lama Corrosiva','frames':16,
  'unique':len(distinct),'source_sha256':EXPECTED,'orientation':'flat-ground-puddle',
  'asset_sha256':sha256(asset.read_bytes()).hexdigest(),
  'other_moves':'V113 artwork unchanged, scale reduced only in V114 runtime'}
(BASE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('PASS V114 authentic floor sludge',len(distinct),'unique frames, 2048x128, separate asset')
