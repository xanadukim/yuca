
import {load,save,KEYS} from '../storage.js';
export function renderEmployees(c){
  const list=load(KEYS.employees);
  c.innerHTML=`
  <div class="header"><h2>👷 직원관리 (${list.length})</h2><button class="btn btn-orange" onclick="window.addEmployee()">+ 직원 추가</button></div>
  <div class="grid grid-2">${list.map(e=>`<div class="card"><div style="display:flex;justify-content:space-between"><b>${e.name}</b><span class="badge badge-green">${e.role}</span></div><div style="font-size:13px;color:#6B7280;margin-top:4px">${e.phone}</div><div style="margin-top:12px;font-size:13px">급여: ₩${e.salary.toLocaleString()}<br>인센티브: 실적 차트</div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-gray" style="flex:1" onclick="window.checkIn('${e.id}')">출근</button><button class="btn btn-gray" style="flex:1" onclick="window.checkOut('${e.id}')">퇴근</button></div></div>`).join('')}</div>
  <div class="card" style="margin-top:16px"><h3>실적 차트 (이번 달)</h3><div style="display:flex;gap:16px;margin-top:12px">${list.map(e=>`<div style="flex:1"><div style="font-size:13px">${e.name}</div><div style="background:#F3F4F6;height:12px;border-radius:6px;margin-top:4px"><div style="width:${60+Math.random()*40}%;background:#FF7A00;height:12px;border-radius:6px"></div></div></div>`).join('')}</div></div>`;
}
