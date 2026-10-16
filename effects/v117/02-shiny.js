/* V117 | 02 — official shiny palette when no protected animated palette exists.
 * Preserve protected six animated shinies. Never generic hue-rotate.
 * Shiny still art is fetched lazily on encounter; original sprite if unavailable.
 */
(()=>{
'use strict';
if(new URLSearchParams(location.search).get('kanto117')!=='1')return;
const protectedIds=new Set([6,18,62,68,94,105]),cache=new Map();
const stats={requested:0,loaded:0,failed:0,authenticFrames:0,animatedProtected:0,unknown:0,evictions:0};
function get(id){
 let record=cache.get(id);
 if(record){cache.delete(id);cache.set(id,record);return record;}
 if(cache.size>=12){cache.delete(cache.keys().next().value);stats.evictions++;}
 const img=new Image();img.crossOrigin='anonymous';img.decoding='async';
 record={image:img,state:'loading'};
 img.onload=()=>{if(img.naturalWidth>0){record.state='ready';stats.loaded++;}else{record.state='failed';stats.failed++;}};
 img.onerror=()=>{record.state='failed';stats.failed++;};
 img.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/'+id+'.png';
 cache.set(id,record);stats.requested++;return record;
}
const prev=BattleEngine.prototype.drawMon;
BattleEngine.prototype.drawMon=function(actor,id,enemy,now){
 const mon=enemy?(typeof foe==='function'?foe():null):(typeof current==='function'?current():null);
 if(!mon?.shiny||+id!==+mon.id||+id===150||!this.ctx)return prev.apply(this,arguments);
 if(protectedIds.has(+id)){stats.animatedProtected++;return prev.apply(this,arguments);}
 const record=get(+id);if(record.state!=='ready')return prev.apply(this,arguments);
 const ctx=this.ctx,old=ctx.drawImage;let patched=false;
 try{ctx.drawImage=function(source,...args){
    // Replace only actual source art with an authentic pre-colored shiny
    // pixel sprite. The original destination position, size and flips remain.
    if(args.length===8){
     const [sx,sy,sw,sh,dx,dy,dw,dh]=args;
     if([dx,dy,dw,dh].every(Number.isFinite)){
      stats.authenticFrames++;
      return old.call(ctx,record.image,dx,dy,dw,dh);
     }
    }else if(args.length===4){
     stats.authenticFrames++;return old.call(ctx,record.image,...args);
    }
    return old.call(ctx,source,...args);
   };patched=ctx.drawImage!==old;
 }catch(e){}
 try{return prev.apply(this,arguments);}
 finally{if(patched){try{ctx.drawImage=old}catch(e){}}}
};
window.PokemonTorreShinyV117=Object.freeze({
 installed:true,previewOnly:true,protectedIds:[...protectedIds],
 diagnostics:()=>({...stats,cacheSize:cache.size,ids:[...cache.keys()]})
});
})();