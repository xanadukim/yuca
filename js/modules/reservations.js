import {load,save,KEYS} from '../storage.js';
export function renderReservations(container){
  const res = load(KEYS.reservations);
  container.innerHTML = `<div class="header"><h2>예약관리</h2><button class="btn btn-orange" onclick="window.openResModal()">+ 예약 추가</button></div>
  <div class="card"><table class="table"><thead><tr><th>날짜</th><th>고객</th><th>서비스</th><th>상태</th></tr></thead>
  <tbody>${res.map(r=>`<tr><td>${r.date}</td><td>${r.name}</td><td>${r.service}</td><td><span class="badge badge-green">${r.status}</span></td></tr>`).join('') || '<tr><td colspan=4>예약 없음</td></tr>'}</tbody></table></div>`;
}
