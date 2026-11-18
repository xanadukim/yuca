// YUCA v10.3 - BEP(손익분기점) 분석: 고정비 테이블 + 공헌이익 기반 BEP/시뮬레이션
import { load, save, KEYS, localToday } from '../storage.js';
import { getPricebook, basePrice, cellCost } from '../price-engine.js?v=10.3.1';

const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const won=n=>'₩'+fmt(Math.round(n));

const DEFAULT_CFG={
  fixedCosts:[
    {name:'임대료',amount:1300000},{name:'원장 인건비',amount:1500000},
    {name:'공과금·수도광열',amount:180000},{name:'보험·통신·소프트웨어',amount:220000},
    {name:'마케팅 고정분',amount:150000},{name:'장비 감가상각',amount:200000},
    {name:'대출이자',amount:150000},{name:'기타 고정잡비',amount:300000}
  ],
  workDays:26, workMinutes:480, utilRate:0.8, groomers:1,
  cardFee:0.028, targetProfit:1000000, avgMaterial:6000, avgMinutes:108
};

function getCfg(){
  const c=load(KEYS.bep,null);
  if(!c) return JSON.parse(JSON.stringify(DEFAULT_CFG));
  return {...JSON.parse(JSON.stringify(DEFAULT_CFG)),...c,
    fixedCosts:(c.fixedCosts&&c.fixedCosts.length?c.fixedCosts:DEFAULT_CFG.fixedCosts)};
}
function saveCfg(c){ save(KEYS.bep,c); }

// 최근 90일 완료 예약의 평균 결제금액 → 가중평균 가격 추정
function avgTicket(){
  const res=load(KEYS.reservations,[])||[];
  const since=new Date(); since.setDate(since.getDate()-90);
  const sinceStr=since.toISOString().slice(0,10);
  const done=res.filter(r=>r.status==='완료'&&r.date&&r.date>=sinceStr&&Number(r.price)>0);
  if(!done.length) return {avg:0,count:0};
  return {avg:done.reduce((s,r)=>s+Number(r.price),0)/done.length,count:done.length};
}

export function renderBEP(container){
  const target=container||document.getElementById('main-content');
  if(!target) return;
  const cfg=getCfg();
  const F=cfg.fixedCosts.reduce((s,x)=>s+(Number(x.amount)||0),0);

  // 가중평균 공헌이익: 가격표 셀별 (가격-재료비-카드수수료) × 서비스믹스 가중
  const pb=getPricebook();
  const weights={}; let wTotal=0;
  const since=new Date(); since.setDate(since.getDate()-90); const sinceStr=since.toISOString().slice(0,10);
  (load(KEYS.reservations,[])||[]).forEach(r=>{
    if(r.status!=='완료'||!r.date||r.date<sinceStr)return;
    const svc=r.service==='미용'?'전체미용':r.service;
    const tier=r.priceDetail?.tierLabel; if(!svc||!tier)return;
    const k=svc+'|'+tier; weights[k]=(weights[k]||0)+1; wTotal++;
  });
  let Msum=0,Psum=0,Tsum=0,W=0;
  (pb.services||[]).forEach(s=>(pb.tiers||[]).forEach(t=>{
    const p=basePrice(pb,s,t.label); if(!p)return;
    const c=cellCost(pb,s,t.label);
    const w=weights[s+'|'+t.label]||(wTotal?0:1); // 믹스 데이터 없으면 균등 가중
    Msum+=w*(p-c.material-p*cfg.cardFee); Psum+=w*p; Tsum+=w*(c.minutes||cfg.avgMinutes); W+=w;
  }));
  let Mavg,avgPrice,avgMin,sampleN=wTotal;
  if(W>0){ Mavg=Msum/W; avgPrice=Psum/W; avgMin=Tsum/W; }
  else{ // 가격표 데이터 없으면 예약 평균단가 기반 추정
    const {avg:avgP,count}=avgTicket();
    avgPrice=avgP||85000; Mavg=avgPrice*(1-cfg.cardFee)-cfg.avgMaterial; avgMin=cfg.avgMinutes; sampleN=count;
  }
  const marginRate=Mavg/avgPrice;

  const bepCount=F/Mavg;
  const bepRevenue=F/marginRate;
  const dailyTarget=bepCount/cfg.workDays;
  const profitBepCount=(F+cfg.targetProfit)/Mavg;

  // 수용능력
  const availMin=cfg.workDays*cfg.workMinutes*cfg.utilRate*cfg.groomers;
  const maxCount=availMin/avgMin;
  const feasible=bepCount<=maxCount;

  const inp=(id,label,val,step='1')=>`<label style="font-size:12px;color:#555">${label}<input id="${id}" type="number" step="${step}" value="${val}" style="width:100%;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>`;

  target.innerHTML=`
    <div class="yu-page" style="padding:24px">
      <div style="margin-bottom:16px">
        <h2 style="margin:0;font-size:22px;font-weight:800">📊 BEP 분석 (손익분기점)</h2>
        <div style="font-size:13px;color:#6b7280;margin-top:4px">고정비와 공헌이익으로 "월 몇 건 팔아야 본전인지" 계산합니다</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:16px">
        ${[['월 고정비 F',won(F),'','#dc2626'],
           ['가중평균 건당 공헌이익',won(Mavg),`평균단가 ${won(avgPrice)} 기준${sampleN?` (최근90일 ${sampleN}건)`:''}`,'#059669'],
           ['월 BEP 건수',Math.ceil(bepCount)+'건',`일일 ${dailyTarget.toFixed(1)}건`,'#1d4ed8'],
           ['월 BEP 매출',won(bepRevenue),'공헌이익률 '+(marginRate*100).toFixed(1)+'%','#7c3aed'],
           ['목표이익 BEP',Math.ceil(profitBepCount)+'건',`목표 ${won(cfg.targetProfit)}`,'#d97706'],
           ['월 최대 처리 가능',Math.floor(maxCount)+'건',`평균 ${Math.round(avgMin)}분/건 · 가동률 ${cfg.utilRate*100}%`,feasible?'#059669':'#dc2626']
          ].map(([l,v,s,c])=>`
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
            <div style="font-size:12px;color:#6b7280">${l}</div>
            <div style="font-size:20px;font-weight:800;margin-top:4px;color:${c}">${v}</div>
            ${s?`<div style="font-size:11px;color:#9ca3af;margin-top:2px">${s}</div>`:''}
          </div>`).join('')}
      </div>

      ${!feasible?`<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 14px;font-size:13px;color:#dc2626;margin-bottom:16px">⚠️ BEP ${Math.ceil(bepCount)}건이 월 최대 처리 ${Math.floor(maxCount)}건을 초과합니다 — 가격 인상, 고정비 절감, 또는 가동률 상향이 필요합니다.</div>`:''}

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">⚙️ 고정비 항목 (월)</b>
          <div id="fc-list" style="margin-top:10px">
            ${cfg.fixedCosts.map((f,i)=>`
              <div style="display:flex;gap:8px;margin-bottom:6px" data-fc="${i}">
                <input class="fc-name" value="${f.name}" style="flex:1;padding:7px;border:1px solid #ddd;border-radius:7px;font-size:13px">
                <input class="fc-amount" type="number" value="${f.amount}" style="width:130px;padding:7px;border:1px solid #ddd;border-radius:7px;font-size:13px">
                <button class="fc-del" style="border:none;background:none;color:#dc2626;cursor:pointer">✕</button>
              </div>`).join('')}
          </div>
          <button id="fc-add" style="margin-top:6px;padding:6px 14px;border:1px dashed #FF8C00;background:#FFF8F0;color:#E65100;border-radius:8px;font-size:12px;cursor:pointer">+ 항목 추가</button>
        </div>

        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <b style="font-size:14px">⚙️ 운영 조건</b>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
            ${inp('cfg-workDays','월 영업일',cfg.workDays)}
            ${inp('cfg-workMinutes','하루 근무(분)',cfg.workMinutes)}
            ${inp('cfg-utilRate','가동률(0~1)',cfg.utilRate,'0.05')}
            ${inp('cfg-groomers','미용사 수',cfg.groomers)}
            ${inp('cfg-cardFee','카드수수료율(0~1)',cfg.cardFee,'0.001')}
            ${inp('cfg-targetProfit','목표 순이익(원)',cfg.targetProfit)}
            ${inp('cfg-avgMaterial','건당 평균 재료비(원)',cfg.avgMaterial)}
            ${inp('cfg-avgMinutes','평균 소요시간(분)',cfg.avgMinutes)}
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:8px">💡 공헌이익·소요시간은 가격표의 셀별 재료비/표준시간에서 자동 계산됩니다(최근 90일 예약 믹스 가중, 데이터 없으면 균등). 아래 값은 셀에 원가가 없을 때의 fallback입니다.</div>
        </div>
      </div>

      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
        <b style="font-size:14px">💰 가격 조정 시뮬레이터</b>
        <div style="display:flex;gap:8px;align-items:flex-end;margin-top:10px;flex-wrap:wrap">
          <label style="font-size:12px;color:#555">건당 할인/인상 금액(원, 음수=할인)
            <input id="sim-delta" type="number" value="-5000" style="width:140px;padding:8px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
          </label>
          <button id="sim-run" style="padding:9px 18px;background:#FF8C00;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">시뮬레이션</button>
        </div>
        <div id="sim-out" style="margin-top:10px;font-size:13px;line-height:1.8"></div>
      </div>

      <div style="margin-top:14px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;font-size:12px;color:#6b7280;line-height:1.7">
        📌 산출 근거: M = 평균단가 × (1 − 카드수수료율) − 평균 재료비 · BEP 건수 = 고정비 ÷ M · 목표이익 BEP = (고정비 + 목표이익) ÷ M · 최대 처리 = 영업일 × 근무분 × 가동률 ÷ 평균 소요시간<br>
        외부 검토 문서(Profit Management Design v2.0) 기반 — 가격표 셀별 재료비/소요시간 정밀화는 후속 단계.
      </div>
    </div>`;

  // ---- 이벤트 ----
  const collectCfg=()=>{
    const c=getCfg();
    c.fixedCosts=[...document.querySelectorAll('#fc-list [data-fc]')].map(r=>({name:r.querySelector('.fc-name').value.trim()||'항목',amount:Number(r.querySelector('.fc-amount').value)||0}));
    ['workDays','workMinutes','utilRate','groomers','cardFee','targetProfit','avgMaterial','avgMinutes'].forEach(k=>{
      const el=document.getElementById('cfg-'+k); if(el) c[k]=Number(el.value)||0;
    });
    return c;
  };
  const rerender=()=>{saveCfg(collectCfg());renderBEP(target)};

  document.getElementById('fc-add').onclick=()=>{
    const list=document.getElementById('fc-list');
    const i=list.querySelectorAll('[data-fc]').length;
    list.insertAdjacentHTML('beforeend',`<div style="display:flex;gap:8px;margin-bottom:6px" data-fc="${i}">
      <input class="fc-name" placeholder="항목명" style="flex:1;padding:7px;border:1px solid #ddd;border-radius:7px;font-size:13px">
      <input class="fc-amount" type="number" placeholder="금액" style="width:130px;padding:7px;border:1px solid #ddd;border-radius:7px;font-size:13px">
      <button class="fc-del" style="border:none;background:none;color:#dc2626;cursor:pointer">✕</button></div>`);
  };
  document.getElementById('fc-list').addEventListener('click',e=>{
    if(e.target.classList.contains('fc-del')){e.target.closest('[data-fc]').remove();rerender()}
  });
  document.getElementById('fc-list').addEventListener('change',rerender);
  ['workDays','workMinutes','utilRate','groomers','cardFee','targetProfit','avgMaterial','avgMinutes'].forEach(k=>{
    document.getElementById('cfg-'+k).addEventListener('change',rerender);
  });

  document.getElementById('sim-run').onclick=()=>{
    const c=collectCfg();
    const d=Number(document.getElementById('sim-delta').value)||0;
    const F2=c.fixedCosts.reduce((s,x)=>s+(Number(x.amount)||0),0);
    const M2=Mavg-d*(1-c.cardFee); // 할인 시 수수료도 줄어듦
    if(M2<=0){document.getElementById('sim-out').innerHTML='<span style="color:#dc2626">⚠️ 공헌이익이 0 이하가 됩니다.</span>';return}
    const bep2=F2/M2, delta=bep2-bepCount;
    document.getElementById('sim-out').innerHTML=`
      건당 <b>${d>0?'+':''}${won(d)}</b> 조정 시 → 공헌이익 <b>${won(M2)}</b><br>
      BEP <b>${Math.ceil(bepCount)}건 → ${Math.ceil(bep2)}건</b> (${delta>=0?'+':''}${delta.toFixed(1)}건, ${delta>=0?'+':''}${(delta/bepCount*100).toFixed(1)}%)<br>
      ${delta>0?`<span style="color:#dc2626">→ 한 달에 약 ${Math.ceil(delta)}건을 더 확보해야 본전입니다.</span>`:`<span style="color:#059669">→ BEP가 ${Math.abs(delta).toFixed(1)}건 낮아집니다.</span>`}`;
  };
}
