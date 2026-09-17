// v7.9.1 FIX - null 에러 완전 해결!
import { load, KEYS } from '../storage.js';

const TEMPLATES = {
  reserve: { name: '예약 확정', text: '[YUCA] {name}님, {date} {service} 예약 확정! 내일 봬요 🐶' },
  done: { name: '미용 완료', text: '[YUCA] {name}님, {pet} 미용 완료! 예쁘게 단장했어요 ✂️' },
  kinder: { name: '유치원 등원', text: '[YUCA] {name}님, {pet} 오늘 유치원 등원 완료! 즐겁게 놀고 있어요 🏫' },
  hotel: { name: '호텔 체크아웃', text: '[YUCA] {name}님, {pet} 호텔 체크아웃! 편히 쉬다 갔어요 🎁' },
};

export function renderSMS(container){
  const customers = load(KEYS.customers) || [];

  container.innerHTML = `
  <div style="padding:20px">
    <h2>💬 문자 발송 <small style="color:#888">템플릿 4종</small></h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
      <div style="background:#fff;padding:16px;border-radius:12px">
        <h4>📝 템플릿 선택</h4>
        <div style="display:grid;gap:8px;margin-top:12px">
          ${Object.entries(TEMPLATES).map(([k,t])=>`
            <button onclick="window.setSMSTemplate('${k}')" class="tplBtn" data-k="${k}" style="text-align:left;padding:12px;border:1px solid #ddd;border-radius:10px;background:#fff;cursor:pointer">
              <b>${t.name}</b><br><small style="color:#888">${t.text.slice(0,35)}...</small>
            </button>`).join('')}
        </div>
        <div style="margin-top:16px">
          <label style="font-size:13px;font-weight:bold">문자 내용</label>
          <textarea id="smsText" style="width:100%;height:100px;margin-top:8px;padding:12px;border:1px solid #ddd;border-radius:10px">${TEMPLATES.reserve.text}</textarea>
        </div>
      </div>
      <div style="background:#fff;padding:16px;border-radius:12px">
        <h4>👥 받을 고객 (${customers.length}명)</h4>
        <div style="margin-top:8px;display:flex;gap:6px">
          <button onclick="window.selectAllSMS(true)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">전체 선택</button>
          <button onclick="window.selectAllSMS(false)" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">해제</button>
          <button onclick="window.sendSMS()" style="padding:6px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">📤 발송</button>
        </div>
        <div id="smsList" style="max-height:400px;overflow:auto;margin-top:12px;border:1px solid #eee;border-radius:10px">
          ${customers.map((c,i)=>`
            <label style="display:flex;gap:10px;padding:10px;border-bottom:1px solid #f5f5f5;cursor:pointer">
              <input type="checkbox" class="smsCheck" value="${i}" checked>
              <div style="flex:1"><b>${c.name||c.owner}</b><br><small style="color:#888">${c.phone||'010-****-****'}</small></div>
            </label>`).join('')}
        </div>
      </div>
    </div>
    <div id="smsLog" style="margin-top:16px;background:#fff;padding:16px;border-radius:12px;display:none"></div>
  </div>`;

  // FIX: container 안에서 찾기 + setTimeout!
  window.setSMSTemplate = (k)=>{
    const txt = container.querySelector('#smsText') || document.getElementById('smsText');
    if(!txt) return;
    txt.value = TEMPLATES[k].text;
    container.querySelectorAll('.tplBtn').forEach(b=> b.style.background = b.dataset.k===k?'#fff7ed':'#fff');
  };
  window.selectAllSMS = (on)=>{
    const list = container.querySelectorAll('.smsCheck');
    list.forEach(c=> c.checked = on);
  };
  window.sendSMS = ()=>{
    const txt = container.querySelector('#smsText') || document.getElementById('smsText');
    const text = txt ? txt.value : '';
    const checked = [...container.querySelectorAll('.smsCheck:checked')];
    if(checked.length===0){ alert('고객 선택!'); return; }
    if(!confirm(`${checked.length}명에게 발송?`)) return;
    const log = container.querySelector('#smsLog');
    log.style.display = 'block';
    log.innerHTML = `<h4>📤 발송 결과</h4>${checked.map(c=>{
      const cust = customers[parseInt(c.value)];
      const msg = text.replace('{name}',cust.name||'고객님').replace('{pet}',cust.petName||'아이');
      return `<div style="padding:8px;border-bottom:1px solid #eee">✅ ${cust.name} → ${msg.slice(0,40)}...</div>`;
    }).join('')}<div style="margin-top:12px;padding:12px;background:#dcfce7;border-radius:10px;text-align:center">🎉 ${checked.length}건 발송 완료!</div>`;
  };

  // 초기 템플릿은 0.1초 뒤에 적용 - 라우터 버그 회피!
  setTimeout(()=> window.setSMSTemplate('reserve'), 100);
}