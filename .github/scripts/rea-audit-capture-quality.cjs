'use strict';
// Validate REA recording evidence from a REAL Poké Arena Training session.
// This does NOT mistake image motion for proof of a particular skill cast.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {PNG}=require('pngjs');
const ROOT=process.env.REA_INPUT||'payload/rea-evolved-moves';
const OUT=process.env.REA_REPORT||'rea-quality-output';
fs.mkdirSync(OUT,{recursive:true});
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'MANIFEST.json'),'utf8'));
const rows=[],problems=[];
function roiStats(file){
 const pic=PNG.sync.read(fs.readFileSync(file));
 const width=390,height=219;
 if(pic.width!==width*4||pic.height!==height*2)throw Error('Contact sheet dimensions unexpected: '+pic.width+'x'+pic.height);
 const diffs=[];
 // The screenshots have 8 temporal samples. Exclude UI: analyze battle arena
 // 110..708 horizontal; 95..344 vertical in original 780x437 image.
 for(let n=1;n<8;n++){
  let changed=0,total=0,magnitude=0;
  const dx=(n%4)*width,dy=Math.floor(n/4)*height;
  for(let y=48;y<170;y+=3)for(let x=55;x<355;x+=3){
   const a=(y*pic.width+x)*4, b=((dy+y)*pic.width+dx+x)*4;
   const d=Math.abs(pic.data[a]-pic.data[b])+
    Math.abs(pic.data[a+1]-pic.data[b+1])+
    Math.abs(pic.data[a+2]-pic.data[b+2]);
   if(d>65)changed++;
   magnitude+=d;total++;
  }
  diffs.push({sample:n,changeRatio:+(changed/total).toFixed(5),
   averageColorDiff:+(magnitude/total).toFixed(1)});
 }
 return {minChange:Math.min(...diffs.map(x=>x.changeRatio)),
  maxChange:Math.max(...diffs.map(x=>x.changeRatio)),
  meanChange:+(diffs.reduce((n,x)=>n+x.changeRatio,0)/diffs.length).toFixed(5),
  sampledSnapshots:8,diffs};
}
for(const cap of manifest.captures||[]){
 try{
  const clip=path.join('payload',cap.video||'');
  const contact=path.join('payload',cap.contact||'');
  const both=fs.existsSync(clip)&&fs.existsSync(contact);
  if(!both){problems.push({move:cap.moveName,index:cap.index,stage:cap.stage,error:'Video/contact missing',clip,contact});continue;}
  const ff=cp.spawnSync('ffprobe',['-v','error','-select_streams','v:0',
   '-show_entries','stream=codec_name,width,height,duration,nb_frames',
   '-show_entries','format=duration,size','-of','json',clip],
   {encoding:'utf8',timeout:16000});
  if(ff.status!==0)throw Error('ffprobe '+String(ff.stderr).slice(0,130));
  const probe=JSON.parse(ff.stdout);
  const stream=(probe.streams||[])[0]||{};
  const duration=+(probe.format?.duration||stream.duration||0);
  if(!duration||!stream.width||!stream.height)throw Error('Video metadata unusable');
  const visual=roiStats(contact);
  const stageVerified=cap.stage===cap.stageAtCast&&(!cap.mega||cap.megaAtCast===true);
  rows.push({index:cap.index,pokemon:cap.pokemon,form:cap.evolvedName,stage:cap.stage,
    mega:!!cap.mega,move:cap.moveName,slot:cap.slot,framesSaved:cap.framesCaptured||0,
    castConfirmed:false,stageVerified,video:cap.video,contact:cap.contact,
    videoSeconds:+duration.toFixed(2),videoBytes:fs.statSync(clip).size,
    codec:stream.codec_name,dimensions:stream.width+'x'+stream.height,
    ...visual,
    reviewPriority:!stageVerified||visual.meanChange<.05?'inspect_low_motion_or_stage':
      visual.meanChange>.85?'inspect_full_screen_flash':'normal_visual_change',
    note:'Change indicates scene motion, NOT proof that the named skill activated'});
 }catch(e){problems.push({index:cap.index,stage:cap.stage,slot:cap.slot,move:cap.moveName,error:String(e).slice(0,220)})}
}
const sum={
 run:process.env.GITHUB_RUN_ID||'local',sourceRun:'39428271235',group:manifest.group,
 expectedCaptures:manifest.captures?.length||0,validatedVideos:rows.length,
 problems:problems.length,stageVerified:rows.filter(x=>x.stageVerified).length,
 lowMotion:rows.filter(x=>x.reviewPriority==='inspect_low_motion_or_stage').length,
 fullScreenFlash:rows.filter(x=>x.reviewPriority==='inspect_full_screen_flash').length,
 normalMotion:rows.filter(x=>x.reviewPriority==='normal_visual_change').length,
 caveat:'Pixel differences cannot prove the intended move. All entries require review of the game animation or event data.'};
fs.writeFileSync(OUT+'/QUALITY.json',JSON.stringify({summary:sum,moves:rows,problems},null,2));
const lines=['# Poké Arena 2D — auditoria visual '+manifest.group,'',
 'Capturas da [execução #39428271235](https://github.com/lulualcides-sys/Pok-mon-torre/actions/runs/39428271235).',
 '',
 '| Estado | Quantidade |','|---|---:|',
 ...Object.entries(sum).filter(([k])=>['expectedCaptures','validatedVideos','problems','stageVerified','lowMotion','fullScreenFlash','normalMotion'].includes(k)).map(([k,v])=>'| '+k+' | '+v+' |'),
 '',
 'Os indicadores de movimento apenas ajudam a priorizar a revisão; não provam a ativação de um golpe.',
 '',
 '| Pokémon | Forma | Golpe | Quadros | Movimento médio | Prioridade |',
 '|---|---|---|---:|---:|---|',
 ...rows.map(x=>'| '+x.pokemon+' | '+x.form+' | '+x.move+' | '+x.framesSaved+' | '+Math.round(100*x.meanChange)+'% | '+x.reviewPriority+' |'),
 '',...problems.map(x=>'- ERRO: '+JSON.stringify(x))];
fs.writeFileSync(OUT+'/REVIEW.md',lines.join('\n'));
console.log(JSON.stringify(sum));
if(problems.length||rows.length!==sum.expectedCaptures)process.exitCode=1;
