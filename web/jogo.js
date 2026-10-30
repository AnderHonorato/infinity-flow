/* Infinity Flow · Capítulo I — motor original em português */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const HEROIS = [
  {id:'astra',nome:'Astra',classe:'Espadachim Astral',cor:'#f5cb98',sombra:'#9f5b9d',descricao:'Uma guardiã da alvorada que transforma determinação em golpes de luz.',atributo:'DANO EQUILIBRADO',arma:'✧'},
  {id:'kael',nome:'Kael',classe:'Guardião Rúnico',cor:'#9bdcdd',sombra:'#327eac',descricao:'Protetor das antigas muralhas. Sua armadura resiste ao fim dos mundos.',atributo:'MAIS RESISTÊNCIA',arma:'◆'},
  {id:'nix',nome:'Nix',classe:'Tecelã do Vazio',cor:'#d4b4fc',sombra:'#894ab5',descricao:'Uma conjuradora inquieta que acelera o tempo entre os seus ataques.',atributo:'MAIS VELOCIDADE',arma:'✦'}
];
const MELHORIAS = [
  {id:'arma',nome:'Força da arma',icone:'⚔',descricao:'Aumenta o dano causado',base:24,fator:1.37},
  {id:'ritmo',nome:'Ritmo de combate',icone:'⌁',descricao:'Ataques automáticos mais fortes',base:42,fator:1.48},
  {id:'armadura',nome:'Armadura viva',icone:'◈',descricao:'Aumenta vida máxima',base:33,fator:1.42},
  {id:'magia',nome:'Núcleo astral',icone:'✶',descricao:'Aprimora dano das habilidades',base:95,fator:1.62}
];
const HABILIDADES = [
  {id:'rajada',icone:'✹',nome:'Rajada solar',descricao:'Explosão de dano no inimigo',base:130,recarga:10},
  {id:'escudo',icone:'◈',nome:'Escudo de aura',descricao:'Recupera e protege sua vida',base:180,recarga:17},
  {id:'cometa',icone:'☄',nome:'Chuva de cometas',descricao:'Destruição celestial concentrada',base:380,recarga:23}
];
const NOMES = ['Rastejante do Eclipse','Vigia da Fenda','Murmúrio Sombrio','Garra do Crepúsculo','Andarilho Oco','Sussurro da Névoa','Arauto do Breu','Peregrino da Noite','Sombra Espinhosa','Ceifador Umbral','Guardião do Limiar'];
const CHAVE='infinity-flow-salvo-v1';
const inicio = () => ({
  versao:1,iniciado:false,heroi:'astra',escolhido:'astra',ouro:15,essencia:0,nivel:1,xp:0,
  vida:110,onda:1,melhorias:{arma:0,ritmo:0,armadura:0,magia:0},
  poderes:{rajada:0,escudo:0,cometa:0},concluido:false,abates:0,mortes:0,
  ultimoRegistro:Date.now(),som:true,pausado:false
});
let dados=inicio();
try {
  const salvos=JSON.parse(localStorage.getItem(CHAVE)||'null');
  if(salvos && salvos.versao===1) {
    dados={...inicio(),...salvos,melhorias:{...inicio().melhorias,...salvos.melhorias},poderes:{...inicio().poderes,...salvos.poderes}};
  }
} catch(erro) {console.warn('Não foi possível ler o progresso:',erro);}
let inimigo=null;
let desenhando=false,ultimoQuadro=0,ultimoSalvamento=0,segundos=0,tempoAviso=0;
let queda=0,tremor=0,flash=0,faiscas=[],numeros=[],fimDaCena=false,tempoProximoAtaque=4;
let recargas={rajada:0,escudo:0,cometa:0};
let contexto=null;
const canvas=$('tela-batalha');
if(canvas) contexto=canvas.getContext('2d',{alpha:false});
const numero=valor => {
  if(!Number.isFinite(valor))return '∞';
  if(valor<1000)return Math.floor(valor).toLocaleString('pt-BR');
  const unidades=['','mil','mi','bi','tri','qua','qui','sex','sep'];
  let indice=Math.floor(Math.log10(Math.max(1,valor))/3);
  if(indice>=unidades.length)return valor.toExponential(2).replace('e+','e');
  return (valor/Math.pow(1000,indice)).toFixed(indice>1?2:1).replace('.',',')+' '+unidades[indice];
};
const heroiAtual=()=>HEROIS.find(h=>h.id===dados.heroi)||HEROIS[0];
const nivelVisual=()=>dados.nivel>=40?4:dados.nivel>=22?3:dados.nivel>=10?2:1;
const experienciaNecessaria=()=>Math.floor(30*Math.pow(1.21,Math.min(350,dados.nivel-1)));
const vidaMaxima=()=>Math.floor((100+dados.melhorias.armadura*35+dados.nivel*10)*(dados.heroi==='kael'?1.35:1));
const danoSegundo=()=>Math.max(1,Math.floor((8+dados.melhorias.arma*5)*Math.pow(1.11,dados.melhorias.arma)*(1+dados.melhorias.ritmo*.22)*(1+dados.nivel*.13)*(dados.heroi==='nix'?1.25:1)));
const poderClique=()=>Math.floor(danoSegundo()*.7+5);
const custo=melhoria=>Math.floor(melhoria.base*Math.pow(melhoria.fator,dados.melhorias[melhoria.id]));
const custoHabilidade=habilidade=>Math.floor(habilidade.base*Math.pow(2.25,dados.poderes[habilidade.id]));
const ehChefe=onda=>onda===12;
const ehMinichefe=onda=>onda===4||onda===8||(onda>12 && onda%8===0);
const hpBase=onda=>{
  const crescente=75*Math.pow(1.27,Math.min(onda-1,950));
  return Math.max(1,Math.floor(crescente*(ehChefe(onda)?6.5:ehMinichefe(onda)?2.5:1)));
};
const obterInimigo=onda=>{
  const chefe=ehChefe(onda),mini=ehMinichefe(onda);
  let nome=chefe?"Vor'Kal, o Olho do Vazio":onda===4?'Zaruk, o Quebra-Rochas':onda===8?'Naerys, a Guardiã Oca':onda>12?(mini?'Eclipse Ancião':'Eco Umbral · '+((onda-13)%7+1)):NOMES[(onda-1)%NOMES.length];
  return {nome,classe:chefe?'TITÃ COLOSSAL':mini?'MINICHEFE · RAÇA UMBRAL':'RAÇA UMBRAL',chefao:chefe,mini,hp:hpBase(onda),vida:hpBase(onda),variante:onda%5};
};
function salvar(){dados.ultimoRegistro=Date.now();try{localStorage.setItem(CHAVE,JSON.stringify(dados));}catch(erro){console.warn('Falha ao salvar',erro);}}
function notificar(titulo,mensagem){
  const caixa=document.createElement('div');caixa.className='notificacao';
  const forte=document.createElement('strong');forte.textContent=titulo;
  const pequeno=document.createElement('small');pequeno.textContent=mensagem;
  caixa.append(forte,pequeno);$('notificacoes').appendChild(caixa);
  setTimeout(()=>caixa.remove(),4500);
}
function modal(html){
  $('conteudo-modal').innerHTML=html;
  $('modal-fundo').classList.remove('escondido');
}
function fecharModal(){$('modal-fundo').classList.add('escondido');}
function registrar(frase){$('texto-registro').textContent=frase;}
function musica(frequencia=540,duracao=.13){
  if(!dados.som)return;
  try{
    const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    if(!musica.ctx)musica.ctx=new C();
    const ctx=musica.ctx;
    if(ctx.state==='suspended')ctx.resume();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.value=frequencia;
    o.frequency.exponentialRampToValueAtTime(Math.max(100,frequencia*.5),ctx.currentTime+duracao);
    g.gain.setValueAtTime(.055,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duracao);
    o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+duracao);
  }catch(_){}
}
function pontoNumero(x,y,texto,cor='#ffe9b1'){
  numeros.push({x,y,texto,cor,vida:1.2});
  if(numeros.length>35)numeros.shift();
}
function faiscar(x,y,cor='#f5b886',quantidade=12){
  for(let i=0;i<quantidade;i++){
    const angulo=Math.random()*Math.PI*2,vel=45+Math.random()*145;
    faiscas.push({x,y,vx:Math.cos(angulo)*vel,vy:Math.sin(angulo)*vel-35,vida:.5+Math.random()*.5,cor,raio:1.4+Math.random()*4});
  }
  if(faiscas.length>170)faiscas=faiscas.slice(-170);
}
function retratoSVG(h,pequeno=false){
  const cor=h.cor,segundo=h.sombra;
  return '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
  '<defs><linearGradient id="c'+h.id+'" x2=".8" y2="1"><stop stop-color="'+cor+'"/><stop offset="1" stop-color="'+segundo+'"/></linearGradient></defs>'+
  '<ellipse cx="60" cy="133" rx="32" ry="5" fill="#080c1a" opacity=".45"/>'+
  '<path d="M36 77Q11 100 28 130L60 114 88 130Q113 100 85 77" fill="'+segundo+'" stroke="#111728" stroke-width="4"/>'+
  '<path d="M45 75L77 75 92 120 30 120Z" fill="url(#c'+h.id+')" stroke="#10192a" stroke-width="5"/>'+
  '<path d="M47 86L60 99 75 86" stroke="#fff5d1" stroke-width="5" fill="none" opacity=".7"/>'+
  '<path d="M31 79L23 105M89 80L99 105" stroke="#141c2e" stroke-width="12" stroke-linecap="round"/>'+
  '<path d="M35 77Q21 52 41 29Q59 11 81 28Q100 49 84 77Q58 90 35 77" fill="#1d2943" stroke="#0c1528" stroke-width="5"/>'+
  '<path d="M39 50Q48 20 60 31Q75 21 82 50" fill="'+cor+'" opacity=".72"/>'+
  '<path d="M47 58l9 2-9 5zm26 0l-9 2 9 5z" fill="#ffefce"/>'+
  '<path d="M29 24L36 9L48 24M71 24L84 8L93 29" fill="'+segundo+'" stroke="#111729" stroke-width="5"/>'+
  (h.id==='astra'?'<path d="M96 22l7 45-13 4 2-47z" fill="#f5daa3" stroke="#202b3e" stroke-width="3"/>':h.id==='kael'?'<path d="M13 83l13-14 18 14-9 21-18-4z" fill="#aee5da" stroke="#172a37" stroke-width="3"/>':'<circle cx="100" cy="44" r="14" fill="none" stroke="#dab5ff" stroke-width="5"/>')+
  (!pequeno?'<path d="M25 125q35 15 70 0" fill="none" stroke="'+cor+'" stroke-width="3" opacity=".5"/>':'')+'</svg>';
}
function escolher(id){
  dados.escolhido=id;
  document.querySelectorAll('.carta-heroi').forEach(c=>c.classList.toggle('ativo',c.dataset.heroi===id));
  const h=HEROIS.find(g=>g.id===id);
  $('perfil-heroi').innerHTML='<div><strong>'+h.nome+' · '+h.classe+'</strong><p>'+h.descricao+'</p></div><span>'+h.atributo+'</span>';
  $('lista-herois').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.heroi===id)));
}
function mostrarEscolha(){
  $('lista-herois').innerHTML=HEROIS.map(h=>'<button class="carta-heroi" data-heroi="'+h.id+'" style="--cor-heroi:'+h.cor+'" aria-pressed="false"><div class="mini-personagem">'+retratoSVG(h)+'</div><strong>'+h.nome+'</strong><small>'+h.classe+'</small></button>').join('');
  $('lista-herois').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{escolher(b.dataset.heroi);musica(750,.07);}));
  escolher(dados.escolhido||'astra');
}
function iniciarJornada(){
  dados.heroi=dados.escolhido;dados.iniciado=true;
  dados.vida=vidaMaxima();
  $('tela-inicial').classList.add('escondido');$('tela-jogo').classList.remove('escondido');
  $('retrato-heroi').innerHTML=retratoSVG(heroiAtual(),true);
  $('nome-heroi-jogo').textContent=heroiAtual().nome;
  $('botao-pausar').textContent=dados.pausado?'Retomar':'Pausar';
  inimigo=obterInimigo(dados.onda);
  if(dados.concluido && dados.onda<=12){dados.onda=13;inimigo=obterInimigo(dados.onda);}
  criarInterfaceHabilidades();atualizarPainel();salvar();
  if(!desenhando){desenhando=true;requestAnimationFrame(atualizarQuadro);}
  registrar('A sombra se move. '+heroiAtual().nome+' já está atacando automaticamente.');
}
function criarInterfaceHabilidades(){
  $('lista-habilidades').innerHTML=HABILIDADES.map(h=>'<button class="habilidade" id="habilidade-'+h.id+'" aria-label="'+h.nome+'" title="'+h.nome+'"><span>'+h.nome.split(' ')[0]+'</span>'+h.icone+'</button>').join('');
  HABILIDADES.forEach(h=>$('habilidade-'+h.id).addEventListener('click',()=>habilidade(h.id)));
}
function recompensa(vitorias=1,ouroExtra=0){
  const ouro=ouroExtra||Math.floor((18+dados.onda*5)*Math.pow(1.245,Math.min(ondaLimitada(),450))*(ehMinichefe(dados.onda)?2:1));
  const xp=Math.floor((12+dados.onda*4)*Math.pow(1.16,Math.min(dados.onda-1,240)));
  dados.ouro+=ouro*vitorias;dados.xp+=xp*vitorias;dados.abates+=vitorias;
  while(dados.xp>=experienciaNecessaria() && dados.nivel<1000000){
    dados.xp-=experienciaNecessaria();dados.nivel++;
    dados.vida=Math.min(vidaMaxima(),dados.vida+vidaMaxima()*.25);
    if([10,22,40].includes(dados.nivel)){notificar('Evolução visual!','Seu guardião despertou uma nova forma.');faiscar(230,470,heroiAtual().cor,45);}
  }
  return ouro*vitorias;
}
function ondaLimitada(){return Math.max(0,dados.onda-1);}
function matarInimigo(){
  if(!inimigo || fimDaCena)return;
  const chefe=inimigo.chefao,mini=inimigo.mini,nome=inimigo.nome;
  const ouro=recompensa(1);
  faiscar(795,430,chefe?'#f7c179':'#d0b0fc',chefe?100:32);
  pontoNumero(790,305,'+'+numero(ouro)+' OURO','#ffe6a3');
  musica(chefe?170:550,chefe?.55:.17);
  if(chefe){
    dados.concluido=true;dados.essencia+=3;queda=.001;fimDaCena=true;
    dados.onda=13;registrar("Vor'Kal tombou! O penhasco se parte e novas rotas se revelam.");
    $('cena').classList.add('vencendo');salvar();return;
  }
  dados.onda++;
  inimigo=obterInimigo(dados.onda);
  if(mini){
    dados.essencia++;notificar('Minichefe vencido!',nome+' deixou um fragmento de essência.');
  }
  if(ehChefe(dados.onda)){
    notificar('O penhasco despertou',"Um olho gigantesco se abre no limite do mundo.");
    registrar('O titã observa o horizonte. Prepare suas habilidades!');
  }else registrar('Inimigo abatido. +'+numero(ouro)+' ouro · Próximo encontro: '+inimigo.nome+'.');
  salvar();
}
function sofrerAtaque(quantidade,tipo){
  if(dados.vida<=0 || !dados.iniciado || dados.pausado)return;
  if(recargas.protecao>0)quantidade*=.4;
  dados.vida=Math.max(0,dados.vida-quantidade);
  tremor=Math.max(tremor,.35);flash=.3;
  pontoNumero(220,420,'-'+numero(quantidade),'#f2a4ab');
  if(dados.vida<=0){
    dados.mortes++;recargas.ressurgir=2.4;
    registrar(heroiAtual().nome+' caiu, mas a energia do Flow o trará de volta.');
  } else if(tipo==='laser')registrar('Laser ocular! O olho do titã rasgou o campo de batalha.');
}
function atacar(dano,toque=false){
  if(!inimigo || dados.pausado||fimDaCena||dados.vida<=0)return;
  inimigo.vida=Math.max(0,inimigo.vida-dano);
  if(toque){pontoNumero(770+Math.random()*80,360,'-'+numero(dano),heroiAtual().cor);faiscar(775,415,heroiAtual().cor,7);musica(790,.06);}
  if(inimigo.vida<=0)matarInimigo();
}
function habilidade(id){
  const h=HABILIDADES.find(p=>p.id===id);
  if(!h || !dados.iniciado)return;
  if(!dados.poderes[id]){
    const preco=custoHabilidade(h);
    if(dados.ouro<preco){notificar('Ouro insuficiente','É necessário '+numero(preco)+' de ouro para aprender '+h.nome+'.');return;}
    dados.ouro-=preco;dados.poderes[id]=1;
    notificar('Nova habilidade aprendida!',h.nome+' está disponível no combate.');salvar();atualizarPainel();return;
  }
  if((recargas[id]||0)>0 || dados.pausado || fimDaCena)return;
  recargas[id]=h.recarga;
  const bonus=(1+dados.melhorias.magia*.45)*dados.poderes[id];
  if(id==='rajada'){atacar(danoSegundo()*8*bonus);faiscar(800,330,'#ffe29c',50);registrar('A rajada solar iluminou as ruínas.');}
  if(id==='escudo'){dados.vida=Math.min(vidaMaxima(),dados.vida+vidaMaxima()*.58*bonus);recargas.protecao=8;faiscar(210,440,'#9edfd2',28);registrar('Um escudo de aura protege o guardião.');}
  if(id==='cometa'){atacar(danoSegundo()*20*bonus);faiscar(800,295,'#dcbaff',85);registrar('Cometas caíram do céu e partiram a escuridão!');}
  musica(id==='cometa'?140:600,.33);salvar();atualizarPainel();
}
function melhorar(id){
  const m=MELHORIAS.find(o=>o.id===id);if(!m)return;
  const preco=custo(m);
  if(dados.ouro<preco)return;
  dados.ouro-=preco;dados.melhorias[id]++;
  if(id==='armadura')dados.vida+=35;
  if(id==='arma' && dados.melhorias.arma%5===0)faiscar(210,420,heroiAtual().cor,35);
  musica(830,.16);atualizarPainel();salvar();
}
function atualizarPainel(){
  if(!dados.iniciado)return;
  $('valor-ouro').textContent=numero(dados.ouro);
  $('valor-essencia').textContent=numero(dados.essencia);
  $('valor-dps').textContent=numero(danoSegundo());
  $('nome-local').textContent=dados.onda>12?'Ecos do Abismo':'Trilha das Sombras';
  $('frase-local').textContent=dados.onda>12?'A primeira passagem foi liberta. O eco da escuridão permanece.':'A raça Umbral guarda a passagem para o penhasco.';
  $('texto-onda').textContent=dados.onda>12?'ECO INFINITO · '+numero(dados.onda):'ENCONTRO '+String(dados.onda).padStart(2,'0')+' / 12';
  $('grande-nivel').textContent=numero(dados.nivel);
  $('nivel-heroi').textContent='Nível '+numero(dados.nivel)+' · Forma '+nivelVisual();
  $('texto-xp').textContent=numero(dados.xp)+' / '+numero(experienciaNecessaria());
  $('barra-xp').style.width=Math.min(100,dados.xp/experienciaNecessaria()*100)+'%';
  $('barra-heroi').style.width=Math.max(0,dados.vida/vidaMaxima()*100)+'%';
  const estagios=['Aprendiz de luz','Desperto astral','Guardião elevado','Forma ascendente'];
  $('texto-evolucao').textContent=estagios[nivelVisual()-1]+' · Sua armadura e sua aura mudam conforme o nível.';
  $('nome-inimigo').textContent=inimigo?inimigo.nome:'Passagem liberta';
  $('alvo-tipo').textContent=inimigo?inimigo.classe:'TITÃ DERROTADO';
  $('vida-inimigo').textContent=inimigo?numero(Math.max(0,inimigo.vida))+' / '+numero(inimigo.hp)+' PV':'Vitória';
  $('barra-inimigo').style.width=(inimigo?100*inimigo.vida/inimigo.hp:0)+'%';
  $('trilha-progresso').innerHTML=Array.from({length:12},(_,i)=>'<span class="marco '+(i===11?'boss ':'')+(dados.concluido||i+1<dados.onda?'feito':i+1===dados.onda?'agora':'')+'"></span>').join('');
  $('lista-melhorias').innerHTML=MELHORIAS.map(m=>{const preco=custo(m);
    return '<div class="melhoria"><div class="melhoria-icone">'+m.icone+'</div><div class="melhoria-nome"><strong>'+m.nome+'</strong><span>Nível '+numero(dados.melhorias[m.id])+' · '+m.descricao+'</span></div><button class="botao-melhoria" data-melhoria="'+m.id+'" '+(dados.ouro<preco?'disabled':'')+'>✦ '+numero(preco)+'</button></div>';
  }).join('')+'<div class="titulo-upgrades"><h4>Despertar poderes</h4></div>'+HABILIDADES.map(h=>'<div class="melhoria"><div class="melhoria-icone">'+h.icone+'</div><div class="melhoria-nome"><strong>'+h.nome+'</strong><span>'+ (dados.poderes[h.id]?'Aprendido · recarga '+h.recarga+'s':h.descricao)+'</span></div><button class="botao-melhoria" data-poder="'+h.id+'" '+(dados.poderes[h.id]||dados.ouro<custoHabilidade(h)?'disabled':'')+'>'+ (dados.poderes[h.id]?'✓':'✦ '+numero(custoHabilidade(h)))+'</button></div>').join('');
  document.querySelectorAll('[data-melhoria]').forEach(b=>b.addEventListener('click',()=>melhorar(b.dataset.melhoria)));
  document.querySelectorAll('[data-poder]').forEach(b=>b.addEventListener('click',()=>habilidade(b.dataset.poder)));
  for(const h of HABILIDADES){
    const b=$('habilidade-'+h.id);if(!b)continue;
    const r=Math.ceil(recargas[h.id]||0);
    b.disabled=!!(dados.poderes[h.id]&&r)||dados.pausado;
    b.innerHTML=h.icone+'<span>'+(dados.poderes[h.id]?(r?r+'s':h.nome.split(' ')[0]):'COMPRAR')+'</span>';
    b.title=h.nome+(dados.poderes[h.id]?' · Ativar':' · Comprar por '+numero(custoHabilidade(h))+' ouro');
  }
}
function progressoAusente(){
  if(!dados.iniciado)return;
  const agora=Date.now(),sec=Math.min(8*3600,Math.max(0,(agora-(dados.ultimoRegistro||agora))/1000));
  if(sec<35)return;
  const oAntes=dados.onda;
  const forca=danoSegundo();
  let restante=sec,abates=0,ganhos=0;
  while(restante>2 && dados.onda<12 && abates<100){
    let duracao=hpBase(dados.onda)/Math.max(1,forca)*1.15;
    if(duracao>restante)break;
    restante-=Math.max(1,duracao);
    ganhos+=recompensa(1);
    dados.onda++;abates++;
  }
  if(dados.onda>=12||dados.concluido){
    const rendimento=Math.floor(restante*Math.max(1,forca)*.15);
    dados.ouro+=rendimento;ganhos+=rendimento;
  }
  if(abates||ganhos){
    salvar();
    modal('<span class="sobrelinha">VOCÊ VOLTOU</span><h2 class="modal-titulo">A jornada não parou. ✦</h2><p class="modal-texto">Seu guardião lutou por '+Math.round(sec/60)+' minuto(s) enquanto você estava fora. '+(dados.onda===12?'O chefe espera sua presença.':'Os ecos continuam sendo explorados.')+'</p><ul class="modal-lista"><li>✦ <strong>+'+numero(ganhos)+' ouro</strong> conquistado</li><li>⚔ <strong>'+abates+' inimigos</strong> derrotados automaticamente</li><li>⌁ Progresso do encontro '+oAntes+' ao '+dados.onda+'</li></ul><button class="botao-principal" id="continuar-modal">Continuar aventura <span>↗</span></button>');
    $('continuar-modal').addEventListener('click',fecharModal);
  }
}
function mapa(){
 const unlocked=dados.concluido;
 const nos=[
 {x:310,y:400,r:29,nome:'Trilha Umbral',sub:'Capítulo I · concluído',ativo:true},
 {x:310,y:265,r:30,nome:'Penhasco',sub:unlocked?'Vor’Kal derrotado':'Chefe bloqueando',ativo:unlocked},
 {x:130,y:115,r:25,nome:'Bosque do Eco',sub:'Capítulo II · em criação',ativo:false},
 {x:490,y:115,r:25,nome:'Cidade de Vidro',sub:'Capítulo II · em criação',ativo:false}
 ];
 const linhas='<path class="mapa-trilha ativo" d="M310 370L310 295"/>'+
 '<path class="mapa-trilha '+(unlocked?'ativo':'')+'" d="M298 240Q235 185 130 144"/>'+
 '<path class="mapa-trilha '+(unlocked?'ativo':'')+'" d="M322 240Q389 185 490 144"/>';
 const desenho=nos.map((n,i)=>'<g><circle class="mapa-no '+(n.ativo?'ativo':'fechado')+'" cx="'+n.x+'" cy="'+n.y+'" r="'+n.r+'"/><text x="'+n.x+'" y="'+(n.y+5)+'" text-anchor="middle" fill="'+(n.ativo?'#152138':'#b9c3d5')+'" font-size="20">'+(i===0?'✦':i===1?'◈':i===2?'♣':'✧')+'</text><text class="mapa-rotulo" x="'+n.x+'" y="'+(n.y+52)+'">'+n.nome+'</text><text class="mapa-sub" x="'+n.x+'" y="'+(n.y+69)+'">'+n.sub+'</text></g>').join('');
 modal('<span class="sobrelinha">CARTOGRAFIA DAS ESTRELAS</span><h2 class="modal-titulo">Árvore de caminhos</h2><p class="modal-texto">Cada chefe abre novos ramos do infinito. O primeiro mundo tem 12 encontros e dois guardiões menores. Os mundos seguintes serão criados fase por fase.</p><svg viewBox="0 0 620 500" class="mapa-svg" role="img" aria-label="Mapa com Trilha Umbral, Penhasco, Bosque do Eco e Cidade de Vidro">'+linhas+desenho+'</svg><div class="selos"><span>✦ Fase inicial '+(unlocked?'concluída':'em andamento')+'</span><span>◇ '+numero(dados.essencia)+' essências</span></div>');
}
function detalhes(){
 const h=heroiAtual();
 modal('<span class="sobrelinha">COMPÊNDIO DE GUARDIÕES</span><h2 class="modal-titulo">'+h.nome+' · '+h.classe+'</h2><div style="display:flex;align-items:center;gap:25px;margin:20px 0"><div style="width:150px;height:170px">'+retratoSVG(h)+'</div><p class="modal-texto">'+h.descricao+'<br><br>Forma visual '+nivelVisual()+' de 4 · Despertar seguinte no nível '+(dados.nivel<10?'10':dados.nivel<22?'22':dados.nivel<40?'40':'máximo visual atual')+'.</p></div><ul class="modal-lista"><li>⚔ Dano por segundo: <strong>'+numero(danoSegundo())+'</strong></li><li>♥ Vida máxima: <strong>'+numero(vidaMaxima())+'</strong></li><li>✧ Derrotas da raça Umbral: <strong>'+numero(dados.abates)+'</strong></li><li>◇ Essência conquistada: <strong>'+numero(dados.essencia)+'</strong></li></ul>');
}
function introducao(){
 modal('<span class="sobrelinha">GUIA DO GUARDIÃO</span><h2 class="modal-titulo">Seu mundo está vivo.</h2><p class="modal-texto">Seus heróis enfrentam monstros automaticamente. Toque no campo para acrescentar ataques. Derrote inimigos, gaste ouro em melhorias e compre habilidades: ao aprendê-las, você poderá ativá-las abaixo da batalha.</p><ul class="modal-lista"><li><strong>4º encontro:</strong> Zaruk, um minichefe das cavernas.</li><li><strong>8º encontro:</strong> Naerys, guardiã do vazio.</li><li><strong>12º encontro:</strong> Vor’Kal, titã do penhasco. Cuidado com o laser ocular!</li><li><strong>Offline:</strong> calcula o que seu herói conquistou ao voltar, até oito horas. O chefe final requer sua presença.</li><li><strong>Depois do chefe:</strong> acesso ao Eco Infinito enquanto os outros mundos são desenvolvidos.</li></ul>');
}
function fimDoChefe(){
  fimDaCena=false;queda=0;tremor=0;inimigo=obterInimigo(dados.onda);
  $('cena').classList.remove('vencendo');
  modal('<span class="sobrelinha">O ABISMO TREMEU</span><h2 class="modal-titulo">O titã caiu. O mundo mudou.</h2><p class="modal-texto">Vor’Kal desapareceu nas profundezas do penhasco. As raízes da escuridão se romperam e duas novas rotas surgiram no horizonte.</p><ul class="modal-lista"><li>◇ <strong>+3 essências</strong> do titã</li><li>⌁ <strong>Árvore de caminhos liberada</strong></li><li>✧ <strong>Eco Infinito disponível</strong> para continuar evoluindo enquanto os novos capítulos são preparados</li></ul><button id="ver-mapa-concluido" class="botao-principal">Ver os caminhos <span>↗</span></button><button id="continuar-eco" class="botao-mapa" style="width:100%;margin-top:10px;padding:13px">Continuar no Eco Infinito</button>');
  $('ver-mapa-concluido').addEventListener('click',mapa);
  $('continuar-eco').addEventListener('click',fecharModal);
  salvar();
}
function fundo(ctx,t){
  const g=ctx.createLinearGradient(0,0,0,650);g.addColorStop(0,'#0b1632');g.addColorStop(.48,'#344562');g.addColorStop(.78,'#a86e75');g.addColorStop(1,'#292a42');ctx.fillStyle=g;ctx.fillRect(0,0,1120,650);
  ctx.save();ctx.globalAlpha=.5;const halo=ctx.createRadialGradient(725,165,0,725,165,250);halo.addColorStop(0,'#edc9b170');halo.addColorStop(1,'#f5b5b000');ctx.fillStyle=halo;ctx.fillRect(420,-80,600,500);ctx.restore();
  ctx.beginPath();ctx.arc(734,178,83,0,Math.PI*2);ctx.fillStyle='#f2c7a5';ctx.shadowBlur=45;ctx.shadowColor='#fac0a2';ctx.fill();ctx.shadowBlur=0;
  ctx.beginPath();ctx.arc(768,164,81,0,Math.PI*2);ctx.fillStyle='#34415b';ctx.fill();
  ctx.save();ctx.globalAlpha=.65;
  for(let i=0;i<65;i++){
    const x=(i*197+17)%1120,y=(i*89)%380;ctx.fillStyle=i%4?'#d8d7e6':'#f4dfad';ctx.beginPath();ctx.arc(x+Math.sin(t*.17+i)*2,y,((i%3)+1)*.6,0,7);ctx.fill();
  }
  ctx.restore();
  function serra(base,altura,cor,passo,deslocamento){
    ctx.beginPath();ctx.moveTo(-80,650);
    for(let x=-80;x<=1200;x+=passo){ctx.lineTo(x,base+Math.sin(x*.014+deslocamento)*altura+Math.cos(x*.023+deslocamento)*altura*.46);}
    ctx.lineTo(1200,650);ctx.closePath();ctx.fillStyle=cor;ctx.fill();
  }
  serra(348,70,'#364562',54,1.5);serra(398,64,'#273956',45,3);serra(454,50,'#17283d',40,5);
  for(let i=0;i<4;i++){
    const x=100+i*244,y=345+Math.sin(i*8)*60;
    ctx.fillStyle='#243048';ctx.beginPath();ctx.moveTo(x-15,y+180);ctx.lineTo(x-6,y+35);ctx.lineTo(x+19,y+12);ctx.lineTo(x+39,y+45);ctx.lineTo(x+24,y+180);ctx.fill();
    ctx.fillStyle='#a4b0ba33';ctx.fillRect(x+1,y+48,5,60);
    ctx.beginPath();ctx.arc(x+10,y+15,16,0,7);ctx.fillStyle='#2c3b56';ctx.fill();
  }
  ctx.fillStyle='#111e30';ctx.beginPath();ctx.moveTo(0,515);ctx.bezierCurveTo(170,495,300,515,480,500);ctx.bezierCurveTo(710,482,800,540,1120,515);ctx.lineTo(1120,650);ctx.lineTo(0,650);ctx.fill();
  ctx.strokeStyle='#77878b33';ctx.lineWidth=2;
  for(let i=0;i<28;i++){const x=(i*119)%1120,y=510+(i*37)%110;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+15,y-3);ctx.lineTo(x+34,y+2);ctx.stroke();}
  ctx.fillStyle='#d2b18b';
  for(let i=0;i<16;i++){const x=(i*213+42)%1120,y=520+(i*37)%110;ctx.globalAlpha=.14+(Math.sin(t*1.4+i)*.5+.5)*.25;ctx.beginPath();ctx.arc(x,y+Math.sin(t+i)*9,1.3+(i%3),0,7);ctx.fill();}
  ctx.globalAlpha=1;
  ctx.fillStyle='#1b2235';ctx.beginPath();ctx.moveTo(1030,415);ctx.lineTo(1092,314);ctx.lineTo(1120,317);ctx.lineTo(1120,650);ctx.lineTo(1006,650);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#7c869866';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(1030,415);ctx.lineTo(1092,314);ctx.stroke();
}
function desenharGuardiao(ctx,x,y,t){
  const h=heroiAtual(),cor=h.cor,classe=nivelVisual();
  ctx.save();ctx.translate(x,y+Math.sin(t*3)*3);
  if(dados.vida<=0)ctx.globalAlpha=.35;
  const aura=ctx.createRadialGradient(0,-100,4,0,-100,classe>=3?124:86);
  aura.addColorStop(0,cor+'56');aura.addColorStop(1,cor+'00');ctx.fillStyle=aura;ctx.fillRect(-150,-220,300,260);
  if(classe>1){
    ctx.strokeStyle=cor;ctx.globalAlpha=.23;ctx.lineWidth=3;
    ctx.beginPath();ctx.ellipse(0,-79,55+Math.sin(t*2)*4,95,0,0,7);ctx.stroke();ctx.globalAlpha=1;
  }
  ctx.fillStyle='#070d1c66';ctx.beginPath();ctx.ellipse(0,14,62,12,0,0,7);ctx.fill();
  ctx.beginPath();ctx.moveTo(-28,-120);ctx.quadraticCurveTo(-82,-56,-59,-4);ctx.lineTo(16,-19);ctx.lineTo(40,-110);ctx.closePath();ctx.fillStyle=h.sombra;ctx.strokeStyle='#101829';ctx.lineWidth=7;ctx.fill();ctx.stroke();
  ctx.fillStyle='#131b30';ctx.strokeStyle='#080f21';ctx.lineWidth=6;
  ctx.beginPath();ctx.roundRect(-22,-44,20,51,6);ctx.roundRect(4,-44,20,51,6);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-34,-125);ctx.lineTo(30,-125);ctx.lineTo(39,-45);ctx.lineTo(-38,-45);ctx.closePath();
  const peitoral=ctx.createLinearGradient(-35,-125,35,-30);peitoral.addColorStop(0,cor);peitoral.addColorStop(.48,h.sombra);peitoral.addColorStop(1,'#202d46');ctx.fillStyle=peitoral;ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-18,-117);ctx.lineTo(0,-96);ctx.lineTo(20,-117);ctx.strokeStyle='#fff5ccbb';ctx.lineWidth=5;ctx.stroke();
  ctx.strokeStyle='#1e2842';ctx.lineWidth=16;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-29,-110);ctx.lineTo(-51,-63);ctx.moveTo(28,-110);ctx.lineTo(51,-68);ctx.stroke();
  ctx.strokeStyle=cor;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-48,-67);ctx.lineTo(-42,-55);ctx.moveTo(49,-70);ctx.lineTo(55,-58);ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,-161,42,47,0,0,7);ctx.fillStyle='#192540';ctx.strokeStyle='#071225';ctx.lineWidth=7;ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-34,-169);ctx.quadraticCurveTo(-16,-216,0,-194);ctx.quadraticCurveTo(22,-221,36,-169);ctx.lineTo(21,-189);ctx.lineTo(-19,-189);ctx.closePath();ctx.fillStyle=cor;ctx.globalAlpha=.85;ctx.fill();ctx.globalAlpha=1;
  ctx.beginPath();ctx.moveTo(-20,-156);ctx.lineTo(-5,-151);ctx.lineTo(-19,-146);ctx.moveTo(20,-156);ctx.lineTo(5,-151);ctx.lineTo(19,-146);ctx.fillStyle='#fff3cf';ctx.fill();
  ctx.strokeStyle='#ffffffbc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-20,-156);ctx.lineTo(-5,-151);ctx.moveTo(20,-156);ctx.lineTo(5,-151);ctx.stroke();
  if(classe>=3){ctx.strokeStyle=cor;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-32,-196);ctx.lineTo(-43,-234);ctx.lineTo(-12,-211);ctx.moveTo(31,-196);ctx.lineTo(44,-234);ctx.lineTo(11,-210);ctx.stroke();}
  if(classe>=4){ctx.save();ctx.translate(0,-230);ctx.rotate(t*.36);ctx.strokeStyle='#ffe6a6';ctx.lineWidth=5;ctx.strokeRect(-19,-19,38,38);ctx.restore();}
  const ang=Math.sin(t*8)*.25;
  ctx.save();ctx.translate(48,-66);ctx.rotate(ang);
  ctx.strokeStyle=h.id==='kael'?'#a4eee3':h.id==='nix'?'#dcaafa':'#ffe7b8';
  ctx.shadowColor=cor;ctx.shadowBlur=22;ctx.lineWidth=h.id==='astra'?10:7;ctx.lineCap='round';
  if(h.id==='astra'){ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(41,-105);ctx.stroke();ctx.beginPath();ctx.moveTo(-13,-15);ctx.lineTo(18,-3);ctx.stroke();}
  if(h.id==='kael'){ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(27,-65);ctx.stroke();ctx.beginPath();ctx.arc(30,-68,25,0,7);ctx.stroke();}
  if(h.id==='nix'){ctx.beginPath();ctx.moveTo(0,16);ctx.lineTo(25,-77);ctx.stroke();ctx.beginPath();ctx.arc(25,-82,20,0,7);ctx.stroke();ctx.fillStyle=cor;ctx.beginPath();ctx.arc(25,-82,8,0,7);ctx.fill();}
  ctx.restore();ctx.shadowBlur=0;ctx.restore();
}
function desenharUmbral(ctx,x,y,t){
  const mini=inimigo&&inimigo.mini,escala=mini?1.37:1,variante=inimigo?.variante||0;
  ctx.save();ctx.translate(x,y+Math.sin(t*2+variante)*7);ctx.scale(escala,escala);
  ctx.shadowBlur=25;ctx.shadowColor=mini?'#c66af1':'#6e65a2';ctx.fillStyle='#171a31';
  ctx.beginPath();ctx.moveTo(-54,-67);ctx.bezierCurveTo(-90,-160,-54,-209,-10,-176);ctx.bezierCurveTo(30,-217,84,-158,60,-65);ctx.lineTo(35,-12);ctx.lineTo(-42,-12);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.strokeStyle='#070c1a';ctx.lineWidth=9;ctx.stroke();
  ctx.fillStyle='#292849';ctx.beginPath();ctx.moveTo(-52,-110);ctx.lineTo(-100,-168);ctx.lineTo(-87,-92);ctx.moveTo(58,-105);ctx.lineTo(104,-162);ctx.lineTo(84,-85);ctx.fill();
  ctx.beginPath();ctx.moveTo(-31,-176);ctx.lineTo(-21,-225-variante*4);ctx.lineTo(-2,-184);ctx.moveTo(22,-183);ctx.lineTo(41,-232);ctx.lineTo(50,-175);ctx.fillStyle=mini?'#ae83cd':'#5c5e89';ctx.fill();
  ctx.beginPath();ctx.moveTo(-53,-83);ctx.lineTo(0,-105);ctx.lineTo(54,-83);ctx.lineTo(31,-51);ctx.lineTo(-31,-51);ctx.closePath();ctx.fillStyle='#111b2d';ctx.fill();
  ctx.fillStyle=mini?'#f3a1f0':'#d9a8c4';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=18;
  ctx.beginPath();ctx.moveTo(-37,-143);ctx.lineTo(-7,-135);ctx.lineTo(-31,-122);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(37,-143);ctx.lineTo(7,-135);ctx.lineTo(31,-122);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='#9492a566';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-22,-37);ctx.lineTo(-26,-5);ctx.moveTo(27,-37);ctx.lineTo(30,-5);ctx.stroke();
  for(let i=0;i<5;i++){ctx.fillStyle='#ad85cb';ctx.globalAlpha=.2+.3*Math.sin(t*2+i)**2;ctx.beginPath();ctx.arc(Math.sin(t+i*3)*85,-90-i*19+Math.sin(t+i)*9,2+i%3,0,7);ctx.fill();}ctx.restore();
}
function desenharColosso(ctx,t){
  const caiu=queda>0;
  ctx.save();ctx.translate(caiu?90*Math.min(1,queda):0,caiu?850*queda*queda:0);ctx.rotate(caiu?queda*.35:0);
  const x=1078,y=310;
  ctx.shadowColor='#0b081b';ctx.shadowBlur=35;
  ctx.fillStyle='#0e1529';ctx.beginPath();ctx.ellipse(x+50,y,255,350,-.17,0,7);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle='#303450';ctx.lineWidth=18;ctx.stroke();
  ctx.fillStyle='#33334f';
  ctx.beginPath();ctx.moveTo(875,167);ctx.lineTo(805,-26);ctx.lineTo(964,104);ctx.lineTo(1060,36);ctx.lineTo(1145,123);ctx.lineTo(1230,-25);ctx.lineTo(1274,220);ctx.closePath();ctx.fill();
  ctx.fillStyle='#101529';ctx.beginPath();ctx.moveTo(870,232);ctx.lineTo(940,170);ctx.lineTo(1080,204);ctx.lineTo(1189,150);ctx.lineTo(1266,260);ctx.lineTo(1220,475);ctx.lineTo(1080,590);ctx.lineTo(912,476);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#555372';ctx.lineWidth=10;ctx.stroke();
  ctx.strokeStyle='#bd8eaf';ctx.lineWidth=3;
  for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(922+i*30,374+i*5);ctx.lineTo(946+i*30,422+i*7);ctx.lineTo(932+i*30,464+i*6);ctx.stroke();}
  const brilho=.75+Math.sin(t*3)*.25;ctx.shadowBlur=65*brilho;ctx.shadowColor='#ed719c';
  ctx.beginPath();ctx.ellipse(996,253,101,61,-.17,0,7);ctx.fillStyle='#b55782';ctx.fill();ctx.shadowBlur=0;
  ctx.beginPath();ctx.ellipse(1000,255,78,42,-.17,0,7);ctx.fillStyle='#f2c1bb';ctx.fill();
  ctx.beginPath();ctx.ellipse(1000,255,31,42,-.17,0,7);ctx.fillStyle='#33213e';ctx.fill();
  ctx.beginPath();ctx.arc(990,243,10,0,7);ctx.fillStyle='#fef5e6';ctx.fill();
  ctx.strokeStyle='#1b1b31';ctx.lineWidth=22;ctx.beginPath();ctx.moveTo(889,255);ctx.quadraticCurveTo(987,156,1099,226);ctx.stroke();
  ctx.strokeStyle='#8a6b8f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(915,337);ctx.lineTo(866,382);ctx.moveTo(1081,362);ctx.lineTo(1029,443);ctx.stroke();
  ctx.restore();
  if(!caiu && inimigo && inimigo.chefao){
    const disparo=Math.sin(t*1.9)> .76 && dados.vida>0;
    if(disparo){
      const alvoX=215+Math.sin(t*2)*25,alvoY=420;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#fc718e';ctx.shadowColor='#ff476e';ctx.shadowBlur=42;ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(997,253);ctx.lineTo(alvoX,alvoY);ctx.stroke();ctx.strokeStyle='#fff3c2';ctx.lineWidth=5;ctx.stroke();ctx.restore();
    }
  }
}
function desenhar(ctx,t){
  ctx.save();
  if(tremor>0)ctx.translate((Math.random()-.5)*tremor*20,(Math.random()-.5)*tremor*10);
  fundo(ctx,t);
  if(dados.onda<=12 && !dados.concluido){
    if(ehChefe(dados.onda)||queda>0)desenharColosso(ctx,t);
    else if(inimigo)desenharUmbral(ctx,780,500,t);
  } else if(inimigo && queda===0)desenharUmbral(ctx,780,500,t);
  desenharGuardiao(ctx,225,505,t);
  for(const p of faiscas){ctx.globalAlpha=Math.max(0,p.vida);ctx.fillStyle=p.cor;ctx.shadowBlur=7;ctx.shadowColor=p.cor;ctx.beginPath();ctx.arc(p.x,p.y,p.raio,0,7);ctx.fill();}
  ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.textAlign='center';ctx.font='800 23px system-ui';
  for(const n of numeros){ctx.globalAlpha=Math.min(1,n.vida);ctx.fillStyle='#101320';ctx.fillText(n.texto,n.x+2,n.y+2);ctx.fillStyle=n.cor;ctx.fillText(n.texto,n.x,n.y);}
  ctx.globalAlpha=1;
  if(flash>0){ctx.globalAlpha=flash*.45;ctx.fillStyle='#f5b6a8';ctx.fillRect(0,0,1120,650);}
  ctx.restore();
}
function atualizarQuadro(instante){
  if(!desenhando)return;
  const dt=Math.min(.08,Math.max(0,(instante-(ultimoQuadro||instante))/1000));
  ultimoQuadro=instante;segundos+=dt;
  if(dados.iniciado && !dados.pausado){
    if(recargas.ressurgir>0){recargas.ressurgir-=dt;if(recargas.ressurgir<=0){dados.vida=vidaMaxima();registrar('A energia do Flow reconstruiu o guardião!');}}
    for(const id of [...HABILIDADES.map(h=>h.id),'protecao'])recargas[id]=Math.max(0,(recargas[id]||0)-dt);
    if(queda>0){queda+=dt*.43;if(queda>=1){fimDoChefe();}}
    else if(!fimDaCena && dados.vida>0 && inimigo){
      atacar(danoSegundo()*dt);
      if(inimigo && inimigo.vida>0 && !dados.concluido){
        tempoProximoAtaque-=dt;
        if(tempoProximoAtaque<=0){
          const chefe=inimigo.chefao,mini=inimigo.mini;
          const dano=Math.floor((chefe?25:mini?14:6)+dados.onda*(chefe?2.7:.6));
          sofrerAtaque(dano,chefe?'laser':'golpe');
          if(chefe)faiscar(230,490,'#f293ab',20);
          tempoProximoAtaque=chefe?5.3:mini?4.4:5.6;
        }
      }
    }
  }
  tremor=Math.max(0,tremor-dt*1.5);flash=Math.max(0,flash-dt);
  for(const p of faiscas){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=170*dt;p.vida-=dt;}
  faiscas=faiscas.filter(p=>p.vida>0);
  for(const n of numeros){n.y-=45*dt;n.vida-=dt;}
  numeros=numeros.filter(n=>n.vida>0);
  if(contexto)desenhar(contexto,instante/1000);
  if(instante-tempoAviso>240){
    atualizarPainel();tempoAviso=instante;
  }
  if(instante-ultimoSalvamento>5000){salvar();ultimoSalvamento=instante;}
  requestAnimationFrame(atualizarQuadro);
}
function instalarEventos(){
  $('botao-comecar').addEventListener('click',iniciarJornada);
  $('botao-som').textContent=dados.som?'♫':'♪';
  $('botao-som').addEventListener('click',()=>{dados.som=!dados.som;$('botao-som').textContent=dados.som?'♫':'♪';salvar();});
  $('botao-ajuda').addEventListener('click',introducao);
  $('botao-mapa').addEventListener('click',mapa);
  $('abrir-mapa-inferior').addEventListener('click',mapa);
  $('abrir-detalhes').addEventListener('click',detalhes);
  $('fechar-modal').addEventListener('click',fecharModal);
  $('modal-fundo').addEventListener('click',e=>{if(e.target.id==='modal-fundo')fecharModal();});
  window.addEventListener('keydown',e=>{if(e.key==='Escape')fecharModal();if((e.key===' '||e.key==='Enter')&&document.activeElement=== $('cena')){e.preventDefault();atacar(poderClique(),true);}});
  $('cena').addEventListener('pointerdown',()=>atacar(poderClique(),true));
  $('botao-pausar').addEventListener('click',()=>{
    dados.pausado=!dados.pausado;$('botao-pausar').textContent=dados.pausado?'Retomar':'Pausar';
    registrar(dados.pausado?'Batalha pausada neste dispositivo.':'A batalha foi retomada.');salvar();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)salvar();});
  window.addEventListener('pagehide',salvar);
  if('serviceWorker' in navigator && location.protocol!=='file:'){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./servico-worker.js').catch(()=>{}));
  }
}
mostrarEscolha();instalarEventos();
if(dados.iniciado){progressoAusente();iniciarJornada();}
})();