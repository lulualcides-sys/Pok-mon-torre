#!/usr/bin/env python3
"""V57 visual refinement — four independent electric moves equipped on Mewtwo.
Only the catalog paths faiscadejolteon/thunderbolt/choquedotrovao/choque
are authored. Previously approved V55 electric moves are not changed.
Each move has 8 real animated beam keyframes and 4 target impact keyframes.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import math,random,argparse
import build_electric_v55 as v

ROOT=Path(__file__).resolve().parents[1]/'effects'/'moves'/'catalog'
MOVES=('faiscadejolteon','thunderbolt','choquedotrovao','choque')
W,H=384,144
S=v.S
LEVELS=[.24,.45,.72,.84,1,.90,.50,.17]

def frame(mode,i):
    im=v.canvas(W,H)
    rng=random.Random(3000+i*77+MOVES.index(mode)*607)
    energy=LEVELS[i]
    origin=(13,72)
    if mode=='faiscadejolteon':
        # Physical Spark: charge around the caster, then an aggressive body-length
        # electric slash/dash to contact, with a bright but short collision.
        reach=[32,48,95,198,335,376,365,360][i]
        count=4 if i<2 else 6
        for j in range(count):
            y=72+(j-(count-1)/2)*13
            tail=(15,y+rng.uniform(-2,2))
            tip=(reach-rng.uniform(0,17),y+rng.uniform(-9,9))
            v.bolt(im,tail,tip,1100+i*113+j,width=(5.3 if j==count//2 else 2.75),
                   power=energy,branches=(2 if i<2 else 4),rough=.13)
        v.sparks(im,reach-12,72,10+i*2,29+(i%5)*5,1500+i,energy*.83)
        if i in (4,5):v.gold_impact(im,367,72,.65 if i==4 else .88,1620+i,32 if i==4 else 39)
    elif mode=='thunderbolt':
        # Signature single branching Thunderbolt: narrow white-yellow core,
        # a visibly propagated zigzag instead of a storm bolt from the sky.
        reach=[20,43,109,233,365,378,371,365][i]
        count=1 if i<2 else 2 if i<4 else 4
        for j in range(count):
            start=(12,70+(j-1)*6)
            end=(reach,72+(j-1)*8)
            v.bolt(im,start,end,2000+i*67+j,width=6.4 if j==0 else 2.35,
                   power=energy*(1 if j==0 else .67),branches=3 if i<3 else 9,rough=.18)
        if i in (4,5):v.gold_impact(im,370,72,.77 if i==4 else 1,2600+i,43)
        if i>=6:v.sparks(im,367,72,11,29,2670+i,energy)
    elif mode=='choquedotrovao':
        # Thundershock: one sharp mid-sized jolt, visibly weaker than Thunderbolt.
        reach=[18,40,114,278,368,374,346,302][i]
        for j in range(2 if i<4 else 3):
            v.bolt(im,(15,72+(j-1)*7),(reach,72+(j-1)*9),
                3200+i*97+j,width=3.8 if j==0 else 1.75,
                power=energy*(1 if j==0 else .64),branches=5,rough=.13)
        if i in (4,5):v.gold_impact(im,366,72,.56 if i==4 else .33,3611+i,27)
        if i>=5:v.sparks(im,364,72,10,21,3680+i,energy*.55)
    else:
        # Basic Shock: a rapid compact electric flick; short energized path.
        reach=[22,48,132,297,369,348,306,270][i]
        v.bolt(im,(13,73),(reach,73),4700+i*41,width=3.25,
            power=energy*.96,branches=2 if i<2 else 4,rough=.12)
        if i in (3,4,5):
            v.sparks(im,reach,72,9+(i==4)*5,18+(i==4)*9,4800+i,energy*.73)
    return im.resize((W,H),Image.Resampling.LANCZOS)

def impact(mode,i):
    im=v.canvas()
    power=[.27,1,.54,.14][i]
    scale={'faiscadejolteon':46,'thunderbolt':54,'choquedotrovao':34,'choque':23}[mode]
    v.gold_impact(im,140,160,power,7000+MOVES.index(mode)*71+i,
                  spread=scale,debris=False)
    return im.resize((v.W,v.H),Image.Resampling.LANCZOS)

def build(selected):
    for name in selected:
        if name not in MOVES:raise ValueError('Unknown move '+name)
        base=ROOT/name
        sprites=base/'sprites';hits=base/'impact'
        sprites.mkdir(parents=True,exist_ok=True);hits.mkdir(parents=True,exist_ok=True)
        for i in range(8):
            frame(name,i).save(sprites/f'frame_{i+1:02}.png')
        for i in range(4):
            impact(name,i).save(hits/f'hit_{i+1:02}.png')
        print('Rendered',name,'8 distinct animation frames + 4 impacts')

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--move',choices=['all',*MOVES],default='all')
    a=p.parse_args()
    build(MOVES if a.move=='all' else (a.move,))
