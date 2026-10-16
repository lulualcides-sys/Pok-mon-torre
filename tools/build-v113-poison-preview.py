#!/usr/bin/env python3
"""V113: 16-frame effects from the user's original Pokemon Mystery Dungeon Poison sheet.
Only original cropped pixels; no ImageDraw geometry, CSS, gradients, fake video.
"""
from pathlib import Path
from PIL import Image
from urllib.request import Request,urlopen
from hashlib import sha256
import math,json,time

BASE=Path(__file__).resolve().parents[1]
DEST=BASE/'effects/moves/v113-poison-preview'
SRC=DEST/'source/poison-attack-effects-original.png'
URL='https://www.spriters-resource.com/media/assets/14/14793.png?updated=1755472482'
CHECKSUM='edc356640969383f7fa1cfe19beda3051184c0bbe1fc77bb211de5846923d659'
SRC.parent.mkdir(parents=True,exist_ok=True)
if not SRC.is_file():
 for attempt in range(3):
  try:
   request=Request(URL,headers={'User-Agent':'Mozilla/5.0','Accept':'image/png,image/*',
    'Referer':'https://www.spriters-resource.com/'})
   with urlopen(request,timeout=30) as r:blob=r.read(400000)
   assert sha256(blob).hexdigest()==CHECKSUM,'Original artwork does not match user library'
   SRC.write_bytes(blob);break
  except Exception as exc:
   if attempt==2:raise RuntimeError('Original Poison sprites unreachable: never produce generic substitute') from exc
   time.sleep(2*(attempt+1))
assert sha256(SRC.read_bytes()).hexdigest()==CHECKSUM
raw=Image.open(SRC).convert('RGB')
assert raw.size==(800,1221),'Wrong original sprite sheet'
boxes={
'acid':[(10,25,35,52),(35,25,65,52),(61,25,94,52),(91,25,120,52)],
'fog':[(14,824,41,875),(68,824,109,875),(151,824,212,875),(206,824,267,875),
 (252,824,317,875),(306,824,371,875),(368,824,435,875),(460,824,543,875)],
'jab':[(42,913,85,976),(86,913,125,976),(167,913,203,976),(254,913,300,976),
 (323,913,376,976),(404,913,457,976),(531,913,584,976),(581,913,637,976)],
'sludge':[(24,265,53,309),(49,265,80,309),(75,265,112,309),(108,265,149,309),
 (145,265,191,309),(182,265,231,309),(262,265,322,309),(359,265,431,309)]}
BG=(0,128,128)
def extract(box):
 crop=raw.crop(box);w,h=crop.size
 pix=crop.load();cut=Image.new('RGBA',(w,h));out=cut.load()
 for y in range(h):
  for x in range(w):
   rgb=pix[x,y]
   out[x,y]=(*rgb,255 if max(abs(rgb[j]-BG[j]) for j in range(3))>24 else 0)
 bounds=cut.getchannel('A').getbbox()
 return cut.crop(bounds) if bounds else Image.new('RGBA',(1,1))
A=[extract(b) for b in boxes['acid']]
F=[extract(b) for b in boxes['fog']]
J=[extract(b) for b in boxes['jab']]
S=[extract(b) for b in boxes['sludge']]
W=128
def put(dst,img,x,y,size=1,alpha=1,flip=False):
 if alpha<=0:return
 w=max(1,round(img.width*size));h=max(1,round(img.height*size))
 frame=img.resize((w,h),Image.Resampling.NEAREST)
 if flip:frame=frame.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
 if alpha<1:frame.putalpha(frame.getchannel('A').point(lambda n:round(n*alpha)))
 layer=Image.new('RGBA',dst.size)
 layer.paste(frame,(round(x-w/2),round(y-h/2)),frame)
 dst.alpha_composite(layer)
def fog(i):
 p=i/15;f=Image.new('RGBA',(W,W))
 k=min(7,round(p*7))
 scale=[.47,.54,.61,.67,.76,.84,1,1.08,1.18,1.25,1.17,1.04,.90,.75,.57,.36][i]
 put(f,F[k],64,63,scale*1.8)
 if i>2:
  put(f,F[max(0,k-2)],44-6*p,73,scale*.78,.79)
  put(f,F[min(7,k+1)],83+6*p,56,scale*.7,.76,True)
 if i>5:put(f,F[(k+5)%8],67,41-3*p,scale*.59,.76)
 return f
def jab(i):
 f=Image.new('RGBA',(W,W))
 if i<11:
  put(f,J[min(7,round(i*.7))],27+i*5.1,66-i*.82,1.55+(.16 if i in (8,9,10) else 0))
 else:
  fade=max(.15,1-(i-11)/6)
  put(f,J[(i-11+3)%8],72,64,1.38*(.95+(i-11)*.08),fade)
  put(f,J[-2],60,58,1.1*fade,fade*.7)
 return f
def acid(i):
 f=Image.new('RGBA',(W,W))
 if i<10:
  q=i/9
  put(f,A[min(3,int(i/3))],18+q*85,62-10*math.sin(q*math.pi),1.12+q*.22)
  if i>2:put(f,A[min(3,int(i/4))],max(10,18+(q-.23)*85),77,.67,.8)
  if i>5:put(f,A[1],max(8,18+(q-.43)*85),51,.49,.66)
 else:
  q=(i-10)/5
  put(f,A[3],95,62,2+q*.45,1-q*.75)
  put(f,A[2],68,47-q*4,1.2+q*.25,1-q*.7)
  put(f,A[0],100,82,1.12,1-q*.7)
 return f
def mud(i):
 f=Image.new('RGBA',(W,W));p=i/15
 if i<9:
  k=min(7,round(i*.83))
  put(f,S[k],18+p*94,67-13*math.sin(p*math.pi),1.3)
  if i>3:put(f,S[max(0,k-2)],10+p*77,80,.56,.88)
 else:
  k=min(7,5+round((i-9)*.32))
  growth=1+math.sin(min(1,(i-9)/7)*math.pi)*.35
  put(f,S[k],77,70,1.75*growth)
  put(f,S[(k+2)%8],54,76,1.15,max(.17,1-(i-9)/8))
  put(f,S[(k+1)%8],98,72,1,max(.12,1-(i-9)/9))
 return f
spec={'nevoavenenosa':fog,'poisonjab':jab,'acido':acid,'lamacorrosiva':mud}
report={'version':'113.0-preview','source':'Original Poison Attack Effects, Pokémon Mystery Dungeon: Explorers of Time / Darkness, sprites ripped by redblueyellow','source_sha256':CHECKSUM,'frame_size':W,'moves':{}}
for name,fn in spec.items():
 atlas=Image.new('RGBA',(W*16,W));frames=set();visible=0
 for i in range(16):
  frame=fn(i);atlas.alpha_composite(frame,(i*W,0))
  frames.add(sha256(frame.tobytes()).digest())
  visible+=frame.getchannel('A').getbbox() is not None
 assert len(frames)>=14 and visible>=15,(name,'not an animated original sprite')
 target=DEST/name/'sprites';target.mkdir(parents=True,exist_ok=True)
 asset=target/(name+'.webp');atlas.save(asset,'WEBP',lossless=True,method=4,exact=True)
 assert Image.open(asset).size==(W*16,W)
 report['moves'][name]={'frames':16,'unique':len(frames),'bytes':asset.stat().st_size}
 print('PASS V113 original',name,'16 frames',len(frames),'distinct')
(DEST/'manifest.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
