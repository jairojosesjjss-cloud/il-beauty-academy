/* Píxel de Meta: evento "Contact" al tocar cualquier enlace a WhatsApp (https://wa.me/) o de texto (sms:).
   Un solo detector para todo el sitio: funciona también con botones nuevos. */
(function(){
  var PAGES={'/':'Inicio','/index.html':'Inicio','/il-beauty-academy.html':'Inicio','/cursos/':'Cursos','/citas/':'Citas',
             '/manicura-rusa-pro/':'Manicura Rusa Pro','/curso-manicura-rusa/':'Manicura Rusa y Gel-X'};
  var COURSES={'curso-unas':'Acrílico Básico','curso-manicure':'Manicura Rusa Pro','curso-pedicura':'Curso Profesional de Pedicura en Seco','curso-mastery':'Manicura Rusa Completa'};
  function pageName(){
    var p=location.pathname.replace(/index\.html$/,'');
    if(p.length>1&&p.slice(-1)!=='/'&&!/\.html$/.test(p))p+='/';
    return PAGES[p]||document.title;
  }
  document.addEventListener('click',function(e){
    if(!window.fbq||!e.target.closest)return;
    var a=e.target.closest('a[href]');if(!a)return;
    var href=a.getAttribute('href')||'';
    if(href.indexOf('https://wa.me/')!==0&&href.indexOf('sms:')!==0)return;
    var card=a.closest('article[id]');
    var name=(card&&COURSES[card.id])||pageName();
    fbq('track','Contact',{content_name:name});
  },true);
})();
