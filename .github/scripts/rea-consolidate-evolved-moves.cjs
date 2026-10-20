'use strict';
// Consolidate ACTUAL visual capture attempt metadata from GitHub artifacts.
// This never invents a successful cast when only screen activity was observed.
const fs=require('node:fs'),path=require('node:path');
const output='docs/rea-pokearena/registro-real/evolucoes';
fs.mkdirSync(output,{recursive:true});
const groups=['e0','e1','e2','e3','e4','e5','e6','e7'];
const run=process.env.SOURCE_RUN||'39428271235';
const root='https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/'+run;
const rows=[],jobs=[],issues=[],types={};
let catalog=[];
for(const group of groups){
 const file='evolution-artifacts/'+group+'/rea-evolved-moves/MANIFEST.json';
 if(!fs.existsSync(file)){
  jobs.push({group,status:'MISSING_ARTIFACT_OR_MANIFEST'});
  continue;
 }
 try{
  const m=JSON.parse(fs.readFileSync(file));
  jobs.push({group,status:'READ',indices:m.indices,activeBundle:m.activeBundle,
   recorded:m.captures?.length||0,videoCount:(m.captures||[]).filter(x=>x.video).length,
   errors:m.errors?.length||0});
  if(!catalog.length)catalog=m.catalog||[];
  for(const item of m.captures||[]){
   const key=item.stage+'-'+String(item.mega);
   types[key]=(types[key]||0)+1;
   rows.push({group,pokemon:item.pokemon,form:item.evolvedName,
    stage:item.stage,mega:!!item.mega,slot:item.slot,move:item.moveName,
    stageVerified:item.stageAtCast===item.stage&&(!item.mega||item.megaAtCast===true),
    video:item.video,contact:item.contact,frameCount:item.framesCaptured,
    changedFrames:item.changedFrames,encoderError:item.videoError,
    videoStatus:item.status,sourceRun:run});
  }
  for(const error of m.errors||[])issues.push({group,...error});
 }catch(e){jobs.push({group,status:'MANIFEST_INVALID',error:String(e)})}
}
const unique=new Set(rows.map(x=>x.move));
const expected=26*3*5+6*5;
const summary={generated:new Date().toISOString(),runUrl:root,
 expectedAttempts:expected,recordedAttempts:rows.length,verifiedStages:rows.filter(x=>x.stageVerified).length,
 videoFiles:rows.filter(x=>x.video).length,
 evolvedStageAttemptVideos:rows.filter(x=>x.video&&x.stage>0).length,
 megaAttemptVideos:rows.filter(x=>x.video&&x.mega).length,
 uniqueMoveNamesSeen:unique.size,attemptedGroups:jobs,errors:issues.length,
 missingAttempts:expected-rows.length,stageCounts:types,
 notes:['Video shows public client combat on a disposable local Training profile.',
  'Successful recording is not proof every skill input triggered its intended attack.',
  'The same move name may have different effects, scales, or damage across evolution stages.',
  'Mega stages are distinct from the third regular stage and need separate evidence.',
  'The original Poké Arena graphics and gameplay code are not redistributed as assets inside Pokémon Torre.']};
fs.writeFileSync(output+'/RESUMO.json',JSON.stringify(summary,null,2));
fs.writeFileSync(output+'/TODOS-OS-GOLPES.json',JSON.stringify(rows,null,2));
fs.writeFileSync(output+'/ERROS.json',JSON.stringify(issues,null,2));
fs.writeFileSync(output+'/ESTAGIOS.json',JSON.stringify(catalog,null,2));
const lines=[
 '# Poké Arena 2D — Todos os golpes por evolução e Mega',
 '',
 'Fonte dos vídeos: [execução automática #'+run+']('+root+').',
 '',
 '## Cobertura',
 '',
 '| Item | Resultado |',
 '|---|---:|',
 '| Comandos/estágios planejados | '+expected+' |',
 '| Tentativas de captura com frames | '+summary.recordedAttempts+' |',
 '| Vídeos MP4 salvos | '+summary.videoFiles+' |',
 '| Vídeos de estágios evoluídos (inclui Mega) | '+summary.evolvedStageAttemptVideos+' |',
 '| Vídeos de formas Mega/especiais | '+summary.megaAttemptVideos+' |',
 '| Estágios comprovados pelo estado do jogo | '+summary.verifiedStages+' |',
 '| Pendências de gravação | '+summary.missingAttempts+' |',
 '',
 '## Arquivos permanentes',
 '',
 '- [RESUMO.json](RESUMO.json) — contagens e grupos, inclusive falhas.',
 '- [TODOS-OS-GOLPES.json](TODOS-OS-GOLPES.json) — cada tentativa, personagem, estágio, golpe e resultado.',
 '- [ESTAGIOS.json](ESTAGIOS.json) — catálogo derivado do client, mesmo quando não foi possível gravar.',
 '- [ERROS.json](ERROS.json) — problemas de navegador e de evolução.',
 '',
 '## Vídeos de batalha',
 'Os arquivos MP4 e contact sheets completos estão nos artefatos da execução do GitHub Actions (retidos por 90 dias),',
 'um por grupo e sem incluir ativos gráficos extraídos ou copiados do jogo.',
 '',
 '## Por grupo',
 '| Grupo | Linhas de Pokémon | Vídeos | Erros |',
 '|---|---|---:|---:|',
 ...jobs.map(x=>'| '+x.group+' | '+(x.indices?.join(', ')||'indisponível')+' | '+(x.videoCount??0)+' | '+(x.errors??'-')+' |'),
 '',
 '## Cada golpe observado',
 '| Linha | Estágio | Forma | Golpe | Status |',
 '|---|---|---|---|---|',
 ...rows.map(x=>'| '+x.pokemon+' | '+(x.mega?'MEGA':x.stage+1)+' | '+x.form+' | '+x.move+
  ' | '+(x.video?'Vídeo salvo':'Vídeo indisponível')+(x.stageVerified?' / estágio verificado':' / verificar estágio')+' |'),
 '',
 '**Atenção:** este acervo contém gravações do gameplay, não spritesheets originais. Mudanças visuais',
 'não comprovam, isoladamente, o disparo da habilidade correta. Não se pode declarar todos',
 'os golpes executados apenas pelo número de arquivos salvos.',
 ''];
fs.writeFileSync(output+'/INDEX.md',lines.join('\n'));
console.log(JSON.stringify(summary));
if(!rows.length)process.exitCode=1;
