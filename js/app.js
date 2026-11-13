// app.js - YUCA v8.6.3 FINAL - mascot.png 원복 + 여백 통일 + 클릭 복구 + active 메뉴 + 방어 코드
import { load, KEYS } from './storage.js';

const MENU = [
  { id: 'dashboard', label: '📊 대시보드', file: 'dashboard.js', func: 'renderDashboard' },
  { id: 'customers', label: '👥 고객관리', file: 'customers.js', func: 'renderCustomers' },
  { id: 'reservations', label: '📅 예약관리', file: 'reservations.js', func: 'renderReservations' },
  { id: 'kindergarten', label: '🏫 유치원', file: 'kindergarten.js', func: 'renderKindergarten' },
  { id: 'hotel', label: '🎁 호텔', file: 'hotel.js', func: 'renderHotel' },
  { id: 'staff', label: '👨‍💼 직원관리', file: 'employees.js', func: 'renderEmployees' },
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

  if(!window.yucaUser){
    nav.innerHTML = `<div style="padding:14px;background:#1a202c;border-radius:10px;font-size:12px;color:#fbbf24;line-height:1.6">🔒 로그인이 필요합니다<br><small style="color:#94a3b8">우측 화면에서 로그인하세요</small></div>`;
    return;
  }

  nav.innerHTML = MENU.map(m => `
    <button data-page="${m.id}" class="${current===m.id?'active':''}"
      style="width:100%;text-align:left;padding:12px 14px;border:none;background:${current===m.id?'#2d3748':'transparent'};color:${current===m.id?'#fff':'#cbd5e1'};border-radius:10px;cursor:pointer;margin-bottom:4px;display:block;font-weight:${current===m.id?'bold':'normal'};font-size:14px;transition:0.2s">
      ${m.label}
    </button>
  `).join('') + `<div style="margin-top:20px;padding:10px;background:#1a202c;border-radius:10px;font-size:11px;color:#a0aec0;line-height:1.4">v8.7.2<br>로그인+동기화<br>${window.yucaUser.email||'Firebase OK'}</div>
  <button id="btnLogout" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;border:1px solid #475569;background:transparent;color:#fca5a5;cursor:pointer;font-size:12px">🚪 로그아웃</button>`;

  nav.querySelector('#btnLogout')?.addEventListener('click', ()=>{
    if(window.yucaSignOut) window.yucaSignOut();
  });

  // 클릭 이벤트 - 방어 코드!
  nav.querySelectorAll('button[data-page]').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.preventDefault();
      current = btn.dataset.page;
      localStorage.setItem('yuca_page', current);
      await renderApp();
    });
  });
}

// 대시보드 빠른 실행용 전역 네비게이션
window.navigate = (id)=>{
  const item = MENU.find(m=>m.id===id);
  if(!item) return;
  current = id;
  localStorage.setItem('yuca_page', id);
  localStorage.setItem('yuca_last_page', id);
  renderApp();
};

// 대시보드/설정 공용 백업 내보내기
window.exportDB = ()=>{
  const out = {};
  Object.keys(KEYS).forEach(k=>{ out[k] = load(KEYS[k]) || []; });
  try{ const s = JSON.parse(localStorage.getItem('yuca_settings')||'{}'); if(Object.keys(s).length) out.settings = s; }catch(e){}
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `YUCA_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('yuca_last_backup', new Date().toLocaleString());
};

async function renderApp(){
  renderSidebar();
  const container = document.getElementById('main-content');
  if(!container){ console.error('main-content 없음!'); return; }

  // 로그인 게이트 - 미인증 시 로그인 화면
  if(!window.yucaUser){ renderLogin(container); return; }

  const item = MENU.find(m=>m.id===current);
  if(!item){ container.innerHTML='메뉴 없음'; return; }

  container.innerHTML = `<div style="padding:60px;text-align:center"><div style="font-size:32px">⏳</div><div style="margin-top:10px">${item.label} 로딩중...</div></div>`;

  try{
    // 소문자 파일명 통일 + 캐시 방지 v=8.6.3 - Mobile.js 대문자 문제 해결!
    const path = `./modules/${item.file.toLowerCase()}?v=8.7.2`;
    const mod = await import(path);
    const fn = mod[item.func] || mod[Object.keys(mod)[0]];
    if(typeof fn!== 'function') throw new Error(`${item.func} 함수 없음 - ${item.file.toLowerCase()}`);
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
          💡 <b>해결:</b> VS Code에서 <code>js/modules/${item.file.toLowerCase()}</code> 파일 존재 확인 & 소문자 변경!
        </div>
      </div>`;
  }
}

//?view=mobile 체크 - QR 모바일 접속
function checkMobile(){
  const v = new URLSearchParams(location.search).get('view');
  if(v==='mobile' || v==='booking'){
    document.body.innerHTML = `<div style="padding:40px;text-align:center"><img src="./assets/mascot.png" style="width:80px;height:80px;border-radius:16px"><h2 style="margin-top:12px">🐶 YUCA 모바일</h2><p style="color:#888;margin-top:8px">메인 앱에서 QR로 접속하세요</p><a href="./" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#f97316;color:#fff;border-radius:20px;text-decoration:none">메인으로</a></div>`;
    return true;
  }
  return false;
}

// Firebase 클라우드 ↔ 로컬 동기화 (Last-Write-Wins, updatedAt 비교)
async function syncFromCloud(){
  if(!window.loadFromCloud) return;
  try{
    const data = await window.loadFromCloud();
    if(!data) return;
    let fromCloud = 0, toCloud = 0;
    for(const [k, doc] of Object.entries(data)){
      if(typeof k !== 'string' || !k.startsWith('yuca_')) continue;
      const cloudVal = doc?.value;
      const cloudTs = doc?.updatedAt || 0;
      const cur = localStorage.getItem(k);
      const localTs = parseInt(localStorage.getItem('yuca_ts_'+k)||'0', 10) || 0;
      const empty = cur === null || cur === '[]' || cur === '{}';
      if(empty || cloudTs > localTs){
        localStorage.setItem(k, JSON.stringify(cloudVal));
        localStorage.setItem('yuca_ts_'+k, String(cloudTs || Date.now()));
        fromCloud++;
      }else if(localTs > cloudTs && cur){
        try{
          const ok = await window.saveToCloud(k, JSON.parse(cur));
          if(ok) toCloud++;
        }catch(e){}
      }
    }
    localStorage.setItem('yuca_firebase_ok', '1');
    if(fromCloud || toCloud) console.log(`☁️ 동기화: 클라우드→로컬 ${fromCloud}키, 로컬→클라우드 ${toCloud}키`);
  }catch(e){
    console.warn('클라우드 동기화 실패 (오프라인?):', e);
  }
}

// 로그인 화면 (미인증 시)
function renderLogin(container){
  container.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:center;min-height:80vh">
    <div style="background:#fff;padding:36px;border-radius:20px;box-shadow:0 8px 30px rgba(0,0,0,0.08);width:100%;max-width:380px">
      <div style="text-align:center;margin-bottom:20px">
        <img src="./assets/mascot.png" style="width:72px;height:72px;border-radius:16px">
        <h2 style="margin-top:10px">🐶 YUCA 로그인</h2>
        <p style="color:#888;font-size:13px;margin-top:4px">관리자 계정으로 로그인하세요</p>
      </div>
      <div style="display:grid;gap:10px">
        <input id="loginEmail" type="email" placeholder="이메일" autocomplete="username"
          style="padding:12px;border:1px solid #ddd;border-radius:10px;font-size:14px">
        <input id="loginPw" type="password" placeholder="비밀번호" autocomplete="current-password"
          style="padding:12px;border:1px solid #ddd;border-radius:10px;font-size:14px">
        <div id="loginErr" style="display:none;color:#dc2626;font-size:12px;padding:8px;background:#fef2f2;border-radius:8px"></div>
        <button id="btnLogin" style="padding:12px;border:none;border-radius:10px;background:#f97316;color:#fff;font-weight:bold;font-size:15px;cursor:pointer">로그인</button>
      </div>
      <p style="margin-top:14px;font-size:11px;color:#aaa;text-align:center">Firebase Authentication 보호됨</p>
    </div>
  </div>`;

  const doLogin = async ()=>{
    const email = container.querySelector('#loginEmail').value.trim();
    const pw = container.querySelector('#loginPw').value;
    const errEl = container.querySelector('#loginErr');
    errEl.style.display='none';
    if(!email || !pw){ errEl.textContent='이메일과 비밀번호를 입력하세요'; errEl.style.display='block'; return; }
    try{
      await window.yucaSignIn(email, pw);
      // 성공 시 onAuthStateChanged → YUCA_onAuthChange가 화면 전환
    }catch(e){
      errEl.textContent = '로그인 실패: ' + (e.code==='auth/invalid-credential'||e.code==='auth/wrong-password'||e.code==='auth/user-not-found' ? '이메일 또는 비밀번호가 올바르지 않습니다' : e.message);
      errEl.style.display='block';
    }
  };
  container.querySelector('#btnLogin').addEventListener('click', doLogin);
  container.querySelector('#loginPw').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });
}

// 인증 상태 변경 시 처리 (로그인/로그아웃/세션 복원)
let appEntered = false;
async function enterApp(){
  if(appEntered) return;
  appEntered = true;
  await syncFromCloud();
  if(document.readyState !== 'loading') renderApp();
  // 'loading' 상태면 DOMContentLoaded 핸들러가 renderApp을 호출
}
window.YUCA_onAuthChange = (user)=>{
  if(user){
    enterApp();
  }else{
    appEntered = false;
    if(document.readyState === 'complete') renderApp();
  }
};

// Service Worker 등록 (HTTPS/localhost에서만 동작)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch((e)=> console.warn('SW 등록 실패:', e));
}

document.addEventListener('DOMContentLoaded', async ()=>{
  if(checkMobile()) return;
  // 인증 상태 복원 대기 후 앱 진입 (미인증이면 로그인 화면)
  const ready = window.yucaAuthReady || Promise.resolve(window.yucaUser || null);
  await ready;
  if(window.yucaUser && !appEntered){ await enterApp(); }
  else { renderApp(); } // 로그인 화면 or 이미 진입한 앱 다시 렌더
});

window.YUCA_render = renderApp;