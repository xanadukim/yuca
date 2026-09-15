
import {load,save,KEYS} from '../storage.js';
export function renderProducts(c){
  const list=load(KEYS.products);
  const logs=load(KEYS.logs);
  c.innerHTML=`
  <div class="header"><h2>📦 제품관리 (${list.length})</h2><button class="btn btn-orange" onclick="window.addProduct()">+ 제품 추가</button></div>
  <div class="grid grid-3">${list.map(p=>`<div class="card" style="${p.stock<=3?'border-color:#FCA5A5;background:#FEF2F2':''}"><b>${p.name}</b> ${p.stock<=3?'<span class="badge" style="background:#FEE2E2;color:#991B1B">재고부족</span>':''}<div style="font-size:13px;margin-top:8px">재고: ${p.stock}개<br>가격: ₩${p.price.toLocaleString()}<br>분류: ${p.category||'-'}</div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-gray" style="flex:1;padding:6px" onclick="window.inProduct('${p.id}')">입고</button><button class="btn btn-gray" style="flex:1;padding:6px" onclick="window.outProduct('${p.id}')">출고</button></div></div>`).join('')}</div>
  <div class="card" style="margin-top:16px"><h3>입출고 로그 (${logs.length})</h3><table class="table" style="margin-top:12px"><thead><tr><th>시간</th><th>제품</th><th>구분</th><th>수량</th></tr></thead><tbody>${logs.slice(-10).reverse().map(l=>`<tr><td>${l.time}</td><td>${l.name}</td><td>${l.type}</td><td>${l.qty}</td></tr>`).join('') || '<tr><td colspan=4>로그 없음</td></tr>'}</tbody></table></div>`;
}
