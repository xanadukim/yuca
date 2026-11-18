// YUCA v9.5 - 장비관리: 고정자산 대장 + 세무/내부 2단계 감가상각 + 수리이력
import { load, save, KEYS } from '../storage.js';

const $=s=>document.querySelector(s);
const fmt=n=>Number(n||0).toLocaleString('ko-KR')+'원';
const uid=()=>'a'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const today=()=>new Date().toISOString().slice(0,10);
const ymOf=d=>d?d.slice(0,7):'';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const STATUSES=['가동중','수리중','폐기','매각'];
const R_TYPES=[['수익적','비용처리(당월 수선비)'],['자본적','취득가액 합산(상각 연장)']];
const MIG='yuca_assets_v1';

// ---------- 감가상각 계산 ----------
function monthsBetween(a,b){ // a,b: 'YYYY-MM'
  const [ay,am]=a.split('-').map(Number),[by,bm]=b.split('-').map(Number);
  return (by-ay)*12+(bm-am);
}
function dim(y,m){return new Date(y,m,0).getDate()}
function startFrac(a){ // 첫 달 사용 일수 비율
  const[y,m,d]=a.split('-').map(Number);
  return (dim(y,m)-d+1)/dim(y,m);
}
// 해당 월의 감가상각액 (월 단위 근사, 첫 달/처분월 일할)
function depForMonth(a,ym){
  if(!a.startDate) return 0;
  const sm=ymOf(a.startDate);
  if(ym<sm) return 0;
  const i=monthsBetween(sm,ym); // 0-base 월 인덱스
  let frac=1;
  if(i===0) frac=startFrac(a.startDate);
  if(a.status==='폐기'||a.status==='매각'){
    const dm=ymOf(a.disposeDate||a.updatedAt||'');
    if(dm&&ym>dm) return 0;
    if(dm&&ym===dm&&a.disposeDate) frac=Math.min(frac,(a.disposeDate.slice(8,10)-0)/dim(+ym.slice(0,4),+ym.slice(5,7))||frac);
  }
  const p1=a.taxLife*12, p2=a.intLife*12;
  const m1=(a.cost-(a.taxResidual||0))/p1, m2=((a.taxResidual||0)-(a.intResidual||0))/p2;
  if(i<p1) return Math.round(m1*frac);
  if(i<p1+p2) return Math.round(m2*frac);
  return 0;
}
function bookValue(a,asOfYm){
  const sm=ymOf(a.startDate); if(!sm) return a.cost||0;
  const end=asOfYm||ymOf(today());
  let acc=0;
  for(let ym=sm;ym<=end;ym=nextYm(ym)) acc+=depForMonth(a,ym);
  return Math.max((a.intResidual??0),(a.cost||0)-acc);
}
function nextYm(ym){const[y,m]=ym.split('-').map(Number);return m===12?`${y+1}-01`:`${y}-${String(m+1).padStart(2,'0')}`}

// ---------- 시드 ----------
function seed(){
  if(localStorage.getItem(MIG)) return;
  const assets=[
    {id:uid(),code:'EQ-2026-01',name:'하이드로바스',model:'HYDRO-3000',maker:'펫스파',location:'1층 미용실',purchaseDate:'2026-01-01',startDate:'2026-01-05',vendor:'펫장비',cost:3000000,taxLife:8,taxResidual:0,intLife:5,intResidual:100000,status:'가동중',notes:'',createdAt:Date.now(),updatedAt:Date.now()},
    {id:uid(),code:'EQ-2026-02',name:'대형 드라이룸',model:'DR-200',maker:'도그드라이',location:'1층 드라이존',purchaseDate:'2026-05-20',startDate:'2026-06-01',vendor:'도그기어',cost:2400000,taxLife:8,taxResidual:0,intLife:5,intResidual:100000,status:'가동중',notes:'',createdAt:Date.now(),updatedAt:Date.now()},
    {id:uid(),code:'EQ-2026-03',name:'전동 미용테이블',model:'ET-120',maker:'펫테이블',location:'1층 미용실',purchaseDate:'2026-08-25',startDate:'2026-09-01',vendor:'펫가구',cost:600000,taxLife:8,taxResidual:0,intLife:5,intResidual:50000,status:'가동중',notes:'',createdAt:Date.now(),updatedAt:Date.now()},
    {id:uid(),code:'EQ-2026-04',name:'POS 포스기',model:'POS-500',maker:'페이시스템',location:'카운터',purchaseDate:'2026-02-10',startDate:'2026-03-01',vendor:'결제솔루션',cost:800000,taxLife:5,taxResidual:0,intLife:3,intResidual:50000,status:'가동중',notes:'',createdAt:Date.now(),updatedAt:Date.now()},
    {id:uid(),code:'EQ-2026-05',name:'냉난방기',model:'AC-24000',maker:'클링',location:'전체 매장',purchaseDate:'2026-03-15',startDate:'2026-04-01',vendor:'공조기기',cost:1500000,taxLife:8,taxResidual:0,intLife:5,intResidual:100000,status:'가동중',notes:'',createdAt:Date.now(),updatedAt:Date.now()},
  ];
  save(KEYS.assets,assets);
  const repairs=[
    {id:uid(),assetId:assets[0].id,date:'2026-10-15',content:'순환펌프 소음 점검 및 필터 교체',amount:85000,type:'수익적',createdAt:Date.now()},
    {id:uid(),assetId:assets[2].id,date:'2026-10-08',content:'유압모터 오일 보충 및 실린더 점검',amount:45000,type:'수익적',createdAt:Date.now()},
    {id:uid(),assetId:assets[1].id,date:'2026-09-20',content:'드라이룸 히터 교체',amount:120000,type:'수익적',createdAt:Date.now()},
  ];
  save(KEYS.repairs,repairs);
  localStorage.setItem(MIG,'1');
}

// ---------- 모달 ----------
function overlay(html){
  document.querySelectorAll('.yu-overlay').forEach(o=>o.remove());
  const d=document.createElement('div');
  d.className='yu-overlay';
  d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px';
  d.innerHTML=`<div style="background:#fff;border-radius:20px;max-width:560px;width:100%;max-height:85vh;overflow:auto;padding:28px">${html}</div>`;
  d.addEventListener('click',e=>{if(e.target===d)d.remove()});
  document.body.appendChild(d);return d;
}
const inp=(id,label,type='text',val='')=>`<div style="margin-bottom:12px"><label style="display:block;font-size:12px;font-weight:700;color:#6b7280;margin-bottom:4px">${label}</label><input id="${id}" type="${type}" value="${esc(val)}" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px"></div>`;
const sel=(id,label,opts,val='')=>`<div style="margin-bottom:12px"><label style="display:block;font-size:12px;font-weight:700;color:#6b7280;margin-bottom:4px">${label}</label><select id="${id}" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px">${opts.map(o=>`<option value="${o[0]}" ${o[0]==val?'selected':''}>${o[1]}</option>`).join('')}</select></div>`;

function assetModal(a){
  const isNew=!a;
  const ov=overlay(`
    <h3 style="margin:0 0 16px;font-size:18px">${isNew?'자산 등록':'자산 수정'}</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">
      ${inp('f-name','장비명 *','text',a?.name||'')}
      ${inp('f-model','모델명','text',a?.model||'')}
      ${inp('f-maker','제조사','text',a?.maker||'')}
      ${inp('f-location','설치 위치','text',a?.location||'')}
      ${inp('f-purchase','취득일','date',a?.purchaseDate||today())}
      ${inp('f-start','가동 개시일 (상각 시작)','date',a?.startDate||today())}
      ${inp('f-vendor','공급처','text',a?.vendor||'')}
      ${inp('f-cost','취득가액 (원) *','number',a?.cost||'')}
      ${sel('f-status','상태','가동중 수리중 폐기 매각'.split(' ').map(s=>[s,s]),a?.status||'가동중')}
      ${inp('f-dispose','폐기/매각일','date',a?.disposeDate||'')}
      ${inp('f-disposePrice','폐기/매각가액','number',a?.disposePrice||'')}
    </div>
    <div style="margin-top:12px;padding:12px;background:#f9fafb;border-radius:10px">
      <div style="font-size:12px;font-weight:700;color:#6b7280;margin-bottom:8px">상각 설정 (정액법)</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 12px">
        ${sel('f-taxLife','세무 내용연수',[1,2,3,4,5,6,7,8,9,10,12,15,20].map(y=>[y,y+'년']),a?.taxLife||5)}
        ${inp('f-taxRes','세무 잔존가액','number',a?.taxResidual??0)}
        ${inp('f-intLife','내부 연수 (세무 완료 후)','number',a?.intLife||5)}
        ${inp('f-intRes','내부 잔존가액','number',a?.intResidual||50000)}
      </div>
      <div style="font-size:11px;color:#9ca3af;margin-top:6px">세무용 상각 완료 후 잔존가액 기준으로 내부관리용 상각이 자동 이어집니다.</div>
    </div>
    <div style="margin-top:12px">${inp('f-notes','메모','text',a?.notes||'')}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="yu-btn yu-s" onclick="this.closest('.yu-overlay').remove()">취소</button>
      <button class="yu-btn" id="btn-save">${isNew?'등록':'저장'}</button>
    </div>`);
  ov.querySelector('#btn-save').onclick=()=>{
    const name=ov.querySelector('#f-name').value.trim();
    const cost=Number(ov.querySelector('#f-cost').value)||0;
    if(!name||!cost){alert('장비명과 취득가액은 필수입니다.');return}
    const data={
      name,model:ov.querySelector('#f-model').value.trim(),maker:ov.querySelector('#f-maker').value.trim(),
      location:ov.querySelector('#f-location').value.trim(),
      purchaseDate:ov.querySelector('#f-purchase').value,startDate:ov.querySelector('#f-start').value,
      vendor:ov.querySelector('#f-vendor').value.trim(),cost:cost,
      status:ov.querySelector('#f-status').value,
      disposeDate:ov.querySelector('#f-dispose').value||null,
      disposePrice:Number(ov.querySelector('#f-disposePrice').value)||0,
      taxLife:Number(ov.querySelector('#f-taxLife').value)||5,
      taxResidual:Number(ov.querySelector('#f-taxResidual').value)||0,
      intLife:Number(ov.querySelector('#f-intLife').value)||5,
      intResidual:Number(ov.querySelector('#f-intRes').value)||0,
      notes:ov.querySelector('#f-notes').value.trim(),
      updatedAt:Date.now()
    };
    let list=load(KEYS.assets,[]);
    if(isNew){
      const y=new Date().getFullYear();
      const cnt=list.filter(x=>x.code?.startsWith(`EQ-${y}`)).length+1;
      data.id=uid();data.code=`EQ-${y}-${String(cnt).padStart(2,'0')}`;data.createdAt=Date.now();
      list.push(data);
    }else{Object.assign(a,data)}
    save(KEYS.assets,list);ov.remove();renderAssets();
  };
}

function repairModal(assetId){
  const a=load(KEYS.assets,[]).find(x=>x.id===assetId); if(!a)return;
  const ov=overlay(`
    <h3 style="margin:0 0 4px;font-size:18px">수리/유지보수 등록</h3>
    <div style="font-size:13px;color:#6b7280;margin-bottom:16px">${esc(a.name)} (${a.code})</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 12px">
      ${inp('r-date','수리일','date',today())}
      ${sel('r-type','지출 성격',R_TYPES,'수익적')}
      ${inp('r-amount','금액 (원)','number','')}
    </div>
    <div style="margin-top:12px">${inp('r-content','수리 내용','text','')}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="yu-btn yu-s" onclick="this.closest('.yu-overlay').remove()">취소</button>
      <button class="yu-btn" id="btn-rsave">등록</button>
    </div>`);
  ov.querySelector('#btn-rsave').onclick=()=>{
    const content=ov.querySelector('#r-content').value.trim();
    const amount=Number(ov.querySelector('#r-amount').value)||0;
    if(!content||!amount){alert('수리 내용과 금액은 필수입니다.');return}
    let list=load(KEYS.repairs,[]);
    list.push({id:uid(),assetId,date:ov.querySelector('#r-date').value,content,amount,type:ov.querySelector('#r-type').value,createdAt:Date.now()});
    save(KEYS.repairs,list);ov.remove();renderAssets();
  };
}

function historyModal(assetId){
  const a=load(KEYS.assets,[]).find(x=>x.id===assetId); if(!a)return;
  const reps=(load(KEYS.repairs,[])||[]).filter(r=>r.assetId===assetId).sort((x,y)=>y.date.localeCompare(x.date));
  const rows=reps.length?reps.map(r=>`
    <tr>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6">${r.date}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6">${esc(r.content)}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6"><span class="yu-bdg ${r.type==='수익적'?'yu-bdg-o':'yu-bdg-b'}">${r.type}</span></td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right">${fmt(r.amount)}</td>
      <td style="padding:8px;border-bottom:1px solid #f3f4f6;text-align:right"><button class="yu-btn yu-d" style="padding:4px 10px;font-size:12px" onclick="window.__delRepair('${r.id}')">삭제</button></td>
    </tr>`).join('')
    :'<tr><td colspan="5" style="padding:20px;text-align:center;color:#9ca3af">수리 이력이 없습니다</td></tr>';
  const ov=overlay(`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <div><h3 style="margin:0;font-size:18px">${esc(a.name)} 수리 이력</h3><div style="font-size:13px;color:#6b7280">${a.code} · ${esc(a.location||'')}</div></div>
      <button class="yu-btn" onclick="window.__repairModal('${a.id}')">+ 수리 등록</button>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="background:#f9fafb"><th style="padding:8px;text-align:left">날짜</th><th style="padding:8px;text-align:left">내용</th><th style="padding:8px">성격</th><th style="padding:8px;text-align:right">금액</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`);
}
window.__repairModal=repairModal;
window.__delRepair=id=>{save(KEYS.repairs,(load(KEYS.repairs,[])||[]).filter(r=>r.id!==id));renderAssets()};

// ---------- 메인 렌더 ----------
export function renderAssets(){
  seed();
  const main=$('#main-content'); if(!main)return;
  const assets=load(KEYS.assets,[])||[];
  const repairs=load(KEYS.repairs,[])||[];
  const curYm=ymOf(today());
  const depMap={}; repairs.forEach(r=>{const m=ymOf(r.date);depMap[m]=depMap[m]||{수익적:0,자본적:0};depMap[m][r.type]=(depMap[m][r.type]||0)+(r.amount||0)});
  const depTotal=assets.reduce((s,a)=>s+depForMonth(a,curYm),0);
  const fixTotal=assets.filter(a=>!['폐기','매각'].includes(a.status)).reduce((s,a)=>s+depForMonth(a,curYm),0);

  const statusBadge=s=>({'가동중':'yu-bdg-g','수리중':'yu-bdg-y','폐기':'yu-bdg-r','매각':'yu-bdg-gr'}[s]||'yu-bdg-g');

  main.innerHTML=`
    <div class="yu-page" style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px">
        <div>
          <h2 style="margin:0;font-size:22px;font-weight:800">장비 관리</h2>
          <div style="font-size:13px;color:#6b7280;margin-top:4px">고정자산 대장 · 감가상각 · 수리 이력</div>
        </div>
        <button class="yu-btn" id="btn-add">+ 자산 등록</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:20px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="font-size:12px;color:#6b7280">등록 자산</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px">${assets.length}<span style="font-size:14px;font-weight:400;color:#6b7280">개</span></div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="font-size:12px;color:#6b7280">취득가액 합계</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px">${fmt(assets.reduce((s,a)=>s+(a.cost||0),0))}</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="font-size:12px;color:#6b7280">이번 달 상각비 (${curYm})</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px;color:#7c3aed">${fmt(fixTotal)}</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="font-size:12px;color:#6b7280">이번 달 수선비 (수익적)</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px;color:#d97706">${fmt((depMap[curYm]?.수익적)||0)}</div>
        </div>
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px">
        <div style="padding:14px 16px;border-bottom:1px solid #f3f4f6;font-weight:700">자산 목록</div>
        ${assets.length===0?'<div style="padding:40px;text-align:center;color:#9ca3af">등록된 자산이 없습니다. "+ 자산 등록"으로 시작하세요.</div>':`
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:800px">
          <thead><tr style="background:#f9fafb;text-align:left">
            <th style="padding:10px 12px">코드</th><th style="padding:10px 12px">장비명</th><th style="padding:10px 12px">설치위치</th>
            <th style="padding:10px 12px;text-align:right">취득가액</th><th style="padding:10px 12px;text-align:right">현재 장부가액</th>
            <th style="padding:10px 12px;text-align:right">월 상각액</th><th style="padding:10px 12px">상태</th><th style="padding:10px 12px"></th>
          </tr></thead>
          <tbody>${assets.map(a=>{
            const bv=bookValue(a);const dep=depForMonth(a,curYm);
            return `<tr style="border-top:1px solid #f3f4f6">
              <td style="padding:10px 12px;font-family:monospace;font-size:12px">${a.code||'-'}</td>
              <td style="padding:10px 12px;font-weight:600">${esc(a.name)}<div style="font-size:11px;color:#9ca3af;font-weight:400">${esc(a.model||'')} ${esc(a.maker||'')}</div></td>
              <td style="padding:10px 12px;color:#6b7280">${esc(a.location||'-')}</td>
              <td style="padding:10px 12px;text-align:right">${fmt(a.cost)}</td>
              <td style="padding:10px 12px;text-align:right;font-weight:700">${fmt(bv)}</td>
              <td style="padding:10px 12px;text-align:right">${dep?fmt(dep):'-'}</td>
              <td style="padding:10px 12px"><span class="yu-bdg ${statusBadge(a.status)}">${a.status}</span></td>
              <td style="padding:10px 12px;text-align:right;white-space:nowrap">
                <button class="yu-btn yu-s" style="padding:4px 10px;font-size:12px" onclick="window.__hist('${a.id}')">이력</button>
                <button class="yu-btn yu-e" style="padding:4px 10px;font-size:12px" onclick="window.__edit('${a.id}')">수정</button>
                <button class="yu-btn yu-d" style="padding:4px 10px;font-size:12px" onclick="window.__del('${a.id}')">삭제</button>
              </td>
            </tr>`}).join('')}
          </tbody>
          <tfoot><tr style="background:#f9fafb;font-weight:700">
            <td colspan="3" style="padding:10px 12px">합계</td>
            <td style="padding:10px 12px;text-align:right">${fmt(assets.reduce((s,a)=>s+(a.cost||0),0))}</td>
            <td style="padding:10px 12px;text-align:right">${fmt(assets.reduce((s,a)=>s+bookValue(a),0))}</td>
            <td style="padding:10px 12px;text-align:right">${fmt(fixTotal)}</td>
            <td colspan="2"></td>
          </tr></tfoot>
        </table></div>`}
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="padding:14px 16px;border-bottom:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700">월별 상각표</span>
          <input type="month" id="dep-month" value="${curYm}" style="padding:6px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px">
        </div>
        <div id="dep-body"></div>
      </div>
    </div>`;

  $('#btn-add').onclick=()=>assetModal(null);
  window.__edit=id=>assetModal(assets.find(x=>x.id===id));
  window.__del=id=>{if(confirm('이 자산을 삭제하시겠습니까? 수리 이력도 함께 삭제됩니다.')){save(KEYS.assets,assets.filter(x=>x.id!==id));save(KEYS.repairs,repairs.filter(r=>r.assetId!==id));renderAssets()}};
  window.__hist=id=>historyModal(id);

  const drawDep=()=>{
    const ym=$('#dep-month').value||curYm;
    const rows=assets.map(a=>({a,dep:depForMonth(a,ym),bv:bookValue(a,ym)})).filter(x=>x.dep>0||['가동중','수리중'].includes(x.a.status));
    const tot=rows.reduce((s,x)=>s+x.dep,0);
    const repTot=(depMap[ym]?.수익적||0)+(depMap[ym]?.자본적||0);
    $('#dep-body').innerHTML=rows.length===0?'<div style="padding:30px;text-align:center;color:#9ca3af">해당 월 상각 대상이 없습니다</div>':`
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb;text-align:left">
          <th style="padding:10px 12px">코드</th><th style="padding:10px 12px">장비명</th>
          <th style="padding:10px 12px;text-align:right">월 상각액</th><th style="padding:10px 12px;text-align:right">기말 장부가액</th>
        </tr></thead>
        <tbody>${rows.map(x=>`<tr style="border-top:1px solid #f3f4f6">
          <td style="padding:10px 12px;font-family:monospace;font-size:12px">${x.a.code||'-'}</td>
          <td style="padding:10px 12px">${esc(x.a.name)}</td>
          <td style="padding:10px 12px;text-align:right">${x.dep?fmt(x.dep):'-'}</td>
          <td style="padding:10px 12px;text-align:right">${fmt(x.bv)}</td>
        </tr>`).join('')}</tbody>
        <tfoot><tr style="background:#f9fafb;font-weight:700">
          <td colspan="2" style="padding:10px 12px">합계</td>
          <td style="padding:10px 12px;text-align:right">${fmt(tot)}</td>
          <td style="padding:10px 12px;text-align:right">${fmt(rows.reduce((s,x)=>s+x.bv,0))}</td>
        </tr></tfoot>
      </table>
      <div style="padding:12px 16px;border-top:1px solid #f3f4f6;font-size:13px;color:#6b7280">
        당월 수선비(수익적): <b>${fmt(depMap[ym]?.수익적||0)}</b> · 자본적 지출: <b>${fmt(depMap[ym]?.자본적||0)}</b>
      </div>`;
  };
  $('#dep-month').onchange=drawDep;
  drawDep();
}
