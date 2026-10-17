#!/usr/bin/env python3
"""V142 quality gate for full-size sprite frames, smooth alpha and memory cost."""
import hashlib
from pathlib import Path
from PIL import Image
ROOT=Path("effects/moves/v136-flying-pixel")
EXPECTED={"roost":16,"gust":20,"air-slash":20,"peck":16}
for slug,n in EXPECTED.items():
    path=ROOT/slug/"spritesheet.png"
    assert path.is_file(),f"Missing {slug} generated atlas"
    atlas=Image.open(path).convert("RGBA")
    expected=(2048,256*((n+7)//8))
    assert atlas.size==expected,(slug,atlas.size,expected)
    hashes=set()
    soft=0
    visible=0
    bright=0
    for i in range(n):
        box=(i%8*256,i//8*256,i%8*256+256,i//8*256+256)
        frame=atlas.crop(box)
        hashes.add(hashlib.sha256(frame.tobytes()).hexdigest())
        px=list(frame.getdata())
        soft+=sum(10<p[3]<245 for p in px)
        visible+=sum(p[3]>24 for p in px)
        bright+=sum(p[3]>100 and max(p[:3])>200 for p in px)
        assert any(p[3]>100 for p in px),f"{slug} blank frame {i}"
    assert len(hashes)>=n-2,(slug,"repeated static animations",len(hashes))
    assert soft>n*450,(slug,"hard/pixelated edges",soft)
    assert bright>n*350,(slug,"no illustrated luminous highlights",bright)
    assert visible>n*800,(slug,"sparse placeholder pixels",visible)
    assert path.stat().st_size<3_000_000,(slug,"unreasonable mobile download bytes",path.stat().st_size)
    print(f"PASS V142 {slug}: {n} high-res animated frames; translucent highlights, smooth alpha, {path.stat().st_size//1024} KiB")
print("PASS V142: four 256x256 animated WebGL atlases, not 64px enlarged tiles.")
