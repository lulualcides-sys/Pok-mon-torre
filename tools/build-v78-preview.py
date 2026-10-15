#!/usr/bin/env python3
"""V78 — cinematic, separated action stages for ONLY Dragon Pulse and Aura Sphere.

Author the eight transparent frames using isolated, hand-painted regions of
the approved V72 raster art. NO Canvas/CSS vector VFX; no animation-video strip.
Approved Dragon Claw and X-Scissor V77 are not touched.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'effects/moves/v72-battle/sprites'
DST=ROOT/'effects/moves/v78-preview/sprites'
W,H=480,240
MOVES=('dragon-pulse','aura-sphere')

def fresh():return Image.new('RGBA',(W,H))
def alpha(im,n):
    p=im.copy()
    p.putalpha(p.getchannel('A').point(lambda a:round(a*n)))
    return p
def crop_art(frame,box,ellipse=None,blur=11):
    art=frame.crop(box).convert('RGBA')
    mask=Image.new('L',art.size,0)
    d=ImageDraw.Draw(mask)
    if ellipse is None:d.rectangle((3,3,art.width-4,art.height-4),fill=255)
    else:d.ellipse(ellipse,fill=255)
    mask=mask.filter(ImageFilter.GaussianBlur(blur))
    art.putalpha(ImageChops.multiply(art.getchannel('A'),mask))
    return art
def center_paste(dst,im,x,y,width=None,height=None,opacity=1):
    if width is not None:
        size=(max(2,int(width)),max(2,int(height or im.height*width/im.width)))
        im=im.resize(size,Image.Resampling.LANCZOS)
    if opacity!=1:im=alpha(im,opacity)
    dst.alpha_composite(im,(int(x-im.width/2),int(y-im.height/2)))
    return dst
def orb(frame):
    # Source frames were approved by the user. Keep original painterly detail
    # but isolate the central luminous core to move it physically in the arena.
    return crop_art(frame,(81,0,402,240),ellipse=(28,0,299,238),blur=13)
def orb_stage(source,x,diameter,energy=1):
    frame=fresh();center_paste(frame,source,x,H*.49,diameter,diameter*.79,energy)
    return frame
def explosion(frame,box,target_x,diameter,fade=1):
    crop=crop_art(frame,box,ellipse=(0,0,box[2]-box[0],box[3]-box[1]),blur=9)
    result=fresh()
    center_paste(result,crop,target_x,H*.50,diameter,diameter*.78,fade)
    return result
def dragon_pulse(frames):
    charge=orb(frames[0])
    charge2=orb(frames[1])
    def segment(stage,how_far):
        # Two-dimensional projectile reveal: NO fully formed beam before cast.
        src=frames[2] if stage==0 else frames[3] if stage==1 else frames[4]
        visible=min(W-12,how_far)
        stripe=src.copy()
        fade_mask=Image.new('L',(W,H),0)
        d=ImageDraw.Draw(fade_mask)
        d.rectangle((72,23,visible,211),fill=255)
        fade_mask=fade_mask.filter(ImageFilter.GaussianBlur(7))
        stripe.putalpha(ImageChops.multiply(stripe.getchannel('A'),fade_mask))
        out=fresh();out.alpha_composite(stripe)
        center_paste(out,charge2,91,116,98,89,.62 if stage else 1)
        return out
    out=[
      orb_stage(charge,88,107,.55),                         # 01 anticipation
      orb_stage(charge2,88,141,1),                         # 02 charge grows
      segment(0,204),                                    # 03 first beam leaves
      segment(1,336),                                    # 04 beam advances
      segment(2,476),                                    # 05 reaches enemy
      explosion(frames[5],(220,8,470,233),387,205,1),    # 06 IMPACT ONLY
      explosion(frames[6],(70,0,417,240),388,215,.92),    # 07 distinct bloom
      explosion(frames[7],(70,0,417,240),394,165,.60),    # 08 echo dissipates
    ]
    return out
def aura_sphere(frames):
    ball=orb(frames[0]);charging=orb(frames[1])
    trail=crop_art(frames[3],(0,40,315,190),ellipse=(0,0,310,148),blur=12)
    def flying(x,diameter,trail_x=None,trail_opacity=.34):
        out=fresh()
        if trail_x is not None:
            center_paste(out,trail,trail_x,H*.49,195,80,trail_opacity)
        center_paste(out,charging,x,H*.49,diameter,diameter*.82,1)
        return out
    return [
      orb_stage(ball,86,90,.65),                            # 01 small charging orb
      orb_stage(charging,88,126,1),                         # 02 gathers energy
      orb_stage(charging,88,143,1),                         # 03 solid orb held
      flying(184,116,117,.30),                              # 04 launched
      flying(330,116,236,.37),                              # 05 travels alone
      explosion(frames[5],(165,9,466,236),399,159,1),      # 06 impact separate
      explosion(frames[6],(72,0,430,240),396,206,1),       # 07 blue explosion
      explosion(frames[7],(65,0,430,240),394,169,.65),     # 08 dissipates
    ]
def validate(frames,name):
    assert len(frames)==8
    for i,frame in enumerate(frames):
        assert frame.size==(W,H) and frame.getchannel('A').getbbox(),(name,i)
    if name=='aura-sphere':
        # World-facing white-blue nucleus now MOVES; not an 8-cell movie strip.
        def centroid(im):
            a=im.getchannel('A').resize((48,24))
            values=list(a.getdata())
            total=sum(values)
            return sum((i%48)*v for i,v in enumerate(values))/max(1,total)*10
        centers=[centroid(frames[i]) for i in (2,3,4)]
        assert centers[0]+38<centers[1] and centers[1]+50<centers[2],centers
def main():
    DST.mkdir(parents=True,exist_ok=True)
    for name in MOVES:
        original=Image.open(SRC/(name+'.webp')).convert('RGBA')
        if original.size!=(W*8,H):raise SystemExit('Approved source missing/corrupt: '+name)
        source=[original.crop((i*W,0,(i+1)*W,H)) for i in range(8)]
        frames=dragon_pulse(source) if name=='dragon-pulse' else aura_sphere(source)
        validate(frames,name)
        atlas=Image.new('RGBA',(8*W,H))
        for i,frame in enumerate(frames):atlas.alpha_composite(frame,(i*W,0))
        target=DST/(name+'.webp')
        atlas.save(target,'WEBP',quality=94,method=6)
        print('V78',name,'8 distinct actions',target.stat().st_size,'bytes')
if __name__=='__main__':main()
