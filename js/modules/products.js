// YUCA v9.4 - 제품관리: 소모품 3단 분류 + 입고일/유통기한
import { load, save, KEYS } from '../storage.js';

// 대분류 -> 중분류 트리 (소분류는 자유 입력)
const CATS = {
  '미용 및 목욕 용품': ['목욕/스파제','피모 관리제','건조 및 흡수'],
  '미용 도구 및 소모품': ['클리퍼/가위 소모품','고정/안전 용품'],
  '위생 및 케어 용품': ['귀/눈/발 케어','면봉/거즈류','배변 처리'],
  '매장 청소 및 방역': ['살균/소독제','청소 소모품','세탁 세제'],
  '보호자 및 사무 용품': ['고객 응대','사무/기록'],
  '안전 및 급급 용품': ['응급 처치','미용사 보호'],
};
const CAT1_LIST = Object.keys(CATS);

const MIGRATION_FLAG = 'yuca_products_v2';
function d(offsetDays){ return new Date(Date.now()+offsetDays*864e5).toISOString().slice(0,10); }
function seedProducts(){
  return [
    {id:'p1',name:'고보습 샴푸 500ml',cat1:'미용 및 목욕 용품',cat2:'목욕/스파제',sub:'일반 샴푸',brand:'YUCA',spec:'500ml',inDate:d(-20),expiry:d(160),price:25000,stock:12,minStock:3,notes:''},
    {id:'p2',name:'약용 지성 샴푸',cat1:'미용 및 목욕 용품',cat2:'목욕/스파제',sub:'약용 샴푸',brand:'더모',spec:'300ml',inDate:d(-45),expiry:d(120),price:32000,stock:4,minStock:2,notes:'민감성용'},
    {id:'p3',name:'피모 린스 미스트',cat1:'미용 및 목욕 용품',cat2:'피모 관리제',sub:'미스트',brand:'스파',spec:'200ml',inDate:d(-10),expiry:d(200),price:18000,stock:8,minStock:3,notes:''},
    {id:'p4',name:'엉킴 방지제',cat1:'미용 및 목욕 용품',cat2:'피모 관리제',sub:'디탱글러',brand:'스파',spec:'250ml',inDate:d(-5),expiry:d(240),price:22000,stock:6,minStock:2,notes:''},
    {id:'p5',name:'대형 타월',cat1:'미용 및 목욕 용품',cat2:'건조 및 흡수',sub:'대형 타월',brand:'YUCA',spec:'60x90cm',inDate:d(-60),expiry:'',price:12000,stock:30,minStock:10,notes:''},
    {id:'p6',name:'클리퍼 날 (정날)',cat1:'미용 도구 및 소모품',cat2:'클리퍼/가위 소모품',sub:'클리퍼 날',brand:'YUCA',spec:'#40',inDate:d(-15),expiry:'',price:45000,stock:6,minStock:2,notes:''},
    {id:'p7',name:'가위 오일',cat1:'미용 도구 및 소모품',cat2:'클리퍼/가위 소모품',sub:'가위 오일',brand:'도구',spec:'100ml',inDate:d(-30),expiry:d(365),price:9000,stock:10,minStock:3,notes:''},
    {id:'p8',name:'왕면봉 대용량',cat1:'위생 및 케어 용품',cat2:'면봉/거즈류',sub:'대용량 면봉',brand:'YUCA',spec:'500입',inDate:d(-8),expiry:'',price:15000,stock:15,minStock:5,notes:''},
    {id:'p9',name:'배변 패드 대형',cat1:'위생 및 케어 용품',cat2:'배변 처리',sub:'배변 패드',brand:'펫케어',spec:'대형 10매',inDate:d(-12),expiry:'',price:14000,stock:9,minStock:4,notes:''},
    {id:'p10',name:'니트릴 장갑',cat1:'안전 및 급급 용품',cat2:'미용사 보호',sub:'니트릴 장갑',brand:'YUCA',spec:'M 사이즈',inDate:d(-3),expiry:'',price:8000,stock:20,minStock:5,notes:'염색/약용 목욕용'},
  ];
}

function expiryBadge(p){
  if(!p.expiry) return '';
  const days = Math.ceil((new Date(p.expiry)-Date.now())/864e5);
  if(days<0) return '<span class="pb pb-red">기한지남</span>';
  if(days<=30) return `<span class="pb pb-orange">D-${days}</span>`;
  if(days<=90) return `<span class="pb pb-yellow">D-${days}</span>`;
  return `<span class="pb pb-gray">D-${days}</span>`;
}

export function renderProducts(container){
  const target = container || document.getElementById('main-content');
  if(!target) return;

  // v2 마이그레이션: 구버전 제품 데이터 1회 삭제 후 시드
  let list;
  if(!localStorage.getItem(MIGRATION_FLAG)){
    list = seedProducts();
    save(KEYS.products, list);
    localStorage.setItem(MIGRATION_FLAG,'1');
    localStorage.removeItem('yuca_prodFilter');
    localStorage.removeItem('yuca_prodFilter2');
  }else{
    list = load(KEYS.products, []) || [];
    if(list.length===0) list = seedProducts();
  }
  list = list.map(p=>({...p, price: parseInt(p.price)||0, stock: parseInt(p.stock)||0}));

  const cat1Filter = localStorage.getItem('yuca_prodFilter') || '전체';
  const cat2Filter = localStorage.getItem('yuca_prodFilter2') || '전체';
  const cat2Options = cat2Filter!=='전체' ? (CATS[cat2Filter]||[]) : [];

  // 소분류 자동완성 목록
  const subList = [...new Set(list.map(p=>p.sub).filter(Boolean))];

  target.innerHTML = `
  <div style="padding:16px">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
      <h2 style="margin:0">📦 제품관리 <span style="background:#ffedd5;color:#f97316;padding:4px 10px;border-radius:20px;font-size:14px">${list.length}개</span></h2>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        ${['전체',...CAT1_LIST].map(c=>`<button onclick="window.setProdFilter('${c}')" class="fBtn" data-f="${c}" style="padding:8px 14px;border-radius:20px;border:1px solid #ddd;background:${cat1Filter===c?'#f97316':'#fff'};color:${cat1Filter===c?'#fff':'#333'};cursor:pointer">${c==='전체'?'전체':c.replace(' 용품','').replace(' 및 ','·')}${c!=='전체'?` (${list.filter(p=>p.cat1===c).length})`:''}</button>`).join('')}
        <select onchange="window.setProdFilter2(this.value)" style="padding:8px 10px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:12px">
          <option value="전체">중분류: 전체</option>
          ${cat2Options.map(m=>`<option value="${m}" ${cat2Filter===m?'selected':''}>${m}</option>`).join('')}
        </select>
        <button onclick="window.openProdModal()" style="padding:8px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">+ 제품 등록</button>
      </div>
    </div>
    <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <table style="width:100%;border-collapse:collapse"><thead style="background:#fff7ed"><tr><th style="text-align:left;padding:12px">제품</th><th>분류</th><th>단가/재고</th><th>입고/유통기한</th><th>상태</th><th>관리</th></tr></thead>
      <tbody id="prodBody">${list.map(p=>{
        const show = (cat1Filter==='전체'||p.cat1===cat1Filter) && (cat2Filter==='전체'||p.cat2===cat2Filter);
        return `<tr data-cat1="${p.cat1}" data-cat2="${p.cat2}" style="display:${show?'':'none'}"><td style="padding:12px"><b>${p.name}</b>${p.sub?` <span class="pb pb-gray" style="font-size:11px">${p.sub}</span>`:''}<br><small>${p.brand||''}${p.spec?` · ${p.spec}`:''}</small></td><td style="text-align:center"><span class="pb pb-blue" style="font-size:11px">${p.cat2||'-'}</span><br><small style="color:#999">${p.cat1||''}</small></td><td style="text-align:center">₩${p.price.toLocaleString()}<br><small>재고 ${p.stock}개${p.minStock?` / 최소 ${p.minStock}`:''}</small></td><td style="text-align:center;font-size:12px">${p.inDate||'-'}<br>${expiryBadge(p)}</td><td style="text-align:center"><span class="pb ${p.stock>(p.minStock||5)?'pb-green':'pb-red'}" style="font-size:11px">${p.stock>(p.minStock||5)?'정상':'부족'}</span></td><td style="text-align:center"><button onclick="window.editProd('${p.id}')" class="yu-e" style="border:none;background:none;padding:6px 8px;cursor:pointer">✏️</button> <button onclick="window.delProd('${p.id}')" class="yu-d" style="border:none;background:none;padding:6px 8px;cursor:pointer">🗑️</button></td></tr>`;
      }).join('')}</tbody></table>
    </div>
    <div style="margin-top:10px;font-size:12px;color:#888">필터: <b id="curFilter">${cat1Filter}${cat2Filter!=='전체'?' > '+cat2Filter:''}</b> → <span id="curCount">${list.filter(p=>(cat1Filter==='전체'||p.cat1===cat1Filter)&&(cat2Filter==='전체'||p.cat2===cat2Filter)).length}</span>개</div>
  </div>
  <div id="prodModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:none;align-items:center;justify-content:center;z-index:99999"><div style="background:#fff;padding:24px;border-radius:16px;width:90%;max-width:460px;display:grid;gap:10px;max-height:90vh;overflow-y:auto"><h3 style="margin:0">제품 등록</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label style="font-size:12px">대분류 *<select id="p_cat1" onchange="window.onCat1Change()" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></select></label>
      <label style="font-size:12px">중분류 *<select id="p_cat2" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></select></label>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label style="font-size:12px">소분류<input id="p_sub" list="p_sublist" placeholder="예: 일반 샴푸" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"><datalist id="p_sublist">${subList.map(s=>`<option value="${s}">`).join('')}</datalist></label>
      <label style="font-size:12px">규격/용량<input id="p_spec" placeholder="예: 500ml, #40" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></label>
    </div>
    <input id="p_name" placeholder="제품명 *" style="padding:12px;border:1px solid #ddd;border-radius:8px">
    <input id="p_brand" placeholder="브랜드" style="padding:12px;border:1px solid #ddd;border-radius:8px">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <label style="font-size:12px">입고일<input id="p_inDate" type="date" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></label>
      <label style="font-size:12px">유통기한<input id="p_expiry" type="date" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></label>
      <label style="font-size:12px">단가(원)<input id="p_price" type="number" placeholder="0" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></label>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label style="font-size:12px">재고 *<input id="p_stock" type="number" placeholder="0" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></label>
      <label style="font-size:12px">최소재고<input id="p_minStock" type="number" placeholder="알림 기준" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;margin-top:3px"></label>
    </div>
    <input id="p_notes" placeholder="메모" style="padding:12px;border:1px solid #ddd;border-radius:8px">
    <input id="p_id" type="hidden">
    <div style="display:flex;gap:8px"><button onclick="window.saveProd()" style="flex:1;padding:12px;background:#f97316;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold">저장</button><button onclick="window.closeProdModal()" style="flex:1;padding:12px;background:#f3f4f6;border:none;border-radius:8px;cursor:pointer">취소</button></div>
  </div></div>`;

  // 대분류 셀렉트 채우기
  const cat1Sel = document.getElementById('p_cat1');
  cat1Sel.innerHTML = CAT1_LIST.map(c=>`<option value="${c}">${c}</option>`).join('');
  window.onCat1Change = function(){
    const c1 = document.getElementById('p_cat1').value;
    document.getElementById('p_cat2').innerHTML = (CATS[c1]||[]).map(m=>`<option value="${m}">${m}</option>`).join('');
  };
  window.onCat1Change();

  window.setProdFilter = function(cat){
    localStorage.setItem('yuca_prodFilter', cat);
    if(cat!=='전체' && cat2Filter!=='전체' && !(CATS[cat]||[]).includes(cat2Filter)){
      localStorage.removeItem('yuca_prodFilter2');
    }
    document.querySelectorAll('#prodBody tr').forEach(r=>{
      const show = (cat==='전체'||r.dataset.cat1===cat) && (localStorage.getItem('yuca_prodFilter2')||'전체')==='전체' || (cat==='전체'||r.dataset.cat1===cat) && r.dataset.cat2===(localStorage.getItem('yuca_prodFilter2'));
      r.style.display = show? '' : 'none';
    });
    let visible=0;
    document.querySelectorAll('#prodBody tr').forEach(r=>{ if(r.style.display!=='none') visible++; });
    document.getElementById('countBadge').textContent = visible + '개';
    document.getElementById('curFilter').textContent = cat + ((localStorage.getItem('yuca_prodFilter2')!=='전체'&&localStorage.getItem('yuca_prodFilter2'))?' > '+localStorage.getItem('yuca_prodFilter2'):'');
    document.getElementById('curCount').textContent = visible;
    document.querySelectorAll('.fBtn').forEach(b=>{
      const active = b.dataset.f===cat;
      b.style.background = active? '#f97316' : '#fff';
      b.style.color = active? '#fff' : '#333';
    });
    // 중분류 셀렉트 옵션 갱신
    const c2 = localStorage.getItem('yuca_prodFilter2')||'전체';
    const sel = document.querySelector('select[onchange="window.setProdFilter2(this.value)"]');
    if(sel){
      const opts = cat==='전체' ? [] : (CATS[cat]||[]);
      sel.innerHTML = '<option value="전체">중분류: 전체</option>' + (cat==='전체' ? CAT1_LIST.flatMap(c=>(CATS[c]||[])).filter((v,i,a)=>a.indexOf(v)===i).map(m=>`<option value="${m}">${m}</option>`).join('') : opts.map(m=>`<option value="${m}">${m}</option>`).join(''));
      sel.value = opts.includes(c2)||cat==='전체' ? c2 : '전체';
    }
  };

  window.setProdFilter2 = function(mid){
    localStorage.setItem('yuca_prodFilter2', mid);
    window.setProdFilter(localStorage.getItem('yuca_prodFilter')||'전체');
  };

  window.openProdModal = function(){
    document.getElementById('prodModal').style.display='flex';
    document.getElementById('p_cat1').value = CAT1_LIST[0];
    window.onCat1Change();
  };
  window.closeProdModal = function(){ document.getElementById('prodModal').style.display='none'; document.getElementById('p_id').value=''; };

  window.saveProd = function(){
    const name = document.getElementById('p_name').value.trim();
    if(!name){ alert('제품명 입력!'); return; }
    const id = document.getElementById('p_id').value || 'p'+Date.now();
    const item = {
      id, name,
      cat1: document.getElementById('p_cat1').value,
      cat2: document.getElementById('p_cat2').value,
      sub: document.getElementById('p_sub').value.trim(),
      spec: document.getElementById('p_spec').value.trim(),
      brand: document.getElementById('p_brand').value.trim(),
      inDate: document.getElementById('p_inDate').value,
      expiry: document.getElementById('p_expiry').value,
      price: parseInt(document.getElementById('p_price').value)||0,
      stock: parseInt(document.getElementById('p_stock').value)||0,
      minStock: parseInt(document.getElementById('p_minStock').value)||0,
      notes: document.getElementById('p_notes').value.trim(),
      updatedAt: new Date().toISOString()
    };
    let arr = load(KEYS.products, []) || [];
    const idx = arr.findIndex(x=>x.id===id);
    if(idx>=0) arr[idx]={...arr[idx],...item}; else arr.push(item);
    save(KEYS.products, arr);
    window.closeProdModal();
    renderProducts(container);
  };

  window.editProd = function(id){
    const p = list.find(x=>x.id===id);
    if(!p) return;
    document.getElementById('p_id').value=p.id;
    document.getElementById('p_cat1').value=p.cat1||CAT1_LIST[0];
    window.onCat1Change();
    document.getElementById('p_cat2').value=p.cat2||(CATS[p.cat1]||[])[0]||'';
    document.getElementById('p_sub').value=p.sub||'';
    document.getElementById('p_spec').value=p.spec||'';
    document.getElementById('p_name').value=p.name;
    document.getElementById('p_brand').value=p.brand||'';
    document.getElementById('p_inDate').value=p.inDate||'';
    document.getElementById('p_expiry').value=p.expiry||'';
    document.getElementById('p_price').value=p.price;
    document.getElementById('p_stock').value=p.stock;
    document.getElementById('p_minStock').value=p.minStock||'';
    document.getElementById('p_notes').value=p.notes||'';
    document.getElementById('prodModal').style.display='flex';
  };

  window.delProd = function(id){
    if(!confirm('삭제?')) return;
    let arr = (load(KEYS.products, []) || []).filter(x=>x.id!==id);
    save(KEYS.products, arr);
    renderProducts(container);
  };

  setTimeout(()=>{ window.setProdFilter(cat1Filter); }, 50);
}
