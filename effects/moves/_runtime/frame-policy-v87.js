/* V87 | Standard for NEW move sprite authoring. Existing approved atlases
 * retain their native number of frames until separately approved/rebuilt.
 * Logical interpolation in PixiJS does not require duplicating textures.
 */
const framePolicyV87=(()=>{
 'use strict';
 const PRESETS=Object.freeze({
  light:Object.freeze({frames:8,particles:12,layers:2,concurrent:3}),
  medium:Object.freeze({frames:12,particles:20,layers:3,concurrent:2}),
  heavy:Object.freeze({frames:16,particles:28,layers:4,concurrent:1})
 });
 const allowed=new Set([8,12,16]);
 function classify({duration=0,layers=1,particles=0,area=false,persistent=false}={}){
  if(persistent||layers>=4||particles>=25||duration>=1800)return 'heavy';
  if(area||layers>=2||particles>=9||duration>=950)return 'medium';
  return 'light';
 }
 function plan(options={}){
  const weight=PRESETS[options.weight]?options.weight:classify(options);
  const preset=PRESETS[weight];
  const nativeFrames=allowed.has(options.nativeFrames)?options.nativeFrames:null;
  const mobile=!!options.mobile;
  return Object.freeze({
   weight,frames:preset.frames,nativeFrames,
   // Heavy effects use more authored stages but fewer simultaneous instances.
   maxParticles:mobile?Math.max(6,Math.floor(preset.particles*.65)):preset.particles,
   maxLayers:preset.layers,maxConcurrent:preset.concurrent,
   interpolation:'position,scale,rotation,alpha',
   needsRebuild:nativeFrames!==null&&nativeFrames!==preset.frames
  });
 }
 function validFrames(count){return allowed.has(count);}
 return Object.freeze({version:'87.0',presets:PRESETS,classify,plan,validFrames});
})();
window.PokemonTorreFramePolicyV87=framePolicyV87;
