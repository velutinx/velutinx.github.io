// assets/js/shop-shared.js
(function () {
"use strict";

const translations = {
en:{
shopTitle:"My Store",
filterTitle:"Filter by Category",
catAll:"All",
catNot:"Not On Booth",
catFrom:"From Booth",
catSisters:"The Sisters Corner",
sortTitle:"Sort by",
sortNewest:"Newest",
sortOldest:"Oldest",
sortLow:"Price: Low to High",
sortHigh:"Price: High to Low",
productsTitle:"Products",
searchPlaceholder:"Search",
cartTitle:"Shopping Cart",
totalLabel:"Total",
snackText:"Added successfully",
loginBtn:"Website",
disclaimerAge:"Disclaimer: All characters depicted are portrayed as 18+. This is a fictional, consensual depiction.",
disclaimerRefund:"Digital products are non-refundable after purchase.",
contentsTitle:"Contents:",
contentsDesc:"ZIP file containing {count} AI-generated illustrations",
originalPrice:"Original Price:",
currentPrice:"Current Price:",
addToCart:"Add to Cart",
removeFromCart:"Remove from Cart"
},
ja:{
shopTitle:"マイストア",
filterTitle:"カテゴリでフィルター",
catAll:"すべて",
catNot:"Booth未掲載",
catFrom:"Boothから",
catSisters:"シスターズコーナー",
sortTitle:"並び替え",
sortNewest:"最新",
sortOldest:"最古",
sortLow:"価格: 安い→高い",
sortHigh:"価格: 高い→安い",
productsTitle:"商品",
searchPlaceholder:"検索",
cartTitle:"ショッピングカート",
totalLabel:"合計",
snackText:"カートに追加しました",
loginBtn:"ウェブサイト",
disclaimerAge:"免責事項：すべてのキャラクターは18歳以上として描写されています。これはフィクションであり、合意のある描写です。",
disclaimerRefund:"デジタル商品は購入後の返金はできません。",
contentsTitle:"内容：",
contentsDesc:"{count}枚のAI生成イラストを含むZIPファイル",
originalPrice:"元の価格：",
currentPrice:"現在の価格：",
addToCart:"カートに追加",
removeFromCart:"カートから削除"
},
zh:{
shopTitle:"我的商店",
filterTitle:"按类别筛选",
catAll:"全部",
catNot:"未在 Booth 上架",
catFrom:"来自 Booth",
catSisters:"姐妹专区",
sortTitle:"排序方式",
sortNewest:"最新",
sortOldest:"最旧",
sortLow:"价格：从低到高",
sortHigh:"价格：从高到低",
productsTitle:"商品",
searchPlaceholder:"搜索",
cartTitle:"购物车",
totalLabel:"总计",
snackText:"已成功加入购物车",
loginBtn:"网站",
disclaimerAge:"免责声明：所有角色均被描绘为18岁以上。这是虚构且双方同意的描写。",
disclaimerRefund:"数字商品购买后不可退款。",
contentsTitle:"内容：",
contentsDesc:"ZIP 文件，包含 {count} 张 AI 生成插图",
originalPrice:"原价：",
currentPrice:"现价：",
addToCart:"加入购物车",
removeFromCart:"从购物车移除"
},
es:{
shopTitle:"Mi Tienda",
filterTitle:"Filtrar por Categoría",
catAll:"Todos",
catNot:"No en Booth",
catFrom:"Desde Booth",
catSisters:"Rincón de las Hermanas",
sortTitle:"Ordenar por",
sortNewest:"Más reciente",
sortOldest:"Más antiguo",
sortLow:"Precio: menor a mayor",
sortHigh:"Precio: mayor a menor",
productsTitle:"Productos",
searchPlaceholder:"Buscar",
cartTitle:"Carrito de Compras",
totalLabel:"Total",
snackText:"Añadido correctamente",
loginBtn:"Sitio web",
disclaimerAge:"Aviso: Todos los personajes representados se muestran como mayores de 18 años. Es una representación ficticia y consensuada.",
disclaimerRefund:"Los productos digitales no son reembolsables después de la compra.",
contentsTitle:"Contenido:",
contentsDesc:"Archivo ZIP con {count} ilustraciones generadas por IA",
originalPrice:"Precio original:",
currentPrice:"Precio actual:",
addToCart:"Añadir al carrito",
removeFromCart:"Eliminar del carrito"
}
};

const tierMap={
1.5:{JPY:250,CNY:10.5,MXN:25},
3.0:{JPY:500,CNY:21.0,MXN:50},
10.0:{JPY:1500,CNY:69.0,MXN:175}
};

const approxRates={JPY:158,CNY:6.9,MXN:18};

let currentLang=localStorage.getItem("language")||"en";
let currentCurrency=currentLang==="en"?"USD":
currentLang==="ja"?"JPY":
currentLang==="zh"?"CNY":"MXN";

let prices={low:1.5,med:3.0,high:10.0};

async function loadPrices(){
try{
const res=await fetch("/prices");
if(!res.ok)throw new Error("Prices fetch failed");
const data=await res.json();
prices.low=data.low||1.5;
prices.med=data.med||3.0;
prices.high=data.high||10.0;
}catch(err){
console.warn("Using default prices",err);
}
}

function getPriceForPack(pack){
switch(pack.price){
case"PRICE_LOW":return prices.low;
case"PRICE_MED":return prices.med;
case"PRICE_HIGH":return prices.high;
default:return prices.med;
}
}

function formatPrice(value,currency=currentCurrency){
if(currency==="USD")return`US$${value.toFixed(2)}`;

const rounded=Math.round(value*100)/100;

if(tierMap[rounded]&&tierMap[rounded][currency]!==undefined){
const converted=tierMap[rounded][currency];
const symbol=currency==="JPY"?"円":currency==="CNY"?"元":"MXN$";
return`${symbol}${converted}`;
}

let converted=value*approxRates[currency];

if(currency==="JPY"||currency==="MXN")converted=Math.ceil(converted);
else converted=Math.ceil(converted*10)/10;

const symbol=currency==="JPY"?"円":currency==="CNY"?"元":"MXN$";
return`${symbol}${converted}`;
}

function getCart(){
try{
const saved=localStorage.getItem("velutinx_cart");
return saved?JSON.parse(saved):[];
}catch{
return[];
}
}

function saveCart(cart){
localStorage.setItem("velutinx_cart",JSON.stringify(cart||[]));
}

function addOrToggleCart(pack){
let cart=getCart();
const index=cart.findIndex(i=>i.id===pack.id);

if(index!==-1)cart.splice(index,1);
else cart.push({
id:pack.id,
title:pack.title,
image:pack.image||"",
price:getPriceForPack(pack),
quantity:1
});

saveCart(cart);
updateCartDisplay();
}

function removeFromCart(id){
let cart=getCart();
cart=cart.filter(i=>i.id!==id);
saveCart(cart);
updateCartDisplay();
}

function getCartCount(){
return getCart().length;
}

function getCartTotal(){
return getCart().reduce((s,i)=>s+i.price,0);
}

function updateCartDisplay(){

const count=getCartCount();
const total=getCartTotal();

document.querySelectorAll("#cartCount,#floatingCartCount").forEach(el=>{
if(el){
el.textContent=count;
el.style.display="inline-block";
}
});

const items=document.getElementById("cartItems");

if(items){

items.innerHTML="";

if(count===0){
items.innerHTML="<p>Your cart is empty</p>";
}else{

getCart().forEach((item,idx)=>{

const div=document.createElement("div");
div.className="cart-item";

div.innerHTML=`
<img src="${item.image}">
<div class="cart-item-info">
<div class="cart-item-title">${item.title}</div>
<div class="cart-item-price">${formatPrice(item.price)}</div>
</div>
<button class="cart-item-remove" data-idx="${idx}">×</button>
`;

items.appendChild(div);

});

}

const totalEl=document.getElementById("cartTotal");
if(totalEl)totalEl.textContent=formatPrice(total);

}

}

function setLanguage(lang){

currentLang=lang;

currentCurrency=
lang==="en"?"USD":
lang==="ja"?"JPY":
lang==="zh"?"CNY":"MXN";

localStorage.setItem("language",lang);

updateCartDisplay();

}

document.addEventListener("DOMContentLoaded",async()=>{

await loadPrices();

updateCartDisplay();

setLanguage(currentLang);

});

window.getCart=getCart;
window.addOrToggleCart=addOrToggleCart;
window.removeFromCart=removeFromCart;
window.formatPrice=formatPrice;
window.getPriceForPack=getPriceForPack;
window.updateCartDisplay=updateCartDisplay;
window.setLanguage=setLanguage;

/* IMPORTANT FIX */
window.translations = translations;

})();
