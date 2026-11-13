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
  `).join('');

  const ls = document.getElementById('logout-slot');
  if(ls){
    ls.innerHTML = `<button id="btnLogout" class="duo-nav-btn" style="margin-top:8px;color:#ff4b4b"><span class="mi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h9"/></svg></span><span>로그아웃</span></button>`;
    ls.querySelector('#btnLogout')?.addEventListener('click', ()=>{
      if(window.yucaSignOut) window.yucaSignOut();
    });
  }

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
    const path = `./modules/${item.file.toLowerCase()}?v=9.3.0`;
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
    document.body.innerHTML = `<div style="padding:40px;text-align:center"><img src="./assets/walkdog.svg" style="width:96px;height:96px;border-radius:24px"><h2 style="margin-top:12px">🐶 YUCA 모바일</h2><p style="color:#888;margin-top:8px">메인 앱에서 QR로 접속하세요</p><a href="./" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#f97316;color:#fff;border-radius:20px;text-decoration:none">메인으로</a></div>`;
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
        <img src="./assets/walkdog.svg" style="width:96px;height:96px;border-radius:24px">
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

// 이모지 -> SVG 라인 아이콘 맵 (전역 후처리)
const EICO = {
  '👥':'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.4c2.6.2 4.4 1.8 4.9 4.1"/>',
  '📅':'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  '🏫':'<path d="M3 10l9-6 9 6"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-5h4v5"/>',
  '🏨':'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  '🎁':'<rect x="4" y="9" width="16" height="4"/><path d="M6 13v8h12v-8M12 9v12M12 9c-4 0-5-1.5-4-3.5C9 4 11 5 12 9Zm0 0c4 0 5-1.5 4-3.5C15 4 13 5 12 9Z"/>',
  '👨‍💼':'<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/><path d="M3 13h18"/>',
  '📦':'<path d="M3 8l9-5 9 5v8l-9 5-9-5V8Z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  '💰':'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15.5 9.5c-.7-1-2-1.5-3.5-1.5-2 0-3.5 1-3.5 2.5s1.5 2 3.5 2.5 3.5 1 3.5 2.5-1.5 2.5-3.5 2.5c-1.5 0-2.8-.5-3.5-1.5"/>',
  '💬':'<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
  '📱':'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  '⚙️':'<path d="M4 8h8M16 8h4M4 16h2M10 16h10"/><circle cx="14" cy="8" r="2"/><circle cx="8" cy="16" r="2"/>',
  '🐶':'<circle cx="12" cy="13" r="7"/><path d="M6 8c-1-3 0-5 2-6M18 8c1-3 0-5-2-6"/><circle cx="9.5" cy="12" r=".8" fill="currentColor"/><circle cx="14.5" cy="12" r=".8" fill="currentColor"/><path d="M11 15.5c.7.6 1.3.6 2 0"/>',
  '✂️':'<circle cx="6" cy="7" r="2.4"/><circle cx="6" cy="17" r="2.4"/><path d="M8 8.5L20 19M8 15.5L20 5"/>',
  '💾':'<path d="M4 4h12l4 4v12H4V4Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
  '🗑️':'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  '✏️':'<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z"/>',
  '👑':'<path d="M3 18l1-9 5 4 3-7 3 7 5-4 1 9H3Z"/>',
  '👩':'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7"/>',
  '🔒':'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  '⏳':'<path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9s8 4 8 9"/>',
  '📊':'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  '📌':'<path d="M9 4h6l-1 7 3 3v2H7v-2l3-3-1-7Z"/><path d="M12 16v5"/>',
  '⚡':'<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8Z"/>',
  '💡':'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.6 1.5 2.6h4c0-1 .7-2 1.5-2.6A6 6 0 0 0 12 3Z"/>',
  '🏷️':'<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="8" cy="9" r="1.5"/>',
  '📞':'<path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  '🧾':'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>',
  '🐾':'<circle cx="12" cy="15" r="4"/><circle cx="6.5" cy="10" r="1.6"/><circle cx="10" cy="7.5" r="1.6"/><circle cx="14" cy="7.5" r="1.6"/><circle cx="17.5" cy="10" r="1.6"/>',
};
function svgIcon(path){
  return `<svg class="eico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
function replaceEmojis(root){
  const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while(n=tw.nextNode()) nodes.push(n);
  nodes.forEach(node=>{
    let txt=node.nodeValue, changed=false, out='';
    let segs;
    try{ segs=[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(txt)].map(s=>s.segment); }
    catch(e){ segs=Array.from(txt); }
    segs.forEach(ch=>{
      if(EICO[ch]){ out+=svgIcon(EICO[ch]); changed=true; }
      else out+=ch;
    });
    if(changed){
      const span=document.createElement('span');
      span.innerHTML=out;
      node.parentNode.replaceChild(span,node);
    }
  });
}

// 모듈 UI 통일: 수정/삭제 파스텔 버튼 + 헤더 버튼 크기/간격
function styleModuleUI(root){
  if(!root || !root.querySelectorAll) return;
  try{ replaceEmojis(root); }catch(e){}
  root.querySelectorAll('button').forEach(btn=>{
    const t=(btn.textContent||'').replace(/\s/g,'');
    const isEdit=t.includes('수정')||t.includes('편집');
    const isDel=t.includes('삭제');
    if(!isEdit&&!isDel) return;
    if(isEdit) btn.classList.add('yu-btn','yu-e');
    else btn.classList.add('yu-btn','yu-d');
  });
  // 버튼 3단계: CTA(생성/확정 동사)는 진한색 유지, 나머지 색상 버튼은 파스텔로
  root.querySelectorAll('button').forEach(btn=>{
    try{
      const t=(btn.textContent||'').replace(/\s/g,'');
      const cs=getComputedStyle(btn);
      const m=cs.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if(!m) return;
      const r=+m[1],g=+m[2],b=+m[3];
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b);
      // 포화색 판별: 채도차 충분 + 어두운 채널 존재 (밝은 파스텔/흰색 제외)
      const saturated = (mx-mn)>=60 && mn<170;
      // CTA: +시작 또는 생성/확정 동사 (내보내기는 보조 액션으로 제외)
      const isCTA = /^\+/.test(t) || /(등록|저장|확인|발송|신규)/.test(t) || (t.includes('보내기') && !t.includes('내보내기'));
      if(isCTA){
        // 파스텔/밝은 배경이면 진한색으로 복원 (단, 텍스트가 어두울 때만)
        if(!saturated){
          const cm=cs.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
          if(cm && (+cm[1]+ +cm[2]+ +cm[3])<600){
            const sr=Math.min(255,Math.round(+cm[1]/0.72)),sg=Math.min(255,Math.round(+cm[2]/0.72)),sb=Math.min(255,Math.round(+cm[3]/0.72));
            if(sr+sg+sb<=600){
              btn.style.background=`rgb(${sr},${sg},${sb})`;
              btn.style.color='#fff';
              btn.style.border=`1px solid rgb(${Math.round(sr*.8)},${Math.round(sg*.8)},${Math.round(sb*.8)})`;
            }
          }
        }
        return;
      }
      if(!saturated) return;
      const mix=(c,t)=>Math.round(c+(255-c)*t);
      btn.style.background=`rgb(${mix(r,.88)},${mix(g,.88)},${mix(b,.88)})`;
      btn.style.color=`rgb(${Math.round(r*.72)},${Math.round(g*.72)},${Math.round(b*.72)})`;
      btn.style.border=`1px solid rgb(${mix(r,.7)},${mix(g,.7)},${mix(b,.7)})`;
    }catch(e){}
  });
  // border-radius 스케일 통일: 8 / 12 / 20 / pill(999)
  root.querySelectorAll('[style*="border-radius"]').forEach(el=>{
    try{
      const raw=el.style.borderRadius||'';
      const m=raw.match(/(\d+(?:\.\d+)?)px/);
      if(!m) return;
      const v=parseFloat(m[1]);
      let nv=null;
      if(v>=40) nv='999px';
      else if(v<10) nv='8px';
      else if(v<16) nv='12px';
      else nv='20px';
      if(nv && raw!==nv) el.style.borderRadius=nv;
    }catch(e){}
  });
  // 페이지 헤더(h1~h3의 flex 부모) 안 버튼 그룹: 작게 + 간격 넓게
  root.querySelectorAll('h1,h2,h3').forEach(h=>{
    const p=h.parentElement; if(!p) return;
    try{ if(!getComputedStyle(p).display.includes('flex')) return; }catch(e){ return; }
    p.querySelectorAll(':scope > div').forEach(d=>{
      const bs=d.querySelectorAll('button');
      if(!bs.length) return;
      try{ if(getComputedStyle(d).display.includes('flex')) d.style.gap='14px'; }catch(e){}
      bs.forEach(b=>b.classList.add('yu-hbtn'));
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