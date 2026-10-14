/* Pokémon Torre V49 FINAL — Trovão usa um único raio principal ramificado com impacto.
 * O motor original continua responsável por dano, acerto, alcance,
 * recarga e movimento. Nenhuma prévia ou visual legado é desenhado.
 * O visual exibe oito fases animadas, com contorno preto.
 */
electricSpriteV46.add('trovao',{
 key:'thunder',duration:2100,contact:false,giantBolt:true,followTarget:true,
 paint(g,f,t,ms,s,K){
  K.cinematic(g,f,t,ms,s,'trovao');
 }
});
