// YUCA v10.0 - 가격표 관리: 체급 구간 + 서비스×체급 행렬 + 가산규칙 + 추가요금 (미용 전용)
import { getPricebook, savePricebook } from '../price-engine.js?v=10.1.0';

const $=s=>document.querySelector(s);
const fmt=n=>Number(n||0).toLocaleString('ko-KR')+'원';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);

let pb=null;

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
        <button class="yu-btn yu-s" id="btn-preview">미리보기</button>
      </div>

      <!-- 체급 구간 -->
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <b>체급 구간</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-tier">+ 체급 추가</button>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:8px">체중(kg) 입력 시 자동으로 체급이 판정됩니다.</div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="background:#f9fafb;text-align:left"><th style="padding:8px">체급명</th><th style="padding:8px;text-align:right">최소 kg (포함)</th><th style="padding:8px;text-align:right">최대 kg (미만)</th><th></th></tr></thead>
          <tbody id="tier-body">${tiers.map(t=>`
            <tr style="border-top:1px solid #f3f4f6">
              <td style="padding:6px">${txtInp('tier-name',t.label,'체급명')}</td>
              <td style="padding:6px">${numInp('tier-min',t.minKg)}</td>
              <td style="padding:6px">${numInp('tier-max',t.maxKg)}</td>
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
          <input id="new-service" placeholder="새 서비스명" style="padding:7px 10px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;width:200px">
          <button class="yu-btn yu-s" style="padding:6px 12px;font-size:12px" id="btn-add-service">+ 서비스 추가</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>모량/기장 가산</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-coat">+ 추가</button></div>
          <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody id="coat-body">${(pb.coats||[]).map(c=>`
            <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px">${txtInp('coat-name',c.label,'등급명')}</td>
            <td style="padding:6px;width:120px">${numInp('coat-add',c.add,'+금액')}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-del-coat="${c.id}">삭제</button></td></tr>`).join('')}
          </tbody></table>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>스타일 가산</b><button class="yu-btn yu-s" style="padding:5px 12px;font-size:12px" id="btn-add-style">+ 추가</button></div>
          <table style="width:100%;border-collapse:collapse;font-size:13px"><tbody id="style-body">${(pb.styles||[]).map(s=>`
            <tr style="border-top:1px solid #f3f4f6"><td style="padding:6px">${txtInp('style-name',s.label,'스타일명')}</td>
            <td style="padding:6px;width:120px">${numInp('style-add',s.add,'+금액')}</td>
            <td style="padding:6px;text-align:right"><button class="yu-btn yu-d" style="padding:3px 8px;font-size:11px" data-del-style="${s.id}">삭제</button></td></tr>`).join('')}
          </tbody></table>
        </div>
      </div>

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

      <div id="preview-box" style="display:none;background:#fff;border:1px solid #a5b4fc;border-radius:12px;padding:16px"></div>
    </div>`;

  bind(target);
}

function collectEdits(){
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
  document.querySelectorAll('#tier-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));
  document.querySelectorAll('#coat-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));
  document.querySelectorAll('#style-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));
  document.querySelectorAll('#addon-body input').forEach(el=>el.addEventListener('change',()=>{collectEdits();savePricebook(pb);}));

  $('#btn-save-prices').onclick=()=>{
    collectEdits();
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
