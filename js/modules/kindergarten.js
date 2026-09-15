
import {load,save,KEYS} from '../storage.js';
export function renderKindergarten(c){
  const list=load(KEYS.kindergarten);
  c.innerHTML=`
  <div class="header"><h2>🏫 유치원 (일 3만원)</h2><button class="btn btn-orange" onclick="window.addKinder()">+ 등원 추가</button></div>
  <div class="grid grid-3">${load(KEYS.customers).map(u=>`<div class="card"><b>${u.dog_name} (${u.breed})</b><div style="font-size:13px;color:#6B7280">${u.name} 보호자</div><div style="margin-top:8px"><button class="btn btn-orange" style="width:100%;padding:8px" onclick="window.checkKinder('${u.id}','${u.dog_name}')">등원 체크</button></div></div>`).join('')}</div>
  <div class="card" style="margin-top:16px"><h3>오늘 등원 (${list.length})</h3><table class="table" style="margin-top:12px"><thead><tr><th>시간</th><th>강아지</th><th>활동</th><th>식사</th><th>기분</th></tr></thead><tbody>${list.map(k=>`<tr><td>${k.time}</td><td>${k.dog}</td><td>${k.activity||'놀이'}</td><td>${k.meal||'잘먹음'}</td><td>${k.mood||'좋음'}</td></tr>`).join('') || '<tr><td colspan=5>등원 기록 없음</td></tr>'}</tbody></table></div>`;
}
