/* V67 Dragon Pulse: serpentine blast with draconic head, horns, jaw and scale-lit wake. */
(()=>{
 const {C,E,MIX,poly,stroke,oval,sparkle,ribbon,fragments,seed,TAU}=fidelityFourV67.art;
 fidelityFourV67.register(['catalog_dragonpulse'],'Dragon Pulse',(g,f)=>{
  const {t,scale:s,from:src,to:dst,at,ux,ny,low}=f,q=E((t-.13)/.68),impact=E((t-.72)/.24),fade=C((1-t)*8);
  const head=at(q,Math.sin(q*14+t*12)*16);
  const trail=[],line2=[];for(let i=0;i<=22;i++){
    const k=i/22,prog=q*(1-k),p=at(prog,Math.sin(prog*15+t*13)*16*(1-k*.35));
    trail.push(p);line2.push([p[0]+ny[0]*s*(5+8*Math.sin(i*.8)),p[1]+ny[1]*s*(5+8*Math.sin(i*.8))]);
  }
  if(t>.10){
    stroke(g,trail,'#211547',27*s*(1-impact*.4),fade*.93,4*s);
    stroke(g,trail,'#6b37cb',18*s*(1-impact*.3),fade*.94,0);
    stroke(g,trail,'#bba4ff',5*s,fade*.83,0);
    stroke(g,line2,'#26c8d5',3.4*s,fade*.82,1.2*s);
    // scale flickers travel separately, revealing a structured dragon rather than plain beam
    for(let j=0;j<(low?11:18);j++){
      const pos=C(q-j*.047),p=at(pos,Math.sin(pos*15+t*13)*15+Math.cos(j*5)*6);
      const a=j*TAU/4+t*9,r=(5+j%3*2.6)*s;
      poly(g,[[p[0]-r,p[1]],[p[0]+r*.1,p[1]-r*.9],
      [p[0]+r,p[1]],[p[0]+r*.2,p[1]+r*.75]],j%3?'#7d5fe7':'#38d5d1',fade*.84,'#0d1630',1.4*s);
    }
    // The projectile head faces its actual target direction, not a static oval.
    g.save();g.translate(head[0],head[1]);g.rotate(Math.atan2(ux[1],ux[0]));
    const rr=(18+7*Math.sin(t*18))*s;
    poly(g,[[-rr*1.12,-rr*.36],[-rr*.38,-rr*1.15],
      [rr*.4,-rr*.76],[rr*1.27,-rr*.19],[rr*1.76,rr*.06],[rr*.45,rr*.22],
      [rr*1.38,rr*.72],[-rr*.06,rr*.54]],'#6c47c5',fade,'#090821',3.6*s);
    poly(g,[[-rr*.56,-rr*.42],[rr*.17,-rr*.73],[rr*1.18,-rr*.04],[rr*.31,rr*.03]],'#a989ff',fade,'#39246d',1*s);
    poly(g,[[rr*.5,rr*.22],[rr*1.65,rr*.13],[rr*.8,rr*.76]],'#27153f',fade,'#0b0925',2*s);
    poly(g,[[-rr*.64,-rr*.75],[-rr*.63,-rr*1.61],[-rr*.08,-rr*.84]],'#49c8da',fade,'#10224f',2*s);
    poly(g,[[rr*.04,-rr*.49],[rr*.15,-rr*.66],[rr*.37,-rr*.52]],'#e4fff7',fade,'#091a32',1*s);
    g.restore();
  }
  if(t>.70){fragments(g,dst[0],dst[1],impact,low?11:27,['#ab8aff','#44d0de','#e0d9ff','#5939ac'],70*s);}
 });
})();