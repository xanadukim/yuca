// app.js - YUCA v8.6 FINAL - 클릭 안됨 버그 완전 수정 + 모든 메뉴 방어 코드
import { load, KEYS } from './storage.js';

const MENU = [
  { id: 'dashboard', label: '📊 대시보드', file: 'dashboard.js', func: 'renderDashboard' },
  { id: 'customers', label: '👥 고객관리', file: 'customers.js', func: 'renderCustomers' },
  { id: 'reservations', label: '📅 예약관리', file: 'reservations.js', func: 'renderReservations' },
  { id: 'kindergarten', label: '🏫 유치원', file: 'kindergarten.js', func: 'renderKindergarten' },
  { id: 'hotel', label: '🎁 호텔', file: 'hotel.js', func: 'renderHotel' },
  { id: 'staff', label: '👨‍💼 직원관리', file: 'staff.js', func: 'renderStaff' },
  { id: 'products', label: '📦 제품관리', file: 'products.js', func: 'renderProducts' },
  { id: 'reports', label: '💰 매출리포트', file: 'reports.js', func: 'renderReports' },
  { id: 'sms', label: '💬 문자', file: 'sms.js', func: 'renderSMS' },
  { id: 'mobile', label: '📱 모바일', file: 'mobile.js', func: 'renderMobile' },
  { id: 'settings', label: '⚙️ 설정', file: 'settings.js', func: 'renderSettings' },
];

let current = localStorage.getItem('yuca_page') || 'dashboard';

function renderSidebar(){
  const nav = document.getElementById('sidebar-nav');
  if(!nav){ console.error('sidebar-nav 없음! index.html 확인!'); return; }
  
  nav.innerHTML = MENU.map(m => `
    <button data-page="${m.id}" style="width:100%;text-align:left;padding:12px 16px;border:none;background:${current===m.id?'#2d3748':'transparent'};color:#fff;border-radius:10px;cursor:pointer;margin-bottom:4px;display:block">
      ${m.label}
    </button>
  `).join('') + `<div style="margin-top:20px;padding:10px;background:#1a202c;border-radius:10px;font-size:11px;color:#a0aec0">v8.6 클릭 복구<br>Firebase OK</div>`;

  // 클릭 이벤트 - 중요!
  nav.querySelectorAll('button[data-page]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      current = btn.dataset.page;
      localStorage.setItem('yuca_page', current);
      await renderApp();
    });
  });
}

async function renderApp(){
  renderSidebar();
  const container = document.getElementById('main-content');
  if(!container){ console.error('main-content 없음!'); return; }

  const item = MENU.find(m=>m.id===current);
  if(!item){ container.innerHTML='메뉴 없음'; return; }

  container.innerHTML = `<div style="padding:60px;text-align:center"><div style="font-size:32px">⏳</div><div style="margin-top:10px">${item.label} 로딩중...</div></div>`;

  try{
    // 소문자 파일명으로 통일 - 대문자 Mobile.js 문제 해결!
    const path = `./modules/${item.file.toLowerCase()}`;
    const mod = await import(path);
    const fn = mod[item.func] || mod[Object.keys(mod)[0]];
    if(typeof fn !== 'function') throw new Error(`${item.func} 함수 없음`);
    fn(container);
  }catch(err){
    console.error(`[YUCA] ${current} 로드 실패:`, err);
    container.innerHTML = `
      <div style="padding:20px">
        <h2>${item.label} 로드 실패</h2>
        <div style="margin-top:12px;padding:14px;background:#fef2f2;border:1px solid #fecaca;border-radius:12px">
          <b>에러:</b> ${err.message}<br>
          <small>파일: js/modules/${item.file.toLowerCase()}</small>
        </div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <button onclick="location.reload()" style="padding:10px 16px;border-radius:10px;background:#111;color:#fff;border:none;cursor:pointer">새로고침</button>
          <button onclick="localStorage.clear(); location.reload()" style="padding:10px 16px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer">캐시 초기화</button>
        </div>
        <div style="margin-top:16px;padding:12px;background:#fff7ed;border-radius:10px;font-size:12px;line-height:1.6">
          💡 <b>해결 방법:</b><br>
          1. VS Code에서 <code>js/modules/${item.file.toLowerCase()}</code> 파일이 있는지 확인<br>
          2. 파일명이 대문자면 소문자로 변경: <code>Mobile.js → mobile.js</code><br>
          3. <code>git add -A && git commit -m "fix" && git push</code>
        </div>
      </div>`;
  }
}

// ?view=mobile 체크
function checkMobile(){
  const v = new URLSearchParams(location.search).get('view');
  if(v==='mobile' || v==='booking'){
    document.body.innerHTML = `<div style="padding:40px;text-align:center"><h2>🐶 YUCA 모바일</h2><p>메인 앱에서 QR로 접속하세요</p><a href="./">메인으로</a></div>`;
    return true;
  }
  return false;
}

document.addEventListener('DOMContentLoaded', ()=>{
  if(checkMobile()) return;
  renderApp();
});

window.YUCA_render = renderApp;