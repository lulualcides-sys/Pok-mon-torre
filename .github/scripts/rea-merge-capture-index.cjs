'use strict';
const fs=require('node:fs');
const out='docs/rea-pokearena/registro-real';
fs.mkdirSync(out,{recursive:true});
const ref=JSON.parse(fs.readFileSync('docs/rea-pokearena/INVENTARIO-GERAL.json','utf8'));
const pokemon=['bulbasaur','charmander','squirtle','pichu'];
const manifests=[],captures=[];
const run=process.env.GITHUB_RUN_ID||'';
const runUrl=run?'https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/'+run:'';
for(const name of pokemon){
 const file='audit-output/rea-real-moves-'+name+'/manifest-'+name+'.json';
 if(!fs.existsSync(file)){manifests.push({pokemon:name,status:'no_manifest',error:'Job did not create a manifest'});continue;}
 try{
  const m=JSON.parse(fs.readFileSync(file,'utf8'));
  manifests.push({pokemon:name,status:'manifest_read',roster:m.roster?.length||0,
   captured:m.captures?.length||0,errors:m.errors||[]});
  captures.push(...(m.captures||[]).map(c=>({
    pokemon:c.pokemon,move:c.move,input:c.input,slot:c.slot,
    framesSaved:c.frameCount,changedFrames:c.changedFrames,status:c.status,
    archivePath:c.evidenceDir,runUrl})));
 }catch(e){manifests.push({pokemon:name,status:'manifest_parse_failed',error:String(e).slice(0,150)});}
}
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const effects=(ref.atlases||[]).map((a,i)=>{
 const related=captures.filter(c=>norm(c.move)===norm(a.key));
 return {id:i+1,key:a.key,source:a.source,frameWidth:a.fw,frameHeight:a.fh,
 columns:a.cols,animations:a.anims||[],
 status:related.length?'move_with_matching_name_was_attempted':'atlas_only_no_battle_evidence',
 matchIsVisualProof:false,
 relatedPublicCaptureNames:related.map(c=>c.pokemon+':'+c.move)};
});
const coverage={
 runId:run,runUrl,generated:new Date().toISOString(),
 atlasRecords:effects.length,charactersPlanned:pokemon.length,
 moveCommandsPlanned:20,frameSequenceCaptures:captures.length,
 framesRecorded:captures.reduce((n,x)=>n+(x.framesSaved||0),0),
 withVisibleChange:captures.filter(x=>x.status==='frames_saved_visual_change').length,
 claimsOfConfirmedExactAnimations:0,
 characters:manifests,captures,effects,
 notes:[
  'Not all moves in Poké Arena 2D are accessible without gameplay unlocks.',
  'An atlas entry is not a distinct move; names and statuses remain separate.',
  'Animation frames represent screen recordings, not original spritesheets.',
  'Pixel changes do not prove each move was activated; manually inspect frame contact sheets.',
  'All images stay in GitHub Actions artifacts for 90 days. Metadata persists on this analysis branch.'
 ]};
fs.writeFileSync(out+'/COBERTURA.json',JSON.stringify(coverage,null,2));
fs.writeFileSync(out+'/EFEITOS-90.json',JSON.stringify(effects,null,2));
const lines=[
 '# Poké Arena 2D — Registro de golpes em batalha real',
 '',
 'Ação: [abrir execução no GitHub]('+runUrl+')',
 '',
 'Esta coleta registra quadros capturados em sessões reais do jogo público,',
 'sem simular sprites, copiar atlas originais, remover bloqueios nem alterar Pokémon Torre.',
 '',
 '## Cobertura comprovada',
 '- Efeitos animados registrados no código fonte público: '+effects.length,
 '- Controles de golpes planejados: 20 (quatro Pokémon × cinco controles)',
 '- Tentativas com sequência de imagens salva: '+captures.length,
 '- Quadros reais do navegador: '+coverage.framesRecorded,
 '- Sequências com diferenças visuais: '+coverage.withVisibleChange,
 '- Golpes cuja ativação específica foi confirmada apenas por pixels: **0** (impossível inferir assim).',
 '- Capturas completas ficam nos artefatos rea-real-moves-* por 90 dias; este índice permanece no GitHub.',
 '',
 '## Personagens e erros',
 '| Pokémon | Sequências salvas | Erros |',
 '|---|---:|---:|',
 ...manifests.map(m=>'| '+m.pokemon+' | '+(m.captured||0)+' | '+(m.errors?.length||(m.error?1:0))+' |'),
 '',
 '## Sequências gravadas (capturas reais)',
 '| Pokémon | Nome exibido | Comando | Quadros | Diferença de imagem | Estado |',
 '|---|---|---|---:|---:|---|',
 ...captures.map(c=>'| '+c.pokemon+' | '+c.move+' | '+c.input+' | '+c.framesSaved+' | '+c.changedFrames+' | '+c.status+' |'),
 '',
 '## Arquivos',
 '- COBERTURA.json: resultados estruturados para cada tentativa e apontador para as imagens',
 '- EFEITOS-90.json: dimensões e animações dos registros de atlas (não confundir com capturas)',
 '- Artefatos do GitHub Actions: frame-00.png a frame-24.png de cada comando, contact-sheet.png, imagem de seleção e de batalha.',
 '',
 '## Ainda não registrados',
 'Efeitos de Pokémon/arenas bloqueados ou de outros modos não são marcados como capturados.',
 'Os 90 efeitos NÃO foram todos executados; o catálogo separa o que foi visto do que falta.',
 '',
 '## Todos os efeitos catalogados',
 '| Efeito identificado | Frame | Animações declaradas | Correspondência com tentativa |',
 '|---|---:|---|---|',
 ...effects.map(e=>'| '+e.key+' | '+e.frameWidth+'×'+e.frameHeight+' | '+e.animations.map(a=>a.name+': '+(a.fps??'?')+' FPS').join(', ').slice(0,120)+' | '+(e.relatedPublicCaptureNames.length?e.relatedPublicCaptureNames.join(', '):'Não testado em combate')+' |')
 ];
fs.writeFileSync(out+'/INDEX.md',lines.join('\n')+'\n');
console.log(JSON.stringify({runUrl,atlases:effects.length,sequences:captures.length,frames:coverage.framesRecorded,manifests:manifests.map(x=>({name:x.pokemon,captured:x.captured,errors:x.errors?.length}))}));
