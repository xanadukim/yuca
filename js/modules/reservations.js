// YUCA v6.8 - 예약관리 완전 복구 (전체입력폼 + 수정삭제 + 고객연동 + 오늘필터)
import { load, save, KEYS } from '../storage.js';

let editingResIndex = null;
let filterMode = 'all'; // all, today, week

function getReservations(){ return load(KEYS.reservations, []); }
function getCustomers(){ return load(KEYS.customers, []); }

export function renderReservations(container){
  const target = container || document.getElementById('content');
  if(!target) return;
  const reservations = getReservations();
  const customers = getCustomers();
  const today = new Date().toISOString().slice(0,10);

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
        <div style="display:flex;border:1px solid #ddd;border-radius:8px;overflow:hidden">
          <button onclick="setResFilter('all')" style="padding:8px 12px;border:none;background:${filterMode==='all'?'#FF8C00':'white'};color:${filterMode==='all'?'white':'#666'};cursor:pointer;font-size:13px">전체</button>
          <button onclick="setResFilter('today')" style="padding:8px 12px;border:none;background:${filterMode==='today'?'#FF8C00':'white'};color:${filterMode==='today'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">오늘</button>
          <button onclick="setResFilter('week')" style="padding:8px 12px;border:none;background:${filterMode==='week'?'#FF8C00':'white'};color:${filterMode==='week'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">이번주</button>
        </div>
        <button onclick="openResFormFull()" style="padding:10px 20px;background:#FF8C00;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">+ 새 예약</button>
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
              ${customers.map(c=>`<option value="${c.name}">${c.name} (${c.dogName||c.dog_name||''}) - ${c.phone||''}</option>`).join('')}
            </select>
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
              <option value="스파">💆 스파</option>
              <option value="유치원">🏫 유치원</option>
              <option value="호텔">🏨 호텔</option>
              <option value="부분미용">부분미용</option>
              <option value="전체미용">전체미용</option>
            </select>
          </label>
          <label style="font-size:13px">가격 <input id="res-price" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="32000"></label>
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
}

// 전역 함수들 - document에서 찾음 (클로저 버그 해결)
window.setResFilter = (mode)=>{
  filterMode = mode;
  renderReservations(document.getElementById('content'));
};

window.openResFormFull = ()=>{
  editingResIndex = null;
  const modal = document.getElementById('res-modal');
  if(!modal) return;
  document.getElementById('res-modal-title').textContent='새 예약 등록';
  document.getElementById('res-name').value='';
  document.getElementById('res-phone').value='';
  document.getElementById('res-dogName').value='';
  document.getElementById('res-date').value=new Date().toISOString().slice(0,10);
  document.getElementById('res-time').value='10:00';
  document.getElementById('res-service').value='미용';
  document.getElementById('res-price').value='32000';
  document.getElementById('res-status').value='확정';
  document.getElementById('res-notes').value='';
  document.getElementById('res-customer').value='';
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
  document.getElementById('res-customer').value='';
  document.getElementById('res-modal').style.display='flex';
};

window.deleteResFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getReservations(); list.splice(idx,1); save(KEYS.reservations,list);
  renderReservations(document.getElementById('content'));
};

window.saveResFull = ()=>{
  const name=document.getElementById('res-name').value.trim();
  const date=document.getElementById('res-date').value;
  const service=document.getElementById('res-service').value;
  if(!name||!date||!service){ alert('고객명, 날짜, 서비스 필수!'); return; }
  const list=getReservations();
  const data={
    name, date,
    phone:document.getElementById('res-phone').value.trim(),
    dogName:document.getElementById('res-dogName').value.trim(),
    time:document.getElementById('res-time').value,
    service,
    price:document.getElementById('res-price').value,
    status:document.getElementById('res-status').value,
    notes:document.getElementById('res-notes').value.trim(),
    createdAt: editingResIndex!==null? list[editingResIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingResIndex!==null) list[editingResIndex]={...list[editingResIndex],...data};
  else list.push(data);
  save(KEYS.reservations,list);
  closeResModalFull();
  renderReservations(document.getElementById('content'));
};

// 고객 선택 시 자동 입력
document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='res-customer'){
    const customers=getCustomers();
    const selected = customers.find(c=>c.name===e.target.value);
    if(selected){
      document.getElementById('res-name').value=selected.name||'';
      document.getElementById('res-phone').value=selected.phone||'';
      document.getElementById('res-dogName').value=selected.dogName||selected.dog_name||'';
    }
  }
});