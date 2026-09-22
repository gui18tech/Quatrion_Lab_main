/* ============================================================================
   QUATRION LAB — ROUTER SPA (exibição/ocultação das abas)
   Extraído do arquivo monolítico original. Lógica idêntica, nenhuma mudança
   de comportamento: cada "página" é uma <section> que ganha/perde .active.
   As funções são expostas em window porque o HTML usa handlers inline.
   ============================================================================ */

/**
 * Troca de aba sempre encerra timers/erupções pendentes — evita comportamento
 * "fantasma" de animações ou cronômetros de uma tela anterior.
 */
export function showTab(name){
  stopAllTimers();
  document.getElementById('quiz-overlay').classList.remove('active');
  document.querySelectorAll('.tab-screen').forEach(s=> s.classList.toggle('active', s.id==='tab-'+name));
  // seletor único cobre Sidebar (desktop) E o drawer mobile — os dois usam o
  // mesmo padrão .nav-btn[data-tab], então ficam sempre sincronizados
  document.querySelectorAll('.nav-btn[data-tab]').forEach(b=> b.classList.toggle('active', b.dataset.tab===name));
  document.querySelector('.content').scrollTop = 0;
  closeMobileMenu();
}

export function pillSelect(el){
  el.parentElement.querySelectorAll('.pill').forEach(p=> p.classList.remove('active'));
  el.classList.add('active');
}

/* O router depende de stopAllTimers (modules/simulations.js) e
   closeMobileMenu (components/sidebar.js) — importados e conectados em main.js. */
window.showTab = showTab;
window.pillSelect = pillSelect;
