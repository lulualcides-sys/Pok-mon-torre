/* Pokémon Torre V49 FINAL — Discharge gera descargas radiais menores, sem fios sobrepostos.
 * O motor original continua responsável por dano, acerto, alcance,
 * recarga e movimento. Nenhuma prévia ou visual legado é desenhado.
 * O visual exibe oito fases animadas, com contorno preto.
 */
electricSpriteV46.add('discharge',{
 key:'discharge',duration:1550,contact:false,area:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  K.cinematic(g,f,t,ms,s,'discharge');
 }
});
