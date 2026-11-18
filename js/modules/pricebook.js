// YUCA v9.6 - 가격표 관리: 체급 구간 + 서비스×체급 행렬 + 가산규칙 + 추가요금
import { getPricebook, savePricebook, calcPrice, calcHotelPrice, calcKgPrice } from '../price-engine.js?v=9.9.1';

const $=s=>document.querySelector(s);
const fmt=n=>Number(n||0).toLocaleString('ko-KR')+'원';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

let pb=null;
let pbTab='groom'; // groom | hotel | kg

function numInp(cls,val,ph='0'){return `<input type="number" class="${cls}" value="${val??''}" placeholder="${ph}" style="width:100%;padding:7px 9px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;text-align:right">`}
function txtInp(cls,val,ph=''){return `<input type="text" class="${cls}" value="${esc(val||'')}" placeholder="${ph}" style="width:100%;padding:7px 9px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px">`}

export function renderPricebook(container){
  const target=container||document.getElementById('main-content');
  if(!target)return;
  pb=getPricebook();
  const tiers=pb.tiers||[], services=pb.services||[];

  target.innerHTML=`
    <div class="yu-page" style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:8px">
        <div>
          <h2 style="margin:0;font-size:22px;font-weight:800">가격표 관리</h2>
          <div style="font-size:13px;color:#6b7280;margin-top:4px">체급 구간 · 서비스별 가격 · 추가요금 규칙 — 예약 시 자동 계산됩니다</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="yu-btn yu-s" id="btn-preview">미리보기 계산</button>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin:12px 0 20px">
        <button class="yu-btn ${pbTab==='groom'?'':'yu-s'}" id="tab-groom" style="padding:8px 18px">미용 가격표</button>
        <button class="yu-btn ${pbTab==='hotel'?'':'yu-s'}" id="tab-hotel" style="padding:8px 18px">호텔 요금제</button>
        <button class="yu-btn ${pbTab==='kg'?'':'yu-s'}" id="tab-kg" style="padding:8px 18px">유치원 요금제</button>
      </div>
      <div id="pb-groom" style="display:${pbTab==='groom'?'block':'none'}">
      <!-- 체급 구간 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <b>체급 구간</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-tier">+ 체급 추가</button>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:8px">체중(kg) 입력 시 자동으로 체급이 판정됩니다. 경계값은 여기서 수정하세요.</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">체급명</th><th style="padding:8px;text-align:right">최소 kg (포함)</th><th style="padding:8px;text-align:right">최대 kg (미만)</th><th style="padding:8px;text-align:right">비우면 무제한</th><th></th></tr></thead>
          <tbody id="tier-body">${tiers.map((t,i)=>`
            <tr style="border-top:1px solid #f3f4f6">
              <td style="padding:6px">${txtInp('tier-name',t.label,'체급명')}</td>
              <td style="padding:6px">${numInp('tier-min',t.minKg)}</td>
              <td style="padding:6px">${numInp('tier-max',t.maxKg)}</td>
              <td style="padding:6px;color:#9ca3af;font-size:11px">${t.maxKg==null?'무제한':''}</td>
              <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-del-tier="${t.id}">삭제</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- 가격 행렬 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <b>서비스 × 체급 기본 가격</b>
          <button class="yu-btn" style="padding:6px 14px;font-size:12px" id="btn-save-prices">가격 저장</button>
        </div>
        <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px">
          <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">서비스</th>${tiers.map(t=>`<th style="padding:8px;text-align:right">${esc(t.label)}</th>`).join('')}</tr></thead>
          <tbody>${services.map((s,si)=>`
            <tr style="border-top:1px solid #f3f4f6">
              <td style="padding:6px;font-weight:600">${esc(s)}</td>
              ${tiers.map(t=>`<td style="padding:6px;width:130px">${numInp(`price-${si}-${t.id}`,pb.prices?.[s]?.[t.label],'원')}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table></div>
        <div style="margin-top:10px;display:flex;gap:8px;align-items:center">
          <input id="new-service" placeholder="새 서비스명 (예: 스파)" style="padding:7px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;width:200px">
          <button class="yu-btn yu-s" style="padding:6px 12px;font-size:12px" id="btn-add-service">+ 서비스 추가</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <!-- 모량/기장 -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>모량/기장 가산</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-coat">+ 추가</button></div>
          <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody id="coat-body">${(pb.coats||[]).map(c=>`
            <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px">${txtInp('coat-name',c.label,'등급명')}</td>
            <td style="padding:6px;width:120px">${numInp('coat-add',c.add,'+금액')}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-del-coat="${c.id}">삭제</button></td></tr>`).join('')}
          </tbody></table>
        </div>
        <!-- 스타일 -->
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>스타일 가산</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-style">+ 추가</button></div>
          <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody id="style-body">${(pb.styles||[]).map(s=>`
            <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px">${txtInp('style-name',s.label,'스타일명')}</td>
            <td style="padding:6px;width:120px">${numInp('style-add',s.add,'+금액')}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-del-style="${s.id}">삭제</button></td></tr>`).join('')}
          </tbody></table>
        </div>
      </div>

      <!-- 추가요금 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <b>추가요금 항목</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-addon">+ 항목 추가</button>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:8px">자동 기준을 입력하면 해당 체중 초과 시 자동 적용됩니다 (예: 대형견 15). 비우면 직원이 수동 체크.</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">항목명</th><th style="padding:8px;text-align:right">금액</th><th style="padding:8px;text-align:right">자동 적용 기준 (kg 초과)</th><th></th></tr></thead>
          <tbody id="addon-body">${(pb.addons||[]).map(ad=>`
            <tr style="border-top:1px solid #f3f4f6">
              <td style="padding:6px">${txtInp('ad-name',ad.name,'항목명')}</td>
              <td style="padding:6px;width:120px">${numInp('ad-price',ad.price,'원')}</td>
              <td style="padding:6px;width:140px">${numInp('ad-over',ad.autoOver,'수동')}</td>
              <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-del-addon="${ad.id}">삭제</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- 미리보기 -->
      <div id="preview-box" style="display:none;background:#fff;border:1px solid #a5b4fc;border-radius:12px;padding:16px"></div>
      </div><!-- /pb-groom -->

      <!-- 호텔 요금제 탭 -->
      <div id="pb-hotel" style="display:${pbTab==='hotel'?'block':'none'}">
        ${hotelTabHTML()}
      </div>

      <!-- 유치원 요금제 탭 -->
      <div id="pb-kg" style="display:${pbTab==='kg'?'block':'none'}">
        ${kgTabHTML()}
      </div>
    </div>`;

  bind(target);
  bindHotel(target);
  bindKg(target);
}

// ---------- 호텔 요금제 탭 ----------
function hotelTabHTML(){
  const h=pb.hotel||{tiers:[],roomTypes:[],prices:{},longStay:[],peak:{},addons:[]};
  const tiers=h.tiers||[], rooms=h.roomTypes||[];
  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <b>체급 구간 (호텔)</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="h-add-tier">+ 체급 추가</button>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">체급명</th><th style="padding:8px;text-align:right">최소 kg</th><th style="padding:8px;text-align:right">최대 kg</th><th></th></tr></thead>
        <tbody id="htier-body">${tiers.map(t=>`
          <tr style="border-top:1px solid #f3f4f6">
            <td style="padding:6px">${txtInp('htier-name',t.label,'체급명')}</td>
            <td style="padding:6px;width:100px">${numInp('htier-min',t.minKg)}</td>
            <td style="padding:6px;width:100px">${numInp('htier-max',t.maxKg)}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-hdel-tier="${t.id}">삭제</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <b>객실타입 × 체급 1박 요금</b>
        <button class="yu-btn" style="padding:6px 14px;font-size:12px" id="h-save-prices">요금 저장</button>
      </div>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">객실</th>${tiers.map(t=>`<th style="padding:8px;text-align:right">${esc(t.label)}</th>`).join('')}</tr></thead>
        <tbody>${rooms.map((r,ri)=>`
          <tr style="border-top:1px solid #f3f4f6">
            <td style="padding:6px;font-weight:600">${esc(r.label)}</td>
            ${tiers.map(t=>`<td style="padding:6px;width:110px">${numInp(`hprice-${ri}-${t.id}`,h.prices?.[r.id]?.[t.label],'원/박')}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <!-- 장기 할인 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>장기 숙박 할인</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="h-add-ls">+ 추가</button></div>
        <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody id="hls-body">${(h.longStay||[]).map((r,i)=>`
          <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px;width:100px">${numInp('hls-nights',r.nights,'박 이상')}</td>
          <td style="padding:6px;width:100px">${numInp('hls-pct',r.pct,'할인%')}</td>
          <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-hdel-ls="${i}">삭제</button></td></tr>`).join('')}
        </tbody></table>
      </div>
      <!-- 성수기 할증 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
        <b style="font-size:14px">성수기 할증</b>
        <div style="margin-top:10px;display:grid;gap:8px;font-size:13px">
          <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" id="hpeak-on" ${h.peak?.enabled?'checked':''}> 성수기 할증 사용</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label>시작일 <input type="date" id="hpeak-start" value="${h.peak?.start||''}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px"></label>
            <label>종료일 <input type="date" id="hpeak-end" value="${h.peak?.end||''}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px"></label>
          </div>
          <label>할증률 <input type="number" id="hpeak-pct" value="${h.peak?.pct??15}" style="width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px"> %</label>
        </div>
      </div>
    </div>

    <!-- 호텔 추가옵션 -->
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>추가 옵션 (1회/1박 기준)</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="h-add-addon">+ 옵션 추가</button></div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">옵션명</th><th style="padding:8px;text-align:right">금액</th><th></th></tr></thead>
        <tbody id="haddon-body">${(h.addons||[]).map(ad=>`
          <tr style="border-top:1px solid #f3f4f6">
            <td style="padding:6px">${txtInp('had-name',ad.name,'옵션명')}</td>
            <td style="padding:6px;width:120px">${numInp('had-price',ad.price,'원')}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-hdel-addon="${ad.id}">삭제</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <button class="yu-btn" style="margin-top:12px" id="h-save-all">호텔 요금표 전체 저장</button>
    </div>

    <!-- 호텔 미리보기 -->
    <div id="hpreview-box" style="display:none;background:#fff;border:1px solid #a5b4fc;border-radius:12px;padding:16px"></div>
  `;
}

function collectHotelEdits(){
  const h=pb.hotel; if(!h)return;
  document.querySelectorAll('#htier-body tr').forEach((tr,i)=>{
    const t=h.tiers[i]; if(!t)return;
    t.label=tr.querySelector('.htier-name').value.trim()||t.label;
    t.minKg=Number(tr.querySelector('.htier-min').value)||0;
    const mx=tr.querySelector('.htier-max').value;
    t.maxKg=(mx===''?null:Number(mx));
  });
  // 장기할인/옵션은 인덱스 기반이므로 행 수 유지 가정
  const lsRows=[...document.querySelectorAll('#hls-body tr')];
  h.longStay=lsRows.map(tr=>({nights:Number(tr.querySelector('.hls-nights').value)||0,pct:Number(tr.querySelector('.hls-pct').value)||0})).filter(r=>r.nights>0);
  document.querySelectorAll('#haddon-body tr').forEach((tr,i)=>{
    const ad=h.addons[i]; if(!ad)return;
    ad.name=tr.querySelector('.had-name').value.trim()||ad.name;
    ad.price=Number(tr.querySelector('.had-price').value)||0;
  });
  h.peak={enabled:!!$('#hpeak-on')?.checked,start:$('#hpeak-start')?.value||'',end:$('#hpeak-end')?.value||'',pct:Number($('#hpeak-pct')?.value)||0};
}

function bindHotel(root){
  $('#tab-groom')?.addEventListener('click',()=>{pbTab='groom';renderPricebook(document.getElementById('main-content'));});
  $('#tab-hotel')?.addEventListener('click',()=>{pbTab='hotel';renderPricebook(document.getElementById('main-content'));});
  if(pbTab!=='hotel') return;
  const h=pb.hotel;

  document.querySelectorAll('#htier-body input').forEach(el=>el.addEventListener('change',()=>{collectHotelEdits();savePricebook(pb);}));
  document.querySelectorAll('#haddon-body input').forEach(el=>el.addEventListener('change',()=>{collectHotelEdits();savePricebook(pb);}));
  ['#hpeak-on','#hpeak-start','#hpeak-end','#hpeak-pct'].forEach(s=>$(s)?.addEventListener('change',()=>{collectHotelEdits();savePricebook(pb);}));

  $('#h-add-tier')?.addEventListener('click',()=>{h.tiers.push({id:uid(),label:`체급${h.tiers.length+1}`,minKg:0,maxKg:null});savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  $('#h-add-ls')?.addEventListener('click',()=>{h.longStay.push({nights:4,pct:5});savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  $('#h-add-addon')?.addEventListener('click',()=>{h.addons.push({id:uid(),name:'신규 옵션',price:0});savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-hdel-tier]').forEach(b=>b.onclick=()=>{h.tiers=h.tiers.filter(t=>t.id!==b.dataset.hdelTier);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-hdel-ls]').forEach(b=>b.onclick=()=>{h.longStay.splice(Number(b.dataset.hdelLs),1);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-hdel-addon]').forEach(b=>b.onclick=()=>{h.addons=h.addons.filter(a=>a.id!==b.dataset.hdelAddon);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});

  $('#h-save-prices')?.addEventListener('click',()=>{
    collectHotelEdits();
    h.prices={};
    h.roomTypes.forEach((r,ri)=>{
      h.prices[r.id]={};
      h.tiers.forEach(t=>{
        const v=document.querySelector(`.hprice-${ri}-${t.id}`)?.value;
        h.prices[r.id][t.label]=v===''?0:(Number(v)||0);
      });
    });
    savePricebook(pb);
    alert('호텔 요금표가 저장되었습니다.');
  });

  $('#h-save-all')?.addEventListener('click',()=>{
    collectHotelEdits();
    h.prices={};
    h.roomTypes.forEach((r,ri)=>{
      h.prices[r.id]={};
      h.tiers.forEach(t=>{
        const v=document.querySelector(`.hprice-${ri}-${t.id}`)?.value;
        h.prices[r.id][t.label]=v===''?0:(Number(v)||0);
      });
    });
    savePricebook(pb);
    alert('호텔 요금표 전체가 저장되었습니다.');
  });
}

function collectEdits(){
  // DOM의 input 값들을 pb에 반영 (저장 전 호출)
  document.querySelectorAll('#tier-body tr').forEach((tr,i)=>{
    const t=pb.tiers[i]; if(!t)return;
    t.label=tr.querySelector('.tier-name').value.trim()||t.label;
    t.minKg=Number(tr.querySelector('.tier-min').value)||0;
    const mx=tr.querySelector('.tier-max').value;
    t.maxKg=(mx===''?null:Number(mx));
  });
  document.querySelectorAll('#coat-body tr').forEach((tr,i)=>{
    const c=pb.coats[i]; if(!c)return;
    c.label=tr.querySelector('.coat-name').value.trim()||c.label;
    c.add=Number(tr.querySelector('.coat-add').value)||0;
  });
  document.querySelectorAll('#style-body tr').forEach((tr,i)=>{
    const s=pb.styles[i]; if(!s)return;
    s.label=tr.querySelector('.style-name').value.trim()||s.label;
    s.add=Number(tr.querySelector('.style-add').value)||0;
  });
  document.querySelectorAll('#addon-body tr').forEach((tr,i)=>{
    const ad=pb.addons[i]; if(!ad)return;
    ad.name=tr.querySelector('.ad-name').value.trim()||ad.name;
    ad.price=Number(tr.querySelector('.ad-price').value)||0;
    const ov=tr.querySelector('.ad-over').value;
    ad.autoOver=(ov===''?null:Number(ov));
  });
}
function persist(){collectEdits();savePricebook(pb);}

function bind(root){
  // 체급 입력 → 라벨 변경 시 가격 행렬 키도 갱신 필요하므로 가격저장 시 처리
  document.querySelectorAll('#tier-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));
  document.querySelectorAll('#coat-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));
  document.querySelectorAll('#style-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));
  document.querySelectorAll('#addon-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));

  $('#btn-save-prices').onclick=()=>{
    collectEdits();
    // 가격 입력 수집
    pb.prices={};
    pb.services.forEach((s,si)=>{
      pb.prices[s]={};
      pb.tiers.forEach(t=>{
        const v=document.querySelector(`.price-${si}-${t.id}`)?.value;
        pb.prices[s][t.label]=v===''?0:(Number(v)||0);
      });
    });
    savePricebook(pb);
    alert('가격표가 저장되었습니다.');
  };

  $('#btn-add-tier').onclick=()=>{pb.tiers.push({id:uid(),label:`체급${pb.tiers.length+1}`,minKg:0,maxKg:null});savePricebook(pb);renderPricebook(document.getElementById('main-content'));};
  $('#btn-add-service').onclick=()=>{const v=$('#new-service').value.trim();if(!v)return alert('서비스명을 입력하세요');if(pb.services.includes(v))return alert('이미 있는 서비스입니다');pb.services.push(v);pb.prices[v]={};pb.tiers.forEach(t=>pb.prices[v][t.label]=0);savePricebook(pb);renderPricebook(document.getElementById('main-content'));};
  $('#btn-add-coat').onclick=()=>{pb.coats.push({id:uid(),label:'신규 등급',add:0});savePricebook(pb);renderPricebook(document.getElementById('main-content'));};
  $('#btn-add-style').onclick=()=>{pb.styles.push({id:uid(),label:'신규 스타일',add:0});savePricebook(pb);renderPricebook(document.getElementById('main-content'));};
  $('#btn-add-addon').onclick=()=>{pb.addons.push({id:uid(),name:'신규 항목',price:0,autoOver:null});savePricebook(pb);renderPricebook(document.getElementById('main-content'));};

  root.querySelectorAll('[data-del-tier]').forEach(b=>b.onclick=()=>{pb.tiers=pb.tiers.filter(t=>t.id!==b.dataset.delTier);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-del-coat]').forEach(b=>b.onclick=()=>{pb.coats=pb.coats.filter(c=>c.id!==b.dataset.delCoat);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-del-style]').forEach(b=>b.onclick=()=>{pb.styles=pb.styles.filter(s=>s.id!==b.dataset.delStyle);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-del-addon]').forEach(b=>b.onclick=()=>{pb.addons=pb.addons.filter(a=>a.id!==b.dataset.delAddon);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});

  $('#btn-preview').onclick=()=>{
    persist();
    const box=$('#preview-box'); box.style.display='block';
    box.innerHTML=`<b style="font-size:14px">가격 미리보기</b>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:10px;font-size:13px">
        ${pb.services.map(s=>`<div style="background:#f9fafb;border-radius:10px;padding:10px"><b>${esc(s)}</b><div style="margin-top:6px;color:#374151">${pb.tiers.map(t=>`${esc(t.label)} ${fmt(pb.prices?.[s]?.[t.label])}`).join('<br>')}</div></div>`).join('')}
      </div>`;
  };
}

// ---------- 유치원 요금제 탭 ----------
function kgTabHTML(){
  const k=pb.kg||{tiers:[],oneTime:{},hourly:{},monthly:{},addons:[]};
  const tiers=k.tiers||[];
  const ot=Object.keys(k.oneTime||{});
  const freqs=Object.keys(k.monthly||{});
  return `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <b>체급 구간 (유치원)</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="k-add-tier">+ 체급 추가</button>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">체급명</th><th style="padding:8px;text-align:right">최소 kg</th><th style="padding:8px;text-align:right">최대 kg</th><th></th></tr></thead>
        <tbody id="ktier-body">${tiers.map(t=>`
          <tr style="border-top:1px solid #f3f4f6">
            <td style="padding:6px">${txtInp('ktier-name',t.label,'체급명')}</td>
            <td style="padding:6px;width:100px">${numInp('ktier-min',t.minKg)}</td>
            <td style="padding:6px;width:100px">${numInp('ktier-max',t.maxKg)}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-kdel-tier="${t.id}">삭제</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>단건 요금 (1회 종일 / 반일)</b></div>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:480px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">구분</th>${tiers.map(t=>`<th style="padding:8px;text-align:right">${esc(t.label)}</th>`).join('')}</tr></thead>
        <tbody>${ot.map((p,pi)=>`
          <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px;font-weight:600">${esc(p)}</td>
            ${tiers.map(t=>`<td style="padding:6px;width:110px">${numInp(`kot-${pi}-${t.id}`,k.oneTime[p][t.label],'원')}</td>`).join('')}
          </tr>`).join('')}
          <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px;font-weight:600">시간당 단가</td>
            ${tiers.map(t=>`<td style="padding:6px;width:110px">${numInp('khourly-'+t.id,k.hourly?.[t.label],'원/h')}</td>`).join('')}
          </tr>
        </tbody>
      </table></div>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>월정액 (주 N회 × 체급)</b></div>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:560px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">횟수</th>${tiers.map(t=>`<th style="padding:8px;text-align:right">${esc(t.label)}</th>`).join('')}</tr></thead>
        <tbody>${freqs.map((f,fi)=>`
          <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px;font-weight:600">${esc(f)}</td>
            ${tiers.map(t=>`<td style="padding:6px;width:110px">${numInp(`kmon-${fi}-${t.id}`,k.monthly[f][t.label],'원/월')}</td>`).join('')}
          </tr>`).join('')}
        </tbody>
      </table></div>
      <div style="font-size:12px;color:#6b7280;margin-top:8px">월정액은 월 1회 결제 기록용입니다. 월정액 이용 출석은 '월정액 이용' 플랜(0원)으로 등록하세요.</div>
    </div>

    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>추가 옵션</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="k-add-addon">+ 옵션 추가</button></div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">옵션명</th><th style="padding:8px;text-align:right">금액</th><th></th></tr></thead>
        <tbody id="kaddon-body">${(k.addons||[]).map(ad=>`
          <tr style="border-top:1px solid #f3f4f6">
            <td style="padding:6px">${txtInp('kad-name',ad.name,'옵션명')}</td>
            <td style="padding:6px;width:120px">${numInp('kad-price',ad.price,'원')}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-kdel-addon="${ad.id}">삭제</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
      <button class="yu-btn" style="margin-top:12px" id="k-save-all">유치원 요금표 전체 저장</button>
    </div>

    <div id="kpreview-box" style="display:none;background:#fff;border:1px solid #a5b4fc;border-radius:12px;padding:16px"></div>
  `;
}

function collectKgEdits(){
  const k=pb.kg; if(!k)return;
  document.querySelectorAll('#ktier-body tr').forEach((tr,i)=>{
    const t=k.tiers[i]; if(!t)return;
    t.label=tr.querySelector('.ktier-name').value.trim()||t.label;
    t.minKg=Number(tr.querySelector('.ktier-min').value)||0;
    const mx=tr.querySelector('.ktier-max').value;
    t.maxKg=(mx===''?null:Number(mx));
  });
  const otKeys=Object.keys(k.oneTime||{});
  document.querySelectorAll('#kb-ot tr, table tbody tr').forEach(()=>{}); // noop
  // 단건/시간제 수집
  const tables=document.querySelectorAll('#pb-kg table');
  // 단건 표: rows = ot + hourly row
  if(tables[1]){
    const rows=[...tables[1].querySelectorAll('tbody tr')];
    otKeys.forEach((p,pi)=>{
      const tr=rows[pi]; if(!tr)return;
      k.tiers.forEach((t,ti)=>{
        const v=tr.querySelectorAll('td')[ti+1]?.querySelector('input')?.value;
        k.oneTime[p][t.label]=v===''?0:(Number(v)||0);
      });
    });
    const htr=rows[otKeys.length];
    if(htr) k.tiers.forEach((t,ti)=>{
      const v=htr.querySelectorAll('td')[ti+1]?.querySelector('input')?.value;
      k.hourly=k.hourly||{}; k.hourly[t.label]=v===''?0:(Number(v)||0);
    });
  }
  // 월정액 표
  if(tables[2]){
    const freqs=Object.keys(k.monthly||{});
    const rows=[...tables[2].querySelectorAll('tbody tr')];
    freqs.forEach((f,fi)=>{
      const tr=rows[fi]; if(!tr||!k.monthly[f])return;
      k.tiers.forEach((t,ti)=>{
        const v=tr.querySelectorAll('td')[ti+1]?.querySelector('input')?.value;
        k.monthly[f][t.label]=v===''?0:(Number(v)||0);
      });
    });
  }
  document.querySelectorAll('#kaddon-body tr').forEach((tr,i)=>{
    const ad=k.addons[i]; if(!ad)return;
    ad.name=tr.querySelector('.kad-name').value.trim()||ad.name;
    ad.price=Number(tr.querySelector('.kad-price').value)||0;
  });
}

function bindKg(root){
  $('#tab-kg')?.addEventListener('click',()=>{pbTab='kg';renderPricebook(document.getElementById('main-content'));});
  if(pbTab!=='kg') return;
  const k=pb.kg;
  document.querySelectorAll('#ktier-body input').forEach(el=>el.addEventListener('change',()=>{collectKgEdits();savePricebook(pb);}));
  document.querySelectorAll('#kaddon-body input').forEach(el=>el.addEventListener('change',()=>{collectKgEdits();savePricebook(pb);}));
  $('#k-add-tier')?.addEventListener('click',()=>{k.tiers.push({id:uid(),label:`체급${k.tiers.length+1}`,minKg:0,maxKg:null});savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  $('#k-add-addon')?.addEventListener('click',()=>{k.addons.push({id:uid(),name:'신규 옵션',price:0});savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-kdel-tier]').forEach(b=>b.onclick=()=>{k.tiers=k.tiers.filter(t=>t.id!==b.dataset.kdelTier);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  root.querySelectorAll('[data-kdel-addon]').forEach(b=>b.onclick=()=>{k.addons=k.addons.filter(a=>a.id!==b.dataset.kdelAddon);savePricebook(pb);renderPricebook(document.getElementById('main-content'));});
  $('#k-save-all')?.addEventListener('click',()=>{
    collectKgEdits(); savePricebook(pb); alert('유치원 요금표가 저장되었습니다.');
  });
}
