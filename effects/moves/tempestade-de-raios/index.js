/* Pokémon Torre V49 FINAL — Tempestade usa raios intermitentes que atingem o alvo.
 * O motor original continua responsável por dano, acerto, alcance,
 * recarga e movimento. Nenhuma prévia ou visual legado é desenhado.
 * O visual exibe oito fases animadas, com contorno preto.
 */
electricSpriteV46.add('tempestadederaios',{
 key:'thunderstorm',duration:2450,contact:false,storm:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  K.cinematic(g,f,t,ms,s,'tempestade');
 }
});
