from PIL import Image,ImageDraw,ImageFilter,ImageChops
import math,random,pathlib
W,H=280,320
S=2
BG=(0,0,0,0)
ROOT=pathlib.Path(__file__).resolve().parent.parent/'effects'/'moves'

def mask():return Image.new('L',(W*S,H*S),0)
def pt(xy):return [(round(x*S),round(y*S)) for x,y in xy]
def use(img,m,c,a):
    if a<=0:return
    alpha=m.point(lambda p:int(p*a))
    layer=Image.new('RGBA',img.size,c+(0,));layer.putalpha(alpha)
    img.alpha_composite(layer)
def glow(im,m,c,blur,a):
    use(im,m.filter(ImageFilter.GaussianBlur(blur*S)),c,a)
def line(m,coords,width):
    if len(coords)<2:return
    ImageDraw.Draw(m).line(pt(coords),fill=255,width=max(1,int(width*S)),joint='curve')
def bolt_path(a,b,seed,split=8,bend=15):
    r=random.Random(seed);x,y=a;tx,ty=b;dx=tx-x;dy=ty-y;d=math.hypot(dx,dy)
    n=max(4,int(d/split));nx=-dy/(d or 1);ny=dx/(d or 1);out=[a]
    for i in range(1,n):
        t=i/n;off=(r.random()-.5)*2*bend*math.sin(math.pi*t)
        out.append((x+dx*t+nx*off,y+dy*t+ny*off))
    out.append(b);return out

def lightning(im,points,width=6,seed=100,branches=2,alpha=1):
    m=mask();fine=mask();line(m,points,width);line(fine,points,max(.8,width*.33))
    if branches:
        r=random.Random(seed)
        for i in range(branches):
            k=int((i+1)/(branches+1)*(len(points)-2))+1
            k=min(len(points)-2,k)
            ox,oy=points[k]; dx=points[-1][0]-points[0][0];dy=points[-1][1]-points[0][1]
            angle=math.atan2(dy,dx)+(1 if i%2==0 else -1)*(0.70+r.random()*.60)
            lng=(17+r.random()*28)*max(.6,min(width/5,1.5))
            branch=bolt_path((ox,oy),(ox+math.cos(angle)*lng,oy+math.sin(angle)*lng),seed+i+7,split=7,bend=6)
            line(m,branch,max(1.2,width*.37));line(fine,branch,max(.6,width*.14))
    # Three distinct translucent bloom layers; drawn once into the PNG, not in the battle runtime.
    glow(im,m,(255,132,17),12,alpha*.27)
    glow(im,m,(255,190,25),5,alpha*.52)
    # a thin black ink rim preserves definition against pale backgrounds
    outer=m.filter(ImageFilter.MaxFilter(9))
    use(im,outer,(7,6,17),alpha*.90)
    use(im,m,(241,133,22),alpha)
    use(im,m.filter(ImageFilter.MinFilter(5)),(255,221,59),alpha)
    use(im,fine,(255,250,184),alpha)
    use(im,fine.filter(ImageFilter.MinFilter(3)),(255,255,255),alpha)

def ring(im,cx,cy,r,alpha=.9,ellipse=.55,seed=3):
    if alpha<=0:return
    rgen=random.Random(seed);pts=[]
    for k in range(33):
        theta=k*math.tau/32;rad=r*(.97+rgen.random()*.055)
        pts.append((cx+math.cos(theta)*rad,cy+math.sin(theta)*rad*ellipse))
    m=mask();line(m,pts,2)
    glow(im,m,(255,194,38),6,alpha*.34)
    use(im,m.filter(ImageFilter.MaxFilter(5)),(13,9,24),alpha*.65)
    use(im,m,(255,204,79),alpha*.9)

def motes(im,x,y,r,n,seed,alpha=1):
    rgen=random.Random(seed)
    base=mask();core=mask();db=ImageDraw.Draw(base);dc=ImageDraw.Draw(core)
    for i in range(n):
        a=rgen.random()*math.tau;d=r*(.21+.75*rgen.random());px=x+d*math.cos(a);py=y+d*math.sin(a)
        z=rgen.choice([1.2,1.7,2.5]);box=[int((px-z)*S),int((py-z)*S),int((px+z)*S),int((py+z)*S)]
        db.ellipse(box,fill=130+rgen.randrange(100));dc.ellipse([int((px-.8)*S),int((py-.8)*S),int((px+.8)*S),int((py+.8)*S)],fill=255)
    glow(im,base,(255,177,23),3,alpha*.6);use(im,base,(251,193,46),alpha*.9);use(im,core,(255,255,244),alpha)

def star(im,x,y,size=1,seed=20,power=1):
    rgen=random.Random(seed)
    # Distinct thick, sharp explosive blast, no simple cartoon lightning wheel
    energy=mask();core=mask();d=ImageDraw.Draw(energy);c=ImageDraw.Draw(core)
    for i in range(14):
        a=math.tau*i/14+(rgen.random()-.5)*.22
        p0=7*size;length=size*rgen.uniform(30,65)
        a2=a+.06*math.sin(i*1.5)
        px=x+p0*math.cos(a);py=y+p0*math.sin(a)
        ax=x+length*math.cos(a2);ay=y+length*math.sin(a2)
        v=.065*size*length
        polygon=[(px+v*math.sin(a),py-v*math.cos(a)),(ax,ay),(px-v*math.sin(a),py+v*math.cos(a))]
        d.polygon(pt(polygon),fill=250);c.line(pt([(px,py),(x+length*.67*math.cos(a2),y+length*.67*math.sin(a2))]),fill=255,width=max(1,int(1*S*size)))
    glow(im,energy,(255,163,26),10,power*.67)
    use(im,energy.filter(ImageFilter.MaxFilter(5)),(9,8,23),power*.82)
    use(im,energy,(255,194,22),power)
    use(im,core,(255,252,195),power)
    disk=mask();ImageDraw.Draw(disk).ellipse([int((x-13*size)*S),int((y-13*size)*S),int((x+13*size)*S),int((y+13*size)*S)],fill=235)
    glow(im,disk,(255,242,80),6,power*.95);use(im,disk,(255,254,226),power)
    motes(im,x,y,70*size,15,seed+1,power*.73)

def cloud(im,cx,cy,stage=1,seed=10):
    r=random.Random(seed)
    dark=mask();lite=mask();dd=ImageDraw.Draw(dark);dl=ImageDraw.Draw(lite)
    for i in range(13):
        xx=cx+(i-6)*12;yy=cy+r.uniform(-10,9);rad=17+r.uniform(-1,12)
        dd.ellipse([int((xx-rad)*S),int((yy-rad)*S),int((xx+rad)*S),int((yy+rad)*S)],fill=r.randint(140,235))
        dl.ellipse([int((xx-rad*.7)*S),int((yy-rad*.7-5)*S),int((xx+rad*.7)*S),int((yy+rad*.3)*S)],fill=r.randint(30,100))
    dark=dark.filter(ImageFilter.GaussianBlur(3*S))
    use(im,dark,(13,12,31),stage*.94)
    use(im,lite.filter(ImageFilter.GaussianBlur(5*S)),(96,83,135),stage*.45)
    motes(im,cx,cy+11,53,7,seed+40,stage*.4)

def create(move,i):
    im=Image.new('RGBA',(W*S,H*S),BG);phase=i+1;r=random.Random(1000+100*list(moves).index(move)+i*37)
    if move=='faisca':
        if i<3:
            ring(im,98,164,19+i*8,alpha=.55+i*.14,seed=i+2)
            for j in range(i+2):
                a=j*math.tau/(i+2);x=98+math.cos(a)*25;y=165+math.sin(a)*25
                lightning(im,bolt_path((x,y),(x+math.cos(a)*30,y+math.sin(a)*30),30+i*7+j,bend=7),2.3,seed=i+j,branches=1)
            motes(im,98,165,40,6+i*5,10+i)
        elif i<5:
            for j in range(4):
                y=164+(j-1.5)*13
                lightning(im,bolt_path((25+r.random()*12,y+r.random()*4),(226-(i==3)*37,y+(r.random()-.5)*8),i*37+j,split=6,bend=10),4.3+j*.5,seed=i*20+j,branches=2)
            motes(im,214,164,35,19,i)
        elif i==5:
            lightning(im,bolt_path((20,164),(178,161),135),9,seed=22,branches=4)
            star(im,181,161,1.12,seed=32);ring(im,181,187,68,.54)
        elif i==6:star(im,177,164,.83,seed=11,power=.83);motes(im,174,164,80,24,14)
        else:motes(im,175,162,53,18,23,.55)
    if move=='discharge':
        radii=[13,22,39,59,81,105,83,43];radius=radii[i]
        ring(im,140,160,radius,.70 if i<7 else .37,.72,30+i)
        if i<7:
            count=[3,4,5,7,9,10,6][i]
            for j in range(count):
                a=j*math.tau/count+r.random()*.12
                x1=140+math.cos(a)*15;y1=160+math.sin(a)*10
                x2=140+math.cos(a)*radius;y2=160+math.sin(a)*radius*.73
                lightning(im,bolt_path((x1,y1),(x2,y2),300+i*23+j,bend=7),3.0+(i>=4)*1.2,seed=i*18+j,branches=1)
            motes(im,140,160,radius,6+i*3,i)
            if i in (4,5):star(im,140,160,.55,seed=i,power=.90)
        else:motes(im,140,160,52,18,44,.5)
    if move=='tempestade-de-raios':
        cloud(im,140,73,1 if i<7 else .35,51+i)
        if i<2:ring(im,140,269,24+i*15,.8,seed=i)
        if 2<=i<=6:
            offsets=[-30,22,-16,28,0];count=[1,1,2,3,1][i-2]
            for j in range(count):
                x=140+offsets[i-2]+j*16-14*(count>1)
                lightning(im,bolt_path((x-7,97),(x,272),400+i*19+j,split=9,bend=17),5.0+(i==5)*2.3,seed=100+i*10+j,branches=4)
                if i>2:star(im,x,272,.50+(i==5)*.15,seed=j+i*4,power=.74)
            motes(im,140,271,64,12+i*3,i)
        if i==7:motes(im,140,270,59,20,43,.65)
    if move=='trovao':
        cloud(im,140,60,1 if i<7 else .45,50)
        if i<3:ring(im,140,268,26+i*12,.7,seed=40+i)
        if i==2:lightning(im,bolt_path((148,91),(146,141),101,split=7),4.0,seed=40,branches=1)
        if 3<=i<=6:
            endpoint=212 if i==3 else 275
            lightning(im,bolt_path((124,91),(142,endpoint),126+i,split=8,bend=18),7.2+(i in (4,5))*5.4,seed=i,branches=6)
            if i in (4,5):
                star(im,142,273,1 if i==4 else 1.36,seed=i*20)
                ring(im,142,281,56+(i==5)*24,.76,seed=60+i)
                motes(im,142,272,78,32,i)
            if i==6:star(im,142,275,.67,seed=61,power=.70)
        if i==7: ring(im,142,277,44,.28);motes(im,142,277,56,16,75,.35)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def create_imp(move,i):
    im=Image.new('RGBA',(W*S,H*S),BG);sc=[.43,.95,.74,.32][i];star(im,140,160,sc,40+i*9,1-i*.15);return im.resize((W,H),Image.Resampling.LANCZOS)

moves=('faisca','discharge','tempestade-de-raios','trovao')
if __name__=='__main__':
    for m in moves:
        p=ROOT/m/'sprites';p.mkdir(parents=True,exist_ok=True)
        q=ROOT/m/'impact';q.mkdir(parents=True,exist_ok=True)
        for i in range(8):create(m,i).save(p/f'frame_{i+1:02}.png')
        for i in range(4):create_imp(m,i).save(q/f'hit_{i+1:02}.png')
