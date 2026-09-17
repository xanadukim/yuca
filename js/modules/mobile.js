// mobile.js - YUCA v8.3 네이버 예약 연동 - 임시 버전
import { load, KEYS } from '../storage.js';

export function renderMobile(container){
  const baseUrl = location.origin + location.pathname.replace(/\/[^\/]*$/, '/');
  
  // 임시 네이버 예약 링크 - 실제 등록 후 교체!
  const NAVER_BOOKING_URL = "https://booking.naver.com/booking/13/bizes/1234567"; 
  const NAVER_PLACE_URL = "https://m.place.naver.com/place/1234567";
  const YUCA_MOBILE_URL = baseUrl + "?view=mobile";
  
  const qrNaverBooking = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(NAVER_BOOKING_URL)}`;
  const qrNaverPlace = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(NAVER_PLACE_URL)}`;
  const qrMyPage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(YUCA_MOBILE_URL)}`;

  container.innerHTML = `
  <div style="padding:20px">
    <h2>📱 모바일 연동 <small style="color:#2db400">v8.3 네이버 예약 연동 (임시)</small></h2>
    <div style="margin-top:8px;padding:12px;background:#e8f5e9;border-radius:10px;font-size:13px">✅ 로그인/결제/알림은 네이버가 다 해줌! 우리는 링크만!</div>
    
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px">
      
      <div style="background:#fff;padding:20px;border-radius:16px;text-align:center;border:2px solid #2db400;box-shadow:0 4px 12px rgba(45,180,0,0.15)">
        <div style="background:#2db400;color:#fff;display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:bold">추천! 메인 예약</div>
        <h4 style="margin:10px 0">🟢 네이버 예약하기</h4>
        <img src="${qrNaverBooking}" style="width:220px;height:220px;border-radius:12px;border:1px solid #eee">
        <div style="margin-top:12px">
          <input value="${NAVER_BOOKING_URL}" readonly style="width:100%;padding:10px;border:1px solid #ddd;border-radius:20px;font-size:11px;text-align:center">
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="navigator.clipboard.writeText('${NAVER_BOOKING_URL}').then(()=>alert('복사 완료!'))" style="flex:1;padding:10px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">🔗 복사</button>
            <button onclick="window.open('${NAVER_BOOKING_URL}','_blank')" style="flex:1;padding:10px;border-radius:20px;background:#2db400;color:#fff;border:none;cursor:pointer;font-weight:bold">예약하기</button>
          </div>
        </div>
        <div style="margin-top:10px;font-size:11px;color:#666;line-height:1.4">고객: 네이버 로그인 → 날짜 선택 → 결제<br><b>우리는 관리만!</b></div>
      </div>

      <div style="background:#fff;padding:20px;border-radius:16px;text-align:center;border:1px solid #eee">
        <h4 style="margin:0 0 10px">📍 네이버 플레이스</h4>
        <img src="${qrNaverPlace}" style="width:220px;height:220px;border-radius:12px;border:1px solid #eee">
        <div style="margin-top:12px">
          <input value="${NAVER_PLACE_URL}" readonly style="width:100%;padding:10px;border:1px solid #ddd;border-radius:20px;font-size:11px;text-align:center">
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="navigator.clipboard.writeText('${NAVER_PLACE_URL}')" style="flex:1;padding:10px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">🔗 복사</button>
            <button onclick="window.open('${NAVER_PLACE_URL}','_blank')" style="flex:1;padding:10px;border-radius:20px;background:#111;color:#fff;border:none;cursor:pointer">지도 보기</button>
          </div>
        </div>
        <div style="margin-top:10px;font-size:11px;color:#888">리뷰 / 사진 / 영업시간 노출</div>
      </div>

      <div style="background:#fff;padding:20px;border-radius:16px;text-align:center;border:1px solid #fed7aa">
        <h4 style="margin:0 0 10px">📱 내 예약 조회 (YUCA)</h4>
        <img src="${qrMyPage}" style="width:220px;height:220px;border-radius:12px;border:1px solid #eee">
        <div style="margin-top:12px">
          <input value="${YUCA_MOBILE_URL}" readonly style="width:100%;padding:10px;border:1px solid #ddd;border-radius:20px;font-size:11px;text-align:center">
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="navigator.clipboard.writeText('${YUCA_MOBILE_URL}')" style="flex:1;padding:10px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">🔗 복사</button>
            <button onclick="window.open('${YUCA_MOBILE_URL}','_blank')" style="flex:1;padding:10px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer">조회</button>
          </div>
        </div>
        <div style="margin-top:10px;font-size:11px;color:#888">로그인: 전화번호로 내 예약만 보기</div>
      </div>

    </div>

    <div style="margin-top:20px;display:grid;grid-template-columns:360px 1fr;gap:16px">
      <div style="background:#111;padding:12px;border-radius:20px">
        <div style="background:#fff;border-radius:12px;overflow:hidden">
          <div style="background:#2db400;color:#fff;padding:12px;text-align:center;font-weight:bold">네이버 예약 플로우</div>
          <div style="padding:16px;font-size:13px;line-height:1.8">
            1️⃣ 고객이 QR 스캔<br>
            2️⃣ 네이버 로그인 (자동)<br>
            3️⃣ 서비스 선택: 미용/유치원/호텔<br>
            4️⃣ 날짜/시간 선택<br>
            5️⃣ 네이버페이 결제 (선택)<br>
            6️⃣ 확정 알림톡 발송 (네이버가 무료로!)<br>
            <div style="margin-top:12px;padding:10px;background:#e8f5e9;border-radius:8px;text-align:center">
              <b>→ YUCA 대시보드에 자동 등록!</b><br><small>(v9.0 API 연동 시)</small>
            </div>
          </div>
        </div>
      </div>

      <div style="background:#fff;padding:20px;border-radius:16px">
        <h4>🔧 설정 방법 (3분 컷)</h4>
        <div style="margin-top:12px;display:grid;gap:10px;font-size:13px">
          <div style="padding:12px;border:1px solid #eee;border-radius:10px"><b>1. 스마트플레이스 등록</b><br><a href="https://m.place.naver.com" target="_blank" style="color:#2db400">m.place.naver.com</a> → 업체 등록 → YUCA 애견</div>
          <div style="padding:12px;border:1px solid #eee;border-radius:10px"><b>2. 예약 파트너센터</b><br><a href="https://partner.booking.naver.com" target="_blank" style="color:#2db400">partner.booking.naver.com</a> → 예약 상품 등록</div>
          <div style="padding:12px;border:2px solid #2db400;border-radius:10px;background:#f1f8e9"><b>3. 링크 교체 (1줄!)</b><br><code style="font-size:11px">const NAVER_BOOKING_URL = "여기에 본인 링크 붙여넣기";</code><br><small>지금은 임시 링크 (1234567) - 실제 링크로 바꾸면 끝!</small></div>
        </div>
        <div style="margin-top:16px;padding:12px;background:#fff7ed;border-radius:10px;font-size:12px">
          💡 YUCA는 자체 로그인 대신 네이버 예약과 연동하여 보안/결제/알림을 위임하고, 관리자는 대시보드에서 통합 관리하는 구조입니다.
        </div>
      </div>
    </div>
  </div>`;
}
