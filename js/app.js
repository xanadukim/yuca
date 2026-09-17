// app.js - YUCA v8.5 Professional - 전체 라우터 + 11개 메뉴 연결
import { load, KEYS } from './storage.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderCustomers } from './modules/customers.js';
import { renderReservations } from './modules/reservations.js';
import { renderKindergarten } from './modules/kindergarten.js';
import { renderHotel } from './modules/hotel.js';
import { renderStaff } from './modules/staff.js';
import { renderProducts } from './modules/products.js';
import { renderReports } from './modules/reports.js';
import { renderSMS } from './modules/sms.js';
import { renderMobile } from './modules/mobile.js';
import { renderSettings } from './modules/settings.js'; // v8.5 고급 설정!

const menu = [
  { id: 'dashboard', label: '📊 대시보드', render: renderDashboard },
  { id: 'customers', label: '👥 고객관리', render: renderCustomers },
  { id: 'reservations', label: '📅 예약관리', render: renderReservations },
  { id: 'kindergarten', label: '🏫 유치원', render: renderKindergarten },
  { id: 'hotel', label: '🎁 호텔', render: renderHotel },
  { id: 'staff', label: '👨‍💼 직원관리', render: renderStaff },
  { id: 'products', label: '📦 제품관리', render: renderProducts },
  { id: 'reports', label: '💰 매출리포트', render: renderReports },
  { id: 'sms', label: '💬 문자', render: renderSMS },
  { id: 'mobile', label: '📱 모바일', render: renderMobile },
  { id: 'settings', label: '⚙️ 설정', render: renderSettings },
];

let current = localStorage.getItem('yuca_page') || 'dashboard';

function renderSidebar(){
  const nav = document.getElementById('sidebar-nav');
  if(!nav) return;
  nav.innerHTML = menu.map(m => `
    <button data-page="${m.id}" class="${current===m.id?'active':''}" 
      style="width:100%;text-align:left;padding:12px 16px;border:none;background:${current===m.id?'#2d3748':'transparent'};color:#fff;border-radius:10px;cursor:pointer;margin-bottom:4px;font-size:14px">
      ${m.label}
    </button>
  `).join('') + `<div style="margin-top:20px;padding:10px;background:#1a202c;border-radius:10px;font-size:11px;color:#a0aec0">v8.5 Professional<br>Firebase yuca-2026-c22e8<br>고급 설정 완성!</div>`;

  nav.querySelectorAll('button').forEach(btn=>{
    btn.onclick = ()=>{
      current = btn.dataset.page;
      localStorage.setItem('yuca_page', current);
      renderApp();
    };
  });
}

function renderApp(){
  renderSidebar();
  const container = document.getElementById('main-content');
  if(!container) return;
  const found = menu.find(m=>m.id===current);
  if(found){
    try{ found.render(container); }
    catch(e){ container.innerHTML = `<div style="padding:20px"><h3>⚠️ ${found.label} 오류</h3><pre style="background:#111;color:#f87171;padding:12px;border-radius:10px;overflow:auto">${e.message}\n${e.stack}</pre></div>`; console.error(e); }
  }
}

// 모바일 뷰 체크 (?view=mobile)
function checkMobileView(){
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if(view==='mobile' || view==='booking'){
    document.body.innerHTML = `<div style="padding:20px;text-align:center"><h2>🐶 YUCA 모바일</h2><p>${view==='mobile'?'내 예약 조회 페이지':'예약 신청 페이지'} - 메인 앱에서 QR로 접속하세요!</p><a href="${location.pathname}">메인으로</a></div>`;
    return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(checkMobileView()) return;
  renderApp();
});

// 전역에서 새로고침용
window.YUCA_render = renderApp;