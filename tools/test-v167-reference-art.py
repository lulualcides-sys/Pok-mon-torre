#!/usr/bin/env python3
"""V167: verify every generated PNG is loadable and every animated atlas has real frames."""
from pathlib import Path
from PIL import Image
import hashlib
ROOT=Path(__file__).resolve().parents[1]
ARENA=ROOT/"assets"/"arena-v167"
FX=ROOT/"assets"/"battle-v167"
ARENA_FILES=["floor-atlas","back-wall","side-rail","horizon-rail","floor-rune",
             "crystal-a","crystal-b","glow","pillar","arch","rock"]
FX_FILES={"shadow-ball-16.png":16,"psychic-wave-16.png":16,
          "fire-burst-16.png":16,"electric-arc-16.png":16,"impact-12.png":12}
for name in ARENA_FILES:
    path=ARENA/(name+".png")
    assert path.exists(),path
    with Image.open(path) as im:
        im.verify()
    with Image.open(path) as im:
        assert im.mode=="RGBA",(name,im.mode)
        assert im.width>=48 and im.height>=40,(name,im.size)
for name,frames in FX_FILES.items():
    path=FX/name
    with Image.open(path) as image:
        image.verify()
    with Image.open(path) as im:
        assert im.mode=="RGBA"
        assert im.size==(512,((frames+3)//4)*128),(name,im.size)
        counts=[];hashes=[]
        for i in range(frames):
            cell=im.crop(((i%4)*128,(i//4)*128,(i%4+1)*128,(i//4+1)*128))
            counts.append(cell.getchannel("A").getbbox()!=None)
            hashes.append(hashlib.sha256(cell.tobytes()).hexdigest())
        assert sum(counts)>=frames-1,(name,counts)
        assert len(set(hashes))>=min(frames-1,8),(name,len(set(hashes)))
print("V167 ART PASS: "+str(len(ARENA_FILES))+" original room textures and "+str(len(FX_FILES))+" animated atlases")
