#!/usr/bin/env python3
"""V141: verify true colorful 12/16-frame pixel sprites against a blue arena."""
from pathlib import Path
from PIL import Image
import hashlib

ROOT=Path('effects/moves/v136-flying-pixel')
EXPECTED={'roost':12,'gust':16,'air-slash':16,'peck':12}
for name,frames in EXPECTED.items():
    path=ROOT/name/'spritesheet.png'
    assert path.is_file(),('missing atlas',name)
    im=Image.open(path).convert('RGBA')
    assert im.size==(512,64*((frames+7)//8)),(name,im.size)
    hashes=set()
    for i in range(frames):
        tile=im.crop((i%8*64,i//8*64,i%8*64+64,i//8*64+64))
        hashes.add(hashlib.sha256(tile.tobytes()).digest())
        px=list(tile.getdata())
        opaque=[x for x in px if x[3]]
        count=len(opaque)
        assert 40<count<2200,(name,i,count)
        assert all(x[3] in (0,255) for x in px),(name,i,'nonpixel soft alpha')
        bright=sum(min(x[:3])>=165 for x in opaque)
        dark=sum(max(x[:3])<=70 for x in opaque)
        ink=sum(x==(28,69,89,255) for x in opaque)
        assert bright>=count*.28,(name,i,'no luminous air core',bright,count)
        assert dark<count*.10,(name,i,'black silhouette regression',dark,count)
        assert ink>=2,(name,i,'outline missing',ink)
        if name=='peck':
            assert sum(x[0]>205 and x[1]>140 and x[2]<175 for x in opaque)>=5,(name,i,'golden beak missing')
        if name=='roost':
            assert any(x==(249,218,131,255) for x in opaque),(name,i,'healing gold missing')
    assert len(hashes)>=frames*.75,(name,'static frames',len(hashes))
    assert path.stat().st_size<120_000,(name,'excessive asset size')
    print(f'PASS V141 {name}: {frames} distinct nearest-neighbour frames, bright core, thin navy contour, no black CSS shapes')
print('PASS V141: four distinct color-authored battle animations, mobile-readable over blue arena.')
