// YUCA v10.0 - 매출리포트: 미용 전용 (기간 필터 + 차트 + 비용 연동)
import { load, save, KEYS } from '../storage.js';
import { depForMonth } from './assets.js';

const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const won=n=>'₩'+fmt(n);
const ymOf=d=>d?String(d).slice(0,7):'';
let reportMonth=ymOf(new Date().toISOString().slice(0,7));

function inMonth(dateStr,ym){ return ym==='all' || ymOf(dateStr)===ym; }
function monthList(n){
  const out=[];const d=new Date();
  for(let i=n-1;i>=0;i--){
    const t=new Date(d.getFullYear(),d.getMonth()-i,1);
    out.push(t.toISOString().slice(0,7));
  }
  return out;
}
function monthLabel(ym){ const[y,m]=ym.split('-');return `${y}년 ${m}월`; }
function prevMonth(ym){ const[y,m]=ym.split('-').map(Number);return new Date(y,m-2,1).toISOString().slice(0,7); }

// ---- 샘플 데이터 (차트 확인용) ----
const SAMPLE_DOGS=[['말숙이','푸들','4.2'],['콩이','말티즈','3.1'],['보리','시바견','11.5'],['누리','비숑','8.7'],['하늘','골든리트리버','28.0'],['몽실','포메라니안','4.8'],['콩알','치와와','2.3'],['해피','코카스패니엘','12.4']];
const SAMPLE_SVCS=[['전체미용',78000],['목욕',35000],['위생미용',45000],['가위컷',55000],['부분미용',42000],['스파',60000]];
const SAMPLE_ADDS=[['엉킴 케어',20000],['장모 케어',20000],['위생 클리닝',15000],['노령견 케어',15000],['픽업·야간',10000]];
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];

function seedSample(){
  // 기존 샘플 삭제 후 재생성
  const res=load(KEYS.reservations,[]).filter(r=>!r.sample);
  const custs=load(KEYS.customers,[]).filter(c=>!c.sample);
  const emps=load(KEYS.employees,[]);
  const empNames=emps.length?emps.map(e=>e.name).filter(Boolean):['김미용'];
  const customers=[];
  SAMPLE_DOGS.forEach(([dog,breed,w],i)=>{
    customers.push({name:'샘플보호자'+(i+1),phone:'010-1000-'+String(2000+i),dogName:dog,breed,weight:w,sample:true,createdAt:new Date().toISOString()});
  });
  const now=new Date();
  for(let m=11;m>=0;m--){
    const base=new Date(now.getFullYear(),now.getMonth()-m,1);
    const ym=base.toISOString().slice(0,7);
    const dim=new Date(base.getFullYear(),base.getMonth()+1,0).getDate();
    const seasonal=1+0.15*Math.sin((base.getMonth()/12)*Math.PI*2); // 여름 성수기
    const count=Math.round(rnd(14,22)*seasonal);
    const lastDay=m===0?now.getDate():dim;
    for(let i=0;i<count;i++){
      const day=1+Math.floor(Math.random()*Math.min(lastDay,dim));
      const d=new Date(base.getFullYear(),base.getMonth(),day);
      const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const isPast=d<now;
      const roll=Math.random();
      const status=!isPast?(roll<0.7?'확정':'대기'):(roll<0.06?'취소':roll<0.9?'완료':'확정');
      const [svc,baseP]=pick(SAMPLE_SVCS);
      const extra=pick(SAMPLE_ADDS);
      const price=Math.round((baseP+rnd(-5000,8000)+ (Math.random()<0.3?extra[1]:0))/1000)*1000;
      const c=pick(customers);
      res.push({
        name:c.name,phone:c.phone,dogName:c.dogName,date,
        time:`${String(Math.floor(rnd(9,18))).padStart(2,'0')}:${pick(['00','30'])}`,
        service:svc,price,status,sample:true,
        employee:pick(empNames),notes:'',
        createdAt:new Date(d.getTime()-rnd(1,10)*86400000).toISOString(),
        updatedAt:new Date().toISOString()
      });
    }
  }
  save(KEYS.customers,[...custs,...customers]);
  save(KEYS.reservations,res);
}

export function renderReports(container){
  const target=container||document.getElementById('main-content');
  if(!target)return;
  const reservations=load(KEYS.reservations,[])||[];
  const products=load(KEYS.products,[])||[];
  const employees=load(KEYS.employees,[])||[];
  const assets=load(KEYS.assets,[])||[];
  const repairs=load(KEYS.repairs,[])||[];

  const ym=reportMonth;
  const active=reservations.filter(x=>x.status!=='취소'&&inMonth(x.date,ym));
  const noPrice=active.filter(x=>!x.price||x.price==='0').length;
  const rev=active.reduce((s,x)=>s+(Number(x.price)||0),0);
  const cnt=active.length;
  const avg=cnt?Math.round(rev/cnt):0;

  let mom=null;
  if(ym!=='all'){
    const pm=prevMonth(ym);
    const pTot=reservations.filter(x=>x.status!=='취소'&&ymOf(x.date)===pm).reduce((s,x)=>s+(Number(x.price)||0),0);
    mom=pTot?Math.round((rev-pTot)/pTot*100):null;
  }

  // 월별 추이 (최근 12개월) + 누적 선
  const chartMonths=monthList(12);
  const chartData=chartMonths.map(cm=>({
    ym:cm,
    tot:reservations.filter(x=>x.status!=='취소'&&ymOf(x.date)===cm).reduce((s,x)=>s+(Number(x.price)||0),0)
  }));
  // 누적 계산 (연도 바뀌면 리셋)
  let cum=0,prevYear=null;
  chartData.forEach(d=>{
    const y=+d.ym.slice(0,4);
    if(prevYear!==null&&y!==prevYear) cum=0;
    cum+=d.tot; d.cum=cum; prevYear=y;
  });
  const chartMax=Math.max(...chartData.map(d=>d.tot),1);

  // 비용
  let dep=0,fixCost=0;
  if(ym!=='all'){
    dep=assets.reduce((s,a)=>s+depForMonth(a,ym),0);
    fixCost=repairs.filter(r=>ymOf(r.date)===ym&&r.type==='수익적').reduce((s,r)=>s+(Number(r.amount)||0),0);
  }else{
    const allMonths=new Set([...assets.map(a=>ymOf(a.startDate)),...repairs.map(r=>ymOf(r.date))].filter(Boolean));
    allMonths.forEach(m=>{dep+=assets.reduce((s,a)=>s+depForMonth(a,m),0)});
    fixCost=repairs.filter(r=>r.type==='수익적').reduce((s,r)=>s+(Number(r.amount)||0),0);
  }
  const profit=rev-dep-fixCost;

  const prodVal=products.reduce((s,x)=>s+(Number(x.price)||0)*(Number(x.stock)||0),0);
  const lowStock=products.filter(x=>x.stock<=(x.minStock||3));

  // 직원별/서비스별
  const byEmp={};
  active.forEach(r=>{const e=r.employee||r.staff||'';if(e)byEmp[e]=(byEmp[e]||0)+(Number(r.price)||0)});
  const empRows=Object.entries(byEmp).sort((a,b)=>b[1]-a[1]);
  const bySvc={};
  active.forEach(r=>{const s2=r.service||'미분류';bySvc[s2]=(bySvc[s2]||0)+(Number(r.price)||0)});
  const svcRows=Object.entries(bySvc).sort((a,b)=>b[1]-a[1]);

  const monthOpts=['all',...monthList(12)].map(m=>`<option value="${m}" ${m===ym?'selected':''}>${m==='all'?'전체 기간':monthLabel(m)}</option>`).join('');
  const card=(label,val,sub,color)=>`
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
      <div style="font-size:12px;color:#6b7280">${label}</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;${color?`color:${color}`:''}">${val}</div>
      ${sub?`<div style="font-size:11px;color:#9ca3af;margin-top:2px">${sub}</div>`:''}
    </div>`;

  const bw=26,gap=10,W=chartData.length*(bw+gap)+20,H=180,pad=30;
  const cumMax=Math.max(...chartData.map(d=>d.cum),1);
  const bars=chartData.map((d,i)=>{
    const x=10+i*(bw+gap);
    const rh=Math.max(2,(d.tot/chartMax)*(H-pad));
    return `<g>
      <rect x="${x}" y="${H-rh}" width="${bw}" height="${rh}" fill="#f97316" rx="3"/>
      ${i%2===0?`<text x="${x+bw/2}" y="${H+14}" font-size="9" fill="#6b7280" text-anchor="middle">${d.ym.slice(2)}</text>`:''}
    </g>`;
  }).join('');
  // 누적 매출 꺾은선
  const cumPts=chartData.map((d,i)=>{
    const x=10+i*(bw+gap)+bw/2;
    const y=H-(d.cum/cumMax)*(H-pad);
    return `${x},${y}`;
  }).join(' ');
  const cumDots=chartData.map((d,i)=>{
    const x=10+i*(bw+gap)+bw/2;
    const y=H-(d.cum/cumMax)*(H-pad);
    return `<circle cx="${x}" cy="${y}" r="2.5" fill="#7c3aed"/>`;
  }).join('');

  target.innerHTML=`
    <div class="yu-page" style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <div>
          <h2 style="margin:0;font-size:22px;font-weight:800">매출 리포트</h2>
          <div style="font-size:13px;color:#6b7280;margin-top:4px">${ym==='all'?'전체 기간':monthLabel(ym)} 기준 · 취소 제외</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button id="btn-sample" style="padding:8px 14px;border:1px solid #e5e7eb;background:#fff;border-radius:10px;font-size:13px;cursor:pointer">🧪 샘플 데이터</button>
          <select id="rpt-month" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px">${monthOpts}</select>
        </div>
      </div>

      ${noPrice?`<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;font-size:13px;color:#92400e;margin-bottom:16px">⚠️ 가격 미입력 ${noPrice}건 — 가격표 관리에서 자동계산을 사용하면 정확해집니다.</div>`:''}

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px">
        ${card('총 매출',won(rev),ym==='all'?'':'이번 달')}
        ${card('예약 건수',cnt+'건','')}
        ${card('평균 건당',won(avg),'')}
        ${card('전월 대비',mom==null?'—':(mom>=0?'+':'')+mom+'%',ym==='all'?'월 선택 시 표시':'',mom==null?'#6b7280':mom>=0?'#059669':'#dc2626')}
        ${card('매출 − 비용',won(profit),'상각+수선비 차감',profit>=0?'#059669':'#dc2626')}
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <b style="font-size:14px">월별 매출 추이 (최근 12개월)</b>
          <div style="font-size:12px;color:#6b7280"><span style="color:#f97316">■</span> 월 매출 <span style="color:#7c3aed">—</span> 누적 매출</div>
        </div>
        <svg viewBox="0 0 ${W} ${H+30}" style="width:100%;height:auto;max-height:220px;margin-top:8px">
          <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#e5e7eb"/>
          ${bars}
          <polyline points="${cumPts}" fill="none" stroke="#7c3aed" stroke-width="2"/>
          ${cumDots}
        </svg>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">서비스별 매출</b>
          <div style="margin-top:10px;font-size:13px;line-height:2">
            ${svcRows.length?svcRows.map(([s,v])=>`<div style="display:flex;justify-content:space-between"><span>${s}</span><b>${won(v)}</b></div>`).join(''):'<div style="color:#9ca3af">데이터 없음</div>'}
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">직원별 실적</b>
          <div style="margin-top:10px;font-size:13px;line-height:2">
            ${empRows.length?empRows.map(([e,v])=>`<div style="display:flex;justify-content:space-between"><span>${e}</span><b>${won(v)}</b></div>`).join(''):'<div style="color:#9ca3af">직원 배정 데이터 없음</div>'}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">비용 및 손익 (해당 월)</b>
          <div style="margin-top:10px;font-size:13px;line-height:2">
            <div style="display:flex;justify-content:space-between"><span>감가상각비</span><b style="color:#7c3aed">-${won(dep)}</b></div>
            <div style="display:flex;justify-content:space-between"><span>수선비 (수익적)</span><b style="color:#d97706">-${won(fixCost)}</b></div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #f3f4f6;padding-top:6px;margin-top:4px"><span><b>매출 − 비용</b></span><b style="color:${profit>=0?'#059669':'#dc2626'}">${won(profit)}</b></div>
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">사업 현황</b>
          <div style="margin-top:10px;font-size:13px;line-height:2;color:#374151">
            직원 ${employees.length}명 · 제품 ${products.length}개 · 장비 ${assets.length}개<br>
            재고 원가 <b>${won(prodVal)}</b>
          </div>
        </div>
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
        <b style="font-size:14px">재고 부족 알림</b>
        <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
          ${lowStock.length?lowStock.map(x=>`<span class="yu-bdg yu-bdg-r">${esc(x.name)} (${x.stock}/${x.minStock||3})</span>`).join(''):'<span style="color:#9ca3af;font-size:13px">없음</span>'}
        </div>
      </div>
    </div>`;

  document.getElementById('rpt-month').onchange=e=>{reportMonth=e.target.value;renderReports(target)};
  document.getElementById('btn-sample').onclick=()=>{
    const hasSample=(load(KEYS.reservations,[])||[]).some(r=>r.sample);
    if(hasSample){
      if(confirm('기존 샘플 데이터를 삭제할까요?\n(취소를 누르면 삭제 후 새로 생성합니다)')){
        save(KEYS.reservations,load(KEYS.reservations,[]).filter(r=>!r.sample));
        save(KEYS.customers,load(KEYS.customers,[]).filter(c=>!c.sample));
        alert('샘플 데이터 삭제 완료');renderReports(target);return;
      }
    }else if(!confirm('최근 12개월 샘플 예약 데이터를 생성할까요? (차트 확인용)'))return;
    seedSample();
    alert('샘플 데이터 생성 완료! 차트가 채워집니다.\n삭제하려면 다시 "샘플 데이터" 버튼을 누르세요.');
    renderReports(target);
  };
}
