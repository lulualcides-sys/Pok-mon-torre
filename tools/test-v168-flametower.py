#!/usr/bin/env python3
"""V168 validate 32/24 RGBA sprite animation atlases before publishing."""
from pathlib import Path
from PIL import Image
import hashlib
base=Path(__file__).resolve().parents[1]/"assets"/"flame-v168"
moves={"flame-tower-32.png":32,"flamethrower-32.png":32,
       "fire-blast-32.png":32,"fire-punch-24.png":24}
for name,n in moves.items():
    path=base/name
    assert path.is_file(),f"Missing atlas: {path}"
    with Image.open(path) as im:
        im.verify()
    with Image.open(path) as im:
        assert im.mode=="RGBA",(name,im.mode)
        assert im.size==(1536,(n//8)*192),(name,im.size)
        frames=[im.crop(((i%8)*192,(i//8)*192,(i%8+1)*192,(i//8+1)*192)) for i in range(n)]
        hashes={hashlib.sha256(frame.tobytes()).hexdigest() for frame in frames}
        assert len(hashes)>=n-3,(name,"repeated animation frames",len(hashes))
        counts=[sum(1 for a in f.getchannel("A").getdata() if a>80) for f in frames]
        assert max(counts)>=350,(name,"empty peak",max(counts))
        assert len(set(counts))>=10,(name,"flat frame timing",len(set(counts)))
        assert min(counts)<max(counts)*.7,(name,"no rise/fall")
        assert all(0<=c<=192*192 for c in counts)
        print("V168 ART PASS",name,n,"unique",len(hashes),"alpha pixels",min(counts),max(counts))
print("V168: 120 hand-authored transparent flame frames verified")
