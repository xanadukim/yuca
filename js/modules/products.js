// v7.2 FIX - NaN + 모달 겹침 해결
import { load, save, KEYS } from '../storage-local.js';
let prodFilter='all';
export function renderProducts(container){
  let list = load(KEYS.products, []);
  // 기존 데이터 마이그레이션: price, stock 숫자화
  list = list.map(p=>({
   ...p,
    price: parseInt(String(p.price).replace(/[^0-9]/g,''))||0,
    stock: parseInt(p.stock)||0
  }));
  save(KEYS.products, list);

  const cats={all:'전체',food:'사료',snack:'간식',supply:'용품',beauty:'미용용품'};
  const totalStock=list.reduce((s,p)=>s+(p.stock||0),0);
  const totalValue=list.reduce((s,p)=>s+(p.price||0)*(p.stock||0),0);

  container.innerHTML=`
  <style>
   .prod-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;align-items:center;justify-content:center;z-index:9999}
   .prod-modal.box{background:white;padding:24px;border-radius:16px;width:90%;max-width:480px;display:grid;gap:10px}
   .prod-modal input{padding:10px;border:1px solid #ddd;border-radius:8px;width:100%}
  </style>
  <div class="page-header"><h2>📦 제품관리 <span class="badge">${list.length}개</span> <small>재고 ${totalStock}개 · 재고가치 ₩${totalValue.toLocaleString()}</small></h2>
    <div class="filter-group">${Object.entries(cats).map(([k,v])=>`<button class="btn ${prodFilter===k?'btn-primary':''}" onclick="setProdFilter('${k}')">${v}</button>`).join('')} <button class="btn btn-orange" onclick="openProdModal()">+ 제품 등록</button></div>
  </div>
  <div class="card"><table class="table"><thead><tr><th>제품</th><th>카테고리</th><th>가격/재고</th><th>상태</th><th>관리</th></tr></thead>
  <tbody>${getFiltered(list).map(p=>`
    <tr><td><b>${p.name}</b><br><small>${p.brand||''}</small></td><td><span class="badge">${p.category}</span></td><td>₩${(p.price||0).toLocaleString()}<br><small>재고 ${p.stock}개</small></td><td><span class="badge ${p.stock>5?'badge-green':'badge-red'}">${p.stock>5?'정상':'재고부족'}</span></td><td><button class="btn btn-sm" onclick="editProd('${p.id}')">✏️</button><button class="btn btn-sm" onclick="delProd('${p.id}')">🗑️</button></td></tr>`).join('') || '<tr><td colspan=5 style="text-align:center;padding:40px">제품이 없습니다</td></tr>'}</tbody></table></div>
  <div id="prodModal" class="prod-modal"><div class="box"><h3>제품 등록/수정</h3>
    <input id="p_name" placeholder="제품명"><input id="p_category" placeholder="카테고리" value="사료"><input id="p_brand" placeholder="브랜드"><input id="p_price" type="number" placeholder="판매가"><input id="p_stock" type="number" placeholder="재고"><input id="p_id" type="hidden">
    <div style="display:flex;gap:8px"><button class="btn btn-orange" onclick="saveProd()" style="flex:1">저장</button><button class="btn" onclick="closeProdModal()" style="flex:1">취소</button></div></div></div>`;

  window.setProdFilter=(f)=>{prodFilter=f;renderProducts(container);};
  window.openProdModal=()=>document.getElementById('prodModal').style.display='flex';
  window.closeProdModal=()=>{document.getElementById('prodModal').style.display='none';document.getElementById('p_id').value='';};
  window.saveProd=()=>{
    const id=document.getElementById('p_id').value||Date.now().toString();
    const item={id,name:document.getElementById('p_name').value,category:document.getElementById('p_category').value,brand:document.getElementById('p_brand').value,price:parseInt(document.getElementById('p_price').value)||0,stock:parseInt(document.getElementById('p_stock').value)||0,createdAt:new Date().toISOString()};
    if(!item.name) return alert('제품명 입력!');
    let arr=load(KEYS.products,[]); const idx=arr.findIndex(x=>x.id===id); if(idx>=0) arr[idx]=item; else arr.push(item); save(KEYS.products,arr); closeProdModal(); renderProducts(container);
  };
  window.editProd=(id)=>{const p=load(KEYS.products,[]).find(x=>x.id===id);if(!p) return; document.getElementById('p_id').value=p.id; document.getElementById('p_name').value=p.name; document.getElementById('p_category').value=p.category; document.getElementById('p_brand').value=p.brand; document.getElementById('p_price').value=p.price; document.getElementById('p_stock').value=p.stock; openProdModal();};
  window.delProd=(id)=>{if(!confirm('삭제?'))return; save(KEYS.products, load(KEYS.products,[]).filter(x=>x.id!==id)); renderProducts(container);};
  function getFiltered(a){if(prodFilter==='all')return a; if(prodFilter==='food')return a.filter(p=>p.category.includes('사료')); if(prodFilter==='snack')return a.filter(p=>p.category.includes('간식')); if(prodFilter==='supply')return a.filter(p=>p.category.includes('용품')&&!p.category.includes('미용')); if(prodFilter==='beauty')return a.filter(p=>p.category.includes('미용')||p.category.includes('샴푸')||p.category.includes('도구')||p.category.includes('스파')); return a;}
}