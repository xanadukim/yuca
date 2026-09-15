
import {load,save,KEYS} from '../storage.js';
export function renderCustomers(c){
  const list=load(KEYS.customers);
  c.innerHTML=`
  <div class="header"><h2>👥 고객관리 (${list.length})</h2><button class="btn btn-orange" onclick="window.openCustomerModal()">+ 고객 추가</button></div>
  <div class="card"><table class="table"><thead><tr><th>보호자</th><th>강아지</th><th>견종</th><th>전화</th><th>방문</th><th>메모</th><th></th></tr></thead>
  <tbody>${list.map(u=>`<tr><td><b>${u.name}</b></td><td>${u.dog_name}</td><td>${u.breed}</td><td>${u.phone}</td><td>${u.total_visits||0}회</td><td style="font-size:12px;color:#6B7280">${u.note||''}</td><td><button class="btn btn-gray" style="padding:4px 8px;font-size:12px" onclick="window.editCustomer('${u.id}')">수정</button> <button class="btn btn-gray" style="padding:4px 8px;font-size:12px" onclick="window.deleteCustomer('${u.id}')">삭제</button></td></tr>`).join('')}</tbody></table></div>`;
}
