// V35.83 — geometric helpers exclusively for the four new beams.
// Uses the game's existing Canvas context; no DOM/CSS overlays or external image URLs.
function beamTravel(A,B,u){return [M(A[0],B[0],u),M(A[1],B[1],u)];}
function beamAxis(A,B){const dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy)||1;return {nx:-dy/len,ny:dx/len,angle:Math.atan2(dy,dx)};}
function beamTrace(A,B,head,phase,wave,frequency,low){
 const d=beamAxis(A,B),out=[],n=low?15:27;
 for(let j=0;j<=n;j++){const u=j/n*head,p=beamTravel(A,B,u),w=(Math.sin(u*frequency-phase)+.30*Math.sin(u*frequency*1.73+phase*.71))*wave;
  out.push([p[0]+d.nx*w,p[1]+d.ny*w]);}
 return out;
}
function beamLayers(g,points,layers,alpha,s){
 for(const layer of layers)line(g,points,layer[0],layer[1]*s,alpha*(layer[2]===undefined?1:layer[2]),layer[3]?layer[3]*s:0);
}
function beamShard(g,x,y,size,rotation,colors,alpha){
 g.save();g.globalAlpha=C(alpha);g.translate(x,y);g.rotate(rotation);
 g.fillStyle=colors[0];g.strokeStyle=colors[1];g.lineWidth=1;
 g.beginPath();g.moveTo(0,-size);g.lineTo(size*.46,-size*.1);g.lineTo(0,size);g.lineTo(-size*.46,-size*.1);g.closePath();g.fill();g.stroke();
 g.beginPath();g.moveTo(0,-size);g.lineTo(0,size);g.moveTo(0,0);g.lineTo(size*.46,-size*.1);g.stroke();g.restore();
}
function beamBurst(g,x,y,progress,s,inner,outer,count=12){
 const fade=1-progress;
 if(fade<=0)return;
 glow(g,x,y,(24+38*progress)*s,inner,outer,fade*.8);
 ring(g,x,y,(12+40*progress)*s,inner,fade*.72,2*s,.68);
 for(let j=0;j<count;j++){const a=j*TWO/count,rr=(9+42*progress*(.7+j%3*.14))*s;
  line(g,[[x+Math.cos(a)*rr*.47,y+Math.sin(a)*rr*.47],[x+Math.cos(a)*rr,y+Math.sin(a)*rr]],j%2?inner:outer,(j%3===0?2.7:1.7)*s,fade*.88,2*s);
 }
}
