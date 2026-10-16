/* V122 + marks previously protected and V122 newly approved official move art. */
(()=>{
'use strict';
if(window.PokemonTorreApprovedMarkV122?.installed)return;
const keys=["Tri Attack","Tri Ataque","Tempestade Psíquica","Chicote de Vinha","Confusion","Psybeam","Folha Navalha","Razor Leaf","Vine Whip","Raízes Violentas","Geada Persistente","Sopro Congelante","Chicote Duplo","Aurora Beam","Raio Aurora","Raio da Aurora","Impacto Glacial","Raio de Gelo","Ice Beam","Raio Congelante","Picada Tóxica","Picada Venenosa","Venoshock","Toxina Pesada","Rajada Ácida","Golpe de Veneno","Ferrão Venenoso","Névoa Venenosa","Poison Jab","Ácido","Lama Corrosiva","Rain Dance","Dança da Chuva","Danca da Chuva","Abalo Terrestre","Aerial Ace","Bone Club","Bonemerang","Close Combat","Dynamic Punch","Earthquake","Fire Blast","Flamethrower","Fly","Gust","Hurricane / Furacão","Hydro Pump","Low Kick","Petal Dance","Shadow Ball","Sludge Bomb","Surf","Tremor","Waterfall","Wing Attack / Ataque de Asa"];
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLowerCase().replace(/[^a-z0-9]/g,'');
const allowed=new Set(keys.map(norm));
const pending=new Set(); // V122 four moves explicitly approved 16/10/2026.
const style=document.createElement('style');style.id='v122-approval-mark';
style.textContent='.v122ApprovedMark{display:inline-block;vertical-align:baseline;margin-left:5px;padding:0 4px;border:1px solid #91bbcd88;background:#183848;color:#d7f9ff;font:900 10px/1.35 system-ui,sans-serif;border-radius:5px;text-shadow:none;letter-spacing:0;white-space:nowrap}';
document.head.appendChild(style);
const original=skillMarkup;
let labeled=0;
skillMarkup=function(s,i){
 let html=original.apply(this,arguments);
 const name=String(s?.name||''),key=norm(name);
 if(allowed.has(key)){
  const head='<span class="skillName"><b>'+name+'</b>';
  if(html.includes(head)){
   html=html.replace(head,head+'<i class="v122ApprovedMark" title="Golpe salvo ou aprovado" aria-label="Golpe salvo ou aprovado">+</i>');
   labeled++;
  }
 }
 return html;
};
window.PokemonTorreApprovedMarkV122=Object.freeze({installed:true,
 diagnostics:()=>({known:allowed.size,labeled,excludedPreview:[...pending]})});
})();