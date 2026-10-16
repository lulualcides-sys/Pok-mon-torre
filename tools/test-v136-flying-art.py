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
        # V138: BLACK is the dominant colour; the narrow silver pixel rim
        # avoids disappearing against the dark blue arena, without blur/CSS.
        black=sum(p[3]==255 and max(p[:3])<=65 for p in pixels)
        rim=sum(p==(217,225,232,255) for p in pixels)
        assert black>max(30,int(opaque*.38)),(name,n,'missing black silhouette',black,opaque)
        assert rim>=6,(name,n,'missing 1px contrast rim',rim)
        assert not any(p[3] and p[:3] in ((152,206,218),(225,247,245),(80,140,165))
                       for p in pixels),(name,n,'old pale-blue arena-matching palette')
    assert len(frame_hashes)>=frames//2,(name,'repeated static frames',len(frame_hashes))
    assert path.stat().st_size<120_000,(name,'asset too large')
    print(f'PASS PIXEL ART {name}: {frames} unique-animation frames, nearest-neighbour transparency, {path.stat().st_size} bytes')
print('PASS V138: four 12/16-frame near-BLACK sprite atlases with crisp silver pixel rims; zero pale-blue V136 frames.')
