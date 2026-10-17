#!/usr/bin/env python3
"""Pokémon Torre V168 — 32/24-frame transparent fiery spritesheets.
Author-created reference-guided pixel sprites. This DOES NOT modify approved moves.
High contrast soot outline, scarlet silhouette, orange tongues, gold/white-hot core,
embers and impact phases. Separate uncommitted-at-rest CI output under assets/flame-v168.
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import random, math, hashlib
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/"assets"/"flame-v168"
DEST.mkdir(parents=True,exist_ok=True)
CELL=192; COLS=8; TAU=math.tau
BLACK=(13,7,17,255); RED=(114,17,22,255); HOT=(227,45,16,255)
ORANGE=(255,117,15,255); YELLOW=(255,207,40,255)
WHITE=(255,247,175,255)
def clamp(a,lo,hi):return max(lo,min(hi,a))
def stroke(d,pts,w=7):
    # Thick dark bottom silhouette and three progressively smaller hot cores.
    d.line(pts,fill=BLACK,width=w+8,joint="curve")
    d.line(pts,fill=RED,width=w+5,joint="curve")
    d.line(pts,fill=HOT,width=w+2,joint="curve")
    d.line(pts,fill=ORANGE,width=max(1,w-1),joint="curve")
    d.line(pts,fill=YELLOW,width=max(1,w-5),joint="curve")
def ring(d,x,y,rx,ry,color,width=2):
    d.ellipse((round(x-rx),round(y-ry),round(x+rx),round(y+ry)),outline=color,width=width)
def sparks(d,rng,x,y,num,spreadx=50,spready=70,alpha=240):
    for i in range(num):
        px=int(x+rng.uniform(-spreadx,spreadx))
        py=int(y+rng.uniform(-spready,spready))
        c=[(255,204,43,alpha),(255,115,22,alpha),(248,64,20,alpha),
           (249,242,172,alpha),(91,24,35,min(alpha,165))][i%5]
        rr=rng.choice([1,1,2,2,3])
        d.rectangle((px,py,px+rr,py+rr),fill=c)
def glow(x,y,rx,ry,tone=(233,76,22,95)):
    l=Image.new("RGBA",(CELL,CELL))
    q=ImageDraw.Draw(l,"RGBA")
    q.ellipse((x-rx,y-ry,x+rx,y+ry),fill=tone)
    return l.filter(ImageFilter.GaussianBlur(11))
def composition(frame,draw,halo=None):
    if halo:frame.alpha_composite(halo)
    d=ImageDraw.Draw(frame,"RGBA");draw(d);return frame
def tower(i,n=32):
    t=i/(n-1);rng=random.Random(168010+i*199)
    im=Image.new("RGBA",(CELL,CELL))
    # Rapid ignition, sustained monumental flame, late breakup.
    rise=clamp((i-2)/12,0,1)
    power=clamp((i-1)/7,0,1)*clamp((n-i)/8,0,1)
    height=18+145*rise
    flare=1+(.24*math.sin(i*.65) if i>11 else 0)
    w=(25+26*power)*flare
    if i>27:w*=max(.15,(n-i)/5)
    if i>2:
        im.alpha_composite(glow(96,171-height*.42,38*power+9,height*.43,
            (241,58,17,clamp(int(82*power),0,100))))
    d=ImageDraw.Draw(im,"RGBA")
    # Red/orange molten floor fissure and a thin, bright flame ring.
    for k in range(5):
        rx=10+k*10+power*15
        ring(d,96,174,rx,4+k*1.2,[(72,18,13,156),HOT,ORANGE,YELLOW,(250,211,128,190)][k],width=2)
    sparks(d,rng,96,168,8,38,10,210)
    if power>.05:
        for layer,scale,col in [(0,1.20,BLACK),(1,1.1,RED),(2,.98,HOT),
            (3,.72,ORANGE),(4,.47,YELLOW),(5,.19,WHITE)]:
            sections=[]
            for row in range(15):
                p=row/14
                y=174-height*p
                rough=(math.sin(p*16+i*.56+layer)*4+
                     math.sin(p*29-i*.29)*2)
                cx=96+math.sin(p*7+i*.18)*7+rough*.40
                # tapered tongues: irregular top, lower robust root
                radius=max(0.6,w*(1-p*.81)*scale+rough)
                sections.append((cx-radius,y))
            for row in range(14,-1,-1):
                p=row/14
                y=174-height*p
                rough=math.sin(p*18-i*.49+layer*.4)*5
                cx=96+math.sin(p*8+i*.21)*6
                radius=max(.4,w*(1-p*.79)*scale+rough)
                sections.append((cx+radius,y))
            d.polygon([(int(x),int(y)) for x,y in sections],fill=col)
        # 7 curling external tongues (not filled circles).
        for j in range(7):
            p=(j+1)/8
            y=int(174-height*p)
            xx=96+int(math.sin(i*.6+j*1.3)*w*.7)
            direction=-1 if j%2 else 1
            dy=int(17+11*math.sin(i*.7+j)**2)
            flame=[(xx,y+18),(xx+direction*17,y+10),(xx+direction*(22+j%3*8),y-dy),
                   (xx+direction*10,y-4),(xx+direction*2,y+7)]
            d.polygon(flame,fill=HOT,outline=BLACK,width=2)
            d.line([(xx,y+10),(xx+direction*16,y),(xx+direction*(18+j%3*7),y-dy)],
                   fill=YELLOW,width=2,joint="curve")
        sparks(d,rng,96,155-height*.45,11,60,60,230)
    if i>=25:
        a=clamp(int((i-24)/7*165),0,180)
        for j in range(9):
            x=53+j*10+int(math.sin(i*.3+j)*4)
            y=122-int((i-24)*4)-j%4*11
            d.ellipse((x,y,x+11,y+13),fill=(24,19,33,max(0,a-j*8)))
    return im
def flame_jet(i,n=32):
    rng=random.Random(168200+i*351);im=Image.new("RGBA",(CELL,CELL))
    growth=clamp((i-1)/9,0,1)
    decay=clamp((n-i)/7,0,1);power=growth*decay
    length=clamp(10+165*growth,12,180)
    im.alpha_composite(glow(94,96,90*power+7,19+25*power,(243,84,19,int(70*power))))
    d=ImageDraw.Draw(im,"RGBA")
    def shape(size,col,wave):
        points=[]
        for k in range(25):
            x=11+(length-11)*k/24;p=k/24
            thick=(6+size*(.25+.72*math.sin(p*math.pi*.85)))*power
            y=96+math.sin(p*16-i*.55+wave)*3
            points.append((int(x),int(y-thick+math.sin(p*31+i*.4)*3*power)))
        for k in range(24,-1,-1):
            x=11+(length-11)*k/24;p=k/24
            thick=(6+size*(.25+.72*math.sin(p*math.pi*.85)))*power
            y=96+math.sin(p*17-i*.47+wave)*3
            points.append((int(x),int(y+thick+math.sin(p*29-i*.3)*3*power)))
        d.polygon(points,fill=col)
    if power>0:
        for size,col in [(30,BLACK),(27,RED),(24,HOT),(18,ORANGE),(12,YELLOW),(5,WHITE)]:
            shape(size,col,size*.03)
        # rolling tongues at top and bottom of the jet
        for k in range(10):
            p=(k+.7)/11
            x=11+p*(length-11)
            direction=-1 if k%2 else 1
            y=96+direction*(17+math.sin(i*.7+k)*6)*power
            r=8+7*math.sin(i*.6+k*.9)**2
            pts=[(x-9,y-direction*6),(x+5,y-direction*11),
                 (x+r+12,y+direction*(14+r)),(x+10,y+direction*6)]
            d.polygon(pts,fill=HOT,outline=BLACK,width=2)
            d.line([(x-3,y),(x+6,y+direction*4),(x+r+8,y+direction*(8+r))],
                   fill=YELLOW,width=2,joint="curve")
        sparks(d,rng,102,95,int(9*power)+2,86,36,240)
        if i>=18 and i<29:
            impact=clamp((i-17)/5,0,1)*clamp((29-i)/5,0,1)
            for k in range(8):
                a=k*TAU/8+i*.2;dist=10+impact*20
                xx=173+math.cos(a)*dist;yy=96+math.sin(a)*dist
                stroke(d,[(173,96),(xx,yy)],max(2,int(impact*5)))
            ring(d,173,96,10+impact*14,10+impact*14,(255,214,76,int(230*impact)),3)
    return im
def blast(i,n=32):
    rng=random.Random(168390+i*213);im=Image.new("RGBA",(CELL,CELL))
    grow=clamp(i/9,0,1);fade=clamp((n-i)/7,0,1);power=grow*fade
    im.alpha_composite(glow(96,99,55*power+5,59*power+5,(252,77,24,int(89*power))))
    d=ImageDraw.Draw(im,"RGBA")
    if power>.05:
        # Japanese 大 shape of classic Fire Blast, not a generic fire orb:
        # upright central stem, crossbar, and two descending diagonal legs.
        p=power
        skeleton=[
          [(96,87),(97,48-p*16),(91,28)],
          [(96,82),(50-p*8,70-p*3)],
          [(96,82),(143+p*8,68-p*3)],
          [(98,89),(64-p*13,157+p*3)],
          [(98,89),(132+p*14,158+p*3)]]
        for j,path in enumerate(skeleton):
            if j>0 and i<3+j:continue
            pts=[(int(96+(x-96)*p+math.sin(i*.45+j)*2.5*p),
                  int(95+(y-95)*p+math.cos(i*.34+j)*2*p)) for x,y in path]
            w=clamp(int((14 if j in (0,3,4) else 12)*p),3,18)
            stroke(d,pts,w)
        # flame spurs flame outward from silhouette and brighten without erasing kanji.
        for j in range(14):
            a=j*TAU/14+i*.12
            r=22+j%4*7
            x=96+math.cos(a)*r;y=95+math.sin(a)*r
            reach=10+9*math.sin(j*.9+i*.7)**2
            pts=[(x-6,y+4),(x+math.cos(a)*reach,y+math.sin(a)*reach),
                 (x+5,y-5)]
            d.polygon(pts,fill=(229,57,17,243),outline=BLACK,width=2)
        if 12<=i<29:
            for j in range(3):
                a=i*.3+j*TAU/3;rad=47+j*10
                d.arc((96-rad,95-rad*.82,96+rad,95+rad*.82),
                      math.degrees(a),math.degrees(a)+68,fill=(245,126,21,int(power*175)),width=2)
        sparks(d,rng,96,95,int(14*power)+1,70,73,220)
    if i>=24:
        impact=clamp((i-23)/4,0,1)*clamp((32-i)/7,0,1)
        for j in range(13):
            a=j*TAU/13+i*.16;rad=20+impact*64
            x=96+rad*math.cos(a);y=95+rad*math.sin(a)
            d.line([(96,95),(x,y)],fill=(255,171,32,int(210*impact)),width=2)
        ring(d,96,95,22+impact*36,18+impact*36,(245,105,29,int(190*impact)),3)
    return im
def punch(i,n=24):
    rng=random.Random(168600+i*93);im=Image.new("RGBA",(CELL,CELL))
    u=i/(n-1)
    charge=clamp(i/5,0,1);contact=clamp((i-9)/6,0,1);end=clamp((n-i)/5,0,1)
    p=charge*end
    cx=96;cy=99
    im.alpha_composite(glow(cx,cy,44*p+9,35*p+6,(247,88,12,int(98*p))))
    d=ImageDraw.Draw(im,"RGBA")
    if p>.02:
        for k in range(7):
            x=48+k*11+int(math.sin(i*.5+k)*7);y=115-(k%3)*8
            tip=19+int(math.sin(i*.8+k)*15)
            flame=[(x-7,y+16),(x-10,y-2),(x-2,y-tip),(x+9,y-10),(x+13,y+17)]
            d.polygon(flame,fill=HOT,outline=BLACK,width=3)
            d.line([(x-4,y+10),(x,y-5),(x+4,y-tip+9)],fill=YELLOW,width=3)
        # fist silhouette: foreground clenched knuckles with three lobes
        for color,inset in [(BLACK,0),(RED,4),(HOT,7),(ORANGE,10),(YELLOW,15)]:
            shift=inset*.3
            base=[(63+shift,84+shift),(74+shift,68+shift),
                  (98-shift,60+shift),(116-shift,66+shift),
                  (126-shift,84+shift),(117-shift,101-shift),
                  (108-shift,110-shift),(86+shift,114-shift),
                  (67+shift,104-shift)]
            d.polygon(base,fill=color)
        for j in range(3):
            x=86+j*12
            d.line([(x,74),(x-2,84)],fill=(122,27,16,245),width=2)
        sparks(d,rng,96,100,8,49,47,230)
        if 12<=i<=20:
            power=clamp((i-11)/4,0,1)*clamp((22-i)/5,0,1)
            for j in range(12):
                a=j*TAU/12+i*.17;rad=28+power*48
                x=cx+math.cos(a)*rad;y=cy+math.sin(a)*rad*.8
                d.line([(cx,cy),(x,y)],fill=(255,199,49,int(229*power)),width=3)
            ring(d,cx,cy,15+power*34,14+power*26,(255,238,111,int(255*power)),3)
    return im
MOVES=[("flame-tower-32",tower,32),("flamethrower-32",flame_jet,32),
       ("fire-blast-32",blast,32),("fire-punch-24",punch,24)]
def main():
    for name,fn,count in MOVES:
        atlas=Image.new("RGBA",(COLS*CELL,math.ceil(count/COLS)*CELL))
        digests=[]
        for i in range(count):
            cell=fn(i,count)
            if i==0 and not cell.getbbox():
                # silent first frame permitted as anticipation
                pass
            digests.append(hashlib.sha256(cell.tobytes()).hexdigest())
            atlas.alpha_composite(cell,((i%COLS)*CELL,(i//COLS)*CELL))
        assert len(set(digests))>=count-3,(name,len(set(digests)))
        atlas.save(DEST/(name+".png"),optimize=True)
        print("V168 sprite art",name,count,atlas.size, "unique",len(set(digests)))
if __name__=="__main__":main()
