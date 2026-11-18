// YUCA v9.6 - 예약관리 + 가격표 자동계산 (체급/가산/추가요금 → priceDetail 스냅샷)
import { load, save, KEYS, localToday } from '../storage.js';
import { getPricebook, calcPrice, isPricedService } from '../price-engine.js?v=10.2.1';
import { loadCustomers, backfillReservationLinks } from './customers.js';

let editingResIndex = null;
let filterMode = 'all'; // all, today, week

function getReservations(){ return load(KEYS.reservations, []); }
function getCustomers(){ return loadCustomers(); }

export function renderReservations(container){
  const target = container || document.getElementById('main-content');
  if(!target) return;
  const reservations = getReservations();
  backfillReservationLinks();
  const customers = getCustomers();
  const today = localToday();

  // 필터
  let filtered = reservations;
  if(filterMode === 'today'){
    filtered = reservations.filter(r => r.date === today);
  } else if(filterMode === 'week'){
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    filtered = reservations.filter(r => {
      if(!r.date) return false;
      return new Date(r.date) >= weekAgo;
    });
  }
  // 최신순 정렬
  filtered = [...filtered].sort((a,b)=> (b.date||'').localeCompare(a.date||'') || (b.time||'').localeCompare(a.time||''));

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <h2>📅 예약관리 <span style="background:#FF8C00;color:white;padding:2px 10px;border-radius:12px;font-size:14px">${filtered.length}건</span>
        <small style="font-size:13px;color:#888;margin-left:8px">전체 ${reservations.length}건</small>
      </h2>
      <div style="display:flex;gap:8px">
        <button onclick="setResFilter('all')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${filterMode==='all'?'#FF8C00':'#fff'};color:${filterMode==='all'?'#fff':'#333'};cursor:pointer;font-size:13px">전체</button>
        <button onclick="setResFilter('today')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${filterMode==='today'?'#FF8C00':'#fff'};color:${filterMode==='today'?'#fff':'#333'};cursor:pointer;font-size:13px">오늘</button>
        <button onclick="setResFilter('week')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${filterMode==='week'?'#FF8C00':'#fff'};color:${filterMode==='week'?'#fff':'#333'};cursor:pointer;font-size:13px">이번주</button>
        <button onclick="openResFormFull()" style="padding:8px 16px;border-radius:20px;background:#FF8C00;color:#fff;border:none;cursor:pointer;font-weight:700">+ 새 예약</button>
      </div>
    </div>

    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8f9fa;text-align:left"><tr>
          <th style="padding:12px">날짜/시간</th><th style="padding:12px">고객/강아지</th><th style="padding:12px">서비스</th><th style="padding:12px">가격</th><th style="padding:12px">상태</th><th style="padding:12px">관리</th>
        </tr></thead>
        <tbody>
          ${filtered.length===0? `<tr><td colspan="6" style="text-align:center;padding:40px;color:#888">예약이 없습니다. 📅 새 예약을 등록해보세요!</td></tr>` :
            filtered.map((r, idx)=>{
              // 원본 인덱스 찾기
              const origIdx = reservations.indexOf(r);
              const cust = customers.find(c => (c.name===r.name) || (c.phone===r.phone));
              const dogName = r.dogName || r.dog_name || cust?.dogName || cust?.dog_name || '';
              // 보호자 이름이 없으면 강아지 이름으로 고객 찾기!
              let displayName = r.name || r.owner || r.customer || '';
              if(!displayName && (r.dogName || r.dog_name)){
                const dog = r.dogName || r.dog_name;
                const found = customers.find(c => (c.dogName===dog) || (c.dog_name===dog));
                if(found) displayName = found.name || found.owner || '';
              }
              displayName = displayName || '-';
              return `
              <tr style="border-top:1px solid #f0f0f0">
                <td style="padding:12px"><div style="font-weight:600">${r.date||'-'}</div><div style="font-size:12px;color:#888">${r.time||'시간 미정'}</div></td>
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:32px;height:32px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;font-size:14px">🐾</div>
                    <div><div style="font-weight:600;font-size:14px">${displayName}</div><div style="font-size:12px;color:#666">${dogName}</div></div>
                  </div>
                </td>
                <td style="padding:12px"><span style="background:#FFF3E0;color:#FF8C00;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600">${r.service||'미용'}</span></td>
                <td style="padding:12px;font-size:13px">₩${(r.price||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g,",")}</td>
                <td style="padding:12px"><span style="padding:4px 10px;border-radius:12px;font-size:12px;
                  background:${r.status==='확정'?'#E8F5E9':r.status==='완료'?'#E3F2FD':r.status==='취소'?'#FFEBEE':'#FFF8E0'};
                  color:${r.status==='확정'?'#2E7D32':r.status==='완료'?'#1565C0':r.status==='취소'?'#C62828':'#EF6C00'}">${r.status||'확정'}</span></td>
                <td style="padding:12px">
                  <button onclick="editResFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF8C00;background:white;color:#FF8C00;cursor:pointer">✏️ 수정</button>
                  <button onclick="deleteResFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
                </td>
              </tr>`;
            }).join('')}
        </tbody>
      </table>
    </div>

    <!-- 전체 입력 폼 모달 -->
    <div id="res-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:92%;max-width:580px;max-height:92vh;overflow-y:auto;padding:24px">
        <h3 id="res-modal-title">새 예약 등록</h3>
        <p style="color:#888;font-size:12px;margin:4px 0 16px">* 필수</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label style="font-size:13px;grid-column:1/-1">고객 선택*
            <select id="res-customer" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="">직접 입력</option>
              ${customers.map(c=>`<option value="${c.id||''}">${c.name} (${(c.pets||[]).map(p=>p.name).join(', ')||c.dogName||''}) - ${c.phone||''}</option>`).join('')}
            </select>
          </label>
          <label id="res-pet-wrap" style="font-size:13px;grid-column:1/-1;display:none">강아지 선택
            <select id="res-pet" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select>
            <div id="res-pet-warn" style="display:none;margin-top:6px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:8px;padding:8px 10px;font-size:12px"></div>
          </label>
          <label style="font-size:13px">고객명* <input id="res-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="홍길동"></label>
          <label style="font-size:13px">전화번호 <input id="res-phone" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="010-..."></label>
          <label style="font-size:13px">강아지명 <input id="res-dogName" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">날짜* <input id="res-date" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">시간 <input id="res-time" type="time" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">서비스*
            <select id="res-service" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="미용">✂️ 미용</option>
              <option value="목욕">🛁 목욕</option>
              <option value="위생미용">🧼 위생미용</option>
              <option value="전체미용">✨ 전체미용</option>
              <option value="가위컷">✂️ 가위컷</option>
              <option value="부분미용">✂️ 부분미용</option>
              <option value="스파">💆 스파</option>
            </select>
          </label>
          <label style="font-size:13px">가격 <input id="res-price" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="자동계산"></label>
          <!-- 가격표 자동계산 패널 (미용 계열 서비스 선택 시 표시) -->
          <div id="res-price-panel" style="display:none;grid-column:1/-1;background:#FFF8F0;border:1px solid #FFD9B3;border-radius:10px;padding:12px">
            <div style="font-size:12px;font-weight:700;color:#E65100;margin-bottom:8px">💰 가격표 자동계산</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px">
              <label style="font-size:12px">체중(kg) <input id="res-weight" type="number" min="0" step="0.5" placeholder="예: 8.5" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
              <label style="font-size:12px">체급 <select id="res-tier" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select></label>
              <label style="font-size:12px">모량/기장 <select id="res-coat" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select></label>
              <label style="font-size:12px">스타일 <select id="res-style" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select></label>
              <label style="font-size:12px;display:flex;align-items:flex-end;gap:6px;padding-bottom:8px"><input type="checkbox" id="res-double"> 이중모</label>
            </div>
            <div id="res-addons" style="margin-top:8px"></div>
            <div id="res-price-detail" style="margin-top:10px;font-size:12px;color:#555;line-height:1.7"></div>
          </div>
          <label style="font-size:13px">상태
            <select id="res-status" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="확정">확정</option>
              <option value="대기">대기</option>
              <option value="완료">완료</option>
              <option value="취소">취소</option>
            </select>
          </label>
        </div>
        <label style="display:block;margin-top:10px;font-size:13px">메모 <textarea id="res-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeResModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveResFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#FF8C00;color:white;font-weight:600;cursor:pointer">💾 저장</button>
        </div>
      </div>
    </div>
  `;
  initPricePanel();
}

// ---------- 가격표 자동계산 ----------
function resVal(id){return document.getElementById(id)?.value||''}
function resChecked(id){return document.getElementById(id)?.checked||false}

function initPricePanel(){
  const pb=getPricebook();
  const tierSel=document.getElementById('res-tier');
  const coatSel=document.getElementById('res-coat');
  const styleSel=document.getElementById('res-style');
  const addonBox=document.getElementById('res-addons');
  const detail=document.getElementById('res-price-detail');
  const panel=document.getElementById('res-price-panel');
  if(!tierSel||!panel) return;
  tierSel.innerHTML='<option value="">체급 선택</option>'+(pb.tiers||[]).map(t=>`<option value="${t.label}">${t.label} (${t.minKg}~${t.maxKg??'∞'}kg)</option>`).join('');
  coatSel.innerHTML=(pb.coats||[]).map(c=>`<option value="${c.label}">${c.label} ${c.add?('+'+c.add.toLocaleString()):'±0'}</option>`).join('');
  styleSel.innerHTML=(pb.styles||[]).map(s=>`<option value="${s.label}">${s.label} ${s.add?('+'+s.add.toLocaleString()):'±0'}</option>`).join('');
  addonBox.innerHTML=(pb.addons||[]).map(ad=>`<label style="display:inline-flex;align-items:center;gap:4px;margin:0 10px 6px 0;font-size:12px;cursor:pointer"><input type="checkbox" class="res-addon" value="${ad.name}" ${ad.autoOver!=null?'disabled':''}> ${ad.name} +${ad.price.toLocaleString()}${ad.autoOver!=null?` <small style="color:#E65100">(>${ad.autoOver}kg 자동)</small>`:''}</label>`).join('');
  detail.textContent='';

  const sync=()=>{
    const service=resVal('res-service');
    const show=isPricedService(pb,service);
    panel.style.display=show?'block':'none';
    if(!show){document.getElementById('res-price').value='';return}
    refreshResPrice();
  };
  ['res-service','res-weight','res-tier','res-coat','res-style','res-double'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',refreshResPrice);
    document.getElementById(id)?.addEventListener('input',refreshResPrice);
  });
  document.getElementById('res-service')?.addEventListener('change',sync);
  addonBox.addEventListener('change',refreshResPrice);
  window.__resSyncPrice=sync;
}

function refreshResPrice(){
  const pb=getPricebook();
  const service=resVal('res-service');
  if(service==='미용') {/* 전체미용으로 간주됨 */}
  const addonNames=[...document.querySelectorAll('.res-addon:checked')].map(c=>c.value);
  const weight=resVal('res-weight');
  const r=calcPrice(pb,{
    service: service==='미용'?'전체미용':service,
    weightKg: weight===''?null:Number(weight),
    tierLabel: resVal('res-tier')||null,
    coatLabel: resVal('res-coat')||null,
    styleLabel: resVal('res-style')||null,
    doubleCoat: resChecked('res-double'),
    addonNames
  });
  const priceInput=document.getElementById('res-price');
  if(priceInput && !priceInput.dataset.manual) priceInput.value=r.total||'';
  const d=document.getElementById('res-price-detail');
  if(d){
    const lines=[];
    if(r.tierLabel) lines.push(`체급: ${r.tierLabel}`);
    if(r.base!=null) lines.push(`기본가 ${r.base.toLocaleString()}원`);
    else if(r.tierLabel||weight) lines.push(`<span style="color:#C62828">해당 서비스×체급 가격이 가격표에 없습니다. 가격표 관리에서 등록하세요.</span>`);
    if(r.coatAdd) lines.push(`모량/기장 +${r.coatAdd.toLocaleString()}`);
    if(r.styleAdd) lines.push(`스타일 +${r.styleAdd.toLocaleString()}`);
    if(r.doubleAdd) lines.push(`이중모 +${r.doubleAdd.toLocaleString()}`);
    r.addonItems.forEach(x=>lines.push(`${x.name} +${x.price.toLocaleString()}${x.auto?' (자동)':''}`));
    lines.push(`<b>합계 ${r.total.toLocaleString()}원</b>`);
    d.innerHTML=lines.join('<br>');
  }
  return r;
}
window.__refreshResPrice=refreshResPrice;
window.__resSyncPrice=window.__resSyncPrice||(()=>{});

// 수동 가격 수정 감지
window.__resPriceManual=()=>{const p=document.getElementById('res-price');if(p)p.dataset.manual='1'};

// 전역 함수들 - document에서 찾음 (클로저 버그 해결)
window.setResFilter = (mode)=>{
  filterMode = mode;
  renderReservations(document.getElementById('main-content'));
};

window.openResFormFull = ()=>{
  editingResIndex = null;
  const modal = document.getElementById('res-modal');
  if(!modal) return;
  document.getElementById('res-modal-title').textContent='새 예약 등록';
  document.getElementById('res-name').value='';
  document.getElementById('res-phone').value='';
  document.getElementById('res-dogName').value='';
  document.getElementById('res-date').value=localToday();
  document.getElementById('res-time').value='10:00';
  document.getElementById('res-service').value='미용';
  document.getElementById('res-price').value='32000';
  document.getElementById('res-status').value='확정';
  document.getElementById('res-notes').value='';
  document.getElementById('res-customer').value='';
  const pw=document.getElementById('res-pet-wrap');if(pw)pw.style.display='none';
  const ps=document.getElementById('res-pet');if(ps)ps.innerHTML='';
  const pwn=document.getElementById('res-pet-warn');if(pwn)pwn.style.display='none';
  // 가격 패널 초기화
  ['res-weight','res-tier','res-coat','res-style'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  const db=document.getElementById('res-double');if(db)db.checked=false;
  document.querySelectorAll('.res-addon').forEach(c=>{if(c.disabled===false)c.checked=false});
  const pd=document.getElementById('res-price-detail');if(pd)pd.innerHTML='';
  const pi=document.getElementById('res-price');if(pi){pi.value='';delete pi.dataset.manual}
  window.__resSyncPrice?.();
  modal.style.display='flex';
};

window.closeResModalFull = ()=>{
  const modal=document.getElementById('res-modal');
  if(modal) modal.style.display='none';
  editingResIndex=null;
};

window.editResFull = (idx)=>{
  const reservations = getReservations();
  const r = reservations[idx]; if(!r) return;
  editingResIndex = idx;
  document.getElementById('res-modal-title').textContent='예약 수정';
  document.getElementById('res-name').value=r.name||r.owner||'';
  document.getElementById('res-phone').value=r.phone||'';
  document.getElementById('res-dogName').value=r.dogName||r.dog_name||'';
  document.getElementById('res-date').value=r.date||'';
  document.getElementById('res-time').value=r.time||'';
  document.getElementById('res-service').value=r.service||'미용';
  document.getElementById('res-price').value=r.price||'';
  document.getElementById('res-status').value=r.status||'확정';
  document.getElementById('res-notes').value=r.notes||'';
  // 고객/강아지 연결 복원
  const custs=getCustomers();
  const cust=custs.find(x=>x.id===(r.customerId)) || custs.find(x=>(x.phone&&r.phone&&x.phone===r.phone)||(x.name===(r.name||r.owner)));
  const cSel=document.getElementById('res-customer');
  if(cSel&&cust){ cSel.value=cust.id||''; fillPetSelect(cust);
    const pSel=document.getElementById('res-pet');
    if(pSel&&r.petId){ pSel.value=r.petId; const p=(cust.pets||[]).find(p=>p.id===r.petId); applyPet(p,cust); }
  }else{ const pw=document.getElementById('res-pet-wrap');if(pw)pw.style.display='none'; }
  // 가격 스냅샷 복원
  const pd=r.priceDetail||{};
  const w=document.getElementById('res-weight');if(w)w.value=pd.weightKg??'';
  const tr=document.getElementById('res-tier');if(tr)tr.value=pd.tierLabel||'';
  const co=document.getElementById('res-coat');if(co)co.value=pd.coatLabel||'';
  const st=document.getElementById('res-style');if(st)st.value=pd.styleLabel||'';
  const db=document.getElementById('res-double');if(db)db.checked=!!pd.doubleCoat;
  document.querySelectorAll('.res-addon').forEach(c=>{c.checked=(pd.addonNames||[]).includes(c.value)});
  window.__resSyncPrice?.();
  document.getElementById('res-modal').style.display='flex';
};

window.deleteResFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getReservations(); list.splice(idx,1); save(KEYS.reservations,list);
  renderReservations(document.getElementById('main-content'));
};

window.saveResFull = ()=>{
  const name=document.getElementById('res-name').value.trim();
  const date=document.getElementById('res-date').value;
  const service=document.getElementById('res-service').value;
  if(!name||!date||!service){ alert('고객명, 날짜, 서비스 필수!'); return; }
  const list=getReservations();
  // 가격 스냅샷 (가격표 계산 결과)
  let priceDetail=null;
  if(isPricedService(getPricebook(),service)){
    const r=refreshResPrice();
    priceDetail={
      weightKg:resVal('res-weight')===''?null:Number(resVal('res-weight')),
      tierLabel:resVal('res-tier')||null,
      coatLabel:resVal('res-coat')||null,
      styleLabel:resVal('res-style')||null,
      doubleCoat:resChecked('res-double'),
      addonNames:[...document.querySelectorAll('.res-addon:checked')].map(c=>c.value),
      calcTotal:r.total,
      manual:!!document.getElementById('res-price')?.dataset.manual
    };
  }
  const data={
    name, date,
    phone:document.getElementById('res-phone').value.trim(),
    dogName:document.getElementById('res-dogName').value.trim(),
    time:document.getElementById('res-time').value,
    service,
    price:document.getElementById('res-price').value,
    priceDetail,
    status:document.getElementById('res-status').value,
    customerId:document.getElementById('res-customer')?.value||null,
    petId:document.getElementById('res-pet')?.value||null,
    notes:document.getElementById('res-notes').value.trim(),
    createdAt: editingResIndex!==null? list[editingResIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingResIndex!==null) list[editingResIndex]={...list[editingResIndex],...data};
  else list.push(data);
  save(KEYS.reservations,list);
  closeResModalFull();
  renderReservations(document.getElementById('main-content'));
};

// 수동 가격 입력 시 자동계산 덮어쓰기 표시
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id==='res-price') window.__resPriceManual?.();
});

// 고객 선택 시 자동 입력 + 강아지 선택
function fillPetSelect(c){
  const wrap=document.getElementById('res-pet-wrap');
  const sel=document.getElementById('res-pet');
  if(!wrap||!sel) return;
  const pets=c?.pets||[];
  if(!pets.length){ wrap.style.display='none'; sel.innerHTML=''; return; }
  wrap.style.display='block';
  sel.innerHTML=pets.map(p=>`<option value="${p.id}">${p.name}${p.breed?` (${p.breed})`:''}${p.weight?` ${p.weight}kg`:''}</option>`).join('');
  applyPet(pets[0], c);
}
function applyPet(p, c){
  if(!p) return;
  document.getElementById('res-dogName').value=p.name||'';
  const w=document.getElementById('res-weight');
  if(w && p.weight) w.value=p.weight;
  const warn=document.getElementById('res-pet-warn');
  if(warn){
    const flags=p.flags||[];
    if(flags.length){
      warn.style.display='block';
      warn.innerHTML=`⚠️ <b>${p.name}</b>: ${flags.map(f=>`<span style="background:#dc2626;color:#fff;padding:1px 7px;border-radius:8px;font-size:11px;margin-left:4px">${f}</span>`).join('')}`;
    }else warn.style.display='none';
  }
  window.__refreshResPrice?.();
}
document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='res-customer'){
    const customers=getCustomers();
    const selected = customers.find(c=>c.id===e.target.value);
    document.getElementById('res-pet-warn') && (document.getElementById('res-pet-warn').style.display='none');
    if(selected){
      document.getElementById('res-name').value=selected.name||'';
      document.getElementById('res-phone').value=selected.phone||'';
      fillPetSelect(selected);
      window.__refreshResPrice?.();
    }else{
      const wrap=document.getElementById('res-pet-wrap'); if(wrap) wrap.style.display='none';
    }
  }
  if(e.target && e.target.id==='res-pet'){
    const customers=getCustomers();
    const c=customers.find(x=>x.id===document.getElementById('res-customer')?.value);
    const p=(c?.pets||[]).find(p=>p.id===e.target.value);
    applyPet(p, c);
  }
});