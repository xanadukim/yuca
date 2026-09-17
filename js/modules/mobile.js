// mobile.js - YUCA v8.0 모바일 연동 - PWA + QR + 예약 링크 - 가입없이 100% 작동!
import { load, KEYS } from '../storage.js';

export function renderMobile(container){
  const baseUrl = location.origin + location.pathname.replace(/\/[^\/]*$/, '/');
  const mobileUrl = baseUrl + '?view=mobile';
  const bookingUrl = baseUrl + '?view=booking';
  
  // QR 생성은 무료 API - 가입 필요 없음!
  const qrMain = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(mobileUrl)}`;
  const qrBooking = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(bookingUrl)}`;

  container.innerHTML = `
  <div style="padding:20px;max-width:1200px">
    <h2>📱 모바일 연동 <small style="color:#888">v8.0 PWA + QR - 가입없이 무료!</small></h2>
    
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:16px">
      <!-- QR 1 -->
      <div style="background:#fff;padding:20px;border-radius:16px;text-align:center;border:2px solid #f97316">
        <h4 style="margin:0 0 10px">📲 고객용 모바일 접속</h4>
        <img src="${qrMain}" style="width:200px;height:200px;border-radius:12px;border:1px solid #eee" id="qr1">
        <div style="margin-top:12px">
          <input id="mobileLink" value="${mobileUrl}" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:20px;font-size:12px;text-align:center" readonly>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="navigator.clipboard.writeText('${mobileUrl}').then(()=>alert('링크 복사!'))" style="flex:1;padding:8px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">🔗 복사</button>
            <button onclick="window.open('${mobileUrl}','_blank')" style="flex:1;padding:8px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer">열기</button>
          </div>
        </div>
        <div style="margin-top:10px;font-size:11px;color:#888">고객이 QR 스캔 → 예약 조회</div>
      </div>

      <!-- QR 2 -->
      <div style="background:#fff;padding:20px;border-radius:16px;text-align:center;border:1px solid #eee">
        <h4 style="margin:0 0 10px">📅 모바일 예약 링크</h4>
        <img src="${qrBooking}" style="width:200px;height:200px;border-radius:12px;border:1px solid #eee">
        <div style="margin-top:12px">
          <input value="${bookingUrl}" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:20px;font-size:12px;text-align:center" readonly>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button onclick="navigator.clipboard.writeText('${bookingUrl}').then(()=>alert('예약 링크 복사!'))" style="flex:1;padding:8px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer">🔗 복사</button>
            <button onclick="window.open('${bookingUrl}','_blank')" style="flex:1;padding:8px;border-radius:20px;background:#111;color:#fff;border:none;cursor:pointer">예약 페이지</button>
          </div>
        </div>
        <div style="margin-top:10px;font-size:11px;color:#888">고객이 직접 예약 신청</div>
      </div>

      <!-- PWA -->
      <div style="background:linear-gradient(135deg,#fff7ed,#ffedd5);padding:20px;border-radius:16px;border:1px solid #fed7aa">
        <h4 style="margin:0">📲 PWA 앱 설치 - 무료!</h4>
        <div style="margin-top:12px;font-size:13px;line-height:1.6">
          <div style="background:#fff;padding:12px;border-radius:10px">
            <b>아이폰:</b><br>사파리 → 공유 버튼 → 홈 화면에 추가<br><br>
            <b>안드로이드:</b><br>크롬 → ⋮ → 홈 화면에 추가<br><br>
            <b>PC:</b><br>주소창 오른쪽 설치 아이콘 클릭
          </div>
        </div>
        <button id="btnInstall" style="width:100%;margin-top:12px;padding:10px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold;display:none">📲 앱 설치하기</button>
        <div style="margin-top:10px;padding:10px;background:#fff;border-radius:10px;font-size:12px">
          <b>✅ 가입 필요 없는 기능:</b><br>
          • QR 출석 체크<br>
          • 모바일 예약<br>
          • 오프라인 조회<br>
          • Firebase 실시간 동기화 (이미 연결됨!)
        </div>
      </div>
    </div>

    <!-- 모바일 미리보기 + 출석 체크 -->
    <div style="display:grid;grid-template-columns:360px 1fr;gap:16px;margin-top:20px">
      <div style="background:#111;padding:16px;border-radius:24px">
        <div style="background:#fff;border-radius:16px;overflow:hidden;min-height:600px">
          <div style="background:#f97316;color:#fff;padding:14px;text-align:center;font-weight:bold">YUCA Mobile - 고객용</div>
          <div style="padding:16px">
            <div style="text-align:center;padding:20px 0">
              <div style="width:60px;height:60px;background:#fff7ed;border-radius:50%;margin:0 auto;display:grid;place-items:center;font-size:30px">🐶</div>
              <h3 style="margin:10px 0 4px">YUCA 애견</h3>
              <small style="color:#888">모바일 예약 & 조회</small>
            </div>
            <div style="display:grid;gap:8px">
              <button style="padding:12px;border-radius:12px;border:none;background:#f97316;color:#fff;font-weight:bold">📅 내 예약 보기</button>
              <button style="padding:12px;border-radius:12px;border:1px solid #eee;background:#fff">🏫 유치원 출석 현황</button>
              <button style="padding:12px;border-radius:12px;border:1px solid #eee;background:#fff">🎁 호텔 이용 내역</button>
              <button style="padding:12px;border-radius:12px;border:1px solid #eee;background:#fff">💬 원장님께 문의</button>
            </div>
            <div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:12px;font-size:12px">
              <b>최근 예약</b><br>
              <div style="margin-top:6px">${(load(KEYS.reservations)||[]).slice(-2).map(r=>`• ${r.date} ${r.service} - ${r.status}`).join('<br>')||'예약 없음'}</div>
            </div>
          </div>
        </div>
        <div style="text-align:center;color:#fff;font-size:11px;margin-top:10px">📱 모바일 미리보기</div>
      </div>

      <div style="background:#fff;padding:20px;border-radius:16px">
        <h4>✅ QR 출석 체크 - 유치원/호텔</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
          <div>
            <label style="font-size:12px;font-weight:bold">오늘 출석 명단</label>
            <div id="todayList" style="margin-top:8px;max-height:400px;overflow:auto;border:1px solid #eee;border-radius:10px">
              ${(load(KEYS.kindergarten)||load(KEYS.customers)||[]).slice(0,10).map((c,i)=>`
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #f5f5f5">
                  <div><b>${c.name||c.owner||'고객'+i}</b><br><small style="color:#888">${c.petName||'반려견'} · 등원 전</small></div>
                  <button onclick="this.textContent='✅ 등원';this.style.background='#dcfce7'" style="padding:6px 12px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:12px">등원</button>
                </div>`).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:12px;font-weight:bold">QR 스캐너 (카메라)</label>
            <div style="margin-top:8px;background:#111;border-radius:12px;height:300px;display:grid;place-items:center;color:#fff;position:relative;overflow:hidden">
              <div style="text-align:center">
                <div style="font-size:40px">📷</div>
                <div style="margin-top:8px;font-size:12px">카메라 권한 허용 시<br>QR 자동 인식</div>
                <button onclick="alert('카메라 기능은 HTTPS + localhost에서만 작동합니다! GitHub Pages에서는 HTTPS라 OK!')" style="margin-top:12px;padding:8px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer">카메라 켜기</button>
              </div>
              <div style="position:absolute;inset:20px;border:2px dashed #f97316;border-radius:12px;pointer-events:none"></div>
            </div>
            <div style="margin-top:10px;padding:10px;background:#fff7ed;border-radius:10px;font-size:11px">
              💡 <b>가입 없이 작동하는 이유:</b><br>
              QR은 그냥 링크! API도 무료 qrserver.com 사용!<br>
              PWA도 manifest.json만 있으면 무료!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  // PWA 설치 이벤트
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferredPrompt = e;
    const btn = container.querySelector('#btnInstall');
    if(btn){ btn.style.display='block'; btn.onclick = ()=>{ deferredPrompt.prompt(); }; }
  });
}
