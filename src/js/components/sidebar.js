/* ============================================================================
   QUATRION LAB — SIDEBAR (menu desktop + drawer mobile) e utilitários de App
   Extraído do arquivo monolítico original. Lógica idêntica, nenhuma mudança
   de comportamento. Funções expostas em window para os handlers inline do HTML.
   ============================================================================ */

export function openMobileMenu(){
  document.getElementById('mobile-menu').classList.add('open');
  document.getElementById('mobile-menu-backdrop').classList.add('open');
}

export function closeMobileMenu(){
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('mobile-menu-backdrop').classList.remove('open');
}

export function toast(msg){
  let el = document.getElementById('toastEl');
  if(!el){
    el = document.createElement('div');
    el.id = 'toastEl';
    el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translate(-50%,14px);z-index:90;background:#0F1E22;'+
      'border:1px solid rgba(0,229,201,.35);border-radius:14px;padding:12px 18px;font-size:13px;font-weight:600;color:#fff;'+
      'opacity:0;transition:opacity .3s ease, transform .3s ease;max-width:90vw;text-align:center';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(function(){ el.style.opacity=1; el.style.transform='translate(-50%,0)'; });
  clearTimeout(el._t);
  el._t = setTimeout(function(){ el.style.opacity=0; el.style.transform='translate(-50%,14px)'; }, 2400);
}

// fechamento defensivo: se a tela crescer para desktop com o menu aberto, fecha sozinho
window.addEventListener('resize', function(){
  if(window.innerWidth >= 900) closeMobileMenu();
});

window.openMobileMenu = openMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toast = toast;
