// v7.6 FINAL - 리렌더 버그 완전 해결! DOM 필터링
import { load, save, KEYS } from '../storage-local.js';

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
  if(list.length < 9) list = SAMPLE;
  list = list.map(p=>({...p, price: parseInt(p.price)||0, stock: parseInt(p.stock)||0}));
  localStorage.setItem('yuca_products', JSON.stringify(list));
  save(KEYS.products, list);

  const counts = {
    '전체': list.length,
    '사료': list.filter(p=>p.category==='사료').length,
    '간식': list.filter(p=>p.category==='간식').length,
    '용품': list.filter(p=>p.category==='용품').length,
    '미용용품': list.filter(p=>p.category==='미용용품').length,
  };

  container.innerHTML=`
  <div style="padding:16px" id="prodRoot">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <h2 style="margin:0">📦 제품관리
        <span id="countBadge" style="background:#ffedd5;color:#f97316;padding:4px 10px;border-radius:20px;font-size:14px">${list.length}개</span>
        <small id="stockInfo" style="color:#666">표시 90개 · 전체가치 ₩${list.reduce((s,p)=>s+p.price*p.stock,0).toLocaleString()}</small>
      </h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        ${Object.entries(counts).map(([c,n])=>`<button data-f="${c}" class="fBtn" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:#fff;color:#333;cursor:pointer;font-weight:bold">${c}${c!=='전체'?` (${n})`:''}</button>`).join('')}
        <button id="btnAdd" style="padding:8px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">+ 제품 등록</button>
      </div>
    </div>
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#fff7ed"><tr><th style="text-align:left;padding:12px">제품</th><th>카테고리</th><th>가격/재고</th><th>상태</th><th>관리</th></tr></thead>
        <tbody id="prodBody">
          ${list.map(p=>`<tr data-cat="${p.category}" style="border-top:1px solid #f3f4f6"><td style="padding:12px"><b>${p.name}</b><br><small style="color:#888">${p.brand}</small></td><td style="text-align:center"><span style="background:#ffedd5;padding:4px 8px;border-radius:12px;font-size:12px">${p.category}</span></td><td style="text-align:center">₩${p.price.toLocaleString()}<br><small>재고 ${p.stock}개</small></td><td style="text-align:center"><span style="background:${p.stock>5?'#dcfce7':'#fee2e2'};color:${p.stock>5?'#16a34a':'#dc2626'};padding:4px 10px;border-radius:12px;font-size:12px">${p.stock>5?'정상':'부족'}</span></td><td style="text-align:center"><button onclick="window.editProd('${p.id}')" style="border:none;background:#fff7ed;padding:6px 10px;border-radius:8px;cursor:pointer">✏️</button> <button onclick="window.delProd('${p.id}')" style="border:none;background:#fff1f1;padding:6px 10px;border-radius:8px;cursor:pointer">🗑️</button></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div id="filterInfo" style="margin-top:10px;font-size:12px;color:#888">현재 필터: <b style="color:#f97316" id="curFilter">전체</b> → <span id="curCount">${list.length}</span>개 표시</div>
  </div>
  <div id="prodModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:99999">
    <div style="background:#fff;padding:24px;border-radius:16px;width:90%;max-width:420px;display:grid;gap:12px">
      <h3 style="margin:0">제품 등록/수정</h3>
      <input id="p_name" placeholder="제품명" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <select id="p_category" style="padding:12px;border:1px solid #ddd;border-radius:8px"><option>사료</option><option>간식</option><option>용품</option><option>미용용품</option></select>
      <input id="p_brand" placeholder="브랜드" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_price" type="number" placeholder="판매가" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_stock" type="number" placeholder="재고수량" style="padding:12px;border:1px solid #ddd;border-radius:8px">
      <input id="p_id" type="hidden">
      <div style="display:flex;gap:8px"><button onclick="window.saveProd()" style="flex:1;padding:12px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold">저장</button><button onclick="window.closeProdModal()" style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer">취소</button></div>
    </div>
  </div>`;

  // 즉시 필터링 - 리렌더 없이 tr 숨기기!


  
  // 기존 applyFilter 함수를 이걸로 교체!
  function applyFilter(cat){
    console.log('🔥 필터 클릭됨:',cat);
    localStorage.setItem('yuca_prodFilter', cat);
    // 0.1초 뒤에 2번 실행 - 라우터 덮어쓰기 이기기!
    const doFilter = () => {
      const rows = document.querySelectorAll('#prodBody tr');
      let visible = 0;
      rows.forEach(r=>{
        const show = (cat==='전체' || r.dataset.cat===cat);
        r.style.display = show? '' : 'none';
        if(show) visible++;
      });
      const badge = document.getElementById('countBadge');
      const curF = document.getElementById('curFilter');
      const curC = document.getElementById('curCount');
      if(badge) badge.textContent = visible + '개';
      if(curF) curF.textContent = cat;
      if(curC) curC.textContent = visible;
      console.log('필터 적용:',cat,visible,'개');
    };
    doFilter();
    setTimeout(doFilter, 100);
    setTimeout(doFilter, 300);
  }

  // 버튼 이벤트 - document 레벨에서 잡기!
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.fBtn');
    if(btn){
      e.preventDefault();
      e.stopPropagation();
      applyFilter(btn.dataset.f);
    }
    if(e.target.closest('#btnAdd')){
      e.preventDefault();
      const modal = document.getElementById('prodModal');
      if(modal) modal.style.display='flex';
    }
  });
    container.querySelector('#stockInfo').textContent = `표시 ${totalStock}개 · 전체가치 ₩${list.reduce((s,p)=>s+p.price*p.stock,0).toLocaleString()}`;

    // 버튼 색상
    container.querySelectorAll('.fBtn').forEach(b=>{
      const isActive = b.dataset.f===cat;
      b.style.background = isActive? '#f97316' : '#fff';
      b.style.color = isActive? '#fff' : '#333';
    });
    localStorage.setItem('yuca_prodFilter', cat);
  }

  // 이벤트 바인딩
  container.querySelectorAll('.fBtn').forEach(b=>{
    b.addEventListener('click', ()=> applyFilter(b.dataset.f));
  });
  container.querySelector('#btnAdd')?.addEventListener('click', ()=> container.querySelector('#prodModal').style.display='flex');

  window.closeProdModal=()=>{ container.querySelector('#prodModal').style.display='none'; document.getElementById('p_id').value=''; };
  window.saveProd=()=>{
    const name = document.getElementById('p_name').value.trim();
    if(!name){ alert('제품명!'); return; }
    const id = document.getElementById('p_id').value || Date.now().toString();
    const item = { id, name, category: document.getElementById('p_category').value, brand: document.getElementById('p_brand').value, price: parseInt(document.getElementById('p_price').value)||0, stock: parseInt(document.getElementById('p_stock').value)||0 };
    let arr = JSON.parse(localStorage.getItem('yuca_products')||'[]');
    const idx = arr.findIndex(x=>x.id===id);
    if(idx>=0) arr[idx]=item; else arr.push(item);
    localStorage.setItem('yuca_products', JSON.stringify(arr));
    save(KEYS.products, arr);
    window.closeProdModal();
    renderProducts(container);
    setTimeout(()=>applyFilter(item.category), 100);
  };
  window.editProd=(id)=>{
    const p = list.find(x=>x.id===id);
    if(!p) return;
    document.getElementById('p_id').value=p.id;
    document.getElementById('p_name').value=p.name;
    document.getElementById('p_category').value=p.category;
    document.getElementById('p_brand').value=p.brand;
    document.getElementById('p_price').value=p.price;
    document.getElementById('p_stock').value=p.stock;
    container.querySelector('#prodModal').style.display='flex';
  };
  window.delProd=(id)=>{
    if(!confirm('삭제?')) return;
    let arr = JSON.parse(localStorage.getItem('yuca_products')||'[]').filter(x=>x.id!==id);
    localStorage.setItem('yuca_products', JSON.stringify(arr));
    save(KEYS.products, arr);
    renderProducts(container);
  };
  window.setProdFilter=(c)=>applyFilter(c);
  window.openProdModal=()=> container.querySelector('#prodModal').style.display='flex';

  // 초기 필터 적용
  const saved = localStorage.getItem('yuca_prodFilter') || '전체';
  applyFilter(saved);
}