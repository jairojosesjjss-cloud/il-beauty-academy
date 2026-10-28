/* Reemplaza las reseñas fijas por las de Google cuando /api/reviews responde.
   Si falla, la página se queda con las reseñas que ya tiene. */
(function(){
var sec=document.getElementById('resenas');if(!sec||!window.fetch)return;
var T={es:{count:'reseñas en Google',all:'Ver todas en Google',write:'Deja tu reseña'},
       en:{count:'Google reviews',all:'See all on Google',write:'Leave a review'}};
function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function stars(n){n=Math.round(n);return '★★★★★'.slice(0,n)+'☆☆☆☆☆'.slice(0,5-n);}
function cut(s,max){return s.length>max?s.slice(0,max).replace(/\s+\S*$/,'')+'…':s;}
function render(d,lang){
  var t=T[lang]||T.es;
  var list=d.reviews.filter(function(r){return r.rating>=4;});
  if(!d.count||!list.length)return;
  var rating=sec.querySelector('.rating');
  rating.querySelector('.num').textContent=d.rating.toFixed(1);
  rating.querySelector('.stars').textContent=stars(d.rating);
  rating.querySelector('.cnt').textContent=d.count+' '+t.count;
  var grid=sec.querySelector('.rev-grid');grid.innerHTML='';
  list.slice(0,4).forEach(function(r){
    var c=el('div','rev rev-live');
    c.appendChild(el('div','s',stars(r.rating)));
    c.appendChild(el('p',null,'"'+cut(r.text,280)+'"'));
    var who=el('div','who');
    if(r.authorUrl){var a=el('a',null,r.author);a.href=r.authorUrl;a.target='_blank';a.rel='noopener';who.appendChild(a);}else who.textContent=r.author;
    c.appendChild(who);c.appendChild(el('div','svc',r.time+' · Google'));
    grid.appendChild(c);
  });
  var old=sec.querySelector('.rev-links');if(old)old.remove();
  var links=el('div','rev-links');
  if(d.url){var a1=el('a','btn btn-ghost',t.all);a1.href=d.url;a1.target='_blank';a1.rel='noopener';links.appendChild(a1);}
  if(d.writeUrl){var a2=el('a','btn btn-dark',t.write);a2.href=d.writeUrl;a2.target='_blank';a2.rel='noopener';links.appendChild(a2);}
  grid.parentNode.appendChild(links);
}
var cache={};
function load(){
  var lang=document.documentElement.lang==='en'?'en':'es';
  if(cache[lang])return render(cache[lang],lang);
  fetch('/api/reviews?lang='+lang).then(function(r){return r.ok?r.json():null;})
    .then(function(d){if(d&&d.reviews){cache[lang]=d;render(d,lang);}}).catch(function(){});
}
load();
[].forEach.call(document.querySelectorAll('.lang-switch button'),function(b){b.addEventListener('click',function(){setTimeout(load,0);});});
})();
