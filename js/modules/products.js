// v7.4 FINAL - 필터 시각적 버그 완전 해결
import { load, save, KEYS } from '../storage-local.js';
let prodFilter = '전체';

const SAMPLE = [
  {id:'1', name:'보습 샴푸 500ml', category:'미용용품', brand:'YUCA', price:25000, stock:12},
  {id:'2', name:'가위 세트', category:'미용용품', brand:'YUCA', price:89000, stock:3},
  {id:'3', name:'발톱깎이', category:'용품', brand:'네일케어', price:15000, stock:15},
  {id:'4', name:'에센스 오일', category:'미용용품', brand:'스파', price:32000, stock:2},
  {id:'5', name:'타월 5장 세트', category:'용품', brand:'소모품', price:18000, stock:30},
  {id:'6', name:'간식 세트', category:'간식', brand:'덴탈껌', price:12000, stock:8},
  {id:'7', name:'향수 100ml', category:'미용용품', brand:'스파', price:28000, stock:6},
  {id:'8', name:'슬리커 빗', category:'용품', brand:'도구', price:9000, stock:4},
  {id:'9', name:'프리미엄 사료 5kg', category:'사료', brand:'로얄캐닌', price:45000, stock:10},
];

export function renderProducts(container){
  let list = JSON.parse(localStorage.getItem('yuca_products')||'null') || load(KEYS.products, []) || [];
  if(list.length < 8) list = SAMPLE;
  list = list.map(p=>({...p, price: parseInt(p.price)||0, stock: parseInt(p.stock)||0}));
  localStorage.setItem('yuca_products', JSON.stringify(list));
  save(KEYS.products, list);

  const filtered = (prodFilter==='전체')? list : list.filter(p=>p.category===prodFilter);
  const totalStock = filtered.reduce((s,p)=>s+p.stock,0);
  const totalValue = list.reduce((s,p)=>s+p.price*p.stock,0);

  container.innerHTML=`
  <div style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <h2 style="margin:0">📦 제품관리
        <span style="background:#ffedd5;color:#f97316;padding:4px 10px;border-radius:20px;font-size:14px">${filtered.length}개</span>
        <small style="color:#666">표시 ${totalStock}개 · 전체가치 ₩${totalValue.toLocaleString()}</small>
      </h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap" id="filterBar">
        ${['전체','사료','간식','용품','미용용품'].map(c=>`<button data-filter="${c}" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${prodFilter===c?'#f97316':'#fff'};color:${prodFilter===c?'#fff':'#333'};cursor:pointer;font-weight:${prodFilter===c?'bold':'normal'}">${c} ${c!=='전체'?`(${list.filter(p=>p.category===c).length})`:''}</button>`).join('')}
        <button id="btnAddProd" style="padding:8px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">+ 제품 등록</button>
      </div>
    </div>
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #f3f4f6">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#fff7ed"><tr><th style="text-align:left;padding:12px">제품</th><th>카테고리</th><th>가격/재고</th><th>상태</th><th>관리</th></tr></thead>
        <tbody>
          ${filtered.map(p=>`<tr style="border-top:1px solid #f3f4f6"><td style="padding:12px"><b>${p.name}</b><br><small style="color:#888">${p.brand}</small></td><td style="text-align:center"><span style="background:#ffedd5;padding:4px 8px;border-radius:12px;font-size:12px">${p.category}</span></td><td style="text-align:center">₩${p.price.toLocaleString()}<br><small>재고 ${p.stock}개</small></td><td style="text-align:center"><span style="background:${p.stock>5?'#dcfce7':'#fee2e2'};color:${p.stock>5?'#16a34a':'#dc2626'};padding:4px 10px;border-radius:12px;font-size:12px">${p.stock>5?'정상':'부족'}</span></td><td style="text-align:center"><button class="editBtn" data-id="${p.id}" style="border:none;background:#fff7ed;padding:6px 10px;border-radius:8px;cursor:pointer">✏️</button> <button class="delBtn" data-id="${p.id}" style="border:none;background:#fff1f1;padding:6px 10px;border-radius:8px;cursor:pointer">🗑️</button></td></tr>`).join('') || `<tr><td colspan=5 style="text-align:center;padding:60px;color:#888;font-size:14px">📭 ${prodFilter} 카테고리에 제품이 없습니다<br><small>다른 필터를 선택하거나 제품을 등록해보세요</small></td></tr>`}
        </tbody>
      </table>
    </div>
    <div style="margin-top:12px;color:#888;font-size:12px">현재 필터: <b style="color:#f97316">${prodFilter}</b> → ${filtered.length}개 표시 / 전체 ${list.length}개</div>
  </div>
  <div id="prodModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999">
    <div style="background:#fff;padding:24px;border-radius:16px;width:90%;max-width:420px;display:grid;gap:12px">
      <h3 style="margin:0">제품 등록/수정</h3>
      <input id="p_name" placeholder="제품명" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <select id="p_category" style="padding:12px;border:1px solid #ddd;border-radius:8px"><option>사료</option><option>간식</option><option>용품</option><option>미용용품</option></select>
      <input id="p_brand" placeholder="브랜드" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_price" type="number" placeholder="판매가" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_stock" type="number" placeholder="재고수량" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_id" type="hidden">
      <div style="display:flex;gap:8px"><button id="btnSaveProd" style="flex:1;padding:12px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold">저장</button><button id="btnCloseModal" style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer">취소</button></div>
    </div>
  </div>`;

  // 이벤트 리스너로 필터 (onclick 버그 방지)
  container.querySelectorAll('[data-filter]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      prodFilter = e.target.dataset.filter;
      renderProducts(container);
    });
  });
  container.querySelector('#btnAddProd')?.addEventListener('click', ()=>{ container.querySelector('#prodModal').style.display='flex'; });
  container.querySelector('#btnCloseModal')?.addEventListener('click', ()=>{ container.querySelector('#prodModal').style.display='none'; container.querySelector('#p_id').value=''; });
  container.querySelector('#btnSaveProd')?.addEventListener('click', ()=>{
    const name = container.querySelector('#p_name').value.trim();
    if(!name){ alert('제품명 입력!'); return; }
    const id = container.querySelector('#p_id').value || Date.now().toString();
    const item = { id, name, category: container.querySelector('#p_category').value, brand: container.querySelector('#p_brand').value, price: parseInt(container.querySelector('#p_price').value)||0, stock: parseInt(container.querySelector('#p_stock').value)||0 };
    let arr = JSON.parse(localStorage.getItem('yuca_products')||'[]');
    const idx = arr.findIndex(x=>x.id===id);
    if(idx>=0) arr[idx]=item; else arr.push(item);
    localStorage.setItem('yuca_products', JSON.stringify(arr));
    save(KEYS.products, arr);
    container.querySelector('#prodModal').style.display='none';
    prodFilter='전체';
    renderProducts(container);
  });
  container.querySelectorAll('.editBtn').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id;
    const p = list.find(x=>x.id===id);
    if(!p) return;
    container.querySelector('#p_id').value=p.id;
    container.querySelector('#p_name').value=p.name;
    container.querySelector('#p_category').value=p.category;
    container.querySelector('#p_brand').value=p.brand;
    container.querySelector('#p_price').value=p.price;
    container.querySelector('#p_stock').value=p.stock;
    container.querySelector('#prodModal').style.display='flex';
  }));
  container.querySelectorAll('.delBtn').forEach(b=>b.addEventListener('click', e=>{
    if(!confirm('삭제?')) return;
    let arr = JSON.parse(localStorage.getItem('yuca_products')||'[]');
    arr = arr.filter(x=>x.id!==e.currentTarget.dataset.id);
    localStorage.setItem('yuca_products', JSON.stringify(arr));
    save(KEYS.products, arr);
    renderProducts(container);
  }));
}