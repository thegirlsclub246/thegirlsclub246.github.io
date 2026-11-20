/* Shop Bajan sign-up pop-ups.
   Only shows REAL sign-ups from the waitlist Google Sheet (via the Apps Script feed below).
   The feed shares only the time and type of each sign-up: no names, no contact details.
   If there are no recent sign-ups, it shows one honest message about founding vendor spots. */
(function(){
"use strict";
var FEED="";            /* paste the Apps Script web app URL here once it's deployed */
var SPOTS_MSG={t:"Vendor spots open",s:"Sell with us",href:"brands.html"};
var MAX_AGE=7*864e5, FIRST=6000, SHOW=6500, GAP=18000, MAX_PER_VISIT=4;

if(window.__sbPop)return;window.__sbPop=1;
var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
try{if(sessionStorage.getItem("sb-pop-off"))return}catch(e){}

var css=".sbpop{position:fixed;left:16px;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);z-index:80;display:flex;align-items:center;gap:12px;max-width:min(340px,calc(100vw - 32px));background:#fff;border:2.5px solid #00267F;border-radius:18px;padding:12px 40px 12px 14px;box-shadow:4px 4px 0 #FFC72C;font:600 15px/1.35 Quicksand,'Segoe UI',system-ui,sans-serif;color:#16213E;opacity:0;transform:translateY(16px);pointer-events:none;transition:opacity .3s,transform .3s}"+
".sbpop.on{opacity:1;transform:none;pointer-events:auto}"+
".sbpop i{flex:none;width:12px;height:12px;border-radius:50%;background:#FF6F59;box-shadow:0 0 0 4px #FFF3C7}"+
".sbpop b{display:block;color:#00267F;font-weight:800}"+
".sbpop small{display:block;color:#4A5675;font-size:13px;font-weight:600;margin-top:1px}"+
".sbpop a{color:#00267F}"+
".sbpop button{position:absolute;top:6px;right:6px;width:30px;height:30px;border:0;background:none;color:#4A5675;font-size:20px;line-height:1;cursor:pointer;border-radius:50%}"+
".sbpop button:focus-visible{outline:3px solid #FF6F59}"+
"@media(prefers-reduced-motion:reduce){.sbpop{transition:none}}"+
"@media(min-width:900px){.sbpop{left:24px;bottom:24px}}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

var box=document.createElement("div");box.className="sbpop";box.setAttribute("role","status");box.setAttribute("aria-live","polite");
box.innerHTML='<i aria-hidden="true"></i><span class="sbpop-t"></span><button type="button" aria-label="Hide these messages">&times;</button>';
document.body.appendChild(box);
var txt=box.querySelector(".sbpop-t"),timer=null,stopped=false;
box.querySelector("button").addEventListener("click",function(){stopped=true;clearTimeout(timer);box.classList.remove("on");try{sessionStorage.setItem("sb-pop-off","1")}catch(e){}});

function ago(ms){var m=Math.round(ms/6e4);if(m<2)return"just now";if(m<60)return m+" minutes ago";var h=Math.round(m/60);if(h<24)return h+(h===1?" hour ago":" hours ago");var d=Math.round(h/24);return d+(d===1?" day ago":" days ago")}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function msgFor(ev){
  if(ev.kind==="brand")return{t:"A new brand just signed up!",s:ago(Date.now()-ev.at)};
  return{t:"Someone in Barbados just joined the waitlist",s:ago(Date.now()-ev.at)}}
function render(m){txt.innerHTML="<b>"+esc(m.t)+"</b><small>"+(m.href?'<a href="'+esc(m.href)+'">'+esc(m.s)+"</a>":esc(m.s))+"</small>"}

function run(list){
  var i=0;
  function next(){if(stopped||i>=list.length)return;render(list[i++]);box.classList.add("on");
    timer=setTimeout(function(){box.classList.remove("on");timer=setTimeout(next,GAP)},SHOW)}
  timer=setTimeout(next,FIRST)}

function start(events){
  var now=Date.now(),list=(events||[]).filter(function(e){return e&&(e.kind==="brand"||e.kind==="waitlist")&&typeof e.at==="number"&&e.at<=now&&now-e.at<MAX_AGE})
    .sort(function(a,b){return b.at-a.at}).slice(0,MAX_PER_VISIT).map(msgFor);
  var onBrands=/brands(\.html)?$/.test(location.pathname);
  if(!list.length&&!onBrands)list=[SPOTS_MSG];          /* honest fallback: no fake sign-ups */
  else if(!list.length&&onBrands)list=[{t:SPOTS_MSG.t,s:"Sign up below",href:"#join"}];
  if(reduce)list=list.slice(0,1);
  run(list)}

if(window.SB_POP_DEMO){start(window.SB_POP_DEMO);return}   /* draft previews only */
if(!FEED){start([]);return}
var ctl=window.AbortController?new AbortController():null;var to=setTimeout(function(){ctl&&ctl.abort()},5000);
fetch(FEED,{cache:"no-store",signal:ctl&&ctl.signal}).then(function(r){return r.ok?r.json():{}}).then(function(d){clearTimeout(to);start(d&&d.events)}).catch(function(){start([])});
})();
