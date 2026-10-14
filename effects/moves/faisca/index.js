/* Pokémon Torre V49 FINAL — Faísca conserva avanço físico do Pokémon; animação V49 final.
 * O motor original continua responsável por dano, acerto, alcance,
 * recarga e movimento. Nenhuma prévia ou visual legado é desenhado.
 * O visual exibe oito fases animadas, com contorno preto.
 */
electricSpriteV46.add('faisca',{
 key:'spark',duration:980,contact:true,contactStyle:'spark',followTarget:true,
 paint(g,f,t,ms,s,K){
  K.cinematic(g,f,t,ms,s,'faisca');
 }
});
