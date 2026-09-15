// customers.js
import {load,save,KEYS} from '../storage.js';
export function renderCustomers(container){
  const customers = load(KEYS.customers);
  container.innerHTML = `
    <div class="header"><h2>고객관리 (${customers.length})</h2><button class="btn btn-orange" onclick="window.openCustomerModal()">+ 고객 추가</button></div>
    <div class="card"><table class="table"><thead><tr><th>이름</th><th>강아지</th><th>견종</th><th>전화</th><th>방문</th></tr></thead>
    <tbody>${customers.map(c=>`<tr><td>${c.name}</td><td>${c.dog_name}</td><td>${c.breed}</td><td>${c.phone}</td><td>${c.total_visits||0}회</td></tr>`).join('')}</tbody></table></div>`;
}
export function addCustomer(data){
  const list = load(KEYS.customers);
  list.push({id:'C'+Date.now(), ...data, total_visits:0, last_visit:new Date().toISOString().slice(0,10)});
  save(KEYS.customers, list);
}
