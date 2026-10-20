'use strict';
const fs=require('node:fs'),path=require('node:path');
const groups=['e0','e1','e2','e3','e4','e5','e6','e7'],list=[],reports=[],errors=[];
for(const group of groups){
 const file=path.join('quality-input','REA-QA-'+group,'QUALITY.json');
 try{
  const src=JSON.parse(fs.readFileSync(file));
  reports.push(src.summary);list.push(...src.moves);errors.push(...src.problems);
 }catch(e){errors.push({group,error:String(e).slice(0,210)})}
}
const totals={run:process.env.GITHUB_RUN_ID||null,sourceCaptureRun:'39428271235',
 expected:420,videoChecked:list.length,stageChecked:list.filter(x=>x.stageVerified).length,
 lowMotion:list.filter(x=>x.reviewPriority==='inspect_low_motion_or_stage').length,
 highMotion:list.filter(x=>x.reviewPriority==='inspect_full_screen_flash').length,
 other:list.filter(x=>x.reviewPriority==='normal_visual_change').length,
 videoErrors:errors.length,distinctNames:new Set(list.map(x=>x.move)).size,
 groups:reports};
const dest='docs/rea-pokearena/registro-real/evolucoes';
fs.mkdirSync(dest,{recursive:true});
fs.writeFileSync(dest+'/AUDITORIA-VIDEO.json',JSON.stringify({summary:totals,results:list,errors},null,2));
const lines=[
 '# Poké Arena 2D — Verificação dos 420 vídeos por evolução',
 '',
 '[Captura original](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39428271235)',
 '',
 'Esta auditoria verifica a integridade de cada MP4, os estágios e as mudanças entre oito quadros reais da batalha.',
 'Não interpreta mudança de pixels como confirmação de um golpe específico.',
 '',
 '| Métrica | Valor |','|---|---:|',
 ...Object.entries(totals).filter(([k])=>['expected','videoChecked','stageChecked','lowMotion','highMotion','other','videoErrors','distinctNames'].includes(k)).map(([k,v])=>'| '+k+' | '+v+' |'),
 '',
 '## Revisão prioritária',
 'Os registros com pouco movimento, transições de tela e flashes intensos devem ser inspecionados individualmente.',
 '',
 '| Pokémon | Forma | Golpe | Movimento médio | Categoria de triagem |',
 '|---|---|---|---:|---|',
 ...list.filter(x=>x.reviewPriority!=='normal_visual_change').map(x=>
  '| '+x.pokemon+' | '+x.form+' | '+x.move+' | '+Math.round(x.meanChange*100)+'% | '+x.reviewPriority+' |'),
 '',
 '## Estado dos oito lotes',
 '| Grupo | Vídeos validados | Problemas |',
 '|---|---:|---:|',
 ...reports.map(x=>'| '+x.group+' | '+x.validatedVideos+' | '+x.problems+' |'),
 '',
 '## Observação',
 'Todos os 420 vídeos são capturas de comandos executados em uma sessão real de jogo.',
 'Um MP4 íntegro e com movimento NÃO garante que o comando tenha disparado o ataque esperado.',
 'Isso deve ser confrontado com o nome do golpe apresentado na interface e o efeito observado.',
 'As imagens dos jogos de terceiros são usadas somente como referência, sem copiar ativos proprietários para Pokémon Torre 2.',
 '',
 'Dados estruturados: [AUDITORIA-VIDEO.json](AUDITORIA-VIDEO.json).'
];
fs.writeFileSync(dest+'/AUDITORIA-VIDEO.md',lines.join('\n'));
console.log(JSON.stringify(totals));
if(list.length!==420||errors.length)process.exitCode=1;
