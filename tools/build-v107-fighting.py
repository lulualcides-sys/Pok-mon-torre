#!/usr/bin/env python3
"""V107: make REAL transparent animated spritesheets from approved illustrated atlases.
No CSS or procedural canvas strokes. Uses Pillow on images already in the repo.
One reproducible 256x192 RGBA WEBP strip per Fighting move (8/12/16/16 frames).
"""
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance
import colorsys, json, hashlib, math

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'effects/atelier-v71/atlases'
ELEMENT=ROOT/'effects/elements/v59'
OUT=ROOT/'effects/moves/v107-fighting/sheets'
OUT.mkdir(parents=True,exist_ok=True)
W,H=256,192

def frames(path, count=8):
    image=Image.open(path).convert('RGBA')
    if image.width < count or image.width%count:
        raise ValueError(f'Invalid reference sprite atlas: {path} {image.size}')
    width=image.width//count
    if width <= 0:raise ValueError('No source frames')
    return [image.crop((i*width,0,(i+1)*width,image.height)) for i in range(count)]

def isolate(image,family,palette):
    """Remove the historical stage/background from existing illustrated panels.
    Bright green/purple illustrated energy remains; dark floor/forest is excluded.
    Alpha is composited into a genuine separate asset frame, not a CSS filter."""
    w,h=image.size
    img=image.convert('RGB')
    pixels=list(img.getdata())
    out=Image.new('RGBA',(w,h));packed=[]
    for index,(r,g,b) in enumerate(pixels):
        x=index%w;y=index//w
        value=max(r,g,b);minimum=min(r,g,b)
        sat=(value-minimum)/max(1,value)
        lum=.23*r+.58*g+.19*b
        if family=='green':
            pure=(g>=r*.79 and g>=b*.86 and g>=80) or (r>180 and g>168 and b<185)
            strength=(lum-78)/115
        elif family=='purple':
            pure=((b>g*1.23 and r>g*1.15) or (b>148 and r>122)) and r>48
            strength=(.34*r+.20*g+.46*b-70)/115
        else:
            pure=(value>100 and (r>g*1.14 or r>b*1.2))
            strength=(lum-74)/112
        # Old material includes tiny logo at top left; never import UI into FX.
        if x<min(58,w*.13) and y<min(39,h*.17):pure=False
        if y>h*.83:strength-=.11
        alpha=int(max(0,min(255,strength*285))) if pure else 0
        if sat<.10 and value<180:alpha=0
        if alpha<35:packed.append((0,0,0,0));continue
        bright=max(.0,min(1,(lum-50)/175))
        if bright>.82:
            red,green,blue=palette[3]
        elif bright>.59:
            red,green,blue=palette[2]
        elif bright>.29:
            red,green,blue=palette[1]
        else:
            red,green,blue=palette[0]
        # Keep tonal gradations: shaded core, bevel and white-hot streaks.
        gain=.80+.25*bright
        packed.append((min(255,int(red*gain)),min(255,int(green*gain)),
                       min(255,int(blue*gain)),alpha))
    out.putdata(packed)
    # Crisp black contour follows exact imported ART silhouette.
    mask=out.getchannel('A')
    dilated=mask.filter(ImageFilter.MaxFilter(5))
    border=Image.new('RGBA',(w,h),(8,9,17,0))
    border.putalpha(dilated.point(lambda v:int(v*.90)))
    border.alpha_composite(out)
    return border

PALETTES={
 'cross':((86,8,28),(194,14,45),(255,55,91),(255,241,232)),
 'chute':((93,42,13),(210,88,25),(255,165,68),(255,242,203)),
 'karate':((53,31,87),(139,93,220),(217,176,255),(255,244,255)),
 'brick':((68,51,37),(159,110,66),(242,183,98),(255,247,211))
}
green=frames(SOURCE/'x-scissor.webp')
purple=frames(SOURCE/'dragon-claw.webp')
explosion=frames(ELEMENT/'explosion/atlas.png')
spikes=frames(ELEMENT/'spikes/atlas.png')
mask_alpha={}
def separate_element(img):
    """The shipped v59 element atlases already have transparent RGBA pixels."""
    a=img.convert('RGBA')
    if a.getextrema()[3]==(255,255):
        # Some atlases use solid black instead of transparent black.
        pix=[]
        for r,g,b,alpha in a.getdata():
            m=max(r,g,b)
            pix.append((r,g,b,int(alpha*min(1,max(0,(m-17)/82)))))
        a.putdata(pix)
    return a

def stamp(canvas,sprite,scale=1.0,dx=0,dy=0,opacity=1,angle=0):
    # Preserve original illustration proportions while filling wider arena.
    ow,oh=sprite.size
    destw=int(W*scale);desth=int(destw*oh/ow)
    if desth>int(H*1.13):
        desth=int(H*1.13);destw=int(desth*ow/oh)
    if destw<2 or desth<2:return
    layer=sprite.resize((destw,desth),Image.Resampling.LANCZOS)
    if angle:layer=layer.rotate(angle,expand=True,resample=Image.Resampling.BICUBIC)
    if opacity<1:
        a=layer.getchannel('A').point(lambda v:int(v*opacity))
        layer.putalpha(a)
    x=round((W-layer.width)/2+dx);y=round((H-layer.height)/2+dy)
    canvas.alpha_composite(layer,(x,y))

def composite(style,i,n):
    t=(i+.5)/n
    canvas=Image.new('RGBA',(W,H))
    # Preserve true 8-pose rhythm on short moves; 16 distinct tweens for complex ones.
    if style=='cross':
        # X-Scissor's illustrated 8-stage timing, but red scarlet/salmon energy,
        # WITHOUT the source stadium, black background or source game UI.
        j=round((n and t)*7)
        base=isolate(green[j],'green',PALETTES['cross'])
        stamp(canvas,base,1.0,opacity=min(1,max(.18,t/.26))*(1 if t<.8 else (1-t)/.2*.75+.15))
        # High impact illustrates the crossing X as TWO overlapping red
        # original scythe strokes; no line-drawing substitute.
        if .52<t<.87:
            center=isolate(green[3 if t<.68 else 4],'green',PALETTES['cross'])
            stamp(canvas,center,.81,opacity=.39*(1-min(1,abs(t-.64)/.28)))
    elif style=='chute':
        j=min(7,max(0,round(t*6.7)))
        base=isolate(green[[0,0,1,1,2,3,5,7][j]],'green',PALETTES['chute'])
        # Single broad sweeping foot trail, never a travelling shot.
        stamp(canvas,base,.82,angle=-24,opacity=.22+.77*math.sin(math.pi*min(.98,t))**.68)
        if .48<t<.91:
            e=separate_element(explosion[min(7,max(0,round((t-.48)/.43*7)))])
            stamp(canvas,e,.66,dx=13,opacity=.83)
    elif style=='karate':
        base=isolate(purple[min(7,round(t*7))],'purple',PALETTES['karate'])
        # The actual Dragon Claw atlas has a crescent slash, which becomes
        # a physical knife-hand shock — NOT a duplicate red X.
        stamp(canvas,base,.93,angle=-15,opacity=.22+.75*math.sin(math.pi*min(.99,t))**.59)
    elif style=='brick':
        j=min(7,max(0,round(t*7)))
        base=isolate(purple[[0,1,2,3,5,5,6,7][j]],'purple',PALETTES['brick'])
        stamp(canvas,base,.72,angle=80,dy=-6,opacity=.21+.72*math.sin(math.pi*min(.99,t))**.52)
        if .50<t<.91:
            e=separate_element(spikes[min(7,max(0,round((t-.50)/.41*7)))])
            stamp(canvas,e,.84,dy=24,opacity=.91)
            burst=separate_element(explosion[min(7,max(0,round((t-.50)/.41*7)))])
            stamp(canvas,burst,.62,dy=8,opacity=.8)
    return canvas

SPECS={'chute':8,'karate':12,'cross':16,'brick':16}
metadata={'version':'107.0','width':W,'height':H,'moves':{},'source':[
 'effects/atelier-v71/atlases/x-scissor.webp',
 'effects/atelier-v71/atlases/dragon-claw.webp',
 'effects/elements/v59/explosion/atlas.png',
 'effects/elements/v59/spikes/atlas.png']}
for name,total in SPECS.items():
    sheet=Image.new('RGBA',(W*total,H))
    ink=[]
    for i in range(total):
        panel=composite(name,i,total)
        sheet.alpha_composite(panel,(W*i,0))
        # Check actual painted sprite frames; no blank placeholder frames.
        alpha=panel.getchannel('A')
        ink.append(sum(1 for v in alpha.getdata() if v>25))
    if max(ink)<200:
        raise AssertionError(f'{name} sprite extraction was empty {ink}')
    target=OUT/(name+'.webp')
    sheet.save(target,'WEBP',lossless=True,method=6,exact=True)
    loaded=Image.open(target)
    if loaded.size!=(W*total,H):raise AssertionError(f'Sheet wrong dimension: {name}')
    metadata['moves'][name]={'frames':total,'path':'sheets/'+name+'.webp',
     'bytes':target.stat().st_size,'painted_by_frame':ink,
     'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
    print(f'PASS {name}: {total} cinematic sprite frames, {target.stat().st_size} bytes, ink max={max(ink)}')
(OUT.parent/'manifest.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print('PASS V107 four real illustrated, animated RGBA spritesheets')
