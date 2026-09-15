
import {load,save,KEYS, getDBStats} from '../storage.js';
import {rooms} from '../data.js';
export function renderHotel(c){
  const bookings=load(KEYS.hotel);
  c.innerHTML=`
  <div class="header"><h2>🏨 호텔 (7박 할인 10%)</h2><button class="btn btn-orange" onclick="window.addHotel()">+ 투숙 등록</button></div>
  <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:12px">
    ${rooms.map(r=>{
      const b=bookings.find(x=>x.room===r && x.status==='투숙중');
      return `<div class="card" style="${b?'background:#FFFBEB;border-color:#FBBF24':''}"><div style="font-weight:700">${r}</div><div style="font-size:12px;margin-top:4px">${b?`${b.dog} 투숙중<br>${b.checkin}~${b.checkout}`:'<span style=color:#9CA3AF>빈 객실</span>'}</div>${b?`<button class="btn btn-gray" style="margin-top:8px;width:100%;padding:6px;font-size:12px" onclick="window.checkoutHotel('${b.id}')">퇴실</button>`:''}</div>`;
    }).join('')}
  </div>
  <div class="card" style="margin-top:16px"><h3>투숙 기록</h3><table class="table" style="margin-top:12px"><thead><tr><th>객실</th><th>강아지</th><th>입실</th><th>퇴실</th><th>박수</th><th>금액</th><th>상태</th></tr></thead><tbody>${bookings.map(h=>`<tr><td>${h.room}</td><td>${h.dog}</td><td>${h.checkin}</td><td>${h.checkout}</td><td>${h.nights||1}박</td><td>₩${(h.amount||50000).toLocaleString()}</td><td><span class="badge ${h.status==='투숙중'?'badge-orange':'badge-green'}">${h.status}</span></td></tr>`).join('') || '<tr><td colspan=7>기록 없음</td></tr>'}</tbody></table></div>`;
}
