/* ============================================================================
   QUATRION LAB — SIMULAÇÕES: os 3 experimentos químicos + stopAllTimers
   (ponto único de limpeza de timers/erupções do app)
   Extraído do arquivo monolítico original. Lógica idêntica, nenhuma mudança
   de comportamento. Funções expostas em window para os handlers inline.

   Acrescenta o Experimento 4 (Serpente de Carbono), que ao concluir registra
   um acerto no sistema de evolução (modules/evolution.js).
   ============================================================================ */

import { registrarAcerto } from './evolution.js';

/* ============================================================================
   SIMULAÇÕES — submenu dos 3 experimentos
   Nota: a limpeza global (stopAllTimers) é composta no entrypoint main.js,
   que combina stopEruption() (aqui) + quizStopTimer() (modules/questions.js)
   sem criar ciclo de importação.
   ============================================================================ */
const EXP_META = {
  titulacao: {title:'Titulação Ácido-Base', sub:'Adicione base (NaOH) a uma solução ácida com fenolftaleína e observe o ponto de viragem.'},
  chama:     {title:'Teste de Chama', sub:'Aproxime sais metálicos da chama do bico de Bunsen e observe a coloração característica de cada elemento.'},
  elefante:  {title:'Pasta de Dente de Elefante', sub:'Decomponha o peróxido de hidrogênio com um catalisador e observe a espuma exotérmica transbordar.'}
};

export function showExperiment(name){
  if(name !== 'elefante') stopEruption();
  document.querySelectorAll('.experiment').forEach(el=> el.classList.toggle('active', el.id==='exp-'+name));
  document.querySelectorAll('.exp-tab').forEach(btn=> btn.classList.toggle('active', btn.dataset.exp===name));
  document.getElementById('expPageTitle').textContent = EXP_META[name].title;
  document.getElementById('expPageSubtitle').textContent = EXP_META[name].sub;
}

/* ---------- Experimento 1: Titulação ---------- */
const T1_PH_STEPS = [2.0, 4.5, 6.8, 8.2];
const T1_VIRAGEM = 3;
const T1_STATUS = ['Solução ácida — incolor, sem viragem do indicador.','Base adicionada. Solução ainda ácida e incolor.',
  'Aproximando-se do ponto de equivalência...','Ponto de viragem! A fenolftaleína indica meio básico (rosa).'];
let t1Count = 0;
const t1Max = T1_PH_STEPS.length - 1;
document.getElementById('t1Max').textContent = t1Max;

export function t1AddDrop(){
  if(t1Count >= t1Max) return;
  document.getElementById('t1Btn').disabled = true;
  const drop = document.createElement('div');
  drop.className = 't1-drop';
  document.querySelector('.t1-zone').appendChild(drop);
  drop.addEventListener('animationend', function(){ drop.remove(); t1OnLanded(); });
}

function t1OnLanded(){
  t1Count++;
  const liquid = document.getElementById('t1Liquid');
  liquid.classList.remove('wobble'); void liquid.offsetWidth; liquid.classList.add('wobble');
  const ring = document.createElement('div'); ring.className = 't1-ripple';
  liquid.appendChild(ring); ring.addEventListener('animationend', ()=> ring.remove());
  liquid.style.height = Math.min(58 + t1Count*2, 68) + '%';
  const ph = T1_PH_STEPS[t1Count];
  document.getElementById('t1PhValue').textContent = ph.toFixed(1);
  document.getElementById('t1ScaleFill').style.width = (ph/14*100) + '%';
  const box = document.querySelector('.t1-ph-box');
  const basicRange = ph >= 7;
  box.style.setProperty('--t1-ph-color', basicRange ? 'var(--purple-bright)' : 'var(--cyan-bright)');
  box.style.setProperty('--t1-ph-glow', basicRange ? 'rgba(155,79,224,.55)' : 'rgba(0,229,201,.4)');
  document.getElementById('t1Status').textContent = T1_STATUS[Math.min(t1Count, T1_STATUS.length-1)];
  if(t1Count >= T1_VIRAGEM){ liquid.classList.add('is-basic'); document.getElementById('t1Glow').classList.add('is-basic'); }
  document.getElementById('t1Count').textContent = t1Count;
  document.getElementById('t1Btn').disabled = t1Count >= t1Max;
}

export function t1Reset(){
  t1Count = 0;
  document.getElementById('t1Btn').disabled = false;
  const liquid = document.getElementById('t1Liquid');
  liquid.classList.remove('is-basic'); document.getElementById('t1Glow').classList.remove('is-basic');
  liquid.style.height = '58%';
  document.getElementById('t1Count').textContent = '0';
  document.getElementById('t1PhValue').textContent = T1_PH_STEPS[0].toFixed(1);
  document.getElementById('t1ScaleFill').style.width = (T1_PH_STEPS[0]/14*100) + '%';
  document.querySelector('.t1-ph-box').style.setProperty('--t1-ph-color','var(--cyan-bright)');
  document.querySelector('.t1-ph-box').style.setProperty('--t1-ph-glow','rgba(0,229,201,.4)');
  document.getElementById('t1Status').textContent = T1_STATUS[0];
}

/* ---------- Experimento 2: Teste de Chama ---------- */
const METAL_COLORS = {
  padrao:{outer:'#2E8BFF',mid:'#63AEFF',core:'#EAF9FF',glow:'rgba(46,139,255,.45)',label:'Chama padrão do bico de Bunsen — nenhum sal testado.'},
  cobre:{outer:'#39FF14',mid:'#8CFF6B',core:'#EFFFEA',glow:'rgba(57,255,20,.5)',label:'Cobre (Cu²⁺) detectado — chama verde neon característica.'},
  estroncio:{outer:'#FF4500',mid:'#FF7A45',core:'#FFE3D6',glow:'rgba(255,69,0,.5)',label:'Estrôncio (Sr²⁺) detectado — chama vermelho carmesim característica.'},
  sodio:{outer:'#FFD447',mid:'#FFE38A',core:'#FFFAE0',glow:'rgba(255,212,71,.55)',label:'Sódio (Na⁺) detectado — chama amarelo-ouro intensa e característica.'}
};

function t2Paint(key){
  const c = METAL_COLORS[key];
  document.getElementById('t2Outer').style.backgroundColor = c.outer;
  document.getElementById('t2Mid').style.backgroundColor = c.mid;
  document.getElementById('t2Core').style.backgroundColor = c.core;
  document.getElementById('t2Tube').style.setProperty('--flame-glow', c.glow);
  document.getElementById('t2Tube').style.boxShadow = '0 0 20px -4px ' + c.glow;
  document.getElementById('t2Glow').style.background = 'radial-gradient(circle,' + c.glow + ',transparent 70%)';
  document.getElementById('t2Status').textContent = c.label;
  ['metalCu','metalSr','metalNa'].forEach(id=> document.getElementById(id).classList.remove('active'));
}

export function t2SetMetal(name){
  t2Paint(name);
  const map={cobre:'metalCu',estroncio:'metalSr',sodio:'metalNa'};
  document.getElementById(map[name]).classList.add('active');
}

export function t2Clear(){ t2Paint('padrao'); }
t2Paint('padrao');

/* ---------- Experimento 3: Pasta de Dente de Elefante ---------- */
const BUBBLE_SPAWN_MS=40, BUBBLES_PER_TICK=2, BUBBLE_RISE_MS=1500, ERUPTION_DURATION=2400, ALERT_DURATION=4000, SHAKE_DURATION=1000;
const BUBBLE_PALETTE = [{base:'#4FA8FF',hi:'#DFF3FF'},{base:'#FF8A3D',hi:'#FFE3C2'},{base:'#FDF6EC',hi:'#FFFFFF'}];

function randomFoamColor(){ return BUBBLE_PALETTE[Math.floor(Math.random()*BUBBLE_PALETTE.length)]; }

let t3Erupting = false, t3SpawnTimer = null, t3Timeouts = [];

export function t3AddCatalyst(){
  if(t3Erupting) return;
  t3Erupting = true;
  document.getElementById('t3Btn').disabled = true;
  document.getElementById('t3Status').textContent = 'Catalisador adicionado! O H₂O₂ está se decompondo rapidamente...';
  const wrap = document.getElementById('t3FlaskWrap');
  wrap.classList.remove('shake'); void wrap.offsetWidth; wrap.classList.add('shake');
  t3Timeouts.push(setTimeout(()=> wrap.classList.remove('shake'), SHAKE_DURATION));
  const liquid = document.getElementById('t3Liquid');
  liquid.classList.add('foaming'); liquid.style.height = '100%';
  t3SpawnInternalFoam();
  document.getElementById('t3FoamMound').classList.add('show');
  document.getElementById('t3Alert').classList.add('show');
  const startTime = Date.now();
  t3SpawnTimer = setInterval(function(){
    if(Date.now() - startTime > ERUPTION_DURATION){ clearInterval(t3SpawnTimer); t3SpawnTimer=null; return; }
    for(let i=0;i<BUBBLES_PER_TICK;i++) t3SpawnBubble();
  }, BUBBLE_SPAWN_MS);
  t3Timeouts.push(setTimeout(function(){ document.getElementById('t3Alert').classList.remove('show'); }, ALERT_DURATION));
  t3Timeouts.push(setTimeout(function(){
    document.getElementById('t3Status').textContent = 'Reação concluída — espuma de O₂ e sabão expelida pelo frasco.';
    document.getElementById('t3Btn').disabled = false; t3Erupting = false;
  }, ERUPTION_DURATION + 600));
}

function t3SpawnInternalFoam(){
  const liquid = document.getElementById('t3Liquid');
  liquid.querySelectorAll('.t3-foam-blob').forEach(b=> b.remove());
  for(let i=0;i<9;i++){
    const blob = document.createElement('div'); blob.className = 't3-foam-blob';
    const size = 14 + Math.random()*26; const c = randomFoamColor();
    blob.style.width = size+'px'; blob.style.height = size+'px';
    blob.style.left = (10 + Math.random()*140) + 'px'; blob.style.bottom = (6 + Math.random()*72) + 'px';
    blob.style.background = 'radial-gradient(circle at 32% 28%,' + c.hi + ',' + c.base + ' 75%)';
    blob.style.animationDelay = (Math.random()*2) + 's';
    liquid.appendChild(blob);
  }
}

function t3SpawnBubble(){
  const layer = document.getElementById('t3Eruption');
  if(!layer) return;
  const isSpill = Math.random() < 0.4;
  const size = isSpill ? (14 + Math.random()*22) : (8 + Math.random()*34);
  const c = randomFoamColor();
  const bubble = document.createElement('div');
  bubble.className = 't3-bubble';
  bubble.style.width = size + 'px'; bubble.style.height = size + 'px';
  bubble.style.background = 'radial-gradient(circle at 32% 28%,' + c.hi + ',' + c.base + ' 75%)';
  bubble.style.left = (Math.random()*30 - 15) + 'px';
  if(isSpill){
    const side = Math.random() < 0.5 ? -1 : 1;
    bubble.style.setProperty('--dx', side*(70 + Math.random()*140) + 'px');
    bubble.style.setProperty('--dy', (Math.random()*100 - 30) + 'px');
    bubble.style.setProperty('--peak', (1.15 + Math.random()*.45).toFixed(2));
  } else {
    bubble.style.setProperty('--dx', (Math.random()*100 - 50) + 'px');
    bubble.style.setProperty('--dy', -(220 + Math.random()*170) + 'px');
    bubble.style.setProperty('--peak', (1.2 + Math.random()*.5).toFixed(2));
  }
  bubble.style.setProperty('--rot', (Math.random()*70 - 35) + 'deg');
  bubble.style.setProperty('--endscale', (0.5 + Math.random()*.35).toFixed(2));
  bubble.style.animationDuration = (BUBBLE_RISE_MS + Math.random()*700) + 'ms';
  layer.appendChild(bubble);
  bubble.addEventListener('animationend', ()=> bubble.remove());
}

export function stopEruption(){
  if(t3SpawnTimer){ clearInterval(t3SpawnTimer); t3SpawnTimer = null; }
  t3Timeouts.forEach(id=> clearTimeout(id)); t3Timeouts = [];
  t3Erupting = false;
}

export function t3Reset(){
  stopEruption();
  const btn = document.getElementById('t3Btn'); if(btn) btn.disabled = false;
  const wrap = document.getElementById('t3FlaskWrap'); if(wrap) wrap.classList.remove('shake');
  const liquid = document.getElementById('t3Liquid');
  if(liquid){ liquid.classList.remove('foaming'); liquid.style.height = '42%'; liquid.querySelectorAll('.t3-foam-blob').forEach(b=> b.remove()); }
  const mound = document.getElementById('t3FoamMound'); if(mound) mound.classList.remove('show');
  const alert = document.getElementById('t3Alert'); if(alert) alert.classList.remove('show');
  const erup = document.getElementById('t3Eruption'); if(erup) erup.innerHTML = '';
  const status = document.getElementById('t3Status'); if(status) status.textContent = 'Solução amarelada em repouso — nenhuma reação iniciada.';
}

/* ============================================================================
   EXPERIMENTO 4 — SERPENTE DE CARBONO (Desidratação do Açúcar)
   Modal em 2 etapas: A) teoria + EPIs obrigatórios; B) prática 2D com lobby de
   segurança (3 EPIs) liberando a bancada, e a reação ácido + açúcar animada
   por .carbon-snake. Ao concluir, registra um acerto no sistema de evolução.
   ============================================================================ */

/* Gate de segurança: só libera a bancada quando os 3 EPIs forem equipados. */
const CARBON_EPI_KEYS = Object.freeze(['oculos', 'jaleco', 'luvas']);

/* Retaguarda da animação .carbon-snake (2.6s) — conclui o experimento mesmo
   se o evento 'animationend' não disparar. */
const CARBON_RISE_FALLBACK_MS = 3200;

const CARBON_STATUS = Object.freeze({
  locked: 'Bancada pronta. Equipe os EPIs para liberar o experimento.',
  ready: 'Bancada liberada! Selecione o frasco de ácido e depois o béquer com açúcar.',
  acidPicked: 'Ácido sulfúrico (H₂SO₄) selecionado — agora despeje no béquer com açúcar.',
  reacting: 'Reação em andamento: a sacarose está sendo desidratada pelo H₂SO₄...',
  done: 'Experimento concluído — massa de carvão expandida e vapor de água liberado.'
});

const CARBON_STAGE_LABELS = Object.freeze({
  A: 'Etapa 1 · Teoria',
  B: 'Etapa 2 · Prática 2D'
});

let carbonEquippedEpis = [];
let carbonAcidSelected = false;
let carbonRunning = false;
let carbonFinished = false;
let carbonTimers = [];
let carbonSnakeListener = null;

function carbonEl(id){ return document.getElementById(id); }

function carbonSetStatus(text){
  const el = carbonEl('carbonStatus');
  if(el) el.textContent = text;
}

function carbonClearTimers(){
  carbonTimers.forEach(function(id){ clearTimeout(id); });
  carbonTimers = [];
}

function carbonIsSecurityReady(){
  return carbonEquippedEpis.length === CARBON_EPI_KEYS.length;
}

/* ---------------------------------------------------------------- navegação */

function carbonShowStage(letter){
  const isTheory = letter === 'A';
  const stageA = carbonEl('carbonStageA');
  const stageB = carbonEl('carbonStageB');
  if(stageA) stageA.classList.toggle('active', isTheory);
  if(stageB) stageB.classList.toggle('active', !isTheory);
  const badge = carbonEl('carbonStepBadge');
  if(badge) badge.textContent = isTheory ? CARBON_STAGE_LABELS.A : CARBON_STAGE_LABELS.B;
  const scroll = document.querySelector('.carbon-scroll');
  if(scroll) scroll.scrollTop = 0;
}

export function carbonGoToPractice(){ carbonShowStage('B'); }
export function carbonBackToTheory(){ carbonShowStage('A'); }

export function openCarbonExperiment(){
  carbonReset();
  const overlay = carbonEl('carbon-overlay');
  if(overlay) overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  carbonShowStage('A');
}

export function closeCarbonExperiment(){ carbonStopTimers(); }

/* Limpeza global (composta em window.stopAllTimers pelo entrypoint). */
export function carbonStopTimers(){
  carbonClearTimers();
  const overlay = carbonEl('carbon-overlay');
  if(overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ---------------------------------------------------------------- segurança */

function carbonRefreshSafety(){
  const ready = carbonIsSecurityReady();
  const lobbyStatus = carbonEl('carbonLobbyStatus');
  if(lobbyStatus) lobbyStatus.classList.toggle('ok', ready);
  const safetyLabel = carbonEl('carbonSafetyLabel');
  if(safetyLabel) safetyLabel.textContent = ready ? 'Segurança OK' : 'Segurança pendente';
  const epiCount = carbonEl('carbonEpiCount');
  if(epiCount) epiCount.textContent = String(carbonEquippedEpis.length);
  const lock = carbonEl('carbonLock');
  if(lock) lock.classList.toggle('hidden', ready);

  const showAcidHint = ready && !carbonAcidSelected && !carbonFinished;
  const showBeakerHint = ready && carbonAcidSelected && !carbonFinished;
  const hintAcid = carbonEl('hintAcid');
  if(hintAcid) hintAcid.classList.toggle('show', showAcidHint);
  const hintBeaker = carbonEl('hintBeaker');
  if(hintBeaker) hintBeaker.classList.toggle('show', showBeakerHint);

  if(carbonRunning || carbonFinished) return;
  if(!ready) carbonSetStatus(CARBON_STATUS.locked);
  else carbonSetStatus(carbonAcidSelected ? CARBON_STATUS.acidPicked : CARBON_STATUS.ready);
}

export function carbonToggleEpi(key){
  if(CARBON_EPI_KEYS.indexOf(key) === -1) return;
  if(carbonEquippedEpis.indexOf(key) !== -1) return;
  carbonEquippedEpis.push(key);
  const btn = carbonEl('epi-' + key);
  if(btn){ btn.classList.add('done'); btn.setAttribute('aria-pressed', 'true'); }
  carbonRefreshSafety();
}

/* ---------------------------------------------------------------- bancada */

export function carbonPickAcid(){
  if(!carbonIsSecurityReady() || carbonRunning || carbonFinished || carbonAcidSelected) return;
  carbonAcidSelected = true;
  const acid = carbonEl('benchAcid');
  if(acid) acid.classList.add('selected');
  carbonRefreshSafety();
  if(window.toast) window.toast('Ácido sulfúrico (H₂SO₄) selecionado — clique no béquer com açúcar.');
}

export function carbonPickBeaker(){
  if(!carbonIsSecurityReady() || carbonRunning || carbonFinished) return;
  if(!carbonAcidSelected){
    if(window.toast) window.toast('Selecione primeiro o frasco de ácido.');
    return;
  }
  carbonRunReaction();
}

/* Acessibilidade: Enter/Espaço nos itens da bancada (role="button"). */
export function carbonBenchKey(event, which){
  if(event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  if(which === 'acid') carbonPickAcid(); else carbonPickBeaker();
}

function carbonRunReaction(){
  carbonRunning = true;
  const beaker = carbonEl('benchBeaker');
  if(beaker) beaker.classList.add('selected');
  const acid = carbonEl('benchAcid');
  if(acid) acid.classList.remove('selected');
  const hintBeaker = carbonEl('hintBeaker');
  if(hintBeaker) hintBeaker.classList.remove('show');
  carbonSetStatus(CARBON_STATUS.reacting);

  const snake = carbonEl('carbonSnake');
  if(!snake){ carbonCompleteExperiment(); return; }
  carbonSnakeListener = carbonCompleteExperiment;
  snake.addEventListener('animationend', carbonSnakeListener, { once: true });
  snake.classList.add('rise');
  carbonTimers.push(setTimeout(carbonCompleteExperiment, CARBON_RISE_FALLBACK_MS));
}

/* Fim do experimento: revela "Experimento Concluído!" e soma +1 nos Acertos. */
function carbonCompleteExperiment(){
  if(carbonFinished) return;
  carbonFinished = true;
  carbonRunning = false;
  carbonClearTimers();
  const snake = carbonEl('carbonSnake');
  if(snake && carbonSnakeListener) snake.removeEventListener('animationend', carbonSnakeListener);
  carbonSnakeListener = null;

  const result = carbonEl('carbonResult');
  if(result) result.classList.add('show');
  carbonSetStatus(CARBON_STATUS.done);
  const beaker = carbonEl('benchBeaker');
  if(beaker) beaker.classList.remove('selected');

  registrarAcerto();
}

export function carbonReset(){
  carbonClearTimers();
  if(carbonSnakeListener){
    const snake = carbonEl('carbonSnake');
    if(snake) snake.removeEventListener('animationend', carbonSnakeListener);
    carbonSnakeListener = null;
  }
  carbonEquippedEpis = [];
  carbonAcidSelected = false;
  carbonRunning = false;
  carbonFinished = false;

  CARBON_EPI_KEYS.forEach(function(key){
    const btn = carbonEl('epi-' + key);
    if(!btn) return;
    btn.classList.remove('done');
    btn.setAttribute('aria-pressed', 'false');
  });

  const snake = carbonEl('carbonSnake');
  if(snake) snake.classList.remove('rise');
  const result = carbonEl('carbonResult');
  if(result) result.classList.remove('show');
  const acid = carbonEl('benchAcid');
  if(acid) acid.classList.remove('selected');
  const beaker = carbonEl('benchBeaker');
  if(beaker) beaker.classList.remove('selected');

  carbonRefreshSafety();
}

/* Exposição global (handlers inline do HTML) */
window.showExperiment = showExperiment;
window.t1AddDrop = t1AddDrop;
window.t1Reset = t1Reset;
window.t2SetMetal = t2SetMetal;
window.t2Clear = t2Clear;
window.t3AddCatalyst = t3AddCatalyst;
window.t3Reset = t3Reset;
window.openCarbonExperiment = openCarbonExperiment;
window.closeCarbonExperiment = closeCarbonExperiment;
window.carbonGoToPractice = carbonGoToPractice;
window.carbonBackToTheory = carbonBackToTheory;
window.carbonToggleEpi = carbonToggleEpi;
window.carbonPickAcid = carbonPickAcid;
window.carbonPickBeaker = carbonPickBeaker;
window.carbonBenchKey = carbonBenchKey;
window.carbonReset = carbonReset;
window.carbonStopTimers = carbonStopTimers;
