
import {load,save,KEYS} from '../storage.js';
export function renderReservations(c){
  const list=load(KEYS.reservations);
  c.innerHTML=`<div class="header"><h2>📅 예약관리 (${list.length})</h2><div><label style="font-size:13px"><input type="checkbox" id="naverToggle"> 네이버 연동</label> <button class="btn btn-orange" style="margin-left:8px" onclick="window.openResModal()">+ 예약 추가</button></div></div>
  <div class="card"><table class="table"><thead><tr><th>날짜</th><th>시간</th><th>고객</th><th>서비스</th><th>담당</th><th>상태</th><th></th></tr></thead>
  <tbody>${list.map(r=>`<tr><td>${r.date}</td><td>${r.time||'10:00'}</td><td>${r.name}</td><td>${r.service}</td><td>${r.staff||'-'}</td><td><span class="badge badge-green">${r.status}</span></td><td><button class="btn btn-gray" style="padding:4px 8px;font-size:12px" onclick="window.deleteRes('${r.id||r.date}')">취소</button></td></tr>`).join('') || '<tr><td colspan=7>예약 없음</td></tr>'}</tbody></table></div>
  <div class="card" style="margin-top:16px"><h3>📅 달력 뷰</h3><div class="grid" style="grid-template-columns:repeat(7,1fr);gap:8px;margin-top:12px">${Array.from({length:30},(_,i)=>`<div style="border:1px solid #F3F4F6;padding:8px;border-radius:8px;text-align:center;font-size:12px">${i+1}<div style="font-size:10px;color:#FF7A00">${i%3==0?'●':''}</div></div>`).join('')}</div></div>`;
}
