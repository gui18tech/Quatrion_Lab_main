/* ============================================================================
   QUATRION LAB — QUESTÕES: login, logout, eye-toggle e MOTOR DE QUIZ
   (modos exam / practice / timed usados por Simulado, Questões e Games)
   Extraído do arquivo monolítico original. Lógica idêntica, nenhuma mudança
   de comportamento. Funções expostas em window para os handlers inline.

   Cada resposta do motor de quiz alimenta o sistema de evolução
   (modules/evolution.js): acertos e erros ficam persistidos em localStorage.
   ============================================================================ */

import { registrarAcerto, registrarErro } from './evolution.js';

/* ============================================================================
   LOGIN / VISITANTE / LOGOUT
   Nota: a limpeza global (stopAllTimers) é um ponto único composto no
   entrypoint main.js (stopEruption + quizStopTimer) e exposto em window —
   exatamente como a função global do arquivo monolítico. As chamadas abaixo
   usam window.stopAllTimers() para evitar ciclo de importação entre módulos.
   ============================================================================ */
export function toggleEye(inputId, btn){
  const input = document.getElementById(inputId);
  const showing = input.type === 'text';
  input.type = showing ? 'password' : 'text';
  btn.style.color = showing ? '' : 'var(--cyan-bright)';
}

export function enterApp(isGuest){
  const login = document.getElementById('login-layer');
  login.classList.add('fade-out');
  setTimeout(function(){
    login.style.display = 'none';
    const shell = document.getElementById('app-shell');
    shell.style.display = 'block';
    requestAnimationFrame(function(){ shell.classList.add('show'); });
  }, 500);
  document.body.classList.toggle('guest-mode', !!isGuest);
}

export function logout(){
  window.stopAllTimers();
  document.getElementById('quiz-overlay').classList.remove('active');
  const shell = document.getElementById('app-shell');
  shell.classList.remove('show');
  setTimeout(function(){
    shell.style.display = 'none';
    document.getElementById('login-layer').style.display = 'flex';
    requestAnimationFrame(function(){ document.getElementById('login-layer').classList.remove('fade-out'); });
    showTab('inicio');
  }, 300);
}

/* ============================================================================
   MOTOR DE QUIZ (genérico) — alimenta Simulado (exam), Questões (practice) e Games (timed)
   ============================================================================ */
let quiz = { questions:[], index:0, mode:'exam', score:0, selected:null, locked:false, points:0, timeLeft:0 };
let quizTimerHandle = null;
let quizAdvanceTimeout = null;
const TIMED_SECONDS = 60; // VELOCIDADE: tempo total do "Desafio Contra o Tempo"

export function quizStopTimer(){
  if(quizTimerHandle){ clearInterval(quizTimerHandle); quizTimerHandle = null; }
  if(quizAdvanceTimeout){ clearTimeout(quizAdvanceTimeout); quizAdvanceTimeout = null; }
}

export function startQuiz(questionSet, mode, meta){
  window.stopAllTimers();
  quiz = { questions:questionSet.slice(0,10), index:0, mode:mode, score:0, selected:null, locked:false, points:0, timeLeft:TIMED_SECONDS, meta:meta||{} };
  document.getElementById('quiz-overlay').classList.add('active');
  document.getElementById('quiz-overlay').classList.toggle('theme-purple', meta && meta.theme==='purple');
  document.getElementById('quizResults').classList.remove('show');
  document.getElementById('quizPlay').style.display = '';
  document.getElementById('quizFooter').style.display = mode==='exam' ? '' : 'none';
  document.getElementById('quizTitleTag').textContent = meta && meta.title ? meta.title : '';

  if(mode==='timed'){
    document.getElementById('quizSideStat').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg><span id="quizTimerText">'+TIMED_SECONDS+'s</span>';
    quizTimerHandle = setInterval(function(){
      quiz.timeLeft--;
      const label = document.getElementById('quizTimerText');
      if(label) label.textContent = quiz.timeLeft+'s';
      document.getElementById('quizSideStat').classList.toggle('urgent', quiz.timeLeft<=10);
      if(quiz.timeLeft<=0){ quizStopTimer(); quizFinish(); }
    }, 1000);
  } else if(mode==='practice'){
    document.getElementById('quizSideStat').textContent = '';
  } else {
    document.getElementById('quizSideStat').textContent = '';
  }

  quizRender();
}

export function retryQuiz(){ startQuiz(quiz.questions, quiz.mode, quiz.meta); }

export function exitQuiz(){
  window.stopAllTimers();
  document.getElementById('quiz-overlay').classList.remove('active');
}

function quizRender(){
  const q = quiz.questions[quiz.index];
  document.getElementById('quizEnunciado').textContent = q.enunciado;
  document.getElementById('quizTag').textContent = q.disciplina;
  document.getElementById('quizFlash').textContent = '';
  document.getElementById('quizFlash').className = 'quiz-feedback-flash';
  const wrap = document.getElementById('quizAlternatives');
  wrap.innerHTML = '';
  q.alternativas.forEach(function(alt){
    const closeIdx = alt.indexOf(')');
    const letter = alt.substring(0, closeIdx).trim();
    const label = alt.substring(closeIdx+1).trim();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-alt-btn';
    btn.dataset.value = alt;
    btn.innerHTML = '<span class="alt-letter">'+letter+'</span><span class="alt-text">'+label+'</span>';
    btn.onclick = function(){ quizSelect(btn); };
    wrap.appendChild(btn);
  });
  quiz.selected = null; quiz.locked = false;
  if(quiz.mode==='exam'){
    const confirmBtn = document.getElementById('quizConfirmBtn');
    confirmBtn.textContent = 'Confirmar Resposta';
    confirmBtn.disabled = true;
    confirmBtn.onclick = quizConfirmExam;
  }
  if(quiz.mode==='timed'){
    document.getElementById('quizSideStat').classList.remove('urgent');
  }
  document.getElementById('quizProgressLabel').textContent = 'Questão '+(quiz.index+1)+' de '+quiz.questions.length;
  document.getElementById('quizProgressFill').style.width = ((quiz.index)/quiz.questions.length*100)+'%';
}

function quizSelect(btn){
  if(quiz.locked) return;
  if(quiz.mode==='exam'){
    document.querySelectorAll('.quiz-alt-btn').forEach(b=> b.classList.remove('selected'));
    btn.classList.add('selected');
    quiz.selected = btn.dataset.value;
    document.getElementById('quizConfirmBtn').disabled = false;
  } else {
    // practice/timed: feedback imediato ao clicar
    quiz.locked = true;
    quiz.selected = btn.dataset.value;
    const q = quiz.questions[quiz.index];
    const correct = q.respostaCorreta;
    const hit = quiz.selected === correct;
    document.querySelectorAll('.quiz-alt-btn').forEach(function(b){
      b.classList.add('locked');
      if(b.dataset.value === correct) b.classList.add('correct');
      else if(b.dataset.value === quiz.selected) b.classList.add('incorrect');
    });
    const flash = document.getElementById('quizFlash');
    if(hit){ quiz.score++; if(quiz.mode==='timed') quiz.points += 10; flash.textContent='Certo! ✓'; flash.classList.add('ok'); registrarAcerto(); }
    else{ flash.textContent='Errado ✗'; flash.classList.add('bad'); registrarErro(); }
    if(quiz.mode==='timed'){
      document.getElementById('quizSideStat').innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2"/><path d="M9 2h6"/></svg><span id="quizTimerText">'+quiz.timeLeft+'s</span> · <span class="mono">'+quiz.points+' pts</span>';
    }
    document.getElementById('quizProgressFill').style.width = ((quiz.index+1)/quiz.questions.length*100)+'%';
    quizAdvanceTimeout = setTimeout(quizAutoNext, 950);
  }
}

function quizConfirmExam(){
  if(!quiz.selected) return;
  quiz.locked = true;
  const q = quiz.questions[quiz.index];
  const correct = q.respostaCorreta;
  document.querySelectorAll('.quiz-alt-btn').forEach(function(b){
    b.classList.add('locked');
    if(b.dataset.value === correct) b.classList.add('correct');
    else if(b.dataset.value === quiz.selected) b.classList.add('incorrect');
  });
  if(quiz.selected === correct){ quiz.score++; registrarAcerto(); }
  else { registrarErro(); }
  document.getElementById('quizProgressFill').style.width = ((quiz.index+1)/quiz.questions.length*100)+'%';
  const confirmBtn = document.getElementById('quizConfirmBtn');
  confirmBtn.textContent = (quiz.index < quiz.questions.length-1) ? 'Próxima questão' : 'Ver resultado';
  confirmBtn.onclick = quizAutoNext;
}

function quizAutoNext(){
  quiz.index++;
  if(quiz.index < quiz.questions.length){ quizRender(); }
  else { quizFinish(); }
}

function quizFinish(){
  quizStopTimer();
  const total = quiz.questions.length;
  const wrong = total - quiz.score;
  const pct = Math.round((quiz.score/total)*100);
  document.getElementById('quizPlay').style.display = 'none';
  document.getElementById('quizFooter').style.display = 'none';
  document.getElementById('quizResultPct').textContent = pct+'%';
  document.getElementById('quizResultCorrect').textContent = quiz.score;
  document.getElementById('quizResultWrong').textContent = wrong;
  if(quiz.mode==='timed'){
    document.getElementById('quizResultTotal').textContent = quiz.points;
    document.getElementById('quizResultTotalLabel').textContent = 'Pontos';
  } else {
    document.getElementById('quizResultTotal').textContent = total;
    document.getElementById('quizResultTotalLabel').textContent = 'Total';
  }
  document.getElementById('quizResultTitle').textContent = pct>=70 ? 'Mandou bem!' : (pct>=40 ? 'Bom treino!' : 'Continue praticando!');
  document.getElementById('quizResultMsg').textContent = quiz.mode==='timed'
    ? ('Você fez '+quiz.points+' pontos acertando '+quiz.score+' de '+total+' perguntas.')
    : ('Você acertou '+quiz.score+' de '+total+' questões.');
  document.getElementById('quizResults').classList.add('show');
}

/* Exposição global (handlers inline do HTML) */
window.toggleEye = toggleEye;
window.enterApp = enterApp;
window.logout = logout;
window.startQuiz = startQuiz;
window.retryQuiz = retryQuiz;
window.exitQuiz = exitQuiz;
