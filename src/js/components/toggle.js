/* ============================================================================
   QUATRION LAB — TOGGLE (botões de configuração ON/OFF)
   Extraído do arquivo monolítico original. A interatividade visual do toggle
   era feita inline no HTML (`onclick="this.classList.toggle('on')"`); aqui
   centralizamos a mesma lógica via event delegation, preservando o comportamento.
   ============================================================================ */

export function initToggles(){
  // Delegação: qualquer clique em .toggle alterna .on — comportamento idêntico
  // ao onclick inline original (this.classList.toggle('on')).
  document.addEventListener('click', function(e){
    const toggle = e.target.closest('.toggle');
    if(!toggle) return;
    toggle.classList.toggle('on');
  });
}
