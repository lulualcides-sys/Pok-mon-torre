/* Pokémon Torre — V70 in-game Atelier launcher.
   Read-only preview, no BattleEngine changes or edits to protected moves. */
(()=>{
 'use strict';
 const ID='pt70-atelier-button',MODAL='pt70-atelier-modal';
 let restoreFocus=null;
 const css=[
 '#'+ID+'{position:fixed;left:11px;top:calc(12px + env(safe-area-inset-top, 0px));z-index:199998;',
 'display:flex;align-items:center;gap:5px;min-height:35px;border:1px solid #8abff5;',
 'border-radius:100px;padding:7px 11px;background:linear-gradient(140deg,#122b4fee,#06162ef1);',
 'color:#e7f8ff;font:800 11px/1.2 system-ui,sans-serif;letter-spacing:.07em;',
 'box-shadow:0 4px 20px #0008;cursor:pointer}',
 '#'+ID+':focus-visible,#pt70-close:focus-visible{outline:3px solid #80d6ff;outline-offset:2px}',
 '#'+MODAL+'{position:fixed;inset:0;z-index:200000;background:#040917f6;',
 'display:flex;flex-direction:column;padding-top:env(safe-area-inset-top, 0px)}',
 '#'+MODAL+'[hidden]{display:none}',
 '#pt70-top{min-height:44px;display:flex;align-items:center;justify-content:space-between;',
 'gap:15px;padding:4px 11px;background:#061429;border-bottom:1px solid #426c98;',
 'color:#cce9ff;font:800 12px system-ui,sans-serif}',
 '#pt70-close{border:1px solid #6da9e0;background:#1b3855;color:white;',
 'border-radius:8px;padding:7px 11px;cursor:pointer;font:800 13px system-ui,sans-serif}',
 '#pt70-iframe{border:0;width:100%;height:100%;flex:1;background:#080e20}',
 '@media(max-width:700px){#'+ID+'{font-size:10px;max-width:100px}}'
 ].join('');
 function mount(){
  if(document.getElementById(ID)||!document.body)return;
  const style=document.createElement('style');style.id='pt70-style';style.textContent=css;document.head.append(style);
  const btn=document.createElement('button');btn.id=ID;btn.type='button';
  btn.textContent='✦ ATELIÊ';btn.setAttribute('aria-haspopup','dialog');
  btn.setAttribute('aria-controls',MODAL);btn.title='Abrir prévias animadas de quatro golpes';
  const modal=document.createElement('section');modal.id=MODAL;modal.hidden=true;
  modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-label','Ateliê dos golpes — quatro prévias animadas');
  const bar=document.createElement('div');bar.id='pt70-top';
  const label=document.createElement('span');label.textContent='✦ POKÉMON TORRE · ATELIÊ DE GOLPES';
  const closeBtn=document.createElement('button');closeBtn.id='pt70-close';
  closeBtn.type='button';closeBtn.textContent='✕ Fechar';
  bar.append(label,closeBtn);modal.append(bar);
  const iframe=document.createElement('iframe');iframe.id='pt70-iframe';
  iframe.title='Quatro animações em PixiJS: Dragon Pulse, Aura Sphere, X-Scissor e Dragon Claw';
  modal.append(iframe);
  function open(){
   if(!modal.hidden)return;
   restoreFocus=document.activeElement;modal.hidden=false;
   iframe.src='previews/atelier-v70.html?embedded=1&art=v71';
   btn.setAttribute('aria-expanded','true');closeBtn.focus();
  }
  function close(){
   if(modal.hidden)return;
   modal.hidden=true;iframe.removeAttribute('src');btn.setAttribute('aria-expanded','false');
   if(restoreFocus?.focus)restoreFocus.focus();
  }
  btn.addEventListener('click',open);closeBtn.addEventListener('click',close);
  modal.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden){e.preventDefault();close()}});
  document.body.append(btn,modal);
  window.PokemonTorreAtelierV70={open,close,version:'71.0',
   active:()=>!modal.hidden,moves:['Dragon Pulse','Aura Sphere','X-Scissor','Dragon Claw']};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();