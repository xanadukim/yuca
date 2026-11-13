// app.js - YUCA v8.6.3 FINAL - mascot.png 원복 + 여백 통일 + 클릭 복구 + active 메뉴 + 방어 코드
import { load, KEYS } from './storage.js';

const MENU = [
  { id: 'dashboard', label: '대시보드', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>', file: 'dashboard.js', func: 'renderDashboard' },
  { id: 'customers', label: '고객관리', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="16" r="4.2"/><circle cx="6.8" cy="10.5" r="1.7"/><circle cx="10.2" cy="7.8" r="1.7"/><circle cx="13.8" cy="7.8" r="1.7"/><circle cx="17.2" cy="10.5" r="1.7"/></svg>', file: 'customers.js', func: 'renderCustomers' },
  { id: 'reservations', label: '예약관리', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 14v4M10 16h4"/></svg>', file: 'reservations.js', func: 'renderReservations' },
  { id: 'kindergarten', label: '유치원', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="8" r="2.6"/><circle cx="16.5" cy="8" r="2.6"/><path d="M10 8h4M9.5 10.5c-1.5 3-1.5 7 0 9.5M14.5 10.5c1.5 3 1.5 7 0 9.5"/></svg>', file: 'kindergarten.js', func: 'renderKindergarten' },
  { id: 'hotel', label: '호텔', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>', file: 'hotel.js', func: 'renderHotel' },
  { id: 'staff', label: '직원관리', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16c.6-1.4 1.5-2 2.5-2s1.9.6 2.5 2M14 10h4M14 13h4"/></svg>', file: 'employees.js', func: 'renderEmployees' },
  { id: 'products', label: '제품관리', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l9-5 9 5v8l-9 5-9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>', file: 'products.js', func: 'renderProducts' },
  { id: 'reports', label: '매출리포트', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>', file: 'reports.js', func: 'renderReports' },
  { id: 'sms', label: '문자', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>', file: 'sms.js', func: 'renderSMS' },
  { id: 'mobile', label: '모바일', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>', file: 'mobile.js', func: 'renderMobile' },
  { id: 'settings', label: '설정', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h8M16 8h4M4 16h2M10 16h10"/><circle cx="14" cy="8" r="2"/><circle cx="8" cy="16" r="2"/></svg>', file: 'settings.js', func: 'renderSettings' },
];

let current = localStorage.getItem('yuca_page') || 'dashboard';

function renderSidebar(){
  const nav = document.getElementById('sidebar-nav');
  if(!nav){ console.error('sidebar-nav 없음! index.html 확인!'); return; }

  if(!window.yucaUser){
    nav.innerHTML = `<div style="padding:14px;background:#fff1d9;border:2px solid #ffc800;border-radius:14px;font-size:12px;color:#7c4a03;line-height:1.6;font-weight:700">🔒 로그인이 필요합니다<br><small style="color:#a16207">우측 화면에서 로그인하세요</small></div>`;
    return;
  }

  nav.innerHTML = MENU.map(m => `
    <button data-page="${m.id}" class="duo-nav-btn ${current===m.id?'active':''}"><span class="mi">${m.icon}</span><span>${m.label}</span></button>
  `).join('') + `
  <button id="btnLogout" class="duo-nav-btn" style="margin-top:16px;color:#ff4b4b"><span class="mi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h9"/></svg></span><span>로그아웃</span></button>`;

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
    const path = `./modules/${item.file.toLowerCase()}?v=8.9.5`;
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
    <div style="background:#fff;padding:36px;border:2px solid #e5e5e5;border-radius:24px;box-shadow:0 8px 0 #e5e5e5;width:100%;max-width:380px">
      <div style="text-align:center;margin-bottom:20px">
        <img src="./assets/mascot.png" style="width:80px;height:80px;border-radius:18px;border:2px solid #e5e5e5">
        <h2 style="margin-top:12px;font-weight:900;letter-spacing:-0.02em">🐶 YUCA</h2>
        <p style="color:#777;font-size:13px;font-weight:700;margin-top:4px">관리자 계정으로 로그인하세요</p>
      </div>
      <div style="display:grid;gap:12px">
        <input id="loginEmail" type="email" placeholder="이메일" autocomplete="off" name="yucoff"
          style="padding:12px 14px;border:2px solid #e5e5e5;border-radius:12px;font-size:14px;font-weight:700;width:100%">
        <input id="loginPw" type="password" placeholder="비밀번호" autocomplete="new-password" name="yucoff2"
          style="padding:12px 14px;border:2px solid #e5e5e5;border-radius:12px;font-size:14px;font-weight:700;width:100%">
        <div id="loginErr" style="display:none;color:#ff4b4b;font-size:12px;font-weight:700;padding:10px;background:#ffe0e0;border-radius:12px"></div>
        <button id="btnLogin" class="duo-btn duo-btn--primary" style="width:100%;padding:13px">로그인</button>
      </div>
      <p style="margin-top:14px;font-size:11px;color:#aaa;text-align:center;font-weight:700">🔒 Firebase Authentication 보호됨</p>
    </div>
  </div>`;

  // 자동완성 방지: 로드 시 readonly, 포커스 시 해제
  ['loginEmail','loginPw'].forEach(id=>{
    const el = container.querySelector('#'+id);
    el.readOnly = true;
    el.addEventListener('focus', ()=>{ el.readOnly = false; });
  });

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

// 사이드바 접기 / 다크모드 토글
window.YUCA_toggleSidebar = ()=>{
  const collapsed = document.body.classList.toggle('sb-collapsed');
  localStorage.setItem('yuca_sb', collapsed ? '1' : '0');
};
window.YUCA_toggleTheme = ()=>{
  const dark = document.body.classList.toggle('dark');
  localStorage.setItem('yuca_theme', dark ? 'dark' : 'light');
  const b = document.getElementById('themeBtn');
  if(b) b.textContent = dark ? '☀️' : '🌙';
};
function applySavedUI(){
  if(localStorage.getItem('yuca_sb')==='1') document.body.classList.add('sb-collapsed');
  if(localStorage.getItem('yuca_theme')==='dark'){
    document.body.classList.add('dark');
    const b = document.getElementById('themeBtn');
    if(b) b.textContent = '☀️';
  }
}

// 모듈 UI 통일: 수정/삭제 파스텔 버튼 + 헤더 버튼 크기/간격
function styleModuleUI(root){
  if(!root || !root.querySelectorAll) return;
  root.querySelectorAll('button').forEach(btn=>{
    const t=(btn.textContent||'').replace(/\s/g,'');
    const isEdit=t.includes('수정')||t.includes('편집');
    const isDel=t.includes('삭제');
    if(!isEdit&&!isDel) return;
    btn.style.borderRadius='8px';
    btn.style.fontWeight='700';
    btn.style.fontSize='12px';
    btn.style.padding='6px 12px';
    if(isEdit){btn.style.background='#E3F2FD';btn.style.color='#1565C0';btn.style.border='1px solid #BBDEFB';}
    if(isDel){btn.style.background='#FFEBEE';btn.style.color='#C62828';btn.style.border='1px solid #FFCDD2';}
  });
  // 페이지 헤더(h1~h3의 flex 부모) 안 버튼 그룹: 작게 + 간격 넓게
  root.querySelectorAll('h1,h2,h3').forEach(h=>{
    const p=h.parentElement; if(!p) return;
    try{ if(!getComputedStyle(p).display.includes('flex')) return; }catch(e){ return; }
    p.querySelectorAll(':scope > div').forEach(d=>{
      const bs=d.querySelectorAll('button');
      if(!bs.length) return;
      try{ if(getComputedStyle(d).display.includes('flex')) d.style.gap='14px'; }catch(e){}
      bs.forEach(b=>{b.style.padding='7px 14px';b.style.fontSize='12px';b.style.borderRadius='20px';});
    });
  });
}
(function watchModuleUI(){
  const mc=document.getElementById('main-content');
  if(!mc) return setTimeout(watchModuleUI,300);
  let pending=false;
  new MutationObserver(()=>{
    if(pending) return; pending=true;
    requestAnimationFrame(()=>{ pending=false; styleModuleUI(mc); });
  }).observe(mc,{childList:true,subtree:true});
  styleModuleUI(mc);
})();

// Service Worker 등록 (HTTPS/localhost에서만 동작)
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch((e)=> console.warn('SW 등록 실패:', e));
}

document.addEventListener('DOMContentLoaded', async ()=>{
  applySavedUI();
  if(checkMobile()) return;
  // 인증 상태 복원 대기 후 앱 진입 (미인증이면 로그인 화면)
  const ready = window.yucaAuthReady || Promise.resolve(window.yucaUser || null);
  await ready;
  if(window.yucaUser && !appEntered){ await enterApp(); }
  else { renderApp(); } // 로그인 화면 or 이미 진입한 앱 다시 렌더
});

window.YUCA_render = renderApp;