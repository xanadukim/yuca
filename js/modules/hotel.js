// YUCA v9.8 - 호텔 + 호텔 요금제 자동계산 (체급×객실 1박요금 + 장기할인/성수기/옵션)
import { load, save, KEYS } from '../storage.js';
import { getPricebook, calcHotelPrice } from '../price-engine.js';

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
  const target = container || document.getElementById('main-content');
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
        <button onclick="setHotelFilter('stay')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${hotelFilter==='stay'?'#9C27B0':'#fff'};color:${hotelFilter==='stay'?'#fff':'#333'};cursor:pointer;font-size:13px">투숙중</button>
        <button onclick="setHotelFilter('today')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${hotelFilter==='today'?'#9C27B0':'#fff'};color:${hotelFilter==='today'?'#fff':'#333'};cursor:pointer;font-size:13px">오늘</button>
        <button onclick="setHotelFilter('all')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${hotelFilter==='all'?'#9C27B0':'#fff'};color:${hotelFilter==='all'?'#fff':'#333'};cursor:pointer;font-size:13px">전체</button>
        <button onclick="openHotelFormFull()" style="padding:8px 16px;border-radius:20px;background:#9C27B0;color:#fff;border:none;cursor:pointer;font-weight:700">+ 투숙 등록</button>
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
              <option value="S">S - 케이지</option>
              <option value="M">M - 룸</option>
              <option value="L">L - 대형룸</option>
              <option value="SUITE">SUITE - 프리미엄</option>
            </select>
          </label>
          <label style="font-size:13px">객실 번호 <input id="hotel-roomNo" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="101"></label>
          <label style="font-size:13px">1박 요금 <input id="hotel-price" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" value="30000"></label>
          <label style="font-size:13px">총 금액 <input id="hotel-totalPrice" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px;background:#f8f9fa" readonly></label>
          <!-- 호텔 요금제 자동계산 패널 -->
          <div id="hotel-price-panel" style="display:none;grid-column:1/-1;background:#F5F0FA;border:1px solid #D9C7F0;border-radius:10px;padding:12px">
            <div style="font-size:12px;font-weight:700;color:#6A1B9A;margin-bottom:8px">💰 호텔 요금제 자동계산</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">
              <label style="font-size:12px">체중(kg) <input id="ht-weight" type="number" min="0" step="0.5" placeholder="예: 8" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
              <label style="font-size:12px">체급 <select id="ht-tier" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></select></label>
              <div id="ht-discount-info" style="font-size:12px;color:#555;align-self:end;padding-bottom:8px"></div>
            </div>
            <div id="ht-addons" style="margin-top:8px"></div>
            <div id="ht-price-detail" style="margin-top:10px;font-size:12px;color:#444;line-height:1.7"></div>
          </div>
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
  initHotelPricePanel();
}

// ---------- 호텔 요금제 자동계산 ----------
function hv(id){return document.getElementById(id)?.value||''}
function initHotelPricePanel(){
  const pb=getPricebook(); const h=pb?.hotel;
  const panel=document.getElementById('hotel-price-panel');
  if(!panel||!h) return;
  const tierSel=document.getElementById('ht-tier');
  tierSel.innerHTML='<option value="">체급 선택</option>'+(h.tiers||[]).map(t=>`<option value="${t.label}">${t.label} (${t.minKg}~${t.maxKg??'∞'}kg)</option>`).join('');
  document.getElementById('ht-addons').innerHTML=(h.addons||[]).map(ad=>`<label style="display:inline-flex;align-items:center;gap:4px;margin:0 10px 6px 0;font-size:12px;cursor:pointer"><input type="checkbox" class="ht-addon" value="${ad.name}"> ${ad.name} +${ad.price.toLocaleString()}</label>`).join('');
  const refresh=()=>{
    const nights=calcNights(hv('hotel-checkInDate'),hv('hotel-checkOutDate'));
    const addonNames=[...document.querySelectorAll('.ht-addon:checked')].map(c=>c.value);
    const weight=hv('ht-weight');
    const r=calcHotelPrice(pb,{
      weightKg:weight===''?null:Number(weight),
      tierLabel:hv('ht-tier')||null,
      roomType:hv('hotel-roomType'),
      nights,
      checkInDate:hv('hotel-checkInDate'),
      addonNames
    });
    // 1박 요금/총액 자동 입력
    if(r.perNight!=null){
      document.getElementById('hotel-price').value=r.perNight;
      document.getElementById('hotel-totalPrice').value=r.total;
    }
    const dinfo=document.getElementById('ht-discount-info');
    if(dinfo){
      let s=`${nights}박`;
      if(r.discPct) s+=` · 장기할인 -${r.discPct}%`;
      if(r.peak) s+=` · 성수기 +${r.peakPct}%`;
      dinfo.textContent=s;
    }
    const d=document.getElementById('ht-price-detail');
    if(d){
      const lines=[];
      if(r.tierLabel) lines.push(`체급: ${r.tierLabel} / 객실: ${hv('hotel-roomType')}`);
      if(r.perNight!=null) lines.push(`1박 ${r.perNight.toLocaleString()}원 × ${nights}박 = ${r.base.toLocaleString()}원`);
      else lines.push(`<span style="color:#C62828">해당 객실×체급 요금이 가격표에 없습니다.</span>`);
      if(r.discount) lines.push(`장기 할인 -${r.discount.toLocaleString()}원 (${r.discPct}%)`);
      if(r.surcharge) lines.push(`성수기 할증 +${r.surcharge.toLocaleString()}원 (${r.peakPct}%)`);
      r.addonItems.forEach(x=>lines.push(`${x.name} +${x.price.toLocaleString()}`));
      lines.push(`<b>합계 ${r.total.toLocaleString()}원</b>`);
      d.innerHTML=lines.join('<br>');
    }
    return r;
  };
  window.__hotelRefreshPrice=refresh;
  ['ht-weight','ht-tier','hotel-checkInDate','hotel-checkOutDate','hotel-roomType'].forEach(id=>{
    document.getElementById(id)?.addEventListener('change',refresh);
    document.getElementById(id)?.addEventListener('input',refresh);
  });
  document.getElementById('ht-addons')?.addEventListener('change',refresh);
  refresh();
}
window.setHotelFilter = (mode)=>{ hotelFilter=mode; renderHotel(document.getElementById('main-content')); };
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
  // 가격 패널 초기화
  const hw=document.getElementById('ht-weight');if(hw)hw.value='';
  const ht=document.getElementById('ht-tier');if(ht)ht.value='';
  document.querySelectorAll('.ht-addon').forEach(c=>c.checked=false);
  const hd=document.getElementById('ht-price-detail');if(hd)hd.innerHTML='';
  window.__hotelRefreshPrice?.();
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
  // 가격 스냅샷 복원
  const hp=h.priceDetail||{};
  const hw=document.getElementById('ht-weight');if(hw)hw.value=hp.weightKg??'';
  const ht=document.getElementById('ht-tier');if(ht)ht.value=hp.tierLabel||'';
  document.querySelectorAll('.ht-addon').forEach(c=>{c.checked=(hp.addonNames||[]).includes(c.value)});
  window.__hotelRefreshPrice?.();
  document.getElementById('hotel-modal').style.display='flex';
};
window.deleteHotelFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getHotel(); list.splice(idx,1); saveHotel(list);
  renderHotel(document.getElementById('main-content'));
};
window.checkOutHotel = (idx)=>{
  if(!confirm('퇴실 처리 할까요?')) return;
  const list=getHotel();
  list[idx].status='퇴실';
  list[idx].checkOutDate = list[idx].checkOutDate || new Date().toISOString().slice(0,10);
  list[idx].updatedAt = new Date().toISOString();
  saveHotel(list);
  renderHotel(document.getElementById('main-content'));
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
  // 호텔 요금 스냅샷
  let priceDetail=null;
  const pb=getPricebook();
  if(pb?.hotel){
    const r=window.__hotelRefreshPrice?.()||calcHotelPrice(pb,{roomType:document.getElementById('hotel-roomType').value,nights:calcNights(inDate,outDate),checkInDate:inDate});
    priceDetail={
      weightKg:hv('ht-weight')===''?null:Number(hv('ht-weight')),
      tierLabel:hv('ht-tier')||null,
      roomType:document.getElementById('hotel-roomType').value,
      nights:calcNights(inDate,outDate),
      addonNames:[...document.querySelectorAll('.ht-addon:checked')].map(c=>c.value),
      calcTotal:r.total
    };
  }
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
    priceDetail,
    createdAt: editingHotelIdx!==null? list[editingHotelIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingHotelIdx!==null) list[editingHotelIdx]={...list[editingHotelIdx],...data};
  else list.push(data);
  saveHotel(list);
  closeHotelModalFull();
  renderHotel(document.getElementById('main-content'));
};

document.addEventListener('change', (e)=>{
  if(e.target && e.target.id==='hotel-customer'){
    const customers=getCustomers();
    const sel=customers.find(c=>c.name===e.target.value);
    if(sel){
      document.getElementById('hotel-name').value=sel.name||'';
      document.getElementById('hotel-dogName').value=sel.dogName||sel.dog_name||'';
      const hw=document.getElementById('ht-weight');
      const cw=sel.weight||sel.weightKg||sel.dogWeight;
      if(hw && cw && !hw.value) hw.value=cw;
      window.__hotelRefreshPrice?.();
    }
  }
  if(e.target && (e.target.id==='hotel-roomType')){
    window.__hotelRefreshPrice?.();
    updateHotelTotal();
  }
  if(e.target && (e.target.id==='hotel-checkInDate' || e.target.id==='hotel-checkOutDate' || e.target.id==='hotel-price')){
    updateHotelTotal();
  }
});