// v7.2 FINAL - 가격/필터 완전복구
import { load, save, KEYS } from '../storage-local.js';
let prodFilter='all';

const SAMPLE = [
  {id:'1', name:'보습 샴푸 500ml', category:'미용용품', brand:'YUCA', price:25000, stock:12},
  {id:'2', name:'가위 세트', category:'미용용품', brand:'YUCA', price:89000, stock:3},
  {id:'3', name:'발톱깎이', category:'용품', brand:'네일케어', price:15000, stock:15},
  {id:'4', name:'에센스 오일', category:'미용용품', brand:'스파', price:32000, stock:2},
  {id:'5', name:'타월 5장 세트', category:'용품', brand:'소모품', price:18000, stock:30},
  {id:'6', name:'간식 세트', category:'간식', brand:'덴탈껌', price:12000, stock:8},
  {id:'7', name:'향수 100ml', category:'미용용품', brand:'스파', price:28000, stock:6},
  {id:'8', name:'슬리커 빗', category:'용품', brand:'도구', price:9000, stock:4},
];

export function renderProducts(container){
  let list = load(KEYS.products, []);
  if(!list || list.length===0 || list.every(p=>!p.price || p.price==0)){
    list = SAMPLE; save(KEYS.products, list);
  }
  // 숫자화
  list = list.map(p=>({...p, price: parseInt(p.price)||0, stock: parseInt(p.stock)||0}));
  save(KEYS.products, list);

  const totalStock = list.reduce((s,p)=>s+p.stock,0);
  const totalValue = list.reduce((s,p)=>s+p.price*p.stock,0);

  container.innerHTML=`
  <div style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <h2 style="margin:0">📦 제품관리 <span style="background:#ffedd5;color:#f97316;padding:4px 10px;border-radius:20px;font-size:14px">${list.length}개</span> <small style="color:#666">재고 ${totalStock}개 · 가치 ₩${totalValue.toLocaleString()}</small></h2>
      <div style="display:flex;gap:6px">
        ${['all','사료','간식','용품','미용용품'].map(c=>`<button onclick="window.setProdFilter('${c}')" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${(prodFilter===c||prodFilter==='all'&&c==='all')?'#f97316':'#fff'};color:${(prodFilter===c||prodFilter==='all'&&c==='all')?'#fff':'#333'};cursor:pointer">${c==='all'?'전체':c}</button>`).join('')}
        <button onclick="window.openProdModal()" style="padding:8px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">+ 제품 등록</button>
      </div>
    </div>
    <div style="background:#fff;border-radius:12px;overflow:hidden">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#fff7ed"><tr><th style="text-align:left;padding:12px">제품</th><th>카테고리</th><th>가격/재고</th><th>상태</th><th>관리</th></tr></thead>
        <tbody>${getFiltered(list).map(p=>`<tr style="border-top:1px solid #f3f4f6"><td style="padding:12px"><b>${p.name}</b><br><small style="color:#888">${p.brand}</small></td><td style="text-align:center"><span style="background:#ffedd5;padding:4px 8px;border-radius:12px;font-size:12px">${p.category}</span></td><td style="text-align:center">₩${p.price.toLocaleString()}<br><small>재고 ${p.stock}개</small></td><td style="text-align:center"><span style="background:${p.stock>5?'#dcfce7':'#fee2e2'};color:${p.stock>5?'#16a34a':'#dc2626'};padding:4px 10px;border-radius:12px;font-size:12px">${p.stock>5?'정상':'부족'}</span></td><td style="text-align:center"><button onclick="window.editProd('${p.id}')" style="cursor:pointer;border:none;background:#fff7ed;padding:6px 10px;border-radius:8px">✏️</button> <button onclick="window.delProd('${p.id}')" style="cursor:pointer;border:none;background:#fff1f1;padding:6px 10px;border-radius:8px">🗑️</button></td></tr>`).join('')}</tbody>
      </table>
    </div>
  </div>
  <div id="prodModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:9999">
    <div style="background:#fff;padding:24px;border-radius:16px;width:90%;max-width:420px;display:grid;gap:12px">
      <h3 style="margin:0">제품 등록/수정</h3>
      <input id="p_name" placeholder="제품명" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <select id="p_category" style="padding:12px;border:1px solid #ddd;border-radius:8px"><option>사료</option><option>간식</option><option>용품</option><option>미용용품</option></select>
      <input id="p_brand" placeholder="브랜드" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_price" type="number" placeholder="판매가 (예: 25000)" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_stock" type="number" placeholder="재고수량" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_id" type="hidden">
      <div style="display:flex;gap:8px"><button onclick="window.saveProd()" style="flex:1;padding:12px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold">저장</button><button onclick="window.closeProdModal()" style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer">취소</button></div>
    </div>
  </div>`;

  window.setProdFilter=(c)=>{
    prodFilter=c;
    renderProducts(container);
    console.log('필터:',c);
  };
  window.openProdModal=()=>{document.getElementById('prodModal').style.display='flex';};
  window.closeProdModal=()=>{document.getElementById('prodModal').style.display='none';document.getElementById('p_id').value='';};
  // js/modules/products.js - FINAL PATCH
//... 앞부분 SAMPLE은 그대로...

window.saveProd=()=>{
  try{
    const id=document.getElementById('p_id').value||Date.now().toString();
    const name=document.getElementById('p_name').value.trim();
    if(!name){alert('제품명 입력!'); return;}
    const item={
      id,
      name,
      category:document.getElementById('p_category').value,
      brand:document.getElementById('p_brand').value,
      price:parseInt(document.getElementById('p_price').value)||0,
      stock:parseInt(document.getElementById('p_stock').value)||0
    };
    let arr = JSON.parse(localStorage.getItem('yuca_products')||'[]');
    const idx = arr.findIndex(x=>x.id===id);
    if(idx>=0) arr[idx]=item; else arr.push(item);
    localStorage.setItem('yuca_products', JSON.stringify(arr));
    // 추가: KEYS.products도 같이 저장
    try{ localStorage.setItem('products', JSON.stringify(arr)); }catch(e){}
    document.getElementById('prodModal').style.display='none';
    document.getElementById('p_id').value='';
    renderProducts(container);
    console.log('저장 성공:',item);
  }catch(e){ alert('저장 오류:'+e.message); console.error(e); }
};
  window.editProd=(id)=>{const p=load(KEYS.products,[]).find(x=>x.id===id); if(!p)return; document.getElementById('p_id').value=p.id; document.getElementById('p_name').value=p.name; document.getElementById('p_category').value=p.category; document.getElementById('p_brand').value=p.brand; document.getElementById('p_price').value=p.price; document.getElementById('p_stock').value=p.stock; window.openProdModal();};
  window.delProd=(id)=>{if(!confirm('삭제?'))return; save(KEYS.products, load(KEYS.products,[]).filter(x=>x.id!==id)); renderProducts(container);};

  function getFiltered(a){
    if(prodFilter==='all'||prodFilter==='전체') return a;
    return a.filter(p=>p.category.includes(prodFilter));
  }
}