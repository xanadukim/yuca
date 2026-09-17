// app.js - YUCA v7.9.3 FINAL - 라우터 버그 완전 해결!
// Yeungjin University Pet Management

import { renderDashboard } from './modules/dashboard.js';
import { load, save, KEYS } from './storage.js';
import { seedCustomers, seedProducts } from './data.js';
import { renderCustomers, addCustomer, openCustomerForm } from './modules/customers.js';
import { renderReservations } from './modules/reservations.js';
import { renderMobile } from './modules/mobile.js';
import { renderKindergarten } from './modules/kindergarten.js';
import { renderHotel } from './modules/hotel.js';
import { renderEmployees } from './modules/employees.js';
import { renderProducts } from './modules/products.js';
import { renderReports } from './modules/reports.js';
import { renderSMS } from './modules/sms.js';

// 초기 데이터 seed - 비어있을 때만
if(load(KEYS.customers).length===0) save(KEYS.customers, seedCustomers);
if(load(KEYS.products).length===0) save(KEYS.products, seedProducts);
if(load(KEYS.reservations).length===0) save(KEYS.reservations, [{date:'2026-09-15',name:'콩이 보호자',service:'미용',status:'확정'}]);

// 페이지 라우터 - v7.9.3 FIX: 직접 main에 렌더링 (innerHTML 복사 안함 -> 이벤트 유지!)
const pages = {
  dashboard: (main)=>{ renderDashboard(main); },
  customers: (main)=>{ renderCustomers(main); },
  reservations: (main)=>{ renderReservations(main); },
  kindergarten: (main)=>{ renderKindergarten(main); },
  hotel: (main)=>{ renderHotel(main); },
  employees: (main)=>{ renderEmployees(main); },
  products: (main)=>{ renderProducts(main); },
  reports: (main)=>{ renderReports(main); },
  sms: (main)=>{ renderSMS(main); },
  mobile: (main)=>{ renderMobile(main); },
  settings: (main)=>{
    main.innerHTML = `<div class="header"><h2>설정</h2></div>
    <div class="card"><h3>데이터 관리</h3>
    <button class="btn btn-orange" onclick="exportDB()">전체 내보내기 (JSON)</button>
    <button class="btn btn-gray" style="margin-left:8px" onclick="if(confirm('정말 삭제?')){localStorage.clear();location.reload()}">초기화</button>
    <div style="margin-top:16px;font-size:12px;color:#888">v7.9.3 Professional<br>HTML/CSS/JS 분리형 + Firebase yuca-2026-c22e8<br>제품 필터 + 매출리포트 + 문자 필터/검색 완성!</div>
    </div>`;
  },
};

function navigate(page){
  document.querySelectorAll('.sidebar nav button').forEach(b=> b.classList.toggle('active', b.dataset.page===page));
  const main=document.getElementById('content');
  main.innerHTML = '';
  if(pages[page]){
    pages[page](main);
  } else {
    main.innerHTML = `<div style="padding:40px;text-align:center;color:#888">준비중: ${page}</div>`;
  }
  localStorage.setItem('yuca_last_page', page);
}

// 예약 모달 - 전체입력폼으로 변경!
window.openResModal = ()=>{
  const lastPage = localStorage.getItem('yuca_last_page');
  if(lastPage!=='reservations'){
    navigate('reservations');
    setTimeout(()=>{ window.openResFormFull && window.openResFormFull(); }, 150);
  } else {
    window.openResFormFull && window.openResFormFull();
  }
};

// DB 전체 내보내기
window.exportDB = ()=>{
  const data={}; for(const k in KEYS){ data[k]=load(KEYS[k]); }
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`yuca_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
};

// 시작
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.sidebar nav button').forEach(btn=>{
    btn.addEventListener('click',()=> navigate(btn.dataset.page));
  });
  navigate(localStorage.getItem('yuca_last_page')||'dashboard');
  console.log('🔥 YUCA v7.9.3 로드 완료!');
});