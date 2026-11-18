// YUCA v9.7 - 매출리포트: 기간 필터 + 사업부별 분석 + 차트 + 비용 연동
import { load, KEYS } from '../storage.js';
import { depForMonth } from './assets.js';

const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const won=n=>'₩'+fmt(n);
const ymOf=d=>d?String(d).slice(0,7):'';
let reportMonth=ymOf(new Date().toISOString().slice(0,7)); // 'YYYY-MM', 'all'=전체

function inMonth(dateStr,ym){
  if(ym==='all') return true;
  return ymOf(dateStr)===ym;
}
function monthList(n){
  const out=[];const d=new Date();
  for(let i=n-1;i>=0;i--){
    const t=new Date(d.getFullYear(),d.getMonth()-i,1);
    out.push(t.toISOString().slice(0,7));
  }
  return out;
}
function monthLabel(ym){
  const[y,m]=ym.split('-');return `${y}년 ${m}월`;
}
function prevMonth(ym){
  const[y,m]=ym.split('-').map(Number);
  const t=new Date(y,m-2,1);return t.toISOString().slice(0,7);
}

export function renderReports(container){
  const target=container||document.getElementById('main-content');
  if(!target)return;
  const reservations=load(KEYS.reservations,[])||[];
  const kg=load(KEYS.kindergarten,[])||[];
  const hotel=load(KEYS.hotel,[])||[];
  const products=load(KEYS.products,[])||[];
  const employees=load(KEYS.employees,[])||[];
  const assets=load(KEYS.assets,[])||[];
  const repairs=load(KEYS.repairs,[])||[];

  const ym=reportMonth;
  const activeR=reservations.filter(x=>x.status!=='취소'&&inMonth(x.date,ym));
  const activeK=kg.filter(x=>x.status!=='취소'&&inMonth(x.date,ym));
  const activeH=hotel.filter(x=>x.status!=='취소'&&inMonth(x.checkInDate||x.date,ym));

  // 가격 미입력 건수 (데이터 품질 표시)
  const noPrice=activeR.filter(x=>!x.price||x.price==='0').length+activeK.filter(x=>!x.price).length;

  const revR=activeR.reduce((s,x)=>s+(Number(x.price)||0),0);
  const revK=activeK.reduce((s,x)=>s+(Number(x.price)||0),0);
  const revH=activeH.reduce((s,x)=>s+(Number(x.totalPrice)||Number(x.price)||0),0);
  const total=revR+revK+revH;
  const cntR=activeR.length,cntK=activeK.length,cntH=activeH.length;
  const cntAll=cntR+cntK+cntH;
  const avg=cntAll?Math.round(total/cntAll):0;

  // 전월 비교
  let mom=null;
  if(ym!=='all'){
    const pm=prevMonth(ym);
    const pR=reservations.filter(x=>x.status!=='취소'&&ymOf(x.date)===pm).reduce((s,x)=>s+(Number(x.price)||0),0);
    const pK=kg.filter(x=>x.status!=='취소'&&ymOf(x.date)===pm).reduce((s,x)=>s+(Number(x.price)||0),0);
    const pH=hotel.filter(x=>x.status!=='취소'&&ymOf(x.checkInDate||x.date)===pm).reduce((s,x)=>s+(Number(x.totalPrice)||Number(x.price)||0),0);
    const pTot=pR+pK+pH;
    mom=pTot?Math.round((total-pTot)/pTot*100):null;
  }

  // 월별 추이 차트 (최근 6개월)
  const chartMonths=monthList(6);
  const chartData=chartMonths.map(cm=>{
    const dR=reservations.filter(x=>x.status!=='취소'&&ymOf(x.date)===cm).reduce((s,x)=>s+(Number(x.price)||0),0);
    const dK=kg.filter(x=>x.status!=='취소'&&ymOf(x.date)===cm).reduce((s,x)=>s+(Number(x.price)||0),0);
    const dH=hotel.filter(x=>x.status!=='취소'&&ymOf(x.checkInDate||x.date)===cm).reduce((s,x)=>s+(Number(x.totalPrice)||Number(x.price)||0),0);
    return {ym:cm,r:dR,k:dK,h:dH,tot:dR+dK+dH};
  });
  const chartMax=Math.max(...chartData.map(d=>d.tot),1);

  // 비용: 감가상각 + 수선비(해당 월)
  let dep=0,fixCost=0;
  if(ym!=='all'){
    dep=assets.reduce((s,a)=>s+depForMonth(a,ym),0);
    fixCost=repairs.filter(r=>ymOf(r.date)===ym&&r.type==='수익적').reduce((s,r)=>s+(Number(r.amount)||0),0);
  }else{
    // 전체 기간 합산
    const allMonths=new Set([...assets.map(a=>ymOf(a.startDate)),...repairs.map(r=>ymOf(r.date))].filter(Boolean));
    allMonths.forEach(m=>{dep+=assets.reduce((s,a)=>s+depForMonth(a,m),0)});
    fixCost=repairs.filter(r=>r.type==='수익적').reduce((s,r)=>s+(Number(r.amount)||0),0);
  }
  const profit=total-dep-fixCost;

  // 재고
  const prodVal=products.reduce((s,x)=>s+(Number(x.price)||0)*(Number(x.stock)||0),0);
  const lowStock=products.filter(x=>x.stock<=(x.minStock||3));

  // 직원별 실적 (예약에 employee 필드가 있는 경우만)
  const byEmp={};
  activeR.forEach(r=>{const e=r.employee||r.staff||'';if(e){byEmp[e]=(byEmp[e]||0)+(Number(r.price)||0)}});
  const empRows=Object.entries(byEmp).sort((a,b)=>b[1]-a[1]);

  // 서비스별 매출 (예약)
  const bySvc={};
  activeR.forEach(r=>{const s2=r.service||'미분류';bySvc[s2]=(bySvc[s2]||0)+(Number(r.price)||0)});
  const svcRows=Object.entries(bySvc).sort((a,b)=>b[1]-a[1]);

  const monthOpts=['all',...monthList(12)].map(m=>`<option value="${m}" ${m===ym?'selected':''}>${m==='all'?'전체 기간':monthLabel(m)}</option>`).join('');

  const card=(label,val,sub,color)=>`
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
      <div style="font-size:12px;color:#6b7280">${label}</div>
      <div style="font-size:22px;font-weight:800;margin-top:4px;${color?`color:${color}`:''}">${val}</div>
      ${sub?`<div style="font-size:11px;color:#9ca3af;margin-top:2px">${sub}</div>`:''}
    </div>`;

  // 차트 SVG
  const bw=34,gap=14,W=chartData.length*(bw+gap)+20,H=180,pad=30;
  const bars=chartData.map((d,i)=>{
    const x=10+i*(bw+gap);
    const rh=Math.max(2,(d.tot/chartMax)*(H-pad));
    const y=H-rh;
    // 사업부 스택
    const sR=(d.r/chartMax)*(H-pad),sK=(d.k/chartMax)*(H-pad),sH=(d.h/chartMax)*(H-pad);
    return `<g>
      <rect x="${x}" y="${H-sR}" width="${bw}" height="${sR}" fill="#f97316"/>
      <rect x="${x}" y="${H-sR-sK}" width="${bw}" height="${sK}" fill="#f59e0b"/>
      <rect x="${x}" y="${H-sR-sK-sH}" width="${bw}" height="${sH}" fill="#10b981"/>
      <text x="${x+bw/2}" y="${H+14}" font-size="10" fill="#6b7280" text-anchor="middle">${d.ym.slice(5)}월</text>
      <text x="${x+bw/2}" y="${y-4}" font-size="9" fill="#374151" text-anchor="middle">${d.tot>=10000?(d.tot/10000).toFixed(0)+'만':'-'}</text>
    </g>`;
  }).join('');

  target.innerHTML=`
    <div class="yu-page" style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px">
        <div>
          <h2 style="margin:0;font-size:22px;font-weight:800">매출 리포트</h2>
          <div style="font-size:13px;color:#6b7280;margin-top:4px">${ym==='all'?'전체 기간':monthLabel(ym)} 기준 · 취소 제외</div>
        </div>
        <select id="rpt-month" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px">${monthOpts}</select>
      </div>

      ${noPrice?`<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:10px 14px;font-size:13px;color:#92400e;margin-bottom:16px">⚠️ 가격 미입력 ${noPrice}건 — 가격표 관리에서 자동계산을 사용하면 정확해집니다.</div>`:''}

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px">
        ${card('총 매출',won(total),ym==='all'?'':'이번 달')}
        ${card('미용/예약',won(revR),`${cntR}건`,'#f97316')}
        ${card('유치원',won(revK),`${cntK}건`,'#f59e0b')}
        ${card('호텔',won(revH),`${cntH}건`,'#10b981')}
        ${card('평균 건당',won(avg),`${cntAll}건 합계`)}
        ${card('전월 대비',mom==null?'—':(mom>=0?'+':'')+mom+'%',ym==='all'?'월 선택 시 표시':'',mom==null?'#6b7280':mom>=0?'#059669':'#dc2626')}
      </div>

      <!-- 월별 추이 차트 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px">
          <b style="font-size:14px">월별 매출 추이 (최근 6개월)</b>
          <div style="font-size:12px;color:#6b7280">
            <span style="color:#f97316">■</span> 미용 <span style="color:#f59e0b">■</span> 유치원 <span style="color:#10b981">■</span> 호텔
          </div>
        </div>
        <svg viewBox="0 0 ${W} ${H+30}" style="width:100%;height:auto;max-height:220px">
          <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="#e5e7eb"/>
          ${bars}
        </svg>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <!-- 사업부 비중 -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">사업부별 비중</b>
          <div style="margin-top:12px;display:grid;gap:10px">
            ${[['미용/예약',revR,'#f97316'],['유치원',revK,'#f59e0b'],['호텔',revH,'#10b981']].map(([l,v,c])=>`
              <div>
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${l}</span><span><b>${won(v)}</b> <small style="color:#9ca3af">${total?Math.round(v/total*100):0}%</small></span></div>
                <div style="background:#f3f4f6;border-radius:6px;height:10px;overflow:hidden"><div style="width:${total?Math.round(v/total*100):0}%;background:${c};height:100%"></div></div>
              </div>`).join('')}
          </div>
        </div>
        <!-- 서비스별 -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">미용 서비스별 매출</b>
          <div style="margin-top:10px;font-size:13px;line-height:2">
            ${svcRows.length?svcRows.map(([s,v])=>`<div style="display:flex;justify-content:space-between"><span>${s}</span><b>${won(v)}</b></div>`).join(''):'<div style="color:#9ca3af">데이터 없음</div>'}
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <!-- 비용/손익 -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">비용 및 손익 (해당 월)</b>
          <div style="margin-top:10px;font-size:13px;line-height:2">
            <div style="display:flex;justify-content:space-between"><span>감가상각비</span><b style="color:#7c3aed">-${won(dep)}</b></div>
            <div style="display:flex;justify-content:space-between"><span>수선비 (수익적)</span><b style="color:#d97706">-${won(fixCost)}</b></div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #f3f4f6;padding-top:6px;margin-top:4px"><span><b>매출 − 비용</b></span><b style="color:${profit>=0?'#059669':'#dc2626'}">${won(profit)}</b></div>
          </div>
        </div>
        <!-- 직원별 -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">직원별 실적</b>
          <div style="margin-top:10px;font-size:13px;line-height:2">
            ${empRows.length?empRows.map(([e,v])=>`<div style="display:flex;justify-content:space-between"><span>${e}</span><b>${won(v)}</b></div>`).join(''):'<div style="color:#9ca3af">직원 배정 데이터 없음 (예약에 직원 필드 필요)</div>'}
          </div>
        </div>
      </div>

      <!-- 현황 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">사업 현황</b>
          <div style="margin-top:10px;font-size:13px;line-height:2;color:#374151">
            직원 ${employees.length}명 · 제품 ${products.length}개<br>
            재고 원가 <b>${won(prodVal)}</b> · 총 재고 ${products.reduce((s,x)=>s+(Number(x.stock)||0),0)}개
          </div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">재고 부족 알림</b>
          <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
            ${lowStock.length?lowStock.map(x=>`<span class="yu-bdg yu-bdg-r">${esc(x.name)} (${x.stock}/${x.minStock||3})</span>`).join(''):'<span style="color:#9ca3af;font-size:13px">없음</span>'}
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('rpt-month').onchange=e=>{reportMonth=e.target.value;renderReports(target)};
}
