// YUCA v6.9 - 유치원 완전 복구 (등원/하원 + 일일권 + 고객연동)
import { load, save, KEYS } from '../storage.js';

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
  const target = container || document.getElementById('content');
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
        <div style="display:flex;border:1px solid #ddd;border-radius:8px;overflow:hidden">
          <button onclick="setKgFilter('today')" style="padding:8px 12px;border:none;background:${kgFilter==='today'?'#2196F3':'white'};color:${kgFilter==='today'?'white':'#666'};cursor:pointer;font-size:13px">오늘</button>
          <button onclick="setKgFilter('all')" style="padding:8px 12px;border:none;background:${kgFilter==='all'?'#2196F3':'white'};color:${kgFilter==='all'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">전체</button>
          <button onclick="setKgFilter('week')" style="padding:8px 12px;border:none;background:${kgFilter==='week'?'#2196F3':'white'};color:${kgFilter==='week'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">이번주</button>
        </div>
        <button onclick="openKgFormFull()" style="padding:10px 20px;background:#2196F3;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">+ 등원 등록</button>
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
              <option value="일일권">일일권 (3만원)</option>
              <option value="월정기권">월정기권 (50만원)</option>
              <option value="10회권">10회권 (25만원)</option>
              <option value="체험">체험</option>
            </select>
          </label>
          <label style="font-size:13px">가격 <input id="kg-price" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" value="30000"></label>
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
}

window.setKgFilter = (mode)=>{ kgFilter=mode; renderKindergarten(document.getElementById('content')); };
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
  document.getElementById('kg-modal').style.display='flex';
};
window.deleteKgFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getKg(); list.splice(idx,1); saveKg(list);
  renderKindergarten(document.getElementById('content'));
};
window.checkOutKg = (idx)=>{
  const list=getKg();
  const now = new Date().toTimeString().slice(0,5);
  list[idx].checkOut = now;
  list[idx].status = '하원';
  list[idx].updatedAt = new Date().toISOString();
  saveKg(list);
  renderKindergarten(document.getElementById('content'));
};
window.saveKgFull = ()=>{
  const name=document.getElementById('kg-name').value.trim();
  const dogName=document.getElementById('kg-dogName').value.trim();
  const date=document.getElementById('kg-date').value;
  if(!name||!dogName||!date){ alert('고객명, 강아지명, 날짜 필수!'); return; }
  const list=getKg();
  const data={
    name, dogName, date,
    checkIn:document.getElementById('kg-checkIn').value,
    checkOut:document.getElementById('kg-checkOut').value,
    pass:document.getElementById('kg-pass').value,
    price:document.getElementById('kg-price').value,
    alarm:document.getElementById('kg-alarm').value.trim(),
    notes:document.getElementById('kg-notes').value.trim(),
    status: document.getElementById('kg-checkOut').value? '하원':'등원',
    createdAt: editingKgIdx!==null? list[editingKgIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingKgIdx!==null) list[editingKgIdx]={...list[editingKgIdx],...data};
  else list.push(data);
  saveKg(list);
  closeKgModalFull();
  renderKindergarten(document.getElementById('content'));
};

document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='kg-customer'){
    const customers=getCustomers();
    const sel = customers.find(c=>c.name===e.target.value);
    if(sel){
      document.getElementById('kg-name').value=sel.name||'';
      document.getElementById('kg-dogName').value=sel.dogName||sel.dog_name||'';
    }
  }
  if(e.target && e.target.id==='kg-pass'){
    const map={ '일일권':30000, '월정기권':500000, '10회권':250000, '체험':0 };
    document.getElementById('kg-price').value = map[e.target.value]?? 30000;
  }
});