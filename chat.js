/* ==SHOP BAJAN CHAT== "Message Shop Bajan" opens a website chat (tawk.to) instead of WhatsApp.
   Every link to our WhatsApp number becomes a chat button, and the chat bubble only shows once a chat is open.
   Reply to chats in the free tawk.to app or at dashboard.tawk.to. */
(function(){
"use strict";
if(window.SB_CHAT)return;window.SB_CHAT=true;
var NUM="2468504460",EMBED="https://embed.tawk.to/6b05d31ac9d1e93cfdd48830/1k87c1894";
var API=window.Tawk_API=window.Tawk_API||{};window.Tawk_LoadStart=new Date();
var ready=false,want=null;
function ongoing(){try{return !!(API.isChatOngoing&&API.isChatOngoing())}catch(e){return false}}
function tidy(){try{if(!ongoing()&&!(API.isChatMaximized&&API.isChatMaximized()))API.hideWidget()}catch(e){}}
API.onLoad=function(){ready=true;tidy();if(want){var w=want;want=null;open(w)}};
API.onChatMinimized=function(){setTimeout(tidy,300)};
API.onChatEnded=function(){setTimeout(tidy,300)};
function open(note){
  if(!ready){want=note||true;return}
  try{API.showWidget();API.maximize();if(note&&note!==true&&API.addEvent)API.addEvent("asked-about",{message:String(note).slice(0,250)},function(){})}catch(e){}
  try{window.goatcounter&&goatcounter.count&&goatcounter.count({path:"event/chat-open",title:"Message Shop Bajan",event:true})}catch(e){}
}
window.sbOpenChat=open;
var s=document.createElement("script");s.async=true;s.src=EMBED;s.charset="UTF-8";s.setAttribute("crossorigin","*");
(document.head||document.documentElement).appendChild(s);

function isOurWa(h){h=String(h||"");return /(wa\.me|whatsapp\.com)/i.test(h)&&h.replace(/\D/g,"").indexOf(NUM)>-1}
function noteOf(h){try{return new URL(h,location.href).searchParams.get("text")||""}catch(e){return""}}
/* any click on a WhatsApp link to our number opens the chat instead */
document.addEventListener("click",function(e){
  var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a||!isOurWa(a.getAttribute("href")))return;
  e.preventDefault();e.stopPropagation();open(noteOf(a.getAttribute("href"))||true);
},true);
/* relabel what people see */
var LABEL=/whats ?app|850.?4460|say hi|^\s*message us/i;
var TXT=[
  [/WhatsApp us (on|at) 1 \(246\) 850-4460/g,"message us in the chat on our website"],
  [/[Mm]essage us on WhatsApp/g,function(m){return(m[0]==="M"?"M":"m")+"essage us in the chat"}],
  [/Ask us on WhatsApp/g,"Message Shop Bajan"],
  [/WhatsApp us/g,"Message us"],
  [/ or WhatsApp us\b/g," or message us"]
];
function fixLink(a){
  if(a.dataset.sbChat)return;a.dataset.sbChat="1";a.dataset.sbNote=noteOf(a.getAttribute("href"));
  a.removeAttribute("target");a.setAttribute("href","#chat");a.setAttribute("role","button");
  if(LABEL.test(a.textContent||""))a.textContent="Message Shop Bajan";
}
function fixText(root){
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){var p=n.parentNode&&n.parentNode.nodeName;return /SCRIPT|STYLE|TEXTAREA|INPUT|LABEL|OPTION/.test(p)||!/WhatsApp/.test(n.nodeValue)?2:1}}),n,list=[];
  while((n=w.nextNode()))list.push(n);
  list.forEach(function(n){var v=n.nodeValue;TXT.forEach(function(r){v=v.replace(r[0],r[1])});if(v!==n.nodeValue)n.nodeValue=v});
}
function sweep(root){
  root=root||document.body;if(!root||!root.querySelectorAll)return;
  Array.prototype.forEach.call(root.querySelectorAll("a[href]"),function(a){if(isOurWa(a.getAttribute("href")))fixLink(a)});
  fixText(root);
}
/* links we have already turned into chat buttons */
document.addEventListener("click",function(e){
  var a=e.target&&e.target.closest&&e.target.closest("a[data-sb-chat]");if(!a)return;e.preventDefault();e.stopPropagation();open(a.dataset.sbNote||true);
},true);
function start(){sweep();var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(function(){sweep()},60)}).observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
/* plain #chat links and links like shopbajanbb.com/#chat open the chat */
document.addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href="#chat"]');if(!a||a.dataset.sbChat)return;e.preventDefault();e.stopPropagation();open(true)},true);
if(location.hash==="#chat")open(true);
})();
