// app.js - YUCA v8.5 Professional - 11개 메뉴 완전 연결 + 404 방어
import { load, KEYS } from './storage.js';

// 동적 import로 404 방지
const modules = {
  dashboard: () => import('./modules/dashboard.js'),
  customers: () => import('./modules/customers.js'),
  reservations: () => import('./modules/reservations.js'),
  kindergarten: () => import('./modules/kindergarten.js'),
  hotel: () => import('./modules/hotel.js'),
  staff: () => import('./modules/staff.js'),
  products: () => import('./modules/products.js'),
  reports: () => import('./modules/reports.js'),
  sms: () => import('./modules/sms.js'),
  mobile: () => import('./modules/mobile.js'),
  settings: () => import('./modules/settings.js'),
};

const menuLabels = {
  dashboard: '📊 대시보드',
  customers: '👥 고객관리',
  reservations: '📅 예약관리',
  kindergarten: '🏫 유치원',
  hotel: '🎁 호텔',
  staff: '👨‍💼 직원관리',
  products: '📦 제품관리',
  reports: '💰 매출리포트',
  sms: '💬 문자',
  mobile: '📱 모바일',
  settings: '⚙️ 설정'
};

let current = localStorage.getItem('yuca_page') || 'dashboard';

function renderSidebar(){
  const nav = document.getElementById('sidebar-nav');
  if(!nav) return;
  nav.innerHTML = Object.keys(menuLabels).map(id => `
    <button data-page="${id}" class="${current===id?'active':''}"
      style="width:100%;text-align:left;padding:12px 16px;border:none;background:${current===id?'#2d3748':'transparent'};color:#fff;border-radius:10px;cursor:pointer;margin-bottom:4px">
      ${menuLabels[id]}
    </button>
  `).join('') + `<div style="margin-top:20px;padding:10px;background:#1a202c;border-radius:10px;font-size:11px;color:#a0aec0">v8.5 Professional<br>manifest + staff 404 수정!</div>`;

  nav.querySelectorAll('button').forEach(btn=>{
    btn.onclick = async ()=>{
      current = btn.dataset.page;
      localStorage.setItem('yuca_page', current);
      await renderApp();
    };
  });
}

async function renderApp(){
  renderSidebar();
  const container = document.getElementById('main-content');
  if(!container) return;

  container.innerHTML = `<div style="padding:40px;text-align:center">⏳ ${menuLabels[current]} 로딩중...</div>`;

  try{
    const mod = await modules[current]();
    const funcName = 'render' + current.charAt(0).toUpperCase() + current.slice(1);
    // settings는 renderSettings, dashboard는 renderDashboard 등
    const renderFunc = mod[funcName] || mod[Object.keys(mod)[0]];
    if(renderFunc) renderFunc(container);
    else throw new Error('render 함수 없음');
  }catch(e){
    console.error(e);
    container.innerHTML = `
      <div style="padding:20px">
        <h3>⚠️ ${menuLabels[current]} 로드 실패</h3>
        <p style="color:#888">파일이 GitHub에 없습니다. 아래를 확인하세요:</p>
        <pre style="background:#111;color:#f87171;padding:12px;border-radius:10px;overflow:auto">js/modules/${current}.js 404\n${e.message}</pre>
        <button onclick="location.reload()" style="margin-top:12px;padding:10px 16px;border-radius:10px;background:#f97316;color:#fff;border:none;cursor:pointer">새로고침</button>
        <div style="margin-top:12px;padding:12px;background:#fff7ed;border-radius:10px;font-size:12px">
          💡 해결: VS Code에서 <code>git add js/modules/${current}.js</code> → commit → push
        </div>
      </div>`;
  }
}

document.addEventListener('DOMContentLoaded', renderApp);
window.YUCA_render = renderApp;