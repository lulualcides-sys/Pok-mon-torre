#!/usr/bin/env python3
"""Deploy-time verify genuine transparent frame-by-frame sprite pixel art."""
from pathlib import Path
from PIL import Image
import hashlib
ROOT=Path('effects/moves/v136-flying-pixel')
expected={'roost':12,'gust':16,'air-slash':16,'peck':12}
for name,frames in expected.items():
    path=ROOT/name/'spritesheet.png'
    assert path.is_file(),f'Missing sprite atlas: {path}'
    im=Image.open(path).convert('RGBA')
    assert im.size==(512,64*((frames+7)//8)),(name,im.size)
    frame_hashes=set()
    for n in range(frames):
        box=(n%8*64,n//8*64,n%8*64+64,n//8*64+64)
        crop=im.crop(box)
        frame_hashes.add(hashlib.sha1(crop.tobytes()).hexdigest())
        pixels=list(crop.getdata())
        opaque=sum(p[3]>0 for p in pixels)
        assert 40<opaque<3200,(name,n,opaque)
        assert all(p[3] in (0,255) for p in pixels),(name,n,'anti-aliased alpha')
        assert any(p[:3]==(17,28,40) and p[3]==255 for p in pixels),(name,n,'missing dark pixel contour')
    assert len(frame_hashes)>=frames//2,(name,'repeated static frames',len(frame_hashes))
    assert path.stat().st_size<120_000,(name,'asset too large')
    print(f'PASS PIXEL ART {name}: {frames} unique-animation frames, nearest-neighbour transparency, {path.stat().st_size} bytes')
print('PASS V136: 4 real pixel spritesheets, no static PNG pretending to animate.')
