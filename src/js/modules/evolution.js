/* ============================================================================
   QUATRION LAB — EVOLUÇÃO: rastreio de desempenho (Acertos / Erros)
   Persiste os stats do usuário em localStorage (chave própria, independente da
   sessão) e reflete os números na aba Evolução. Ao entrar pela primeira vez,
   tudo inicia zerado. registrarAcerto()/registrarErro() são os pontos de
   entrada usados pelos experimentos e pelo motor de quiz.
   ============================================================================ */

/* Chave de persistência + estado inicial — constantes nomeadas no lugar de
   strings/números mágicos espalhados pelo módulo. */
const EVOLUTION_STORAGE_KEY = 'quatrion:evolution-stats';
const DEFAULT_STATS = Object.freeze({ acertos: 0, erros: 0 });

/* IDs dos elementos que exibem os números na aba Evolução. */
const EVOLUTION_DOM_IDS = Object.freeze({
  acertos: 'evoAcertosValue',
  acertosPct: 'evoAcertosPct',
  erros: 'evoErrosValue',
  errosPct: 'evoErrosPct',
  total: 'evoTotalValue',
  masteryPct: 'masteryPct',
  masteryFill: 'masteryFill'
});

/* Percentual de domínio exibido enquanto o aluno ainda não tem dados reais —
   preserva o valor de referência que a tela já mostrava. */
const MASTERY_FALLBACK_PCT = 78;

/* ---------------------------------------------------------------- persistência */

function sanitizeStats(parsed){
  const acertos = Number.isFinite(parsed && parsed.acertos) ? Math.max(0, Math.floor(parsed.acertos)) : DEFAULT_STATS.acertos;
  const erros = Number.isFinite(parsed && parsed.erros) ? Math.max(0, Math.floor(parsed.erros)) : DEFAULT_STATS.erros;
  return { acertos, erros };
}

export function getEvolutionStats(){
  try{
    const raw = window.localStorage.getItem(EVOLUTION_STORAGE_KEY);
    if(!raw) return { ...DEFAULT_STATS };
    return sanitizeStats(JSON.parse(raw));
  }catch(error){
    // localStorage indisponível (modo privado) ou JSON corrompido:
    // degrada para o estado zerado sem quebrar a interface.
    return { ...DEFAULT_STATS };
  }
}

function saveStats(stats){
  try{
    window.localStorage.setItem(EVOLUTION_STORAGE_KEY, JSON.stringify(stats));
  }catch(error){
    // Sem storage: a sessão continua funcional, apenas não persiste.
  }
}

/* ---------------------------------------------------------------- registro */

function registerResult(field){
  const stats = getEvolutionStats();
  stats[field] += 1;
  saveStats(stats);
  renderEvolution();
  return stats;
}

export function registrarAcerto(){ return registerResult('acertos'); }
export function registrarErro(){ return registerResult('erros'); }

/* ---------------------------------------------------------------- renderização */

function formatCount(value){
  return value.toLocaleString('pt-BR');
}

function setText(elementId, value){
  const el = document.getElementById(elementId);
  if(el) el.textContent = value;
}

function getPercentages(stats){
  const total = stats.acertos + stats.erros;
  if(total === 0) return { acertos: 0, erros: 0, total: 0 };
  const acertosPct = Math.round((stats.acertos / total) * 100);
  return { acertos: acertosPct, erros: 100 - acertosPct, total };
}

function applyMastery(stats){
  const total = stats.acertos + stats.erros;
  const pct = total > 0 ? Math.round((stats.acertos / total) * 100) : MASTERY_FALLBACK_PCT;
  setText(EVOLUTION_DOM_IDS.masteryPct, pct + '%');
  const fill = document.getElementById(EVOLUTION_DOM_IDS.masteryFill);
  if(fill) requestAnimationFrame(function(){ fill.style.width = pct + '%'; });
}

export function renderEvolution(){
  const stats = getEvolutionStats();
  const pct = getPercentages(stats);
  setText(EVOLUTION_DOM_IDS.acertos, formatCount(stats.acertos));
  setText(EVOLUTION_DOM_IDS.acertosPct, pct.acertos + '%');
  setText(EVOLUTION_DOM_IDS.erros, formatCount(stats.erros));
  setText(EVOLUTION_DOM_IDS.errosPct, pct.erros + '%');
  setText(EVOLUTION_DOM_IDS.total, formatCount(pct.total));
  applyMastery(stats);
}

/* Ponto de entrada do entrypoint (main.js): sincroniza a aba Evolução com o
   que está salvo no localStorage assim que a aplicação carrega. */
export function initEvolution(){
  renderEvolution();
}
