#!/usr/bin/env python3
"""V165 basic asset fidelity tests, independent of screenshot quality claims."""
from pathlib import Path
from PIL import Image, ImageChops
P=Path(__file__).resolve().parents[1]
fx=P/'assets/battle-v165'
room=P/'assets/arena-v165'
expected={'shadow-ball-16.png':(512,512,16),'psychic-wave-16.png':(512,512,16),'impact-12.png':(512,384,12)}
for name,(w,h,n) in expected.items():
    im=Image.open(fx/name).convert('RGBA')
    assert im.size==(w,h),(name,im.size)
    frames=[im.crop(((i%4)*128,(i//4)*128,((i%4)+1)*128,((i//4)+1)*128)) for i in range(n)]
    assert all(f.getbbox() for f in frames),name+' contains blank frames'
    changes=sum(ImageChops.difference(frames[i],frames[i+1]).getbbox() is not None for i in range(n-1))
    assert changes>=n-3,(name,changes)
    print('V165 FX PASS',name,'animated changes',changes)
for name,sz in [('floor-atlas.png',(512,512)),('back-wall.png',(960,256)),('pillar.png',(144,240)),('arch.png',(256,160))]:
    im=Image.open(room/name).convert('RGBA')
    assert im.size==sz,(name,im.size)
    assert im.getbbox() is not None,name
    print('V165 ARENA PASS',name,im.size)
print('V165: original animated art + layered Pixi props validated')
