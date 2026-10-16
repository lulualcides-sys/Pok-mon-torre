/* V118 — RESTORE APPROVED RAIN DANCE WEATHER, using V35.64 original PMD frames.
 * Exactly the original ten pixel sprites from parts/p019.txt, no CSS, no new art.
 * Normal V117 game uses this module; other weather/moves stay unchanged.
 * Gameplay is delegated to the native useMove — do not bypass cooldown/energy.
 */
(()=>{
 'use strict';
 if(window.PokemonTorreRainDanceV118?.installed)return;
 const originalFrames={"weather_rain_00":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAAAxElEQVR42u3YsQ2AMAwEwIiGmuUYgZ5N2IaK0hJLZJI0TJAOZAR3I7z08ielPCxqOwvQNYgAvl/CJWrbRA2JTFIwR4GobZcC5F7CSdxgjsKvS7j6oIHcEo7ihmQuIeS/CQ9FhNwSAi+YpLMUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADucgGyvhwsMGamSgAAAABJRU5ErkJggg==","weather_rain_01":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAAA70lEQVR42u3boQ0CQRCG0T8gThAMjhrO4SgHSxEYiqAYJNmEJraSRSCwWG4E75XwJZOZu2QTFtH6eKrANysJwBD+i7MEAACLa32cWh9HJaDum3CTZJIa6obwlWQnNdSepLfWx0EJqNmESbKWGmqH8JFklhtqT9J762OvBNRswiTZ5vOnFCgawmuSi+RQe5J6SQCFmxCwDcEmBAwhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8BNvi1Qfvx/9OokAAAAASUVORK5CYII=","weather_rain_02":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAAA/klEQVR42u3XsQlCUQxA0SDWloKFUwiuYecCti5h4RJWNtZO8eAv8SYQ7CWNC2j5f0DPGeFCSBLBqFrPfet5UoJvZhKMbhkRaxmgdhteWs+dEtiEdV4RsZWBT+YSTGITEU8ZoPYkHVrPsxI4R2stJMAQ1npIAAAwudZzpQLU/oR3qaF2CIHiIby2nke5ofYvHFQA5yj89RAeWs+b5OAkBecoYBuCTQgYQnCSAjYhGEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+EFvazwun3QTl0oAAAAASUVORK5CYII=","weather_rain_03":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAABOklEQVR42u3bMUpDQRQF0EvQWAgpsoEUaawtbGyzhhRBO7ck2YFglzUEBlLbzyaEFDJNarHOfxbnrOBzh/vfYz4/4WpaHwcplJ/BqfWx/8/POHNMV7UQAdS/iT+lgElYayUClBBwOSAFTEJQQgArKSYhoIS10/BNCgAA1K2jLmcAAMpWsY0U4K/ZRAV8TPIkbigqYZK7+MEVytfRVx+roW4SJslPknuRQ10Jb5IsRQ5FJXxe334kObc+tmKH39NpSssk32KHmnU0Sb6SPIgdCrU+jq2PnSSgZhImyTwuaKC0hO9JXkQPtSvpyUoKdZMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAyVwAENY8aPJ8STIAAAAASUVORK5CYII=","weather_rain_04":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAABK0lEQVR42u3bsW3CUBQF0KdIbtiA2hNA65Zl0tBkBXZgAWpGoPvIokyX4heRImWI39BQ0uIH+BzJA/jKV+8KiQi4KbWN3md6Hz49AB51CZevcA1dQt7W0Hf/5ijAE0yisxRwCWWMDwQgd5KOUsAlBCWctV8RoIS5PkttJzGghHkWtweUMMPQd38R8V1q20gDJcxzjIidGFDCPEsRQLJS26nUtpcELmGen4hYiQElBAAAYFL+SQD3+WEGZlTCsdS2FjmYpGCOAnklPJTavsQOJimYo0BeCbeuISSWcOi7i9jBHAVMUgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAmNIVWYBBnLpkeSUAAAAASUVORK5CYII=","weather_rain_05":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAABVUlEQVR42u3asWkCQBQG4COY1kJshBSCY6R1BgvBIXSAQAIZwlZIb2Gt1YFLHGSPI5ARjEV8evd9E3j/+e5/iCkBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE3KpS6k8L+eRMAFm8YelZ0hhFjDXOpIDDxSc0xzqefGzvSlCXkYr7Pn7waPNTOEAFy9wp2dB2hyCK2jaA6g74dFE4Ih7Polnkgh/A7epWAdQhMChrBf21zqUgyh28heCr4EVlJNCBjCvq1zqZ9iACspmhAMIbErqTY0hAT6EYEhJNZQBBAsl/pmJdWEQICBCO7GKaX0IgYAgJvLpc6lQK/u5YeZD1eBIfQ5oPuV9CAFNGGssevAEALdr6T+toUmBAwhYCUFTQiGMLgNV64GAIC4dfQoBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/uQXzzVf8Q4Vvj0AAAAASUVORK5CYII=","weather_rain_06":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAAB4klEQVR42u3dIWvVURgG8IfhWBA3uEzBMBC0LTmTiCAYDTabzU9hFARtwsKazWAVwSCzHRzL2jzZaDLIMRhcFRYc7909v983+D/nPvd9uZx7bwIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPxfrY/XUjh7ayLgHwVcJNmUBNQW8UHr44kkTELqfE9ySwxKSJ2NJAsxQO1K+rD18XTFnunIJOQ8uZjkihiUkDq/k1wVA9Sub69aHy+spGfjgpcYp7BI8lMM1lHqHCe5uWLP1E8uJMD5Wd9aHwdWUpMQYNpJeG8Fn2m/9fHY6UJdCfeWYSW1jjIzlxC8E4+7rY9rkig9gzetj48m4bx2k9wQQ6mvSS4p4bw28/duJlC4Du23PvYkMS+TcDm4PqiEFPqV5LIYoHYlfd/68HUhk5BC2/EBjRJS6jDJIzFA7Up6JAWTEFDCqb0zDcFKikkIAADAjFofH6TAjJbpgxnXtlDCYr7OA0uwkn6SAiahaQhTl/CbI0EJa71sfbx1LChhna0kO44FJSxy5/r6cZIvrY/bjgYlrPM5yTNHgxLW2UnxLyLD9E7+kPK5JDAJ6/xIct/xoIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAnNofYdmAxQ9vUCQAAAAASUVORK5CYII=","weather_rain_07":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAABmElEQVR42u3doUpEQRQG4EGUBYMWjYKwomaDRaPBJvgU+xA+ggaxGEUwaRRsYhnwJU7zCaxTLJs1uHp273wfbNxwz+zPfxhYbikAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdKdGuzSFbs/+wRRmZ+kX3z02vm6NjWA+QggAAAAMVI32ZAp/z8UM31k2AiEk12eNtm0MkLuSvpuCJgQhpGtvNdqpMYCVdJbPM6nRTjQh5BlNP0LIwrir0Z6H8jBH45XrUsq+ELJIP9rbUsrGwB5rq0Y7FELIszZPKyn8qEY7GOAFzY2ThdwQvtZoO9ZRyLM6XUuBxDZMX7E1IQghpLfhuSlYh+j4DDQhWEe791Gj7RkDWEnRhCCE5Hms0SbGAFZSNCEIIXkutCFYSdGEANoQTQhCCAAAAP+qRrv0Ljx6NE8XM6PizbAIYaqrUsqZI4HclfTFFNCEudZrtE3HArlteG8KaMJcu44FIQS6X0n9kwBNCAghAABkcTkDAAAAAAAAAAAAAAAAAAAAAAAAAIvsCxkqdBkBqfB/AAAAAElFTkSuQmCC","weather_rain_08":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAACI0lEQVR42u3dsWpUQRgF4INGlAiBCFoJRtIppIiNYGMZEBQES4WAhX1AxIeQgK1ECPgEInZWDmwn2A/Y2QsRZCwsfAFJInP3zvf1S9gzOfn/OySbBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgMKW2g15f+Fmpbc8RDPlNd6/Uti+J07VyjNdcSbImuiFdSnJVDNP4iXhYatuRxJBnv19q25XE6TlzzNedT3JTfEM6SrIthr7raJJcS/JLfEPaTrIuhmmsJYtS23NJDHv2h5Lou46edJKy/M6KYBol/C7CIf1M8k0MAAD8Z6W2y1KY9jMh8/deBEoISsjQ3pTaHooB+j4XLqRgEoISMrQXpbaXM5vuH5WQZfI1yf2Zvad1JWSZ+CNumMD6tjO3C5qpvB+TkH/1WwRKiJUUhl9JX1tJTUKwjjK0D0k+z3DCbzlaGHglNQnBOkqpbUMK3c/gQAnHPfytJE8k0c+dzXO3k9xQwnFdSLIqBug7DXdLbXcl4ZmQfo6S3BKDEtLPxfi1MCWk68XA2yQ/Sm0PpKGE9LOWxGd8KiEdrSS5LgboqNT2qdT2WBImIf2s5u8lDUpIJ1+SuJyBzivpwkpqEgIMPQmfSgEAoNcq9k4KjGZqFzObjgQlBIZfSf1DSkxCQAkBKymYhKCEgJUUTEJg4BKW2vYcEUrYz6skjxwRSggAAAAAAAAAAAAAAAAAAADL7A9ca5Zp0eufGgAAAABJRU5ErkJggg==","weather_rain_09":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAABwCAYAAADoiRecAAACbklEQVR42u3dIWhVYRgG4Be3MdkYA4MwcShMUBgsLAxk1T5YHNjsNovJYLUYDIJhTTEYbOKw/HKzYDD8WAyCeUH+BcNg2Jy68d97z/Pky4Hzfve738c999yTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAIpbarUhj7Gu1LYboLfCCFwdb+pRROstgttT0+q+Nd+MvXLyjBYC2K4MTlJKs9PwXeqYFpKIv2rNS212MSJsmSEgzWNRGc+Jlk4ywONCtL+CdbSQ57juKRGgx2DVP737IotT3tsY4CZ7hNakL4P1+tJaj9hDMJYZKbsNR2X4SDnYaPpAAA9F9J3khhsLV/KwUAAM5/7bxTaluRxPlxnZA/2UxyXQyakH6Wk8yLAfqupC9KbTckYRLSz2ySGTFoQvo5TOLLGei8kh5M2fmsj8vvX01CTmthyi5VzGRM/t5FE3JaoyR703Iy22tzn3L8Z00wUSvcaMrOZ7fU9sAkhH5mk1zUhEyS99M0DbfX5l4lOdKETNKb9uEUntZRqe1e73EMQ3ZFH0BnpbbXpbYt6yj0s5xkXRNCP0tJboph2OvQRyl0r8Go1HbXJBwudRgP84oPff0QwcDXISlYgwBNOGjfS20bYgArKSYhaEL6+VBq2xcDWEkxCUET0s8T0xAAAAAAhqbUttPrxkroZdwuUXj8Fpqwsy9JLikLmrCT7bW5z0kWS207SoMm7GfeWoom7Ot5Es9HRxN2XEm/JblVarutPGjCflbjCxroa9qekQ6TNgmT42ekbyoRmrCvFSWCviupm1sxCQFNCAAAAAAAAAAAAMDZ+AXgdLZjIp4grgAAAABJRU5ErkJggg=="};
 const nameKey=n=>String(n||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
   .toLowerCase().replace(/[^a-z0-9]/g,'');
 const matches=n=>['raindance','dancadachuva'].includes(nameKey(n));
 const frames=Array.from({length:10},(_,i)=>{
  const im=new Image();im.decoding='async';
  im.src=originalFrames['weather_rain_'+String(i).padStart(2,'0')];
  return im;
 });
 const state={activations:0,blocked:0,recoveredCasts:0,lastGate:null,originalRendererFrames:0,
  fallbackFrames:0,failures:0,lastName:null,lastTime:null,frameCount:frames.length};
 const useMove=BattleEngine.prototype.useMove;
 BattleEngine.prototype.useMove=function(slot){
  const b=typeof battle==='undefined'?null:battle;
  const mon=b?.active&&typeof current==='function'?current():null;
  const move=mon&&typeof skillSet==='function'&&Number.isInteger(slot)?skillSet(mon)?.[slot]:null;
  if(!move||!matches(move.name))return useMove.apply(this,arguments);
  const energy=Number(b.energy),cooldown=Number(cooldowns[slot]||0);
  const now=performance.now();
  // Check the standard gameplay gates BEFORE trying the legacy handlers.
  const cost=Math.max(0,Number(move.cost)||0);
  const allowed=!!b.active&&!b.paused&&mon?.hp>0&&
    Number.isFinite(energy)&&energy>=cost&&Number(cooldowns[slot]||0)<=now;
  state.lastGate={active:!!b.active,paused:!!b.paused,hp:mon?.hp,
    energy,cost,cooldown:cooldowns[slot],now,allowed};
  const outcome=useMove.apply(this,arguments);
  let accepted=!!b?.active&&b===battle&&
    (outcome===true||(Number.isFinite(energy)&&Number(b.energy)<energy-.001)||
      Number(cooldowns[slot]||0)>Math.max(now,cooldown)+1);
  // Rain Dance is an unconditional field-weather status move. Old versions can
  // reject it before setting v32Weather. Recover ONLY an otherwise legal cast,
  // charging the original cost and cooldown once, never touching HP or attacks.
  if(!accepted&&allowed&&b===battle&&b.active&&mon?.hp>0){
   b.energy=Math.max(0,energy-cost);
   const cd=Math.max(650,Math.min(16000,Number(move.cd)||5700));
   cooldowns[slot]=now+cd;
   if(this.attackActs)this.attackActs.player=Math.max(this.attackActs.player||0,(this.time||0)+.36);
   state.recoveredCasts++;
   if(typeof log==='function')log((typeof D!=='undefined'?D[mon.id]?.name:'Pokémon')+' usou Rain Dance! CHUVA');
   accepted=true;
  }
  if(!accepted){state.blocked++;return outcome;}
  b.v32Weather='rain'; // the V35.64 PMD weather renderer reads this exact state
  b.v118RainCastAt=now;
  state.activations++;state.lastName=move.name;state.lastTime=now;
  return outcome;
 };
 const oldDraw=BattleEngine.prototype.draw;
 BattleEngine.prototype.draw=function(now){
  const b=typeof battle==='undefined'?null:battle;
  const needsRain=b?.active&&String(b.v32Weather||'').toLowerCase()==='rain';
  const native=needsRain&&window.PokemonTorreV3564WeatherDiagnostics?.();
  const countBefore=native?.framesDrawn||0;
  const result=oldDraw.apply(this,arguments);
  if(!needsRain||!this.ctx||!this.w||!this.h)return result;
  const n=window.PokemonTorreV3564WeatherDiagnostics?.();
  if(n?.framesDrawn>countBefore){state.originalRendererFrames++;return result;}
  // Fallback only if the native V35.64 weather renderer could not draw.
  // It draws the SAME ten source frames, not replacement art.
  const ctx=this.ctx,w=this.w,h=this.h,t=Number(now)||performance.now();
  ctx.save();
  try{
   ctx.beginPath();ctx.rect(0,h*.19,w,h*.80);ctx.clip();
   let drawn=false;
   for(let j=0;j<3;j++)for(let i=0;i<4;i++){
    const f=Math.floor(t/90+i*2+j*3)%10;
    const img=frames[f];
    if(!img?.complete||!img.naturalWidth)continue;
    ctx.save();ctx.globalAlpha=.48;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(img,(i-.12)*w/4,(j*.26+.21)*h,w*.27,h*.27);
    ctx.restore();drawn=true;
   }
   if(drawn)state.fallbackFrames++;
  }catch(e){state.failures++;console.warn('V118 original PMD rain fallback unavailable',e);}
  finally{ctx.restore();}
  return result;
 };
 // Browser QA only: use the real status-move engine, without changing saves.
 if(/^(localhost|127\.0\.0\.1)$/.test(location.hostname||'')&&
    window.PokemonTorreLocalCombatTestV47){
  const qa=window.PokemonTorreLocalCombatTestV47;
  qa.testRainDanceV118=()=>{
   try{
    qa.prepareVisualV116(130,false,false);
    if(typeof engine==='undefined'||!engine||!battle?.active)return {error:'engine not active'};
    const oldSkillSet=skillSet;
    const nativeBefore=window.PokemonTorreV3564WeatherDiagnostics?.();
    const weatherBefore=battle.v32Weather||'clear';
    const beforeEnergy=battle.energy;
    const previousCooldown=cooldowns[0];
    cooldowns[0]=0; // Fresh test battle, no carry-over timing from previous QA casts.
    battle.paused=false;
    if(current()?.hp<=0)current().hp=Math.max(1,current().maxHp||1);
    try{
     skillSet=function(mon){
      const list=oldSkillSet(mon);
      if(mon!==current())return list;
      const out=list.slice();
      out[0]={...out[0],name:'Rain Dance',type:'water',
       cat:'status',kind:'status',power:0,cost:0,cd:1500};
      return out;
     };
     engine.useMove(0);
    }finally{skillSet=oldSkillSet;}
    return {activated:battle.v32Weather==='rain',before:weatherBefore,
     energyBefore:beforeEnergy,energyAfter:battle.energy,
     cooldownBefore:previousCooldown,cooldownAfter:cooldowns[0],
     nativeBefore,diagnostics:window.PokemonTorreRainDanceV118.diagnostics()};
   }catch(error){return {error:String(error),stack:String(error?.stack||'')}}
  };
 }
 window.PokemonTorreRainDanceV118=Object.freeze({
  installed:true,source:'Original V35.64 PMD weather_rain_00..09',approvedRestore:true,
  matches,diagnostics:()=>({...state,framesReady:frames.filter(f=>f.complete&&f.naturalWidth>0).length,
    weather:(typeof battle!=='undefined'?battle?.v32Weather:null)||'clear'})
 });
})();