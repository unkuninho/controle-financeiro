const KEY='controle-financeiro-v2';
const today='2026-09-01';
const defaults={cards:{PicPay:{limit:0,due:25,close:17},Bradesco:{limit:0,due:10,close:26},Nubank:{limit:0,due:3,close:27}},mpBalance:622,expenses:[
 {description:'Frango na Caixa',amount:44,account:'PicPay',date:today,category:'Alimentação'},
 {description:'Airbnb (parcela 2 de 6)',amount:186.33,account:'PicPay',date:today,category:'Casa'},
 {description:'Airbnb (parcela 5 de 6)',amount:127.29,account:'PicPay',date:today,category:'Casa'},
 {description:'Grupo Casas Bahia (parcela 7 de 10)',amount:124.48,account:'PicPay',date:today,category:'Compras'},
 {description:'Norte Grill',amount:141.68,account:'Bradesco',date:today,category:'Alimentação'},
 {description:'Tamujunto Lanchonete',amount:36,account:'Bradesco',date:today,category:'Alimentação'},
 {description:'Costazul Curicica',amount:37.20,account:'Bradesco',date:today,category:'Compras'},
 {description:'Mini Mercado RR',amount:24.90,account:'Bradesco',date:today,category:'Alimentação'},
 {description:'Veras Case',amount:60,account:'Bradesco',date:today,category:'Compras'},
 {description:'MP Cityfarmacuri',amount:107.46,account:'Bradesco',date:today,category:'Contas'},
 {description:'Apple Com Bill',amount:19.90,account:'Bradesco',date:today,category:'Contas'},
 {description:'Nubank — gasto não detalhado',amount:1095,account:'Nubank',date:today,category:'Outros'}
]};
let data=JSON.parse(localStorage.getItem(KEY)||'null')||defaults;
const money=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(v)||0);
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const totalMonth=()=>{const m=new Date().toISOString().slice(0,7);return data.expenses.filter(e=>e.date?.startsWith(m)).reduce((s,e)=>s+Number(e.amount),0)};
function render(){
 const total=totalMonth();document.querySelector('#monthTotal').textContent=money(total);document.querySelector('#monthCount').textContent=`${data.expenses.filter(e=>e.date?.startsWith(new Date().toISOString().slice(0,7))).length} lançamentos`;
 const invoice=Object.keys(data.cards).reduce((s,c)=>s+data.expenses.filter(e=>e.account===c).reduce((a,e)=>a+Number(e.amount),0),0);document.querySelector('#invoiceTotal').textContent=money(invoice);
 document.querySelector('#mpBalance').textContent=money(data.mpBalance);document.querySelector('#mpBalance2').textContent=money(data.mpBalance);
 document.querySelector('#cards').innerHTML=Object.entries(data.cards).map(([name,c])=>{const spent=data.expenses.filter(e=>e.account===name).reduce((s,e)=>s+Number(e.amount),0);const pct=c.limit?Math.min(100,spent/c.limit*100):0;return `<article class="card"><div class="card-head"><span class="brand">💳 ${name}</span><span class="pill">${c.limit?money(c.limit):'Sem limite'}</span></div><div class="card-total">${money(spent)}</div><div class="card-sub">gastos registrados</div><div class="bar"><i style="width:${pct}%"></i></div><div class="card-foot"><span>${c.limit?money(Math.max(0,c.limit-spent))+' disponível':'Configure o limite'}</span><span>fecha ${c.close} · vence ${c.due}</span></div></article>`}).join('');
 const sorted=[...data.expenses].sort((a,b)=>b.date.localeCompare(a.date));document.querySelector('#expenses').innerHTML=sorted.length?sorted.slice(0,30).map(e=>`<article class="expense"><div class="expense-info"><div class="expense-icon">${icon(e.category)}</div><div><div class="expense-name">${escapeHtml(e.description)}</div><div class="expense-meta">${e.account} · ${new Date(e.date+'T12:00').toLocaleDateString('pt-BR')} · ${e.category}</div></div></div><div class="expense-value">${money(e.amount)}</div></article>`).join(''):'<div class="summary"><strong style="font-size:16px">Nenhum gasto ainda.</strong><small>Toque em “+ Novo gasto” para começar.</small></div>';
}
const icon=c=>({Alimentação:'🍔',Transporte:'🚌',Casa:'🏠',Lazer:'🎮',Compras:'🛍️',Contas:'🧾'})[c]||'💸';
const escapeHtml=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
document.querySelector('#addBtn').onclick=()=>{const d=document.querySelector('#expenseDialog');document.querySelector('[name=date]').value=new Date().toISOString().slice(0,10);d.showModal()};
document.querySelector('#expenseForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);data.expenses.push({description:f.get('description'),amount:Number(f.get('amount')),account:f.get('account'),date:f.get('date'),category:f.get('category')});save();e.target.closest('dialog').close();e.target.reset();render();toast('Gasto salvo! 💸')};
document.querySelector('#manageBtn').onclick=()=>{const box=document.querySelector('#settingsFields');box.innerHTML=Object.entries(data.cards).map(([n,c])=>`<div style="padding:10px 0;border-bottom:1px solid #eee"><b>${n}</b><label>Limite (R$)<input name="limit-${n}" type="number" min="0" step="0.01" value="${c.limit}"></label><label>Dia de fechamento<input name="close-${n}" type="number" min="1" max="31" value="${c.close}"></label><label>Dia de vencimento<input name="due-${n}" type="number" min="1" max="31" value="${c.due}"></label></div>`).join('');document.querySelector('[name=mpBalance]').value=data.mpBalance;document.querySelector('#settingsDialog').showModal()};
document.querySelector('#settingsForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);for(const n of Object.keys(data.cards)){data.cards[n]={limit:Number(f.get('limit-'+n)||0),close:Number(f.get('close-'+n)||1),due:Number(f.get('due-'+n)||1)}}data.mpBalance=Number(f.get('mpBalance')||0);save();e.target.closest('dialog').close();render();toast('Configurações salvas! ⚙️')};
document.querySelector('#mpBtn').onclick=()=>document.querySelector('#manageBtn').click();
document.querySelector('#notifyBtn').onclick=async()=>{if(!('Notification'in window)){toast('Seu navegador não suporta notificações.');return}const p=await Notification.requestPermission();if(p==='granted'){toast('Notificações ativadas! 🔔');if('serviceWorker'in navigator){const r=await navigator.serviceWorker.ready;r.showNotification('Meu Controle Financeiro',{body:'Notificações ativadas com sucesso!'});}}else toast('Notificações não autorizadas.')};
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
function toast(t){const x=document.querySelector('#toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2200)}
render();