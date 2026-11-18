// YUCA v9.9 - 유치원 + 유치원 요금제 자동계산 (1회/반일/시간제/월정액)
import { load, save, KEYS } from '../storage.js';
import { getPricebook, calcKgPrice } from '../price-engine.js?v=9.9.1';

let editingKgIdx = null;
let kgFilter = 'today'; // today, all, week

function getKg(){
  try{ return load(KEYS.kindergarten, []); }catch(e){ return load('yuca_kindergarten', []); }
}
function getCustomers(){ return load(KEYS.customers, []); }
function saveKg(list){
  save(KEYS.kindergarten, list);
  try{ save('yuca_kindergarten', list); }catch(e){}
}

export function renderKindergarten(container){
  const target = container || document.getElementById('main-content');
  if(!target) return;
  const kgList = getKg();
  const customers = getCustomers();
  const today = new Date().toISOString().slice(0,10);

  let filtered = kgList;
  if(kgFilter==='today') filtered = kgList.filter(k=>k.date===today);
  else if(kgFilter==='week'){
    const weekAgo=new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    filtered = kgList.filter(k=>k.date && new Date(k.date)>=weekAgo);
  }
  filtered = [...filtered].sort((a,b)=>(b.date||'').localeCompare(a.date||'') || (b.checkIn||'').localeCompare(a.checkIn||''));

  const todayCount = kgList.filter(k=>k.date===today).length;
  const totalRevenue = filtered.reduce((sum,k)=>sum+(parseInt(k.price)||30000),0);

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <h2>🏫 유치원 <span style="background:#2196F3;color:white;padding:2px 10px;border-radius:12px;font-size:14px">${filtered.length}명</span>
        <small style="font-size:13px;color:#888;margin-left:8px">오늘 ${todayCount}명 · 매출 ₩${totalRevenue.toLocaleString()}</small>
      </h2>
      <div style="display:flex;gap:8px">
        <button onclick="setKgFilter('today')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${kgFilter==='today'?'#2196F3':'#fff'};color:${kgFilter==='today'?'#fff':'#333'};cursor:pointer;font-size:13px">오늘</button>
        <button onclick="setKgFilter('all')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${kgFilter==='all'?'#2196F3':'#fff'};color:${kgFilter==='all'?'#fff':'#333'};cursor:pointer;font-size:13px">전체</button>
        <button onclick="setKgFilter('week')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${kgFilter==='week'?'#2196F3':'#fff'};color:${kgFilter==='week'?'#fff':'#333'};cursor:pointer;font-size:13px">이번주</button>
        <button onclick="openKgFormFull()" style="padding:8px 16px;border-radius:20px;background:#2196F3;color:#fff;border:none;cursor:pointer;font-weight:700">+ 등원 등록</button>
      </div>
    </div>

    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8f9fa;text-align:left"><tr>
          <th style="padding:12px">날짜/등원</th><th style="padding:12px">고객/강아지</th><th style="padding:12px">이용권</th><th style="padding:12px">하원</th><th style="padding:12px">상태/알림</th><th style="padding:12px">관리</th>
        </tr></thead>
        <tbody>
          ${filtered.length===0? `<tr><td colspan="6" style="text-align:center;padding:40px;color:#888">오늘 등원한 강아지가 없습니다. 🏫<br><small>+ 등원 등록으로 추가해보세요!</small></td></tr>` :
            filtered.map((k)=>{
              const origIdx = kgList.indexOf(k);
              // 고객명 찾기
              let displayName = k.name || k.owner || '';
              if(!displayName && k.dogName){
                const found = customers.find(c=> (c.dogName===k.dogName) || (c.dog_name===k.dogName));
                if(found) displayName = found.name||found.owner||'';
              }
              displayName = displayName || '-';
              return `
              <tr style="border-top:1px solid #f0f0f0">
                <td style="padding:12px"><div style="font-weight:600">${k.date||'-'}</div><div style="font-size:12px;color:#2196F3">등원 ${k.checkIn||'09:00'}</div></td>
                <td style="padding:12px"><div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:32px;border-radius:50%;background:#E3F2FD;display:flex;align-items:center;justify-content:center">🐶</div><div><div style="font-weight:600;font-size:14px">${displayName}</div><div style="font-size:12px;color:#666">${k.dogName||k.dog_name||''}</div></div></div></td>
                <td style="padding:12px"><span style="background:#E3F2FD;color:#1565C0;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600">${k.pass||'일일권'}</span><div style="font-size:12px;margin-top:4px">₩${(k.price||30000).toLocaleString()}</div></td>
                <td style="padding:12px;font-size:13px">${k.checkOut? `<span style="color:#4CAF50">하원 ${k.checkOut}</span>` : `<button onclick="checkOutKg(${origIdx})" style="padding:4px 10px;border-radius:6px;border:1px solid #4CAF50;background:white;color:#4CAF50;cursor:pointer;font-size:12px">하원 처리</button>`}</td>
                <td style="padding:12px"><span style="padding:4px 10px;border-radius:12px;font-size:12px;background:${k.status==='등원'?'#E8F5E9':k.status==='하원'?'#E3F2FD':'#FFF8E0'};color:${k.status==='등원'?'#2E7D32':k.status==='하원'?'#1565C0':'#EF6C00'}">${k.status||'등원'}</span>${k.alarm? `<div style="font-size:11px;color:#FF8C00;margin-top:2px">🔔 ${k.alarm}</div>`:''}</td>
                <td style="padding:12px">
                  <button onclick="editKgFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #2196F3;background:white;color:#2196F3;cursor:pointer">✏️ 수정</button>
                  <button onclick="deleteKgFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
                </td>
              </tr>`;
            }).join('')}
        </tbody>
      </table>
    </div>

    <!-- 유치원 등록 모달 -->
    <div id="kg-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:92%;max-width:560px;max-height:92vh;overflow-y:auto;padding:24px">
        <h3 id="kg-modal-title">등원 등록</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
          <label style="font-size:13px;grid-column:1/-1">고객 선택
            <select id="kg-customer" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="">직접 입력</option>
              ${customers.map(c=>`<option value="${c.name}">${c.name} (${c.dogName||c.dog_name||''})</option>`).join('')}
            </select>
          </label>
          <label style="font-size:13px">고객명* <input id="kg-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">강아지명* <input id="kg-dogName" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">날짜* <input id="kg-date" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">등원 시간 <input id="kg-checkIn" type="time" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" value="09:00"></label>
          <label style="font-size:13px">하원 시간 <input id="kg-checkOut" type="time" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">이용권
            <select id="kg-pass" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="일일권">일일권</option>
              <option value="반일권">반일권</option>
              <option value="시간제">시간제</option>
              <option value="월정액">월정액</option>
              <option value="체험">체험</option>
            </select>
          </label>
          <label style="font-size:13px">가격 <input id="kg-price" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="자동계산"></label>
          <!-- 유치원 요금제 자동계산 패널 -->
          <div id="kg-price-panel" style="display:none;grid-column:1/-1;background:#EAF4FF;border:1px solid #BBD8F5;border-radius:10px;padding:12px">
            <div style="font-size:12px;font-weight:700;color:#1565C0;margin-bottom:8px">💰 유치원 요금제 자동계산</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
              <label style="font-size:12px">체중(kg) <input id="kgw-weight" type="number" min="0" step="0.5" placeholder="예: 8" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
              <label style="font-size:12px">체급 <select id="kgw-tier" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select></label>
              <label style="font-size:12px">요금제 <select id="kgw-plan" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
                <option value="1회">1회 (종일)</option>
                <option value="반일">반일</option>
                <option value="시간제">시간제</option>
                <option value="월정액">월정액 결제</option>
                <option value="월정액 이용">월정액 이용 (무료)</option>
                <option value="체험">체험 (무료)</option>
              </select></label>
              <label style="font-size:12px">월정액 횟수 <select id="kgw-freq" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select></label>
            </div>
            <div id="kgw-addons" style="margin-top:8px"></div>
            <div id="kgw-price-detail" style="margin-top:10px;font-size:12px;color:#444;line-height:1.7"></div>
          </div>
          <label style="font-size:13px">알림/특이사항 <input id="kg-alarm" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="알러지, 약 등"></label>
        </div>
        <label style="display:block;margin-top:10px;font-size:13px">메모 <textarea id="kg-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeKgModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveKgFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#2196F3;color:white;font-weight:600;cursor:pointer">💾 저장</button>
        </div>
      </div>
    </div>
  `;
  initKgPricePanel();
}

// ---------- 유치원 요금제 자동계산 ----------
function kgv(id){return document.getElementById(id)?.value||''}
function initKgPricePanel(){
  const pb=getPricebook(); const k=pb?.kg;
  const panel=document.getElementById('kg-price-panel');
  if(!panel||!k) return;
  const tierSel=document.getElementById('kgw-tier');
  const freqSel=document.getElementById('kgw-freq');
  tierSel.innerHTML='<option value="">체급 선택</option>'+(k.tiers||[]).map(t=>`<option value="${t.label}">${t.label} (${t.minKg}~${t.maxKg??'∞'}kg)</option>`).join('');
  freqSel.innerHTML=Object.keys(k.monthly||{}).map(f=>`<option value="${f}">${f}</option>`).join('');
  document.getElementById('kgw-addons').innerHTML=(k.addons||[]).map(ad=>`<label style="display:inline-flex;align-items:center;gap:4px;margin:0 10px 6px 0;font-size:12px;cursor:pointer"><input type="checkbox" class="kgw-addon" value="${ad.name}"> ${ad.name} +${ad.price.toLocaleString()}</label>`).join('');
  const refresh=()=>{
    const plan=kgv('kgw-plan');
    const addonNames=[...document.querySelectorAll('.kgw-addon:checked')].map(c=>c.value);
    const weight=kgv('kgw-weight');
    const r=calcKgPrice(pb,{
      weightKg:weight===''?null:Number(weight),
      tierLabel:kgv('kgw-tier')||null,
      plan,
      freqLabel:kgv('kgw-freq')||null,
      checkIn:kgv('kg-checkIn'),
      checkOut:kgv('kg-checkOut'),
      addonNames
    });
    const priceInput=document.getElementById('kg-price');
    if(priceInput && !priceInput.dataset.manual) priceInput.value=r.total||0;
    // 이용권 select 동기화
    const passSel=document.getElementById('kg-pass');
    if(passSel && plan){
      const map={'1회':'일일권','반일':'반일권','시간제':'시간제','월정액':'월정액','월정액 이용':'월정액','체험':'체험'};
      passSel.value=map[plan]||passSel.value;
    }
    const d=document.getElementById('kgw-price-detail');
    if(d){
      const lines=[];
      if(r.tierLabel) lines.push(`체급: ${r.tierLabel}`);
      if(r.detail) lines.push(r.detail);
      if(r.base) lines.push(`기본 ${r.base.toLocaleString()}원`);
      else if(plan==='월정액 이용'||plan==='체험') lines.push('무료');
      else if((plan==='1회'||plan==='반일'||plan==='시간제'||plan==='월정액')&&!r.base) lines.push(`<span style="color:#C62828">해당 요금이 가격표에 없습니다. 가격표 관리에서 등록하세요.</span>`);
      r.addonItems.forEach(x=>lines.push(`${x.name} +${x.price.toLocaleString()}`));
      lines.push(`<b>합계 ${r.total.toLocaleString()}원</b>`);
      d.innerHTML=lines.join('<br>');
    }
    return r;
  };
  window.__kgRefreshPrice=refresh;
  ['kgw-weight','kgw-tier','kgw-plan','kgw-freq','kg-checkIn','kg-checkOut'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',refresh);
    document.getElementById(id)?.addEventListener('input',refresh);
  });
  document.getElementById('kgw-addons')?.addEventListener('change',refresh);
  refresh();
}

window.setKgFilter = (mode)=>{ kgFilter=mode; renderKindergarten(document.getElementById('main-content')); };
window.openKgFormFull = ()=>{
  editingKgIdx=null;
  document.getElementById('kg-modal-title').textContent='등원 등록';
  document.getElementById('kg-name').value='';
  document.getElementById('kg-dogName').value='';
  document.getElementById('kg-date').value=new Date().toISOString().slice(0,10);
  document.getElementById('kg-checkIn').value='09:00';
  document.getElementById('kg-checkOut').value='';
  document.getElementById('kg-pass').value='일일권';
  document.getElementById('kg-price').value='30000';
  document.getElementById('kg-alarm').value='';
  document.getElementById('kg-notes').value='';
  document.getElementById('kg-customer').value='';
  // 가격 패널 초기화
  ['kgw-weight','kgw-tier','kgw-freq'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});
  document.getElementById('kgw-plan').value='1회';
  document.querySelectorAll('.kgw-addon').forEach(c=>c.checked=false);
  const kd=document.getElementById('kgw-price-detail');if(kd)kd.innerHTML='';
  const kp=document.getElementById('kg-price');if(kp){kp.value='';delete kp.dataset.manual}
  window.__kgRefreshPrice?.();
  document.getElementById('kg-modal').style.display='flex';
};
window.closeKgModalFull = ()=>{ document.getElementById('kg-modal').style.display='none'; editingKgIdx=null; };
window.editKgFull = (idx)=>{
  const list=getKg(); const k=list[idx]; if(!k) return;
  editingKgIdx=idx;
  document.getElementById('kg-modal-title').textContent='등원 수정';
  document.getElementById('kg-name').value=k.name||k.owner||'';
  document.getElementById('kg-dogName').value=k.dogName||k.dog_name||'';
  document.getElementById('kg-date').value=k.date||'';
  document.getElementById('kg-checkIn').value=k.checkIn||'09:00';
  document.getElementById('kg-checkOut').value=k.checkOut||'';
  document.getElementById('kg-pass').value=k.pass||'일일권';
  document.getElementById('kg-price').value=k.price||30000;
  document.getElementById('kg-alarm').value=k.alarm||'';
  document.getElementById('kg-notes').value=k.notes||'';
  // 가격 스냅샷 복원
  const kp=k.priceDetail||{};
  const kw=document.getElementById('kgw-weight');if(kw)kw.value=kp.weightKg??'';
  const kt=document.getElementById('kgw-tier');if(kt)kt.value=kp.tierLabel||'';
  const kpl=document.getElementById('kgw-plan');if(kpl)kpl.value=kp.plan||'1회';
  const kf=document.getElementById('kgw-freq');if(kf)kf.value=kp.freqLabel||'';
  document.querySelectorAll('.kgw-addon').forEach(c=>{c.checked=(kp.addonNames||[]).includes(c.value)});
  window.__kgRefreshPrice?.();
  document.getElementById('kg-modal').style.display='flex';
};
window.deleteKgFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getKg(); list.splice(idx,1); saveKg(list);
  renderKindergarten(document.getElementById('main-content'));
};
window.checkOutKg = (idx)=>{
  const list=getKg();
  const now = new Date().toTimeString().slice(0,5);
  list[idx].checkOut = now;
  list[idx].status = '하원';
  list[idx].updatedAt = new Date().toISOString();
  saveKg(list);
  renderKindergarten(document.getElementById('main-content'));
};
window.saveKgFull = ()=>{
  const name=document.getElementById('kg-name').value.trim();
  const dogName=document.getElementById('kg-dogName').value.trim();
  const date=document.getElementById('kg-date').value;
  if(!name||!dogName||!date){ alert('고객명, 강아지명, 날짜 필수!'); return; }
  const list=getKg();
  // 유치원 요금 스냅샷
  let priceDetail=null;
  const pb=getPricebook();
  if(pb?.kg){
    const r=window.__kgRefreshPrice?.()||calcKgPrice(pb,{plan:kgv('kgw-plan')});
    priceDetail={
      weightKg:kgv('kgw-weight')===''?null:Number(kgv('kgw-weight')),
      tierLabel:kgv('kgw-tier')||null,
      plan:kgv('kgw-plan'),
      freqLabel:kgv('kgw-freq')||null,
      addonNames:[...document.querySelectorAll('.kgw-addon:checked')].map(c=>c.value),
      calcTotal:r.total,
      manual:!!document.getElementById('kg-price')?.dataset.manual
    };
  }
  const data={
    name, dogName, date,
    checkIn:document.getElementById('kg-checkIn').value,
    checkOut:document.getElementById('kg-checkOut').value,
    pass:document.getElementById('kg-pass').value,
    price:document.getElementById('kg-price').value,
    alarm:document.getElementById('kg-alarm').value.trim(),
    notes:document.getElementById('kg-notes').value.trim(),
    priceDetail,
    status: document.getElementById('kg-checkOut').value? '하원':'등원',
    createdAt: editingKgIdx!==null? list[editingKgIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingKgIdx!==null) list[editingKgIdx]={...list[editingKgIdx],...data};
  else list.push(data);
  saveKg(list);
  closeKgModalFull();
  renderKindergarten(document.getElementById('main-content'));
};

document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='kg-customer'){
    const customers=getCustomers();
    const sel = customers.find(c=>c.name===e.target.value);
    if(sel){
      document.getElementById('kg-name').value=sel.name||'';
      document.getElementById('kg-dogName').value=sel.dogName||sel.dog_name||'';
      const kw=document.getElementById('kgw-weight');
      const cw=sel.weight||sel.weightKg||sel.dogWeight;
      if(kw && cw && !kw.value) kw.value=cw;
      window.__kgRefreshPrice?.();
    }
  }
  if(e.target && e.target.id==='kgw-plan'){
    // 요금제 변경 시 이용권 라벨 동기화 + 가격 갱신
    window.__kgRefreshPrice?.();
  }
});
// 수동 가격 입력 시 자동계산 덮어쓰기 표시
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id==='kg-price'){const p=document.getElementById('kg-price');if(p)p.dataset.manual='1'}
});