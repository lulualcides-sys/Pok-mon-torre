#!/usr/bin/env python3
"""V82 opt-in battle preview. Four genuinely different staged grass animations.
Uses the project's already-authored vine/leaf SVG sprites as SOURCE art,
rasterized offline to 8-frame transparent WebP atlases, played by PixiJS.
Never changes any original approved sprites, gameplay, or catalog.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from io import BytesIO
import cairosvg, math, random
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'effects/moves/chicote-de-vinha/assets'
OUT=ROOT/'effects/moves/v82-preview/sprites'
W,H,S=480,240,2
SZ=(W*S,H*S)
TAU=math.tau
NAMES=['chicote-de-vinha','folha-navalha','chicotes-em-area','vine-whip']
def px(x):return int(x*S)
def col(r,g,b,a=255):return (r,g,b,int(max(0,min(255,a))))
def img():return Image.new('RGBA',SZ,(0,0,0,0))
def source_svg(p,width,height):
    data=cairosvg.svg2png(url=str(p),output_width=px(width),output_height=px(height))
    return Image.open(BytesIO(data)).convert('RGBA')
LEAF=source_svg(ART/'vine-leaf.svg',60,48)
HIT=source_svg(ART/'vine-impact.svg',122,105)
VINES=[source_svg(ART/f'frames/vine-{i}.svg',355,120) for i in range(7)]
def composite(dst,src,x,y,alpha=1):
    if alpha<=0:return
    part=src
    if alpha<1:
        part=src.copy()
        part.putalpha(part.getchannel('A').point(lambda v:round(v*alpha)))
    dst.alpha_composite(part,(px(x),px(y)))
def scale(src,w,h):
    return src.resize((px(w),px(h)),Image.Resampling.LANCZOS)
def rotated(src,degrees,w,h):
    return src.rotate(degrees,Image.Resampling.BICUBIC,expand=True)
def sparkle(canvas,x,y,r,a=1,tint=(205,255,143),seed=0):
    rnd=random.Random(seed)
    d=ImageDraw.Draw(canvas,'RGBA')
    c=col(*tint,215*a)
    lines=[(-r,0,r,0),(0,-r*.6,0,r*.6)]
    for x1,y1,x2,y2 in lines:
        d.line((px(x+x1),px(y+y1),px(x+x2),px(y+y2)),fill=col(8,33,23,230*a),width=px(3))
        d.line((px(x+x1),px(y+y1),px(x+x2),px(y+y2)),fill=c,width=px(1.25))
    d.ellipse((px(x-1.7),px(y-1.7),px(x+1.7),px(y+1.7)),fill=col(242,255,214,240*a))
def leaves(canvas,cx,cy,n,seed,spread=38,visibility=1,green=True):
    rng=random.Random(seed)
    for i in range(n):
        angle=rng.random()*TAU
        r=spread*(.4+1.05*rng.random())
        x=cx+math.cos(angle)*r
        y=cy+math.sin(angle)*r*.68
        leaf=LEAF.resize((px(8+12*rng.random()),px(7+10*rng.random())),Image.Resampling.LANCZOS)
        leaf=rotated(leaf,angle*180/math.pi+85,0,0)
        composite(canvas,leaf,x-leaf.width/S/2,y-leaf.height/S/2,visibility)
        if i%4==0:sparkle(canvas,x,y,2.4,visibility,seed=i+seed)
def burst(canvas,x=412,y=121,power=.9,seed=5):
    if power<=0:return
    base=img();d=ImageDraw.Draw(base,'RGBA')
    rng=random.Random(seed)
    for i in range(23):
        a=(i/23)*TAU+rng.random()*.19
        reach=power*(17+30*rng.random())
        end=(x+math.cos(a)*reach,y+math.sin(a)*reach*.8)
        d.line((px(x),px(y),px(end[0]),px(end[1])),
               fill=col(11,36,23,210*power),width=px(5))
        d.line((px(x),px(y),px(end[0]),px(end[1])),
               fill=col(168,255,104,225*power),width=px(1.8))
    composite(canvas,base,0,0)
    composite(canvas,scale(HIT,84+33*power,80+25*power),x-45,y-53,power*.90)
    leaves(canvas,x,y,10,seed,45*power,power)
    sparkle(canvas,x,y,14*power,power,seed=seed)
def vine(canvas,frame,length=1,y=60,opacity=1,flip=False,tilt=0,width=356):
    strip=scale(VINES[frame%7],width,120)
    if flip:strip=strip.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    # Individual organic frame's tip moves toward the target; mask the SOURCE
    # vine progressively instead of stretching a static green vector bolt.
    q=max(0,min(1,length));mask=Image.new('L',strip.size,0)
    dm=ImageDraw.Draw(mask)
    lim=max(1,int(strip.width*q));dm.rectangle((0,0,lim,strip.height),fill=255)
    edge=Image.new('L',strip.size,0);ed=ImageDraw.Draw(edge)
    ed.rectangle((max(0,lim-px(14)),0,lim,strip.height),fill=255)
    soft=edge.filter(ImageFilter.GaussianBlur(px(5)))
    mask=ImageChops.subtract(mask,ImageChops.multiply(soft,Image.new('L',strip.size,150)))
    strip.putalpha(ImageChops.multiply(strip.getchannel('A'),mask))
    if tilt:strip=strip.rotate(tilt,Image.Resampling.BICUBIC,expand=False)
    composite(canvas,strip,63,y,opacity)
    if length<.98 and length>.2:
        tip=63+width*length
        sparkle(canvas,tip,119+(y-60)*.3,5.2,opacity,seed=frame*17)
def charge(canvas,t,seed=5):
    leaves(canvas,80,118,max(3,int(6*t)),seed,25*t,.85)
    for j in range(3):
        a=j*2.1+t*4.4
        sparkle(canvas,80+math.cos(a)*18*t,118+math.sin(a)*17*t,3.0,.6,seed*10+j)
def whip_one(i):
    im=img();charge(im,min(1,(i+1)/3),3)
    grow=[0,.18,.37,.66,.93,1,.78,.32][i]
    if i>0:vine(im,i-1,grow,62,1 if i<7 else .44)
    if i>=4:burst(im,power=[.24,.93,.58,.22][i-4],seed=71)
    if i==7:leaves(im,396,116,6,72,23,.22)
    return im
def leaf_blade(canvas,x,y,w,h,angle,opacity=.99):
    asset=scale(LEAF,w,h)
    asset=asset.rotate(angle,Image.Resampling.BICUBIC,expand=True)
    composite(canvas,asset,x-asset.width/(2*S),y-asset.height/(2*S),opacity)
def navalha(i):
    im=img();rng=random.Random(91)
    charge(im,min(1,(i+1)/3),23)
    # Curved paths fly in two distinct volleys; dark outlined approved leaf art.
    groups=[[.22,.39,.57,.76,.91,.97,.71,.27][i],
            [0,0,.14,.32,.61,.91,.70,.28][i]]
    for group,u in enumerate(groups):
        if u<=0:continue
        for n in range(4):
            v=max(.02,min(1,u-(n*.082)))
            x=78+320*v
            y=121+(n-1.5)*16+math.sin(v*5+n+group)*8+group*8
            if v>.04:
                points=[(x-50,y-5),(x-22,y-3),(x-9,y)]
                d=ImageDraw.Draw(im,'RGBA')
                d.line([tuple(px(z) for z in pt) for pt in points],
                    fill=col(14,39,23,145),width=px(4))
                d.line([tuple(px(z) for z in pt) for pt in points],
                    fill=col(144,246,101,150),width=px(1.5))
            leaf_blade(im,x,y,32 if group==0 else 29,21,n*13+(18 if group else -18),.98)
    if i>=5:burst(im,404,120,[.67,.92,.20][i-5],82)
    return im
def whip_area(i):
    im=img();charge(im,min(1,(i+1)/3),39)
    order=[i*.12,max(0,(i-1)*.16),max(0,(i-2)*.19)]
    for j,q in enumerate(order):
        if i>=7:q*=.35
        if q<=.02:continue
        # These are THREE independent whips, aimed at different enemy zones.
        vine(im,(i+j)%7,min(1,q),y=29+j*31,
             opacity=.95 if i<7 else .32,flip=j==2,tilt=[-13,0,13][j],width=358)
    if i>=4:
        for j in range(3):
            power=max(0,min(1,(i-4-j*.60)/1.7))
            if i==7:power=.12
            burst(im,390+(j%2)*13,86+j*32,power*.70,91+j*11)
    return im
def vine_whip(i):
    im=img();charge(im,min(1,(i+1)/3),53)
    # One whip lashes first, retracts, then the second one strikes lower.
    upper=[0,.27,.61,1,.65,.32,.06,0][i]
    lower=[0,0,0,.18,.42,.78,1,.20][i]
    if upper>0:vine(im,i,upper,y=40,opacity=.94 if i<6 else .30,tilt=-5)
    if lower>0:vine(im,i+3,lower,y=84,opacity=.99,flip=True,tilt=7)
    if i==3:burst(im,410,107,.86,101)
    if i==6:burst(im,405,141,.91,120)
    if i==7:leaves(im,411,140,7,127,30,.34)
    return im
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    fns=[whip_one,navalha,whip_area,vine_whip]
    for name,render in zip(NAMES,fns):
        result=Image.new('RGBA',(W*8,H))
        signatures=[]
        for index in range(8):
            layer=render(index)
            if layer.getchannel('A').getbbox() is None:
                raise RuntimeError('Blank frame '+name+' '+str(index))
            small=layer.resize((W,H),Image.Resampling.LANCZOS)
            signatures.append(small.tobytes())
            result.alpha_composite(small,(index*W,0))
        assert len(set(signatures))==8,name+' repeated frames'
        filename=OUT/(name+'.webp')
        result.save(filename,'WEBP',quality=95,method=5)
        print('V82',name,'8 unique real raster stages',filename.stat().st_size,'bytes')
if __name__=='__main__':main()
