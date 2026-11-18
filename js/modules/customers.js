// YUCA v10.2 - 고객관리: 다견(pets[]) + 주소 + 주의 플래그 + 프로필 모달
import { load, save, KEYS, localToday } from '../storage.js';

let editingIndex = null;
let tempDogPhoto = null;

export const FLAG_PRESETS = ['입질 주의','컴플레인 이력','공격성','분리불안','의료 주의','노령견','알레르기'];

const DOG_ICON = `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#FF8C00" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="4.2" r="1.9"/><path d="M7.5 6.8v6.4M7.5 9.2l-2.6 1.8M7.5 10.6l2.6 1.6"/><path d="M5.2 19.5l.9-4.3M9.8 19.5l-.9-4.3"/><path d="M9.9 12.6c1.8.7 3.6.7 5.4-.2"/><path d="M13.6 12.4c-.9-.7-1-1.9-.2-2.7"/><ellipse cx="16.6" cy="13.8" rx="3.3" ry="2.1"/><circle cx="20" cy="12.4" r="1.3"/><path d="M14.6 15.7l-.8 3.3M17.8 15.9l.4 3.4M20.3 13.6l1.2 2.8"/></svg>`;
const newId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// ---------- 마이그레이션 ----------
export function migrateCustomer(c){
  if(!c.id) c.id = newId('c');
  if(!c.pets || !c.pets.length){
    c.pets = [{
      id: newId('p'),
      name: c.dogName || c.dog_name || c.dog || '강아지',
      breed: c.breed || '', weight: c.weight || '', birth: c.birth || '',
      notes: '', flags: [], photo: c.dogPhoto || null
    }];
  }
  c.pets.forEach(p=>{ if(!p.id) p.id=newId('p'); if(!p.flags) p.flags=[]; });
  // 레거시 필드 동기화 (예약/CSV 등 기존 코드 호환)
  const p0 = c.pets[0];
  c.dogName = p0.name; c.breed = p0.breed || '';
  c.weight = p0.weight || ''; c.birth = p0.birth || '';
  c.address = c.address || '';
  return c;
}

export function loadCustomers(){
  const list = load(KEYS.customers, []) || [];
  let changed = false;
  list.forEach(c=>{ const b=JSON.stringify(c); migrateCustomer(c); if(JSON.stringify(c)!==b) changed=true; });
  if(changed) save(KEYS.customers, list);
  return list;
}

// 기존 예약에 customerId/petId 소급 연결 (name+phone 정확 일치만)
export function backfillReservationLinks(){
  const custs = loadCustomers();
  const res = load(KEYS.reservations, []) || [];
  let changed = false;
  res.forEach(r=>{
    if(r.customerId) return;
    const c = custs.find(x => (x.phone && r.phone && x.phone===r.phone) || (x.name===r.name));
    if(!c) return;
    r.customerId = c.id;
    const p = (c.pets||[]).find(p=>p.name === (r.dogName || r.dog_name || r.dog));
    if(p) r.petId = p.id;
    changed = true;
  });
  if(changed) save(KEYS.reservations, res);
}

function petFlags(p){ return (p.flags||[]).join(' · '); }
function allFlags(c){ return (c.pets||[]).flatMap(p=>p.flags||[]); }

// ---------- 목록 ----------
export function renderCustomers(container){
  backfillReservationLinks();
  const customers = loadCustomers();
  const target = container || document.getElementById('main-content');
  if(!target) return;

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2>👥 고객관리 <span style="background:#FF8C00;color:white;padding:2px 10px;border-radius:12px;font-size:14px">${customers.length}명</span></h2>
      <button onclick="openCustomerFormFull()" style="padding:10px 20px;background:#FF8C00;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">+ 새 고객 등록</button>
    </div>

    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8f9fa;text-align:left"><tr>
          <th style="padding:12px">보호자/강아지</th><th style="padding:12px">견종</th><th style="padding:12px">전화번호</th><th style="padding:12px">메모</th><th style="padding:12px">관리</th>
        </tr></thead>
        <tbody>
          ${customers.length===0? `<tr><td colspan="5" style="text-align:center;padding:40px;color:#888">고객이 없습니다. 🐶</td></tr>` :
            customers.map((c,i)=>{
              const pets = c.pets||[];
              const p0 = pets[0]||{};
              const flags = [...new Set(allFlags(c))];
              const dogLabel = pets.length>1 ? `${p0.name} 외 ${pets.length-1}마리` : (p0.name||'강아지');
              return `
              <tr style="border-top:1px solid #f0f0f0;cursor:pointer" onclick="openCustomerProfile(${i})">
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:42px;height:42px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;overflow:hidden">
                      ${p0.photo||c.dogPhoto? `<img src="${p0.photo||c.dogPhoto}" style="width:100%;height:100%;object-fit:cover">` : DOG_ICON}
                    </div>
                    <div>
                      <div style="font-weight:600">${c.name||c.owner||'보호자'} ${flags.length?`<span title="${flags.join(', ')}" style="color:#dc2626;font-size:13px">⚠️</span>`:''}</div>
                      <div style="font-size:13px;color:#666">${dogLabel} ${p0.weight? `(${p0.weight}kg)`:''}</div>
                      ${flags.length?`<div style="font-size:11px;color:#dc2626">${flags.join(' · ')}</div>`:''}
                    </div>
                  </div>
                </td>
                <td style="padding:12px">${p0.breed||'-'}</td>
                <td style="padding:12px;font-size:13px">${c.phone||'-'}${c.address?`<div style="font-size:11px;color:#9ca3af">${c.address}</div>`:''}</td>
                <td style="padding:12px;font-size:13px">${c.notes||'-'}</td>
                <td style="padding:12px" onclick="event.stopPropagation()">
                  <button onclick="editCustomerFull(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF8C00;background:white;color:#FF8C00;cursor:pointer">✏️ 수정</button>
                  <button onclick="deleteCustomerFull(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
                </td>
              </tr>`
            }).join('')}
        </tbody>
      </table>
    </div>

    <div id="customer-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:94%;max-width:720px;max-height:92vh;overflow-y:auto;padding:24px;position:relative">
        <h3 id="modal-title">새 고객 등록</h3>
        <p style="color:#888;font-size:12px;margin:0 0 16px">* 필수 / 사진 선택 (NULL 허용)</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label style="font-size:13px">보호자* <input id="inp-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">전화번호* <input id="inp-phone" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px;grid-column:1/-1">주소 <input id="inp-address" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="방문/픽업용"></label>
        </div>

        <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">
          <b style="font-size:14px">🐶 강아지 정보</b>
          <button type="button" onclick="addPetRow()" style="padding:6px 12px;border:1px dashed #FF8C00;background:#FFF8F0;color:#E65100;border-radius:7px;font-size:12px;cursor:pointer">+ 강아지 추가</button>
        </div>
        <div id="pets-box"></div>

        <label style="display:block;margin-top:12px;font-size:13px">보호자 메모 <textarea id="inp-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeCustomerModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveCustomerFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#FF8C00;color:white;font-weight:600;cursor:pointer">💾 저장</button>
        </div>
      </div>
    </div>

    <div id="profile-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9998;justify-content:center;align-items:center">
      <div id="profile-body" style="background:white;border-radius:16px;width:94%;max-width:680px;max-height:90vh;overflow-y:auto;padding:24px;position:relative"></div>
    </div>
  `;
}

// ---------- 강아지 행 편집 ----------
function petRowHTML(p={}, idx=0){
  const flags=(p.flags||[]);
  const chips=FLAG_PRESETS.map(f=>{
    const on=flags.includes(f);
    return `<button type="button" class="pet-flag-chip" data-flag="${f}" data-on="${on?1:0}" style="padding:3px 9px;border-radius:12px;font-size:11px;cursor:pointer;border:1px solid ${on?'#dc2626':'#ddd'};background:${on?'#fef2f2':'#fff'};color:${on?'#dc2626':'#6b7280'}">${f}</button>`;
  }).join('');
  return `
  <div class="pet-row" data-idx="${idx}" data-pet-id="${p.id||''}" style="border:1px solid #eee;border-radius:10px;padding:12px;margin-top:10px;background:#fafafa">
    <input type="hidden" class="pet-photo" value="${p.photo||''}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b style="font-size:13px">강아지 ${idx+1}</b>
      <button type="button" class="pet-del" style="border:none;background:none;color:#dc2626;font-size:12px;cursor:pointer">삭제</button>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <input class="pet-name" placeholder="이름*" value="${p.name||''}" style="padding:8px;border:1px solid #ddd;border-radius:7px">
      <select class="pet-breed" style="padding:8px;border:1px solid #ddd;border-radius:7px">
        <option value="">견종</option>${['푸들','비숑','말티즈','포메','웰시코기','시바견','믹스','기타'].map(b=>`<option ${p.breed===b?'selected':''}>${b}</option>`).join('')}
      </select>
      <input class="pet-weight" type="number" step="0.1" placeholder="체중(kg)" value="${p.weight||''}" style="padding:8px;border:1px solid #ddd;border-radius:7px">
      <input class="pet-birth" type="date" value="${p.birth||''}" style="padding:8px;border:1px solid #ddd;border-radius:7px">
    </div>
    <input class="pet-notes" placeholder="강아지 메모" value="${p.notes||''}" style="width:100%;margin-top:8px;padding:8px;border:1px solid #ddd;border-radius:7px;box-sizing:border-box">
    <div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
      <span style="font-size:11px;color:#888">주의 플래그:</span>${chips}
      <input class="pet-flag-custom" placeholder="직접 입력" value="${flags.filter(f=>!FLAG_PRESETS.includes(f)).join(',')}" style="padding:4px 8px;border:1px solid #ddd;border-radius:12px;font-size:11px;width:110px">
    </div>
  </div>`;
}

window.addPetRow = (p) => {
  const box = document.getElementById('pets-box');
  if(!box) return;
  const idx = box.querySelectorAll('.pet-row').length;
  box.insertAdjacentHTML('beforeend', petRowHTML(p||{}, idx));
};

document.addEventListener('click', (e)=>{
  const chip = e.target.closest('.pet-flag-chip');
  if(chip){
    const on = chip.dataset.on === '1';
    chip.dataset.on = on ? '0' : '1';
    chip.style.borderColor = on ? '#ddd' : '#dc2626';
    chip.style.background = on ? '#fff' : '#fef2f2';
    chip.style.color = on ? '#6b7280' : '#dc2626';
    return;
  }
  const del = e.target.closest('.pet-del');
  if(del){ del.closest('.pet-row')?.remove(); reindexPetRows(); }
});
function reindexPetRows(){
  document.querySelectorAll('#pets-box .pet-row').forEach((r,i)=>{
    r.dataset.idx=i;
    const b=r.querySelector('b'); if(b) b.textContent=`강아지 ${i+1}`;
  });
}

// ---------- 폼 ----------
window.openCustomerFormFull = () => {
  editingIndex = null; tempDogPhoto = null;
  const modal = document.getElementById('customer-modal');
  if(!modal) return;
  document.getElementById('modal-title').textContent = '새 고객 등록';
  ['inp-name','inp-phone','inp-address','inp-notes'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('pets-box').innerHTML='';
  window.addPetRow({name:''});
  modal.style.display='flex';
};

window.closeCustomerModalFull = () => {
  const modal = document.getElementById('customer-modal');
  if(modal) modal.style.display='none';
  editingIndex=null; tempDogPhoto=null;
};

window.editCustomerFull = (i) => {
  const c = loadCustomers()[i]; if(!c) return;
  migrateCustomer(c);
  editingIndex=i; tempDogPhoto=c.dogPhoto||c.pets?.[0]?.photo||null;
  document.getElementById('modal-title').textContent='고객 수정';
  document.getElementById('inp-name').value=c.name||'';
  document.getElementById('inp-phone').value=c.phone||'';
  document.getElementById('inp-address').value=c.address||'';
  document.getElementById('inp-notes').value=c.notes||'';
  const box=document.getElementById('pets-box'); box.innerHTML='';
  (c.pets&&c.pets.length?c.pets:[{}]).forEach(p=>window.addPetRow(p));
  document.getElementById('customer-modal').style.display='flex';
};

window.deleteCustomerFull = (i) => {
  if(!confirm('정말 삭제?')) return;
  const list=loadCustomers(); list.splice(i,1); save(KEYS.customers,list);
  renderCustomers(document.getElementById('main-content'));
};

window.saveCustomerFull = ()=>{
  const name=document.getElementById('inp-name').value.trim();
  const phone=document.getElementById('inp-phone').value.trim();
  if(!name||!phone){ alert('보호자 이름/전화번호 필수!'); return; }
  const rows=[...document.querySelectorAll('#pets-box .pet-row')];
  const pets=rows.map(r=>{
    const presetFlags=[...r.querySelectorAll('.pet-flag-chip')].filter(ch=>ch.dataset.on==='1').map(ch=>ch.dataset.flag);
    const custom=(r.querySelector('.pet-flag-custom')?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
    return {
      id:r.dataset.petId||newId('p'),
      name:r.querySelector('.pet-name').value.trim()||'강아지',
      breed:r.querySelector('.pet-breed').value,
      weight:r.querySelector('.pet-weight').value,
      birth:r.querySelector('.pet-birth').value,
      notes:r.querySelector('.pet-notes').value.trim(),
      photo:r.querySelector('.pet-photo')?.value||null,
      flags:[...new Set([...presetFlags,...custom])]
    };
  }).filter(p=>p.name!=='강아지'||p.breed||p.weight);
  if(!pets.length) pets.push({id:newId('p'),name:'강아지',breed:'',weight:'',birth:'',notes:'',flags:[]});
  pets[0].photo = pets[0].photo || tempDogPhoto || null;

  const list=loadCustomers();
  const newData={
    name, phone,
    address:document.getElementById('inp-address').value.trim(),
    notes:document.getElementById('inp-notes').value.trim(),
    pets,
    dogPhoto: pets[0].photo || null,
    visits: editingIndex!==null? (list[editingIndex].visits||0):0,
    createdAt: editingIndex!==null? list[editingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  migrateCustomer(newData);
  if(editingIndex!==null) list[editingIndex]={...list[editingIndex],...newData};
  else list.push(newData);
  save(KEYS.customers,list);
  closeCustomerModalFull();
  renderCustomers(document.getElementById('main-content'));
};

// ---------- 프로필 모달 ----------
window.openCustomerProfile = (i)=>{
  const c = loadCustomers()[i]; if(!c) return;
  migrateCustomer(c);
  const res = (load(KEYS.reservations,[])||[]).filter(r=>r.customerId===c.id || ((r.name===c.name)&&(r.phone===c.phone)));
  const done = res.filter(r=>r.status!=='취소');
  const total = done.reduce((s,r)=>s+(Number(r.price)||0),0);
  const avg = done.length? Math.round(total/done.length):0;
  const lastDate = res.map(r=>r.date).filter(Boolean).sort().pop();
  const upcoming = res.filter(r=>r.status!=='취소'&&r.status!=='완료'&&r.date>=localToday()).sort((a,b)=>a.date.localeCompare(b.date));

  const petCards=(c.pets||[]).map(p=>`
    <div style="border:1px solid #eee;border-radius:10px;padding:12px;display:flex;gap:12px;align-items:flex-start">
      <div style="width:52px;height:52px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
        ${p.photo?`<img src="${p.photo}" style="width:100%;height:100%;object-fit:cover">`:DOG_ICON}
      </div>
      <div style="flex:1">
        <b>${p.name}</b> ${p.breed?`<span style="color:#6b7280;font-size:12px">· ${p.breed}</span>`:''}
        <div style="font-size:12px;color:#6b7280;margin-top:2px">
          ${p.weight?`${p.weight}kg · `:''}${p.birth?`생일 ${p.birth} · `:''}
        </div>
        ${(p.flags||[]).length?`<div style="margin-top:4px">${p.flags.map(f=>`<span style="background:#fef2f2;color:#dc2626;border:1px solid #fecaca;padding:2px 8px;border-radius:10px;font-size:11px;margin-right:4px">⚠ ${f}</span>`).join('')}</div>`:''}
        ${p.notes?`<div style="font-size:12px;color:#9ca3af;margin-top:4px">${p.notes}</div>`:''}
      </div>
    </div>`).join('');

  const histRows=res.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(r=>`
    <tr style="border-top:1px solid #f3f4f6">
      <td style="padding:8px;font-size:13px">${r.date||'-'} ${r.time||''}</td>
      <td style="padding:8px;font-size:13px">${r.service||'-'}</td>
      <td style="padding:8px;font-size:13px">${r.dogName||r.dog_name||''}</td>
      <td style="padding:8px;font-size:13px">₩${(Number(r.price)||0).toLocaleString()}</td>
      <td style="padding:8px"><span style="font-size:12px;padding:2px 8px;border-radius:8px;${r.status==='완료'?'background:#e0f2fe;color:#0369a1':r.status==='취소'?'background:#fee2e2;color:#dc2626':'background:#fef3c7;color:#b45309'}">${r.status||'-'}</span></td>
    </tr>`).join('');

  document.getElementById('profile-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
        <h3 style="margin:0">👤 ${c.name} <span style="font-size:13px;color:#6b7280;font-weight:400">프로필</span></h3>
        <div style="font-size:13px;color:#6b7280;margin-top:4px">${c.phone||'-'} ${c.address?`· 📍 ${c.address}`:''}</div>
      </div>
      <button onclick="document.getElementById('profile-modal').style.display='none'" style="border:none;background:#f3f4f6;border-radius:8px;padding:6px 12px;cursor:pointer">✕</button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0">
      <div style="background:#f9fafb;border-radius:8px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800">${done.length}</div><div style="font-size:11px;color:#6b7280">총 방문</div></div>
      <div style="background:#f9fafb;border-radius:8px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800">₩${total>=10000?(total/10000).toFixed(1)+'만':total.toLocaleString()}</div><div style="font-size:11px;color:#6b7280">누적 결제</div></div>
      <div style="background:#f9fafb;border-radius:8px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800">₩${avg.toLocaleString()}</div><div style="font-size:11px;color:#6b7280">평균 단가</div></div>
      <div style="background:#f9fafb;border-radius:8px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800">${lastDate||'-'}</div><div style="font-size:11px;color:#6b7280">마지막 방문</div></div>
    </div>

    ${upcoming.length?`<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:12px">📅 예정된 예약: ${upcoming.map(r=>`${r.date} ${r.service||''}`).join(', ')}</div>`:''}

    <b style="font-size:14px">🐶 강아지 (${(c.pets||[]).length}마리)</b>
    <div style="display:grid;gap:8px;margin-top:8px">${petCards||'<div style="color:#9ca3af;font-size:13px">등록된 강아지 없음</div>'}</div>

    <b style="font-size:14px;display:block;margin-top:16px">📋 예약 이력 (${res.length}건)</b>
    <div style="margin-top:8px;max-height:280px;overflow-y:auto;border:1px solid #f3f4f6;border-radius:8px">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f9fafb;position:sticky;top:0"><tr>
          <th style="padding:8px;font-size:12px;text-align:left">날짜/시간</th><th style="padding:8px;font-size:12px;text-align:left">서비스</th><th style="padding:8px;font-size:12px;text-align:left">강아지</th><th style="padding:8px;font-size:12px;text-align:left">금액</th><th style="padding:8px;font-size:12px;text-align:left">상태</th>
        </tr></thead>
        <tbody>${histRows||'<tr><td colspan="5" style="padding:16px;text-align:center;color:#9ca3af;font-size:13px">예약 이력 없음</td></tr>'}</tbody>
      </table>
    </div>
    ${c.notes?`<div style="margin-top:12px;font-size:13px;color:#6b7280">📝 ${c.notes}</div>`:''}
  `;
  document.getElementById('profile-modal').style.display='flex';
};

export function addCustomer(obj){
  const customers = loadCustomers();
  const newData = {
    name: obj.name || obj.owner || '보호자',
    phone: obj.phone || '010-0000-0000',
    address: obj.address || '',
    notes: obj.notes || '',
    pets: [{ id:newId('p'), name:obj.dog_name||obj.dogName||'강아지', breed:obj.breed||'믹스', weight:obj.weight||'', birth:obj.birth||'', notes:'', flags:[], photo:null }],
    visits: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  migrateCustomer(newData);
  customers.push(newData);
  save(KEYS.customers, customers);
  return newData;
}

export function openCustomerForm(){ openCustomerFormFull(); }
