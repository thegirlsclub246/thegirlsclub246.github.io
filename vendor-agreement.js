/* Shop Bajan by The Girls Club: vendor plans + agreement (shared by brands.html and vendors.html)
   Plans from 11 Nov 2026: Starter $0, Spotlight $75, Signature $125 a month (BBD),
   all + 15% per sale for the vendor's first 12 months, then 20%.
   Vendors who signed before then (version starting "2026-10") keep the deal they signed:
   Starter 15%, paid plans (incl. the retired Essentials) 5%. */
(function(){
var RATE={first:15,after:20,months:12};
var PLANS={starter:{name:"Starter",fee:0,rate:15},spotlight:{name:"Spotlight",fee:75,rate:15},signature:{name:"Signature",fee:125,rate:15},
  essentials:{name:"Essentials",fee:40,rate:5,hidden:true}}; /* Essentials: retired 11 Nov 2026, kept only for vendors already on it */
var OLD={starter:15,essentials:5,spotlight:5,signature:5};
var VERSION="2026-12-10-rules";
/* From 10 Dec 2026: marketplace rules + BBD $0.10 listing fee for each new physical product (digital free).
   Vendors who signed earlier keep their old terms until they accept this version in the Vendor Portal;
   products they listed before accepting never pay the listing fee. */
var RULES_FROM="2026-12-10",LISTING_FEE=0.10;
/* rateDeal keeps the per-sale deal a vendor first signed when they later accept a newer agreement */
function isLegacy(c){var d=c&&(c.rateDeal||c.version);return !!(d&&/^2026-10/.test(d))}
function hasRules(c){return !!(c&&c.version&&c.version>=RULES_FROM)}
var RULES=[
 ["It's yours to sell","You made it, own it, or have the right to sell it. No fakes, copies or knock-offs of other brands."],
 ["It matches the listing","Your own clear photos (no stock photos or someone else's photos), and an honest name, price and description."],
 ["It's legal and safe in Barbados","No food, alcohol, weapons, medicines or anything banned. Cosmetics, skincare and candles show ingredients, your business name and a batch or use-by date."],
 ["Honest claims only","No \"cures\", \"guaranteed\" or medical claims. No fake reviews, fake \"sold out\" or fake countdowns."],
 ["One product, one listing","No copies of the same item. Sizes, colours and scents go in the options."],
 ["Same price or better","You won't advertise the same item publicly for less elsewhere."],
 ["Quality over quantity","Fewer, better products. We may say no to a listing that doesn't meet the standard, and we'll tell you why."],
 ["Shop Bajan customers stay Shop Bajan customers","Don't contact Shop Bajan buyers to sell to them outside the marketplace."]];
var DIGITAL_RULES=[
 ["Original work only","Made by you, in your own words and design. No PLR, MRR or resell-rights packs sold as they are, no AI-generated filler, and no reselling someone else's course or template."],
 ["Real value","It does what its title says and is worth its price."],
 ["Show what's inside","At least one real preview of the inside, plus what the buyer gets (pages, file type, video length)."],
 ["Working download","The link opens without a login or request-access step and keeps working for at least 12 months after each sale."],
 ["No get-rich promises","No income claims you can't prove and no earnings screenshots that aren't yours."],
 ["Income disclaimer","Anything about money, business, side hustles, selling or income shows \"Results may vary. Not a promise of income.\" on the product page and inside the product."]];
function addMonths(d,m){var x=new Date(d);x.setMonth(x.getMonth()+m);return x}
/* first day of the 20% rate for a vendor (YYYY-MM-DD), from when their shop was set up */
function rateUntil(v){var c=(v&&v.contract)||{};var start=(v&&v.created_at)||c.signedAt;if(!start)return"";var d=addMonths(start,RATE.months);
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
/* per-sale rate in % for vendor v on date (YYYY-MM-DD, default today) */
function rateFor(v,date){var c=(v&&v.contract)||{};var plan=(v&&v.plan)||c.plan||"starter";
  if(isLegacy(c))return OLD[plan]!=null?OLD[plan]:5;
  var u=rateUntil(v);if(!u)return RATE.first;
  var d=date||new Date().toISOString().slice(0,10);return String(d).slice(0,10)<u?RATE.first:RATE.after}
function legacyPlanClause(p,pl){return "The Vendor chooses a plan: Starter (free, no monthly fee, 15% per sale) or a paid plan with 5% per sale: Essentials ($40 a month), Spotlight ($75 a month) or Signature ($125 a month), in BBD."+(pl?" The Vendor has chosen "+pl.name+(pl.fee?" ($"+pl.fee+" a month).":" (free)."):"")}
function clauses(p,c){var pl=PLANS[p],legacy=isLegacy(c),rules=!c||hasRules(c),feeTxt;
  if(legacy){var r=OLD[p]!=null?OLD[p]:5,why=p==="starter"?"covers card fees, checkout, order handling and customer care":"covers card and payment fees";
    feeTxt=r+"% of each sale to The Girls Club, which "+why+"; the Vendor keeps "+(100-r)+"%. Each sale uses the rate in force on the day it is sold. "+(rules?"Apart from the plan's monthly fee (none on Starter), this per-sale fee and the listing fee below, there are no other fees.":"Apart from the plan's monthly fee (none on Starter) and this per-sale fee, there are no listing or hidden fees.")}
  else if(rules)feeTxt="On every plan, The Girls Club takes "+RATE.first+"% of each sale during the Vendor's first "+RATE.months+" months (counted from the day the Vendor's shop is set up in the Vendor Portal) and "+RATE.after+"% after that. The fee covers card fees, checkout, order handling and customer care. The Vendor keeps "+(100-RATE.first)+"% of each sale in the first year and "+(100-RATE.after)+"% after that. Each sale uses the rate for the day it is sold, and The Girls Club will remind the Vendor at least 30 days before the rate changes. Apart from the plan's monthly fee (none on Starter), this per-sale fee and the listing fee below, there are no other fees.";
  else feeTxt="On every plan, The Girls Club takes "+RATE.first+"% of each sale during the Vendor's first "+RATE.months+" months (counted from the day the Vendor's shop is set up in the Vendor Portal) and "+RATE.after+"% after that. The fee covers card fees, checkout, order handling and customer care. The Vendor keeps "+(100-RATE.first)+"% of each sale in the first year and "+(100-RATE.after)+"% after that. Each sale uses the rate for the day it is sold, and The Girls Club will remind the Vendor at least 30 days before the rate changes. Apart from the plan's monthly fee (none on Starter) and this per-sale fee, there are no listing or hidden fees.";
  var planTxt=legacy?legacyPlanClause(p,pl):("The Vendor chooses a plan: Starter (free, no monthly fee), Spotlight ($75 a month) or Signature ($125 a month), in BBD. Every plan also has the per-sale fee below. Spotlight and Signature add extra promotion for the Vendor's brand."+(pl?" The Vendor has chosen "+pl.name+(pl.fee?" ($"+pl.fee+" a month).":" (free)."):""));
  return [
["Plan and monthly fee",planTxt+" The first month on any paid plan is free. For a paid plan, the Vendor sets up the monthly fee by debit or credit card through The Girls Club's secure PayPal sign-up link; it is charged automatically each month from the start of the second month. The Vendor may change or cancel the plan at any time; a change applies from the next monthly payment. If a monthly payment fails, The Girls Club may take it from the Vendor's next payout."],
["Stock","The Vendor delivers products to The Girls Club in St. Thomas (or as agreed). Each delivery is logged on a Stock Received form signed by both."],
["Ownership","The Vendor owns all products until they are sold. Ownership passes straight from the Vendor to the customer at the time of sale."],
["Prices","The Vendor sets the retail price of each product, in BBD. Price changes go live once The Girls Club approves them in the Vendor Portal, normally within 2 working days. The Girls Club will not discount a Vendor's product without the Vendor's written OK. Shop-wide discount codes are paid for by The Girls Club, so the Vendor's share is worked out on the full listed price."],
["Selling and payments","The Girls Club lists, sells and delivers the products, and collects payment from customers. The Vendor does not take payment for Shop Bajan orders."],
["Per-sale fee",feeTxt],
].concat(rules?[["Listing fee","Each new physical product costs BBD $"+LISTING_FEE.toFixed(2)+" to list, charged once when The Girls Club approves it and taken from the Vendor's next Sunday payout (or the first payout with sales). Digital products are free to list. Editing, repricing or restocking a product is free. Listing fees are not refunded once a product has gone live."+(legacy||(c&&c.previous)?" Products the Vendor listed before accepting this version never pay a listing fee.":"")]]:[]).concat([
["Payouts","Every Sunday, The Girls Club pays the Vendor their share of all items sold in the week before (Sunday to Saturday), by the payout method the Vendor chose, with a statement. A sale is paid out only once the customer's payment has cleared. If a Sunday payout can't go through (for example a bank holiday), it is made the next working day."],
["Customer returns","The Girls Club handles customer questions and returns. If an item is returned for a fault, damage or wrong description that is the Vendor's responsibility, the refund is taken from the Vendor's next payout and the item goes back to the Vendor. Returns caused by The Girls Club are paid for by The Girls Club."],
["Unsold stock","Each batch stays on consignment for 60 days. After that the Vendor may renew it, swap it for new stock, or collect it within 14 days. Stock not collected within 30 days after a written reminder may be returned to the Vendor at the Vendor's cost."],
["Care, loss and damage","The Girls Club stores products clean, dry and out of direct sun. If a product is lost, stolen or damaged in The Girls Club's care through its fault, The Girls Club pays the Vendor its share of the listed price. The Girls Club is not responsible for events outside its control (such as hurricane, flood or fire) or for products that expire naturally."],
["Digital products","For digital products (such as e-books, guides, templates or classes) no stock is delivered, and the Stock, Ownership, Unsold stock and Care, loss and damage points do not apply. The Vendor sends The Girls Club a working download link, keeps it working for at least 12 months after each sale, and confirms they own the content or have the right to sell it. After the customer's payment clears, The Girls Club sends the link to the customer. Digital products can't be returned: a refund is given only if the file doesn't work or isn't as described and the Vendor can't fix it within 3 days, and that refund is taken from the Vendor's next payout. The Girls Club will not share, copy or resell the Vendor's files."],
["Product quality and safety","The Vendor promises every product is legal to sell in Barbados, genuine, theirs to sell, and matches its description and photos. Cosmetics, skincare and candles must be labelled with ingredients, the Vendor's business name and a use-by or batch date where relevant. The Vendor is responsible for any claim caused by a faulty or unsafe product. Shop Bajan does not sell food, liquor, wine or other alcohol. The Vendor will not list them. The Girls Club may refuse or remove any product."],
["Photos and marketing","The Vendor allows The Girls Club to use their business name, logo, product photos and descriptions to promote the products during this agreement and for 30 days after, and confirms they own or may use these photos."],
["Records","The Vendor keeps product details, photos, prices and stock up to date in the Vendor Portal (thegirlsclub246.com/vendors). The Girls Club approves each product and change before it shows on the website. Sales figures and statements are for information and may be approximate; payouts follow the actual cleared sales."],
["Customer information","The Girls Club shares only what the Vendor needs to fulfil an order. The Vendor uses it only for that order, keeps it private and does not contact customers to sell outside Shop Bajan, in line with the Data Protection Act, 2019."],
["Selling elsewhere","The Vendor may keep selling in their own shop and online, but will not advertise the same product publicly for less than its price on Shop Bajan during this agreement."],
["Ending the agreement","Either side may end this agreement with 14 days' written notice (WhatsApp or email), and the monthly plan payment is then cancelled. The Girls Club then pays all sales owed at the next Sunday payout, and the Vendor collects unsold stock within 14 days. The Girls Club may end it at once if the Vendor breaks the Product quality and safety point."],
["General","The Vendor and The Girls Club are independent businesses; this is not a partnership or employment. Changes must be agreed in writing by both. This agreement is governed by the laws of Barbados."]]).map(function(x){
    if(rules&&x[0]==="Digital products")return[x[0],x[1]+" Digital products must also meet these standards: "+DIGITAL_RULES.map(function(d){return d[0]+": "+d[1]}).join(" ")];
    if(rules&&x[0]==="Product quality and safety")return[x[0],x[1]+" No medical claims, \"guaranteed\" results, fake reviews or fake urgency."];
    if(rules&&x[0]==="Ending the agreement")return[x[0],x[1]+" A product that breaks the Marketplace rules is first sent back for changes, then hidden; a third time in 6 months, or a serious breach (fakes, stolen work, unsafe products, misleading money claims, contacting Shop Bajan customers to sell outside Shop Bajan), lets The Girls Club close the Vendor's shop at once. Sales already made are paid at the next Sunday payout, less any refunds owed."];
    return x;}).concat(rules?[["Marketplace rules","Every product follows the Shop Bajan Marketplace rules: "+RULES.map(function(d){return d[0]+": "+d[1]}).join(" ")]]:[]);}

window.TGC_AGREE={PLANS:PLANS,RATE:RATE,clauses:clauses,rateFor:rateFor,rateUntil:rateUntil,isLegacy:isLegacy,hasRules:hasRules,RULES:RULES,DIGITAL_RULES:DIGITAL_RULES,LISTING_FEE:LISTING_FEE,RULES_FROM:RULES_FROM,VERSION:VERSION};
})();
