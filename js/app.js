// app.js - main router - v6.5 FINAL
import { renderDashboard } from './modules/dashboard.js';
import { load, save, KEYS } from './storage.js';
import { seedCustomers, seedProducts } from './data.js';
import { renderCustomers, addCustomer, openCustomerForm } from './modules/customers.js';
import { renderReservations } from './modules/reservations.js';
import { renderMobile } from './modules/mobile.js';
import { renderKindergarten } from './modules/kindergarten.js';

// init seed if empty
if(load(KEYS.customers).length===0) save(KEYS.customers, seedCustomers);
if(load(KEYS.products).length===0) save(KEYS.products, seedProducts);
if(load(KEYS.reservations).length===0) save(KEYS.reservations, [{date:'2026-09-15',name:'콩이 보호자',service:'미용',status:'확정'}]);

const pages = {
  dashboard: ()=>{ const d=document.createElement('div'); renderDashboard(d); return d.innerHTML; },
  customers: ()=>{ const d=document.createElement('div'); renderCustomers(d); return d.innerHTML; },
  reservations: ()=>{ const d=document.createElement('div'); renderReservations(d); return d.innerHTML; },
  kindergarten: ()=>{ const d=document.createElement('div'); renderKindergarten(d); return d.innerHTML; },
  hotel: ()=> `<div class="header"><h2>호텔</h2></div><div class="card">객실 S01 M01 L01 SUITE - 박수 계산</div>`,
  employees: ()=> `<div class="header"><h2>직원관리</h2></div><div class="card">출퇴근/급여/인센티브</div>`,
  products: ()=> `<div class="header"><h2>제품관리</h2></div><div class="card">재고 관리 - 재고 경고</div>`,
  reports: ()=> `<div class="header"><h2>매출리포트</h2></div><div class="card">일/주/월/년 매출</div>`,
  sms: ()=> `<div class="header"><h2>문자</h2></div><div class="card">템플릿 4종 + 대량발송</div>`,
  mobile: ()=>{ const d=document.createElement('div'); renderMobile(d); return d.innerHTML; },
  settings: ()=> `<div class="header"><h2>설정</h2></div><div class="card"><h3>데이터 관리</h3><button class="btn btn-orange" onclick="exportDB()">전체 내보내기 (JSON)</button><button class="btn btn-gray" style="margin-left:8px" onclick="if(confirm('정말 삭제?')){localStorage.clear();location.reload()}">초기화</button></div>`,
};

function navigate(page){
  document.querySelectorAll('.sidebar nav button').forEach(b=> b.classList.toggle('active', b.dataset.page===page));
  const main=document.getElementById('content');
  main.innerHTML = pages[page]? pages[page]() : `<div>준비중</div>`;
  localStorage.setItem('yuca_last_page', page);
}

// 전체입력폼으로 변경!
window.openResModal = ()=>{
  const lastPage = localStorage.getItem('yuca_last_page');
  if(lastPage!=='reservations'){
    navigate('reservations');
    setTimeout(()=>{ window.openResFormFull && window.openResFormFull(); }, 150);
  } else {
    window.openResFormFull && window.openResFormFull();
  }
};

window.openResModal = ()=>{
  const name=prompt('고객명?'); if(!name) return;
  const date=prompt('날짜 (YYYY-MM-DD)','2026-09-16');
  const service=prompt('서비스 (미용/유치원/호텔)','미용');
  const list=load(KEYS.reservations); list.push({date,name,service,status:'확정'}); save(KEYS.reservations,list); navigate('reservations');
};

window.exportDB = ()=>{
  const data={}; for(const k in KEYS){ data[k]=load(KEYS[k]); }
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`yuca_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
};

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.sidebar nav button').forEach(btn=>{
    btn.addEventListener('click',()=> navigate(btn.dataset.page));
  });
  navigate(localStorage.getItem('yuca_last_page')||'dashboard');
});