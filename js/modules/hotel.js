// YUCA v7.0 - 호텔 완전 복구 (체크인/체크아웃 + 방타입 + 숙박일수 자동)
import { load, save, KEYS } from '../storage.js';

let editingHotelIdx = null;
let hotelFilter = 'stay'; // stay, today, all, week

function getHotel(){
  try{ return load(KEYS.hotel, []); }catch(e){ return load('yuca_hotel', []); }
}
function getCustomers(){ return load(KEYS.customers, []); }
function saveHotel(list){
  save(KEYS.hotel, list);
  try{ save('yuca_hotel', list); }catch(e){}
}

function calcNights(checkInDate, checkOutDate){
  if(!checkInDate ||!checkOutDate) return 1;
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diff = Math.round((d2 - d1) / (1000*60*60*24));
  return diff > 0? diff : 1;
}

export function renderHotel(container){
  const target = container || document.getElementById('content');
  if(!target) return;
  const hotelList = getHotel();
  const customers = getCustomers();
  const today = new Date().toISOString().slice(0,10);

  let filtered = hotelList;
  if(hotelFilter==='stay'){
    filtered = hotelList.filter(h=> (h.status==='투숙중' || h.status==='예약' ||!h.checkOutDate || h.checkOutDate >= today));
  } else if(hotelFilter==='today'){
    filtered = hotelList.filter(h=> h.checkInDate===today || h.checkOutDate===today);
  } else if(hotelFilter==='week'){
    const weekAgo=new Date(); weekAgo.setDate(weekAgo.getDate()-7);
    filtered = hotelList.filter(h=> h.checkInDate && new Date(h.checkInDate)>=weekAgo);
  }
  filtered = [...filtered].sort((a,b)=>(b.checkInDate||'').localeCompare(a.checkInDate||''));

  const staying = hotelList.filter(h=>h.status==='투숙중').length;
  const totalRev = filtered.reduce((s,h)=>s + (parseInt(h.totalPrice)|| parseInt(h.price)||0), 0);

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <h2>🏨 호텔 <span style="background:#9C27B0;color:white;padding:2px 10px;border-radius:12px;font-size:14px">${filtered.length}건</span>
        <small style="font-size:13px;color:#888;margin-left:8px">투숙중 ${staying}마리 · 매출 ₩${totalRev.toLocaleString()}</small>
      </h2>
      <div style="display:flex;gap:8px">
        <div style="display:flex;border:1px solid #ddd;border-radius:8px;overflow:hidden">
          <button onclick="setHotelFilter('stay')" style="padding:8px 12px;border:none;background:${hotelFilter==='stay'?'#9C27B0':'white'};color:${hotelFilter==='stay'?'white':'#666'};cursor:pointer;font-size:13px">투숙중</button>
          <button onclick="setHotelFilter('today')" style="padding:8px 12px;border:none;background:${hotelFilter==='today'?'#9C27B0':'white'};color:${hotelFilter==='today'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">오늘</button>
          <button onclick="setHotelFilter('all')" style="padding:8px 12px;border:none;background:${hotelFilter==='all'?'#9C27B0':'white'};color:${hotelFilter==='all'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">전체</button>
        </div>
        <button onclick="openHotelFormFull()" style="padding:10px 20px;background:#9C27B0;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">+ 투숙 등록</button>
      </div>
    </div>

    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8f9fa;text-align:left"><tr>
          <th style="padding:12px">체크인/아웃</th><th style="padding:12px">고객/강아지</th><th style="padding:12px">객실/박수</th><th style="padding:12px">금액</th><th style="padding:12px">상태</th><th style="padding:12px">관리</th>
        </tr></thead>
        <tbody>
          ${filtered.length===0? `<tr><td colspan="6" style="text-align:center;padding:40px;color:#888">투숙 중인 강아지가 없습니다. 🏨<br><small>+ 투숙 등록으로 추가!</small></td></tr>` :
            filtered.map((h)=>{
              const origIdx = hotelList.indexOf(h);
              let displayName = h.name||h.owner||'';
              if(!displayName && h.dogName){
                const f=customers.find(c=> (c.dogName===h.dogName)||(c.dog_name===h.dogName));
                if(f) displayName=f.name||f.owner||'';
              }
              displayName=displayName||'-';
              const nights = calcNights(h.checkInDate, h.checkOutDate);
              const roomColor = h.roomType==='SUITE'?'#FF9800':h.roomType==='L'?'#9C27B0':h.roomType==='M'?'#2196F3':'#4CAF50';
              return `
              <tr style="border-top:1px solid #f0f0f0">
                <td style="padding:12px"><div style="font-weight:600;font-size:13px">IN ${h.checkInDate||'-'} ${h.checkInTime||''}</div><div style="font-size:13px;color:#9C27B0">OUT ${h.checkOutDate||'-'} ${h.checkOutTime||''}</div><div style="font-size:11px;color:#888">${nights}박</div></td>
                <td style="padding:12px"><div style="display:flex;align-items:center;gap:8px"><div style="width:32px;height:32px;border-radius:50%;background:#F3E5F5;display:flex;align-items:center;justify-content:center">🐕</div><div><div style="font-weight:600;font-size:14px">${displayName}</div><div style="font-size:12px;color:#666">${h.dogName||h.dog_name||''}</div></div></div></td>
                <td style="padding:12px"><span style="background:${roomColor}15;color:${roomColor};border:1px solid ${roomColor}30;padding:4px 10px;border-radius:12px;font-size:12px;font-weight:700">${h.roomType||'S'}</span><div style="font-size:12px;margin-top:4px">${h.roomNo? h.roomNo+'호':''} ${nights}박</div></td>
                <td style="padding:12px"><div style="font-weight:600">₩${(h.totalPrice||h.price||0).toLocaleString()}</div><div style="font-size:11px;color:#888">₩${(h.price||0).toLocaleString()}/박</div></td>
                <td style="padding:12px"><span style="padding:4px 10px;border-radius:12px;font-size:12px;background:${h.status==='투숙중'?'#E8F5E9':h.status==='예약'?'#FFF3E0':h.status==='퇴실'?'#E3F2FD':'#FFEBEE'};color:${h.status==='투숙중'?'#2E7D32':h.status==='예약'?'#EF6C00':h.status==='퇴실'?'#1565C0':'#C62828'}">${h.status||'예약'}</span>${h.alarm?`<div style="font-size:11px;color:#FF8C00;margin-top:2px">🔔 ${h.alarm}</div>`:''}</td>
                <td style="padding:12px">
                  <button onclick="editHotelFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #9C27B0;background:white;color:#9C27B0;cursor:pointer">✏️ 수정</button>
                  ${h.status!=='퇴실'? `<button onclick="checkOutHotel(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #4CAF50;background:white;color:#4CAF50;margin-left:4px;cursor:pointer">퇴실</button>` : ''}
                  <button onclick="deleteHotelFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️</button>
                </td>
              </tr>`;
            }).join('')}
        </tbody>
      </table>
    </div>

    <div id="hotel-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:92%;max-width:600px;max-height:92vh;overflow-y:auto;padding:24px">
        <h3 id="hotel-modal-title">투숙 등록</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
          <label style="font-size:13px;grid-column:1/-1">고객 선택
            <select id="hotel-customer" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="">직접 입력</option>
              ${customers.map(c=>`<option value="${c.name}">${c.name} (${c.dogName||c.dog_name||''})</option>`).join('')}
            </select>
          </label>
          <label style="font-size:13px">고객명* <input id="hotel-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">강아지명* <input id="hotel-dogName" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">체크인 날짜* <input id="hotel-checkInDate" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">체크인 시간 <input id="hotel-checkInTime" type="time" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" value="15:00"></label>
          <label style="font-size:13px">체크아웃 날짜* <input id="hotel-checkOutDate" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">체크아웃 시간 <input id="hotel-checkOutTime" type="time" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" value="11:00"></label>
          <label style="font-size:13px">객실 타입
            <select id="hotel-roomType" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="S">S - 소형 (3만/박)</option>
              <option value="M">M - 중형 (4만/박)</option>
              <option value="L">L - 대형 (5만/박)</option>
              <option value="SUITE">SUITE - 특실 (8만/박)</option>
            </select>
          </label>
          <label style="font-size:13px">객실 번호 <input id="hotel-roomNo" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="101"></label>
          <label style="font-size:13px">1박 요금 <input id="hotel-price" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" value="30000"></label>
          <label style="font-size:13px">총 금액 <input id="hotel-totalPrice" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px;background:#f8f9fa" readonly></label>
          <label style="font-size:13px">상태
            <select id="hotel-status" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="예약">예약</option>
              <option value="투숙중">투숙중</option>
              <option value="퇴실">퇴실</option>
              <option value="취소">취소</option>
            </select>
          </label>
          <label style="font-size:13px">알림 <input id="hotel-alarm" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="산책, 식사 등"></label>
        </div>
        <label style="display:block;margin-top:10px;font-size:13px">메모 <textarea id="hotel-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeHotelModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveHotelFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#9C27B0;color:white;font-weight:600;cursor:pointer">💾 저장</button>
        </div>
      </div>
    </div>
  `;
}

window.setHotelFilter = (mode)=>{ hotelFilter=mode; renderHotel(document.getElementById('content')); };
window.openHotelFormFull = ()=>{
  editingHotelIdx=null;
  document.getElementById('hotel-modal-title').textContent='투숙 등록';
  document.getElementById('hotel-name').value='';
  document.getElementById('hotel-dogName').value='';
  document.getElementById('hotel-checkInDate').value=new Date().toISOString().slice(0,10);
  document.getElementById('hotel-checkOutDate').value=new Date(new Date().setDate(new Date().getDate()+1)).toISOString().slice(0,10);
  document.getElementById('hotel-checkInTime').value='15:00';
  document.getElementById('hotel-checkOutTime').value='11:00';
  document.getElementById('hotel-roomType').value='S';
  document.getElementById('hotel-roomNo').value='';
  document.getElementById('hotel-price').value='30000';
  document.getElementById('hotel-totalPrice').value='30000';
  document.getElementById('hotel-status').value='예약';
  document.getElementById('hotel-alarm').value='';
  document.getElementById('hotel-notes').value='';
  document.getElementById('hotel-customer').value='';
  updateHotelTotal();
  document.getElementById('hotel-modal').style.display='flex';
};
window.closeHotelModalFull = ()=>{ document.getElementById('hotel-modal').style.display='none'; editingHotelIdx=null; };
window.editHotelFull = (idx)=>{
  const list=getHotel(); const h=list[idx]; if(!h) return;
  editingHotelIdx=idx;
  document.getElementById('hotel-modal-title').textContent='투숙 수정';
  document.getElementById('hotel-name').value=h.name||h.owner||'';
  document.getElementById('hotel-dogName').value=h.dogName||h.dog_name||'';
  document.getElementById('hotel-checkInDate').value=h.checkInDate||'';
  document.getElementById('hotel-checkInTime').value=h.checkInTime||'15:00';
  document.getElementById('hotel-checkOutDate').value=h.checkOutDate||'';
  document.getElementById('hotel-checkOutTime').value=h.checkOutTime||'11:00';
  document.getElementById('hotel-roomType').value=h.roomType||'S';
  document.getElementById('hotel-roomNo').value=h.roomNo||'';
  document.getElementById('hotel-price').value=h.price||30000;
  document.getElementById('hotel-totalPrice').value=h.totalPrice||h.price||30000;
  document.getElementById('hotel-status').value=h.status||'예약';
  document.getElementById('hotel-alarm').value=h.alarm||'';
  document.getElementById('hotel-notes').value=h.notes||'';
  document.getElementById('hotel-modal').style.display='flex';
};
window.deleteHotelFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getHotel(); list.splice(idx,1); saveHotel(list);
  renderHotel(document.getElementById('content'));
};
window.checkOutHotel = (idx)=>{
  if(!confirm('퇴실 처리 할까요?')) return;
  const list=getHotel();
  list[idx].status='퇴실';
  list[idx].checkOutDate = list[idx].checkOutDate || new Date().toISOString().slice(0,10);
  list[idx].updatedAt = new Date().toISOString();
  saveHotel(list);
  renderHotel(document.getElementById('content'));
};
window.updateHotelTotal = ()=>{
  const inDate=document.getElementById('hotel-checkInDate')?.value;
  const outDate=document.getElementById('hotel-checkOutDate')?.value;
  const price=parseInt(document.getElementById('hotel-price')?.value)||0;
  const nights = calcNights(inDate,outDate);
  const total = nights*price;
  const el=document.getElementById('hotel-totalPrice');
  if(el) el.value=total;
};
window.saveHotelFull = ()=>{
  const name=document.getElementById('hotel-name').value.trim();
  const dogName=document.getElementById('hotel-dogName').value.trim();
  const inDate=document.getElementById('hotel-checkInDate').value;
  const outDate=document.getElementById('hotel-checkOutDate').value;
  if(!name||!dogName||!inDate||!outDate){ alert('고객명, 강아지명, 체크인/아웃 날짜 필수!'); return; }
  const list=getHotel();
  const data={
    name, dogName,
    checkInDate:inDate, checkInTime:document.getElementById('hotel-checkInTime').value,
    checkOutDate:outDate, checkOutTime:document.getElementById('hotel-checkOutTime').value,
    roomType:document.getElementById('hotel-roomType').value,
    roomNo:document.getElementById('hotel-roomNo').value.trim(),
    price:document.getElementById('hotel-price').value,
    totalPrice:document.getElementById('hotel-totalPrice').value,
    status:document.getElementById('hotel-status').value,
    alarm:document.getElementById('hotel-alarm').value.trim(),
    notes:document.getElementById('hotel-notes').value.trim(),
    createdAt: editingHotelIdx!==null? list[editingHotelIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingHotelIdx!==null) list[editingHotelIdx]={...list[editingHotelIdx],...data};
  else list.push(data);
  saveHotel(list);
  closeHotelModalFull();
  renderHotel(document.getElementById('content'));
};

document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='hotel-customer'){
    const customers=getCustomers();
    const sel=customers.find(c=>c.name===e.target.value);
    if(sel){
      document.getElementById('hotel-name').value=sel.name||'';
      document.getElementById('hotel-dogName').value=sel.dogName||sel.dog_name||'';
    }
  }
  if(e.target && (e.target.id==='hotel-roomType')){
    const map={ 'S':30000, 'M':40000, 'L':50000, 'SUITE':80000 };
    document.getElementById('hotel-price').value=map[e.target.value]||30000;
    updateHotelTotal();
  }
  if(e.target && (e.target.id==='hotel-checkInDate' || e.target.id==='hotel-checkOutDate' || e.target.id==='hotel-price')){
    updateHotelTotal();
  }
});