#!/usr/bin/env python3
"""V142: high-resolution, authored, transparent animation atlases for battle PixiJS.

Pillow is an offline sprite authoring tool; the game renders only the finished
animated spritesheets on WebGL, never CSS/canvas geometry. Detailed 256px
alpha-blended paint frames, 8 columns, using only ~0.55-0.8 GPU scaling.
"""
from math import sin, cos, pi, atan2
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SIZE=256
COLS=8
ROOT=Path("effects/moves/v136-flying-pixel")
IVORY=(250,253,252)
WHITE=(255,255,252)
SKY=(112,214,244)
DEEP=(37,90,136)
PALE=(195,241,253)
CYAN=(72,186,225)
GOLD=(255,228,142)
AMBER=(251,186,87)
INK=(23,66,102)

def rgba(rgb,a=255): return (*rgb,int(max(0,min(255,a))))
def smooth(x): x=max(0,min(1,x));return x*x*(3-2*x)
def lerp(a,b,t):return a+(b-a)*t
def wrap(x,y):return (round(x),round(y))
def curve(a,b,c,d,steps=38):
    points=[]
    for i in range(steps+1):
        t=i/steps;u=1-t
        points.append((u**3*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t**3*d[0],
                       u**3*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t**3*d[1]))
    return points

def paint_stroke(im,pts,width,color=SKY,shine=True,opacity=220):
    """Four separately anti-aliased paint layers: halo, ink edge, body, shine."""
    pts=list(map(lambda p:wrap(*p),pts))
    if len(pts)<2:return
    glow=Image.new("RGBA",im.size)
    gd=ImageDraw.Draw(glow)
    gd.line(pts,fill=rgba(color,100),width=round(width+13),joint="curve")
    im.alpha_composite(glow.filter(ImageFilter.GaussianBlur(9)))
    body=Image.new("RGBA",im.size)
    d=ImageDraw.Draw(body)
    d.line(pts,fill=rgba(INK,min(145,opacity)),width=max(2,round(width+4)),joint="curve")
    d.line(pts,fill=rgba(color,opacity),width=round(width),joint="curve")
    if shine:
        d.line(pts,fill=rgba(IVORY,min(250,opacity+15)),width=max(2,round(width*.32)),joint="curve")
    im.alpha_composite(body)

def paint_poly(im,outer,color,edge=INK,alpha=240):
    layer=Image.new("RGBA",im.size)
    d=ImageDraw.Draw(layer)
    coords=list(map(lambda p:wrap(*p),outer))
    d.polygon(coords,fill=rgba(color,alpha))
    if edge:d.line(coords+[coords[0]],fill=rgba(edge,140),width=3,joint="curve")
    im.alpha_composite(layer)

def flare(im,x,y,r=4,color=WHITE,intensity=210):
    layer=Image.new("RGBA",im.size)
    d=ImageDraw.Draw(layer)
    d.ellipse((x-r*3,y-r*3,x+r*3,y+r*3),fill=rgba(color,78))
    im.alpha_composite(layer.filter(ImageFilter.GaussianBlur(max(2,r*1.2))))
    layer=Image.new("RGBA",im.size)
    d=ImageDraw.Draw(layer)
    d.line([(x-r*2,y),(x+r*2,y)],fill=rgba(color,intensity),width=2)
    d.line([(x,y-r*2),(x,y+r*2)],fill=rgba(color,intensity),width=2)
    d.ellipse((x-r*.7,y-r*.7,x+r*.7,y+r*.7),fill=rgba(WHITE,255))
    im.alpha_composite(layer)

def feather(im,x,y,rotation=0,scale=1,color=IVORY,fade=230):
    """Curved feather with separated spine, taper and translucent barbs."""
    ux,uy=cos(rotation),sin(rotation)
    vx,vy=-uy,ux
    def pt(s,w):return (x+ux*s*scale+vx*w*scale,y+uy*s*scale+vy*w*scale)
    shaft=[pt(-19,0),pt(-4,-4),pt(7,-3),pt(19,0)]
    left=[pt(16,0),pt(8,-7),pt(-4,-9),pt(-15,-3),pt(-19,0)]
    right=[pt(-19,0),pt(-10,5),pt(3,7),pt(13,4),pt(16,0)]
    paint_poly(im,left+right,color,DEEP,fade)
    d=ImageDraw.Draw(im)
    d.line([wrap(*p) for p in shaft],fill=rgba(WHITE,220),width=max(1,round(scale*1.4)),joint='curve')

def gust(im,t):
    # Multiple independent double-wound currents with a changing crest and
    # a bright leading compression front, not a set of static parallel bars.
    growth=smooth(t/.23)*(1-smooth((t-.89)/.11))
    for k in range(4):
        y0=56+k*45
        offset=sin(t*2*pi+k*.8)*10
        pts=[]
        for j in range(46):
            u=j/45
            x=20+214*u
            y=y0+13*sin(u*5.9-t*2*pi*1.5+k*1.37)+7*sin(u*10.1+t*2*pi*.64+k)+offset
            pts.append((x,y))
        strength=(.64+.36*sin(pi*(k+1)/5))*growth
        paint_stroke(im,pts,10+6*strength,PALE if k%2 else CYAN,True,round(120+105*strength))
        paint_stroke(im,pts[8:39],3,IVORY,False,round(120+110*strength))
        tip=pts[-1]
        flare(im,tip[0]-8,tip[1],3,PALE)
    for k in range(14):
        phase=k*2.39+t*20
        x=15+(k*23+round(66*t))%228
        y=35+(k*71+round(7*sin(phase)))%181
        flare(im,x,y,1.2,WHITE if k%4==0 else SKY,120)
    # Polished translucent curling wisps at the center of the gust.
    for j in range(2):
        a=(t*1.6+j*.5)*2*pi
        start=(112+22*sin(a),100+j*50)
        pts=curve((start[0]-35,start[1]+10),start,
                  (start[0]+42,start[1]-28),(start[0]+90,start[1]-10),30)
        paint_stroke(im,pts,5,IVORY,False,170)

def arc_points(cx,cy,r,rotation=0,steps=46):
    points=[]
    for j in range(steps+1):
        a=-1.33+2.66*j/steps
        x=r*cos(a);y=.88*r*sin(a)
        points.append((cx+x*cos(rotation)-y*sin(rotation),
                       cy+x*sin(rotation)+y*cos(rotation)))
    return points

def air_slash(im,t):
    # Blade-shaped translucent crescent: taper at both tips and sharp arc.
    drift=lerp(-18,24,smooth(t/.75))
    power=smooth(t/.22)*(1-smooth((t-.9)/.1))
    for k in (1,0):
        radius=72 if k==0 else 52
        cx=105+drift-14*k;cy=128+25*k
        rot=-.35-.09*sin(t*pi)
        outer=arc_points(cx,cy,radius,rot,52)
        inner=arc_points(cx,cy,radius*.48,rot,52)
        polygon=outer+list(reversed(inner))
        halo=Image.new("RGBA",im.size)
        paint_poly(halo,polygon,SKY,None,100)
        im.alpha_composite(halo.filter(ImageFilter.GaussianBlur(12)))
        paint_poly(im,polygon,PALE if k==0 else SKY,DEEP,round(195*power+18))
        paint_stroke(im,outer[3:-3],8 if k==0 else 5,WHITE,True,round(225*power+18))
        paint_stroke(im,inner[5:-5],3,CYAN,False,round(160*power+18))
    for j in range(13):
        x=170+((j*29+round(t*80))%75)
        y=65+((j*41+round(t*35))%138)
        flare(im,x,y,1.3,IVORY,140)
    if t>.46:
        hit=smooth((t-.46)/.18)*(1-smooth((t-.85)/.15))
        for j in range(7):
            a=(j/7)*2*pi+t*2
            d=lerp(10,47,hit)
            x=206+d*cos(a);y=132+d*sin(a)
            paint_stroke(im,[(206+9*cos(a),132+9*sin(a)),(x,y)],max(2,5*hit),PALE,False,round(210*hit))

def peck(im,t):
    # A close-range stab, with actual beak silhouette, rapid feather flick,
    # bright point of contact and NO full-size flying wind crescent.
    charge=smooth(t/.24)
    strike=smooth((t-.26)/.36)
    retire=smooth((t-.77)/.23)
    x=lerp(20,64,strike)-21*retire
    y=127-8*sin(t*pi)
    tail=[(38+x,y),(53+x,y-25),(79+x,y-21),(107+x,y-6),
          (103+x,y+15),(75+x,y+27),(45+x,y+17)]
    paint_poly(im,tail,IVORY,DEEP,230)
    for j in range(4):
        feather(im,65+x-j*10,y-15+j*11,-.9+j*.25,1.4-j*.17,PALE,200)
    beak=[(92+x,y-15),(121+x,y-26),(214+x,y-4),(225+x,y),
          (214+x,y+7),(119+x,y+23),(93+x,y+11)]
    paint_poly(im,beak,GOLD,INK,245)
    paint_poly(im,[(120+x,y-19),(208+x,y-4),(220+x,y-1),
                   (135+x,y-5)],WHITE,None,235)
    paint_stroke(im,[(115+x,y+8),(192+x,y+4),(222+x,y)],4,AMBER,False,180)
    for j in range(4):
        paint_stroke(im,[(10+j*11,y-38+j*13),(55+x,y-32+j*11)],3,PALE,False,round(155*charge))
    if t>.43:
        hit=smooth((t-.43)/.17)*(1-smooth((t-.84)/.16))
        for j in range(11):
            a=2*pi*j/11
            dist=26+40*hit
            paint_stroke(im,[(218+6*cos(a),y+7*sin(a)),
                              (218+dist*cos(a),y+dist*sin(a))],
                         2+2*hit,GOLD if j%3 else IVORY,False,round(210*hit))
        flare(im,217,y,5+5*hit,WHITE,round(230*hit))
    for j in range(5):
        flare(im,26+j*18,y+28+sin(t*8+j)*4,1.4,PALE,125)

def roost(im,t):
    # The wings fold towards the user. Falling feathers and a rising golden
    # recovery ring stay on the user; Roost has no enemy-bound projectile.
    pulse=smooth(t/.25)*(1-smooth((t-.86)/.14))
    closure=smooth((t-.2)/.6)
    for side in (-1,1):
        start=(128+side*17,146)
        tip=(128+side*(93-47*closure),66+52*closure)
        body=[start,(128+side*(51-19*closure),99),
              tip,(128+side*(103-46*closure),99+18*closure),
              (128+side*60,161),(128+side*22,163)]
        paint_poly(im,body,PALE,DEEP,round(170+65*pulse))
        paint_stroke(im,curve(start,(128+side*45,109),
                        (128+side*65,94),tip),5,IVORY,False,205)
        for k in range(4):
            u=k/4
            feather(im,128+side*(37+51*u)*(1-.3*closure),
                    122-34*u+25*closure,1.1*side,1.15-.2*u,IVORY,165)
    # Halo and thin orbit ring - no solid disk, no bitmap overlay rectangle.
    ring=Image.new('RGBA',im.size)
    d=ImageDraw.Draw(ring)
    r=47+15*pulse
    d.ellipse((128-r,140-r*.45,128+r,140+r*.45),
              outline=rgba(GOLD,round(175*pulse)),width=5)
    im.alpha_composite(ring.filter(ImageFilter.GaussianBlur(6)))
    im.alpha_composite(ring)
    for j in range(11):
        a=2*pi*j/11+t*1.2
        x=128+(44+10*sin(t*pi))*cos(a)
        y=125+(47+5*cos(t*pi))*sin(a)-15*t
        flare(im,x,y,1.4+(j%3)*.6,GOLD if j%3 else IVORY,170)
    for k in range(7):
        y=(55+k*31+round(t*85))%218
        x=43+(k*29)%172+8*sin(t*4+k)
        feather(im,x,y,sin(t*pi+k)*.65,.7+(k%3)*.18,
                IVORY if k%3 else GOLD,205)

def build(slug,frames,drawfn):
    path=ROOT/slug
    path.mkdir(parents=True,exist_ok=True)
    atlas=Image.new("RGBA",(SIZE*COLS,SIZE*((frames+COLS-1)//COLS)))
    for i in range(frames):
        frame=Image.new("RGBA",(SIZE,SIZE))
        drawfn(frame,i/max(1,frames-1))
        atlas.paste(frame,((i%COLS)*SIZE,(i//COLS)*SIZE))
    target=path/"spritesheet.png"
    atlas.save(target,optimize=True,compress_level=7)
    print(f"V142 {slug}: {frames}x{SIZE}px, {atlas.width}x{atlas.height} atlas, {target.stat().st_size//1024} KiB")

if __name__=="__main__":
    build("roost",16,roost)
    build("gust",20,gust)
    build("air-slash",20,air_slash)
    build("peck",16,peck)
