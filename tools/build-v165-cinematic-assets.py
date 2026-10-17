#!/usr/bin/env python3
"""V165 isolated cinematic art: authored pixel-frame spells and layered stone tiles.
Built during CI with Pillow. Never overwrites existing approved move sprites."""
from pathlib import Path
from PIL import Image, ImageDraw
import random, math, shutil

ROOT=Path(__file__).resolve().parents[1]
FX=ROOT/'assets'/'battle-v165'
ROOM=ROOT/'assets'/'arena-v165'
FX.mkdir(parents=True,exist_ok=True)
ROOM.mkdir(parents=True,exist_ok=True)
R=random.Random(165)
TAU=math.tau

def poly_ring(d,cx,cy,r,phase,colors,points=26,irregularity=.14):
    outside=[]
    for k in range(points):
        a=phase+k*TAU/points
        rr=r*(1+irregularity*math.sin(k*2.6+phase*4)+.07*math.cos(k*5.1-phase))
        outside.append((int(cx+math.cos(a)*rr),int(cy+math.sin(a)*rr)))
    d.polygon(outside,fill=colors[0])
    rr=r*.73
    d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),fill=colors[1])
    return outside

def shadow_ball(d,i,n,w,rnd):
    cx=cy=w//2;t=i/n; ang=t*TAU*1.7
    # silhouette first: asymmetrical black-violet plasma, NOT a gradient disc
    for k in range(7):
        a=ang+k*TAU/7
        rad=38+(k%3)*3
        tip=(cx+math.cos(a)*(rad+9),cy+math.sin(a)*(rad+9))
        left=(cx+math.cos(a-.22)*rad*.65,cy+math.sin(a-.22)*rad*.65)
        right=(cx+math.cos(a+.24)*rad*.64,cy+math.sin(a+.24)*rad*.64)
        d.polygon((left,tip,right),fill=(8,4,17,235) if k%2 else (29,11,44,230))
    poly_ring(d,cx,cy,35,ang,((10,5,21,255),(27,12,45,255)))
    d.ellipse((cx-24,cy-26,cx+23,cy+20),fill=(32,10,54,255))
    d.ellipse((cx-17,cy-20,cx+16,cy+12),fill=(50,16,87,255))
    for k in range(5):
        a=ang+k*TAU/5
        rad=23+(k%2)*7
        d.line([(int(cx+math.cos(a-.52)*rad),int(cy+math.sin(a-.52)*rad)),(int(cx+math.cos(a)*rad*1.22),int(cy+math.sin(a)*rad*1.22)),(int(cx+math.cos(a+.28)*rad),int(cy+math.sin(a+.28)*rad))],
          fill=(112,51,174,255),width=2)
    # angular fractures, never radial flat stars
    for k in range(5):
        a=ang*.7+k*TAU/5
        x=cx+math.cos(a)*19;y=cy+math.sin(a)*19
        d.line([(int(x-4),int(y-6)),(int(x+2),int(y-2)),(int(x),int(y+7))],
               fill=(160,76,215,230),width=1)
    for k in range(6):
        a=ang+k*TAU/6
        rad=45+(k%2)*8
        x=int(cx+math.cos(a)*rad);y=int(cy+math.sin(a)*rad)
        d.rectangle((x-2,y-1,x+1,y+1),fill=(104,47,161,160))
    # dark 3px rim, edge varies frame by frame
    outside=poly_ring_points(cx,cy,36,ang)
    d.line(outside+[outside[0]],fill=(5,3,12,255),width=3,joint='curve')

def poly_ring_points(cx,cy,r,phase,points=25):
    return [(int(cx+math.cos(phase+k*TAU/points)*(r+2*math.sin(k*2.6+phase*4))),
             int(cy+math.sin(phase+k*TAU/points)*(r+2*math.sin(k*2.6+phase*4))))
            for k in range(points)]

def psychic(d,i,n,w,rnd):
    cx=cy=w//2;t=i/n
    theta=t*TAU
    # a distinct effect: psychic pressure waves / refracted diamond geometry
    for k in range(4):
        radius=20+k*11
        shade=[(65,28,115,150),(105,55,180,170),(163,91,218,190),(228,161,250,215)][k]
        for aidx in range(3):
            aa=theta*(1 if k%2 else -1)+aidx*TAU/3+.25*k
            pts=[(int(cx+math.cos(aa+v*.063)*radius),
                  int(cy+math.sin(aa+v*.063)*radius*.75)) for v in range(16)]
            d.line(pts,fill=shade,width=2 if k<2 else 1,joint='curve')
    # central lens = layered translucent diamond, clipped by tiny glints
    wobble=math.sin(theta)*3
    d.polygon([(cx,cy-29+wobble),(cx+26,cy),(cx,cy+29+wobble),(cx-26,cy)],
      fill=(81,40,139,95),outline=(165,92,228,210))
    d.polygon([(cx,cy-17),(cx+15,cy),(cx,cy+17),(cx-15,cy)],
      fill=(165,92,221,165),outline=(243,176,255,245))
    d.line([(cx,cy-13),(cx+5,cy-2),(cx,cy+11),(cx-4,cy+1),(cx,cy-13)],
      fill=(254,216,255,255),width=2)
    for k in range(9):
        aa=k*TAU/9-theta*1.3;rad=51+k%3*4
        x=int(cx+math.cos(aa)*rad);y=int(cy+math.sin(aa)*rad*.80)
        d.rectangle((x,y,x+2,y+2),fill=(224,165,255,190))
        
def impact(d,i,n,w,rnd):
    t=i/(n-1);cx=cy=w//2
    r=12+t*43;a=max(0,round(240*(1-t)))
    if a:
        for k in range(9):
            aa=k*TAU/9+i*.11
            v=(r+6*(k%2))
            x=int(cx+math.cos(aa)*v);y=int(cy+math.sin(aa)*v*.8)
            d.line([(cx,cy),(x,y)],fill=(135,65,203,a),width=max(1,3-i//5))
        for k in (0,1):
            rr=r*(.72+k*.32)
            for q in range(4):
                aa=q*TAU/4+t*.4
                pts=[(int(cx+math.cos(aa+v*.10)*rr),int(cy+math.sin(aa+v*.10)*rr*.68)) for v in range(10)]
                d.line(pts,fill=(224,151,247,max(0,a-30-k*60)),width=2)

def save_anim(filename,draw,n=16,cell=128):
    atlas=Image.new('RGBA',(4*cell,math.ceil(n/4)*cell))
    for i in range(n):
        half=cell//2
        im=Image.new('RGBA',(half,half))
        dr=ImageDraw.Draw(im,'RGBA')
        draw(dr,i,n,half,random.Random(16500+i))
        atlas.alpha_composite(im.resize((cell,cell),Image.Resampling.NEAREST),(i%4*cell,i//4*cell))
    atlas.save(FX/filename,optimize=True)
    print('V165',filename,atlas.size)

def floor():
    atlas=Image.new('RGBA',(512,512))
    for k in range(16):
        rnd=random.Random(17000+k)
        im=Image.new('RGBA',(128,128),(22,35,71,255))
        d=ImageDraw.Draw(im,'RGBA')
        d.rectangle((3,4,125,124),fill=(30+rnd.randrange(6),51+rnd.randrange(7),97+rnd.randrange(9),255))
        # Uneven masonry edge, chipped corners and bevelled joints
        d.polygon([(3,4),(120,3),(125,8),(121,21),(20,19)],fill=(61,85,136,255))
        d.line([(3,4),(125,4),(125,124)],fill=(7,17,42,255),width=3)
        d.line([(4,5),(5,124),(123,124)],fill=(8,18,41,255),width=3)
        d.line([(7,9),(118,9)],fill=(94,125,180,110),width=2)
        for j in range(65):
            x=rnd.randrange(9,118);y=rnd.randrange(16,117)
            color=(109,136,177,rnd.randrange(25,85)) if j%3 else (6,18,48,rnd.randrange(60,130))
            d.line([(x,y),(x+rnd.randrange(1,6),y+rnd.choice([-1,0,1]))],fill=color,width=1)
        for j in range(3):
            x=rnd.randrange(25,105);y=rnd.randrange(28,97)
            pts=[(x,y),(x+rnd.randint(3,8),y+rnd.randint(-2,3)),(x+rnd.randint(9,19),y+rnd.randint(3,8))]
            d.line(pts,fill=(9,25,57,140),width=1)
        atlas.alpha_composite(im,(k%4*128,k//4*128))
    atlas.save(ROOM/'floor-atlas.png',optimize=True)

def wall():
    rnd=random.Random(1648)
    im=Image.new('RGBA',(960,256),(15,27,54,255));d=ImageDraw.Draw(im,'RGBA')
    for row in range(10):
        y=row*27
        for j in range(-1,16):
            x=j*69+(row%2)*34
            tone=rnd.randrange(-5,9)
            d.polygon([(x+1,y+2),(x+65,y+2),(x+67,y+21),(x+59,y+25),(x+3,y+24)],
                      fill=(22+tone,42+tone,86+tone,255))
            d.line([(x+2,y+3),(x+63,y+3)],fill=(86,120,176,130),width=1)
            d.line([(x+2,y+24),(x+65,y+24)],fill=(5,14,32,250),width=2)
            for k in range(5):
                px=x+rnd.randrange(4,63);py=y+rnd.randrange(6,21)
                d.point((px,py),fill=(122,166,215,rnd.randrange(60,120)))
    # Recessed central doorway / depth cue
    d.polygon([(370,50),(591,50),(617,190),(344,190)],fill=(7,15,34,255))
    d.polygon([(361,51),(379,38),(580,38),(601,52),(594,63),(370,63)],fill=(54,76,122,255))
    for x in (371,591):
        d.line([(x,62),(x,185)],fill=(84,108,160,200),width=6)
    d.line([(348,190),(616,190)],fill=(6,11,28,255),width=14)
    d.line([(384,181),(576,181)],fill=(22,34,63,255),width=3)
    im.save(ROOM/'back-wall.png',optimize=True)

def props():
    im=Image.new('RGBA',(144,240));d=ImageDraw.Draw(im,'RGBA')
    d.ellipse((12,210,140,235),fill=(2,11,26,140))
    d.polygon([(37,216),(26,65),(38,43),(50,62),(61,3),(91,37),(108,16),(124,55),(112,215)],
      fill=(21,40,70,255),outline=(5,14,33,255))
    d.polygon([(57,192),(61,36),(80,17),(89,55),(84,184)],fill=(60,123,173,255))
    d.polygon([(90,196),(108,34),(118,64),(111,195)],fill=(54,94,146,255))
    d.line([(64,40),(70,165)],fill=(146,216,247,220),width=3)
    d.line([(109,50),(104,166)],fill=(96,190,239,185),width=2)
    im.save(ROOM/'pillar.png',optimize=True)
    arch=Image.new('RGBA',(256,160));dr=ImageDraw.Draw(arch,'RGBA')
    dr.polygon([(0,30),(39,6),(220,6),(255,28),(244,53),(212,31),(42,31),(11,57)],fill=(11,19,45,255))
    dr.line([(39,7),(218,7)],fill=(100,142,199,210),width=3)
    for xx in (18,238):
        dr.rectangle((xx-14,51,xx+10,159),fill=(19,31,60,255),outline=(6,14,32,255),width=2)
        dr.line([(xx-8,56),(xx-8,153)],fill=(76,109,164,160),width=2)
    arch.save(ROOM/'arch.png',optimize=True)
    
def main():
    for name in ['crystal-a','crystal-b','chest','rock','glow','magic-ring']:
        shutil.copyfile(ROOT/'assets'/'arena-blue-v154'/f'{name}.png',ROOM/f'{name}.png')
    save_anim('shadow-ball-16.png',shadow_ball)
    save_anim('psychic-wave-16.png',psychic)
    save_anim('impact-12.png',impact,n=12)
    floor();wall();props()
    print('V165 art build done')

if __name__=='__main__':main()
