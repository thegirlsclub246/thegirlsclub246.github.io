/* Shop Bajan creator links for the tiny apps and the waitlist page.
   A link like shopbajanbb.com/hustle-kit/?ref=BREE10 saves the creator's code on this device for 30 days
   (same storage the shop checkout uses). When someone then pays for an app, the code is recorded in the
   "TGC Vendor Sign-ups (Responses)" Google Sheet, tagged type = "shop-bajan-app-referral", so the
   creator can be paid. Codes are checked against the list in admin (content/settings.json). */
(function(){
"use strict";
var KEY="sb-creator-code",DAYS=30;
var FORM="https://docs.google.com/forms/d/e/1FAIpQLSfGTId0Oa7jR23yfKmouDejd1AVFxPNZA8QMfMkK3JWV0mCFA/formResponse",FIELD="entry.858011822";
function get(){try{var v=JSON.parse(localStorage.getItem(KEY)||"null");return v&&v.code&&Date.now()-v.at<DAYS*864e5?v.code:""}catch(e){return ""}}
function set(code){try{localStorage.setItem(KEY,JSON.stringify({code:code,at:Date.now()}))}catch(e){}}
var m=/[?&](?:ref|code)=([A-Za-z0-9_-]{2,30})/i.exec(location.search);
if(m){
  var want=m[1].toUpperCase();
  fetch("/content/settings.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():null}).then(function(s){
    var ok=s&&Array.isArray(s.creator_codes)&&s.creator_codes.some(function(c){return c&&c.active!==false&&String(c.code||"").trim().toUpperCase()===want});
    if(ok)set(want);
  }).catch(function(){});
}
function app(){var p=location.pathname.split("/").filter(Boolean);return p[0]||"home"}
var sent={};
function record(what,detail){
  var code=get();if(!code)return;
  var key=what+"|"+(detail||"");if(sent[key])return;sent[key]=1;
  var fd=new FormData();
  fd.append(FIELD,JSON.stringify({type:"shop-bajan-app-referral",code:code,app:app(),event:what,detail:String(detail||"").slice(0,300),page:location.pathname,submittedAt:new Date().toISOString()}));
  try{if(navigator.sendBeacon&&navigator.sendBeacon(FORM,fd))return}catch(e){}
  try{fetch(FORM,{method:"POST",mode:"no-cors",body:fd,keepalive:true})}catch(e){}
}
/* Any tap on a PayPal or Dodo payment link counts as "went to pay" */
document.addEventListener("click",function(e){
  var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;
  var h=a.href||"";
  if(/paypal\.com\/(ncp\/payment|webapps\/billing)|checkout\.dodopayments\.com|paypal\.me\//i.test(h))record("went-to-pay",h);
},true);
window.sbCreator={code:get,record:record};
})();
