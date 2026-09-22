/* ============================================================================
   QUATRION LAB — MAIN (ENTRYPOINT)
   Importa e conecta o router, os componentes e os módulos de funcionalidade.
   Os módulos ES6 expõem suas funções em window para os handlers inline do HTML
   (onclick), preservando integralmente o comportamento do arquivo monolítico.
   ============================================================================ */

import { showTab, pillSelect } from './router.js';
import { initToggles } from './components/toggle.js';

// Dados — disponibilizados globalmente para os handlers inline (startQuiz)
import {
  SIMULADO_ENEM_01,
  SIMULADO_ENEM_02,
  SIMULADO_TEMATICO,
  QUESTOES_QUESTIONS,
  GAMES_QUESTIONS
} from './data/questionsData.js';

// Módulos de funcionalidade (expõem funções globais ao serem importados)
import './components/sidebar.js';
import './modules/questions.js';
import './modules/simulations.js';

// Evolução — animação da barra de domínio ao carregar a página
import { initEvolution } from './modules/evolution.js';

// Ponto único de limpeza — chamado ao trocar de aba, sair do quiz ou deslogar.
// Composto aqui (sem ciclos de importação) e exposto em window porque os
// handlers inline e os módulos o referenciam globalmente, como no monolítico.
import { stopEruption, carbonStopTimers } from './modules/simulations.js';
import { quizStopTimer } from './modules/questions.js';
window.stopAllTimers = function(){
  stopEruption();
  quizStopTimer();
  carbonStopTimers();
};

/* Login form (submit) — mesmo binding do arquivo original */
document.getElementById('loginForm').addEventListener('submit', function(e){
  e.preventDefault();
  window.enterApp(false);
});

/* Componentes visuais */
initToggles();
initEvolution();

/* Handlers inline exigem as funções no escopo global — expostas pelos módulos,
   e os conjuntos de questões precisam estar acessíveis para startQuiz(...). */
window.SIMULADO_ENEM_01 = SIMULADO_ENEM_01;
window.SIMULADO_ENEM_02 = SIMULADO_ENEM_02;
window.SIMULADO_TEMATICO = SIMULADO_TEMATICO;
window.QUESTOES_QUESTIONS = QUESTOES_QUESTIONS;
window.GAMES_QUESTIONS = GAMES_QUESTIONS;

/* Re-export do router para referência programática interna (se necessário). */
export { showTab, pillSelect };
