// mobile.js - YUCA v8.4 네이버 연동 + 설정 기능 완전 보완 - FINAL
import { load, KEYS } from '../storage.js';

export function renderMobile(container){
  const SETTINGS_KEY = 'yuca_settings';
  const defaultSettings = {
    shopName: 'YUCA 애견',
    shopPhone: '010-1234-5678',
    shopAddr: '대구 영진전문대 근처',
    naverBookingUrl: 'https://booking.naver.com/booking/13/bizes/1234567',
    naverPlaceUrl: 'https://m.place.naver.com/place/1234567',
    useNaver: true,
    msgBooking: '네이버 예약으로 간편하게 예약하세요!',
    msgWelcome: '반려견을 가족처럼 모십니다'
  };
  const settings = {...defaultSettings, ...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')};
  
  const baseUrl = location.origin + location.pathname.replace(/\/[^\/]*$/, '/');
  const YUCA_MOBILE_URL = baseUrl + '?view=mobile';
  const YUCA_BOOKING_URL = baseUrl + '?view=booking';
  
  const naverBookingUrl = settings.naverBookingUrl;
  const naverPlaceUrl = settings.naverPlaceUrl;
  
  const qrNaverBooking = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(naverBookingUrl)}`;
  const qrNaverPlace = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(naverPlaceUrl)}`;
  const qrMyPage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(YUCA_MOBILE_URL)}`;
  const qrBookingInternal = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(YUCA_BOOKING_URL)}`;

  container.innerHTML = `
  <div style="padding:20px;max-width:1400px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h2>📱 모바일 연동 <small style="color:#2db400">v8.4 설정 기능 완전 보완</small></h2>
      <span style="padding:6px 12px;border-radius:20px;background:${settings.useNaver?'#e8f5e9':'#fff7ed'};border:1px solid ${settings.useNaver?'#2db400':'#fed7aa'};font-size:12px;font-weight:bold;color:${settings.useNaver?'#2db400':'#f97316'}">${settings.useNaver?'🟢 네이버 연동 ON':'🟠 자체 예약 ON'}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 380px;gap:16px;margin-top:16px">
      <div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div style="background:#fff;padding:16px;border-radius:16px;text-align:center;border:2px solid ${settings.useNaver?'#2db400':'#ddd'};position:relative">
            ${settings.useNaver?'<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#2db400;color:#fff;padding:2px 10px;border-radius:10px;font-size:10px;font-weight:bold">메인 사용</div>':''}
            <h4>🟢 네이버 예약</h4>
            <img src="${qrNaverBooking}" style="width:180px;height:180px;border-radius:12px;border:1px solid #eee">
            <div style="font-size:11px;color:#666;margin-top:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${naverBookingUrl}</div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <button onclick="navigator.clipboard.writeText('${naverBookingUrl}')" style="flex:1;padding:8px;border-radius:20px;border:1px solid #ddd;background:#fff">복사</button>
              <button onclick="window.open('${naverBookingUrl}','_blank')" style="flex:1;padding:8px;border-radius:20px;background:#2db400;color:#fff;border:none;font-weight:bold">열기</button>
            </div>
          </div>
          <div style="background:#fff;padding:16px;border-radius:16px;text-align:center;border:1px solid #eee">
            <h4>📍 네이버 플레이스</h4>
            <img src="${qrNaverPlace}" style="width:180px;height:180px;border-radius:12px;border:1px solid #eee">
            <button onclick="window.open('${naverPlaceUrl}','_blank')" style="width:100%;margin-top:8px;padding:8px;border-radius:20px;background:#111;color:#fff;border:none">지도</button>
          </div>
          <div style="background:#fff;padding:16px;border-radius:16px;text-align:center;border:1px solid #fed7aa;opacity:${settings.useNaver?'0.6':'1'}">
            <h4>📱 자체 예약 ${!settings.useNaver?'●':''}</h4>
            <img src="${qrBookingInternal}" style="width:180px;height:180px;border-radius:12px;border:1px solid #eee">
            <button onclick="window.open('${YUCA_BOOKING_URL}','_blank')" style="width:100%;margin-top:8px;padding:8px;border-radius:20px;background:#f97316;color:#fff;border:none">자체 예약</button>
          </div>
        </div>
      </div>
      <div style="background:#fff;padding:18px;border-radius:16px;border:1px solid #e5e7eb;position:sticky;top:20px;height:fit-content">
        <h4>⚙️ 설정 v8.4</h4>
        <div style="margin-top:12px"><label style="font-size:12px;font-weight:bold">🏪 매장 정보</label>
          <input id="cfgShopName" value="${settings.shopName}" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:10px">
          <input id="cfgShopPhone" value="${settings.shopPhone}" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:10px">
          <input id="cfgShopAddr" value="${settings.shopAddr}" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:10px">
        </div>
        <div style="margin-top:12px"><label style="font-size:12px;font-weight:bold">🟢 네이버 연동</label>
          <div style="margin-top:8px;display:flex;gap:8px;padding:10px;background:#e8f5e9;border-radius:10px"><input type="checkbox" id="cfgUseNaver" ${settings.useNaver?'checked':''}><label for="cfgUseNaver">네이버 우선</label></div>
          <input id="cfgNaverBooking" value="${settings.naverBookingUrl}" style="width:100%;margin-top:8px;padding:10px;border:1px solid #2db400;border-radius:10px;font-size:12px">
          <input id="cfgNaverPlace" value="${settings.naverPlaceUrl}" style="width:100%;margin-top:8px;padding:10px;border:1px solid #ddd;border-radius:10px;font-size:12px">
        </div>
        <div style="margin-top:12px"><label style="font-size:12px;font-weight:bold">💬 메시지</label>
          <input id="cfgMsgWelcome" value="${settings.msgWelcome}" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:10px">
        </div>
        <button id="btnSaveSettings" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;border:none;background:#111;color:#fff;font-weight:bold;cursor:pointer">💾 저장 & QR 재생성</button>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="btnResetSettings" style="flex:1;padding:10px;border-radius:12px;border:1px solid #ddd;background:#fff">🔄 초기화</button>
          <button id="btnTestNaver" style="flex:1;padding:10px;border-radius:12px;border:1px solid #2db400;background:#e8f5e9;color:#2db400;font-weight:bold">🔗 테스트</button>
        </div>
      </div>
    </div>
  </div>`;

  container.querySelector('#btnSaveSettings').onclick = ()=>{
    const newSettings = {
      shopName: container.querySelector('#cfgShopName').value.trim(),
      shopPhone: container.querySelector('#cfgShopPhone').value.trim(),
      shopAddr: container.querySelector('#cfgShopAddr').value.trim(),
      naverBookingUrl: container.querySelector('#cfgNaverBooking').value.trim(),
      naverPlaceUrl: container.querySelector('#cfgNaverPlace').value.trim(),
      useNaver: container.querySelector('#cfgUseNaver').checked,
      msgBooking: defaultSettings.msgBooking,
      msgWelcome: container.querySelector('#cfgMsgWelcome').value.trim(),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    alert('✅ 저장 완료! QR이 재생성됩니다.');
    renderMobile(container);
  };
  container.querySelector('#btnResetSettings').onclick = ()=>{ if(confirm('초기화?')){ localStorage.removeItem(SETTINGS_KEY); renderMobile(container);} };
  container.querySelector('#btnTestNaver').onclick = ()=>{ window.open(container.querySelector('#cfgNaverBooking').value.trim(),'_blank'); };
}