// settings.js - YUCA v8.5 고급 설정 - 데이터 관리 + 사용 매뉴얼 + 고급 설정 통합
import { load, save, KEYS } from '../storage.js';

export function renderSettings(container){
  const SETTINGS_KEY = 'yuca_settings';
  const defaultSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  const allData = {};
  Object.keys(KEYS).forEach(k => { allData[k] = load(KEYS[k]) || []; });

  container.innerHTML = `
  <div style="padding:20px;max-width:1200px">
    <h2>⚙️ 설정 <small style="color:#f97316">v8.5 고급 설정</small></h2>
    <div style="display:flex;gap:8px;margin-top:16px;border-bottom:2px solid #eee">
      <button class="tabBtn active" data-tab="data" style="padding:10px 18px;border:none;border-bottom:3px solid #f97316;background:#fff;font-weight:bold;cursor:pointer;border-radius:10px 10px 0 0">📦 데이터 관리</button>
      <button class="tabBtn" data-tab="manual" style="padding:10px 18px;border:none;border-bottom:3px solid transparent;background:#f9fafb;cursor:pointer">📖 사용 매뉴얼</button>
      <button class="tabBtn" data-tab="code" style="padding:10px 18px;border:none;border-bottom:3px solid transparent;background:#f9fafb;cursor:pointer">💻 코드 설명</button>
      <button class="tabBtn" data-tab="advanced" style="padding:10px 18px;border:none;border-bottom:3px solid transparent;background:#f9fafb;cursor:pointer">🔧 고급 설정</button>
    </div>

    <div id="tab-data" class="tabPane" style="background:#fff;padding:20px;border-radius:0 16px 16px 16px;margin-top:-2px">
      <h3>데이터 관리</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
        <div style="padding:16px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa">
          <h4>💾 백업 & 내보내기</h4>
          <button id="btnExportJson" style="width:100%;margin-top:8px;padding:12px;border-radius:10px;background:#f97316;color:#fff;border:none;font-weight:bold;cursor:pointer">📤 전체 내보내기 (JSON)</button>
          <button id="btnExportCsv" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer">📊 고객 CSV 내보내기</button>
          <button id="btnBackupLocal" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer">💾 로컬 백업 생성</button>
          <div style="margin-top:10px;font-size:11px;color:#888">마지막 백업: ${localStorage.getItem('yuca_last_backup')||'없음'}<br>Firebase: yuca-2026-c22e8</div>
        </div>
        <div style="padding:16px;background:#fef2f2;border-radius:12px;border:1px solid #fecaca">
          <h4>⚠️ 복구 & 초기화</h4>
          <label style="display:block;padding:10px;background:#fff;border-radius:10px;border:1px dashed #f87171;cursor:pointer;text-align:center;margin-top:8px">📥 JSON 가져오기<input type="file" id="fileImportJson" accept=".json" style="display:none"></label>
          <button id="btnRestoreBackup" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer">♻️ 로컬 백업 복구</button>
          <button id="btnClearAll" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#dc2626;color:#fff;border:none;font-weight:bold;cursor:pointer">🗑️ 전체 초기화</button>
        </div>
      </div>
      <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:12px">
        <h4>📊 현재 데이터 현황</h4>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px;font-size:12px">
          ${Object.entries(allData).map(([k,v])=>`<div style="padding:8px;background:#fff;border-radius:8px;border:1px solid #eee"><b>${k}</b>: ${Array.isArray(v)?v.length:0}개</div>`).join('')}
        </div>
        <div style="margin-top:10px;font-size:11px;color:#888">v8.5 Professional | HTML/CSS/JS 분리형 + Firebase + 제품 필터 + 매출리포트 + 문자 필터/검색 + 모바일 PWA + 네이버 연동</div>
      </div>
    </div>

    <div id="tab-manual" class="tabPane" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;margin-top:-2px">
      <h3>📖 사용 매뉴얼</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
        <div style="padding:14px;background:#fff7ed;border-radius:12px;border-left:4px solid #f97316">
          <h4>💬 문자 매뉴얼</h4>
          <div style="font-size:12px;line-height:1.7;margin-top:8px">
            <b>변수:</b> {이름} {반려견} {날짜} {서비스} {시간}<br>
            <div style="padding:8px;background:#fff;border-radius:8px;margin-top:6px">안녕하세요 {이름}님! {반려견}의 {날짜} {서비스} 예약 확정!</div>
            <br><b>필터:</b> 전체/미용/유치원/호텔별 발송, 검색 가능
          </div>
        </div>
        <div style="padding:14px;background:#e8f5e9;border-radius:12px;border-left:4px solid #2db400">
          <h4>🟢 네이버 예약 매뉴얼</h4>
          <div style="font-size:12px;line-height:1.7;margin-top:8px">
            <b>왜 연동?</b> 보안(네이버 ID) + 결제(네이버페이) + 알림(알림톡 무료) 위임<br><br>
            <b>3분 컷:</b><br>1. smartplace.naver.com 등록<br>2. partner.booking.naver.com 예약 상품 등록<br>3. 링크 복사 → 모바일 설정에 붙여넣기 → 저장
          </div>
        </div>
      </div>
    </div>

    <div id="tab-code" class="tabPane" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;margin-top:-2px">
      <h3>💻 코드 설명</h3>
      <div style="padding:14px;background:#1e293b;color:#e2e8f0;border-radius:12px;font-family:monospace;font-size:12px;margin-top:10px">
        <div style="color:#f97316">// 문자 템플릿 치환</div>
        text.replace(/{이름}/g,customer.name).replace(/{반려견}/g,customer.petName)<br><br>
        <div style="color:#22c55e">// 네이버 QR 생성</div>
        const qrUrl = \`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=\${encodeURIComponent(NAVER_URL)}\`<br><br>
        <div style="color:#60a5fa">// Firebase 이중 저장</div>
        localStorage.setItem(key, JSON.stringify(data));<br>
        firebaseDB.ref(key).set(data);
      </div>
    </div>

    <div id="tab-advanced" class="tabPane" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;margin-top:-2px">
      <h3>🔧 고급 설정</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:12px">
        <div style="padding:16px;background:#f9fafb;border-radius:12px">
          <h4>🏪 매장 정보</h4>
          <input id="cfgShopName" value="${defaultSettings.shopName||'YUCA 애견'}" placeholder="매장명" style="width:100%;margin-top:8px;padding:10px;border:1px solid #ddd;border-radius:8px">
          <input id="cfgPhone" value="${defaultSettings.shopPhone||''}" placeholder="전화번호" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px">
          <input id="cfgAddr" value="${defaultSettings.shopAddr||''}" placeholder="주소" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px">
        </div>
        <div style="padding:16px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0">
          <h4>🟢 네이버 연동</h4>
          <label style="display:flex;gap:8px;padding:8px;background:#fff;border-radius:8px;margin-top:8px"><input type="checkbox" id="cfgUseNaver" ${defaultSettings.useNaver!==false?'checked':''}> 네이버 우선</label>
          <input id="cfgNaverBooking" value="${defaultSettings.naverBookingUrl||''}" placeholder="네이버 예약 URL" style="width:100%;margin-top:8px;padding:10px;border:1px solid #2db400;border-radius:8px;font-size:12px">
          <input id="cfgNaverPlace" value="${defaultSettings.naverPlaceUrl||''}" placeholder="네이버 플레이스 URL" style="width:100%;margin-top:8px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:12px">
        </div>
      </div>
      <button id="btnSaveAdvanced" style="width:100%;margin-top:16px;padding:12px;border-radius:10px;background:#111;color:#fff;border:none;font-weight:bold;cursor:pointer">💾 고급 설정 저장</button>
    </div>
  </div>`;

  container.querySelectorAll('.tabBtn').forEach(btn=>{
    btn.onclick = ()=>{
      container.querySelectorAll('.tabBtn').forEach(b=>{ b.style.borderBottom='3px solid transparent'; b.style.background='#f9fafb'; b.style.fontWeight='normal'; });
      btn.style.borderBottom='3px solid #f97316'; btn.style.background='#fff'; btn.style.fontWeight='bold';
      container.querySelectorAll('.tabPane').forEach(p=>p.style.display='none');
      container.querySelector(`#tab-${btn.dataset.tab}`).style.display='block';
    };
  });

  container.querySelector('#btnExportJson')?.addEventListener('click', ()=>{
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download=`YUCA_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
    localStorage.setItem('yuca_last_backup', new Date().toLocaleString());
  });
  container.querySelector('#btnSaveAdvanced')?.addEventListener('click', ()=>{
    const cur = JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
    const next = {...cur, shopName: container.querySelector('#cfgShopName').value, shopPhone: container.querySelector('#cfgPhone').value, shopAddr: container.querySelector('#cfgAddr').value, useNaver: container.querySelector('#cfgUseNaver').checked, naverBookingUrl: container.querySelector('#cfgNaverBooking').value, naverPlaceUrl: container.querySelector('#cfgNaverPlace').value };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    alert('✅ 저장 완료!');
  });
}