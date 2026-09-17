// v7.9.2 문자 개선 - 템플릿/전체선택 버그 FIX + 필터/검색 추가!
import { load, KEYS } from '../storage.js';

const TEMPLATES = {
  reserve: { name: '예약 확정', text: '[YUCA] {name}님, {date} {service} 예약 확정! 내일 봬요 🐶' },
  done: { name: '미용 완료', text: '[YUCA] {name}님, {pet} 미용 완료! 예쁘게 단장했어요 ✂️' },
  kinder: { name: '유치원 등원', text: '[YUCA] {name}님, {pet} 오늘 유치원 등원 완료! 즐겁게 놀고 있어요 🏫' },
  hotel: { name: '호텔 체크아웃', text: '[YUCA] {name}님, {pet} 호텔 체크아웃! 편히 쉬다 갔어요 🎁' },
};

export function renderSMS(container){
  let customers = load(KEYS.customers) || [];
  let reservations = load(KEYS.reservations) || [];
  let activeFilter = 'all';
  let searchQuery = '';

  // 고객별 마지막 서비스 찾기
  const getLastService = (custName)=>{
    const r = [...reservations].reverse().find(x=> x.name===custName || x.owner===custName);
    return r? r.service : '미용';
  };

  function getFiltered(){
    return customers.filter((c, idx)=>{
      const name = (c.name||c.owner||'').toLowerCase();
      const phone = (c.phone||'').toLowerCase();
      const pet = (c.petName||c.pet||'').toLowerCase();
      const service = (c.service || getLastService(c.name||c.owner) || '').toLowerCase();

      const matchSearch =!searchQuery || name.includes(searchQuery) || phone.includes(searchQuery) || pet.includes(searchQuery);

      let matchFilter = true;
      if(activeFilter==='grooming') matchFilter = service.includes('미용');
      if(activeFilter==='kinder') matchFilter = service.includes('유치원') || service.includes('kinder');
      if(activeFilter==='hotel') matchFilter = service.includes('호텔') || service.includes('hotel');

      return matchSearch && matchFilter;
    });
  }

  function renderList(){
    const listEl = container.querySelector('#smsList');
    const filtered = getFiltered();
    const countEl = container.querySelector('#smsCount');
    if(countEl) countEl.textContent = `${filtered.length}명 / 전체 ${customers.length}명`;

    if(filtered.length===0){
      listEl.innerHTML = `<div style="padding:40px;text-align:center;color:#888">검색 결과 없음<br><small>필터: ${activeFilter}, 검색: ${searchQuery||'없음'}</small></div>`;
      return;
    }

    listEl.innerHTML = filtered.map((c)=>{
      const origIdx = customers.indexOf(c);
      const service = c.service || getLastService(c.name||c.owner) || '미용';
      const badge = service.includes('미용')? '✂️미용' : service.includes('유치원')? '🏫유치원' : service.includes('호텔')? '🎁호텔' : '🐶고객';
      return `
        <label style="display:flex;gap:10px;padding:10px;border-bottom:1px solid #f5f5f5;cursor:pointer;align-items:center">
          <input type="checkbox" class="smsCheck" value="${origIdx}" checked>
          <div style="flex:1">
            <b>${c.name||c.owner}</b> <span style="font-size:11px;background:#fff7ed;border:1px solid #fed7aa;padding:2px 6px;border-radius:10px">${badge}</span><br>
            <small style="color:#888">${c.phone||'010-****-****'} · ${c.petName||c.pet||'반려견'} · ${service}</small>
          </div>
        </label>`;
    }).join('');
  }

  container.innerHTML = `
  <div style="padding:20px">
    <h2>💬 문자 발송 <small style="color:#888">v7.9.2 개선</small></h2>
    <div style="display:grid;grid-template-columns:380px 1fr;gap:16px;margin-top:16px">
      <div style="background:#fff;padding:16px;border-radius:12px;height:fit-content">
        <h4>📝 템플릿 선택</h4>
        <div id="tplArea" style="display:grid;gap:8px;margin-top:12px">
          ${Object.entries(TEMPLATES).map(([k,t])=>`
            <button class="tplBtn" data-k="${k}" style="text-align:left;padding:12px;border:2px solid #eee;border-radius:10px;background:#fff;cursor:pointer">
              <b>${t.name}</b><br><small style="color:#888">${t.text}</small>
            </button>`).join('')}
        </div>
        <div style="margin-top:16px">
          <label style="font-size:13px;font-weight:bold">문자 내용</label>
          <textarea id="smsText" style="width:100%;height:110px;margin-top:8px;padding:12px;border:1px solid #ddd;border-radius:10px;font-size:13px">${TEMPLATES.reserve.text}</textarea>
          <div style="margin-top:6px;font-size:11px;color:#888">변수: {name} {pet} {date} {service} 자동 치환</div>
        </div>
      </div>

      <div style="background:#fff;padding:16px;border-radius:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
          <h4>👥 받을 고객 <span id="smsCount" style="font-weight:normal;color:#f97316">${customers.length}명</span></h4>
          <div style="display:flex;gap:6px">
            <button id="btnAll" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">전체 선택</button>
            <button id="btnNone" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">해제</button>
            <button id="btnSend" style="padding:6px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">📤 발송</button>
          </div>
        </div>

        <!-- 필터 + 검색 - NEW! -->
        <div style="display:flex;gap:6px;margin-top:12px;flex-wrap:wrap">
          <button class="filterBtn" data-f="all" style="padding:6px 12px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer">전체</button>
          <button class="filterBtn" data-f="grooming" style="padding:6px 12px;border-radius:20px;background:#fff;border:1px solid #ddd;cursor:pointer">✂️미용</button>
          <button class="filterBtn" data-f="kinder" style="padding:6px 12px;border-radius:20px;background:#fff;border:1px solid #ddd;cursor:pointer">🏫유치원</button>
          <button class="filterBtn" data-f="hotel" style="padding:6px 12px;border-radius:20px;background:#fff;border:1px solid #ddd;cursor:pointer">🎁호텔</button>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <input id="smsSearch" type="text" placeholder="고객명, 전화번호, 반려견 이름 검색... (예: 콩이, 010)" style="flex:1;padding:10px 14px;border:1px solid #ddd;border-radius:20px">
          <button id="btnSearchClear" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">✕</button>
        </div>

        <div id="smsList" style="max-height:480px;overflow:auto;margin-top:12px;border:1px solid #eee;border-radius:10px;background:#fff"></div>
        <div id="smsLog" style="margin-top:12px;padding:16px;border-radius:12px;background:#f9fafb;display:none"></div>
      </div>
    </div>
  </div>`;

  // 이벤트 바인딩 - container 안에서!
  container.querySelectorAll('.tplBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.dataset.k;
      container.querySelector('#smsText').value = TEMPLATES[k].text;
      container.querySelectorAll('.tplBtn').forEach(b=>{ b.style.background='#fff'; b.style.borderColor='#eee'; });
      btn.style.background='#fff7ed'; btn.style.borderColor='#f97316';
    });
  });

  container.querySelector('#btnAll').addEventListener('click', ()=> container.querySelectorAll('.smsCheck').forEach(c=> c.checked=true));
  container.querySelector('#btnNone').addEventListener('click', ()=> container.querySelectorAll('.smsCheck').forEach(c=> c.checked=false));

  container.querySelectorAll('.filterBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      activeFilter = btn.dataset.f;
      container.querySelectorAll('.filterBtn').forEach(b=>{
        b.style.background = b.dataset.f===activeFilter? '#f97316' : '#fff';
        b.style.color = b.dataset.f===activeFilter? '#fff' : '#333';
        b.style.border = b.dataset.f===activeFilter? 'none' : '1px solid #ddd';
      });
      renderList();
    });
  });

  const searchInput = container.querySelector('#smsSearch');
  searchInput.addEventListener('input', (e)=>{
    searchQuery = e.target.value.toLowerCase().trim();
    renderList();
  });
  container.querySelector('#btnSearchClear').addEventListener('click', ()=>{
    searchInput.value=''; searchQuery=''; renderList(); searchInput.focus();
  });

  container.querySelector('#btnSend').addEventListener('click', ()=>{
    const txt = container.querySelector('#smsText').value;
    const checked = [...container.querySelectorAll('.smsCheck:checked')];
    if(checked.length===0){ alert('고객을 선택하세요!'); return; }
    if(!confirm(`${checked.length}명에게 발송할까요?\n\n${txt.slice(0,60)}...`)) return;

    const log = container.querySelector('#smsLog');
    log.style.display='block';
    log.innerHTML = `<h4 style="margin:0">📤 발송 결과 - ${new Date().toLocaleString()}</h4>
      <div style="margin-top:10px;max-height:200px;overflow:auto">${checked.map(c=>{
        const cust = customers[parseInt(c.value)];
        const msg = txt.replaceAll('{name}',cust.name||cust.owner||'고객님').replaceAll('{pet}',cust.petName||'아이').replaceAll('{date}','오늘').replaceAll('{service}',getLastService(cust.name||cust.owner));
        return `<div style="padding:6px 0;border-bottom:1px solid #eee;font-size:12px">✅ <b>${cust.name||cust.owner}</b> (${cust.phone||''}) → ${msg.slice(0,50)}...</div>`;
      }).join('')}</div>
      <div style="margin-top:12px;padding:12px;background:#dcfce7;border-radius:10px;text-align:center;font-weight:bold">🎉 ${checked.length}건 발송 완료! (시뮬레이션)</div>`;
    log.scrollIntoView({behavior:'smooth'});
  });

  // 초기 렌더
  renderList();
  // 첫 템플릿 선택 상태
  const firstBtn = container.querySelector('.tplBtn[data-k="reserve"]');
  if(firstBtn){ firstBtn.style.background='#fff7ed'; firstBtn.style.borderColor='#f97316'; }
}