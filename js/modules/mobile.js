
import {getDBStats} from '../storage.js';
export function renderMobile(c){
  const stats=getDBStats();
  const qr=Array.from({length:400},()=>Math.random()>0.5?'black':'');
  c.innerHTML=`
  <div class="header"><h2>📱 모바일 연동</h2><span class="badge badge-green">PWA Ready</span></div>
  <div class="grid grid-2">
    <div class="card"><h3>QR 코드</h3><div style="display:flex;justify-content:center;margin:16px 0"><div class="qr">${qr.map(x=>`<div class="${x}"></div>`).join('')}</div></div><p style="text-align:center;font-size:13px;color:#6B7280">모바일 스캔 → 고객 대기표</p><p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:4px">https://kim-yuca.github.io/yuca-test/</p></div>
    <div class="card"><h3>PWA 설치 가이드</h3><div style="margin-top:12px;line-height:2;font-size:14px"><div>📱 Android: 크롬 → ⋮ → 홈 화면에 추가</div><div>🍎 iPhone: 사파리 → 공유 → 홈 화면에 추가</div></div><button class="btn btn-orange" style="margin-top:16px;width:100%" onclick="alert('브라우저 메뉴에서 홈 화면에 추가를 눌러주세요!')">설치하기</button></div>
  </div>
  <div class="grid grid-3" style="margin-top:16px">
    <div class="card"><b>grooming.db</b><br><span class="badge badge-green">● healthy</span><div style="margin-top:8px;font-size:13px">고객 ${stats.yuca_customers||0}건 / 예약 ${stats.yuca_reservations||0}건</div><div style="font-size:11px;color:#9CA3AF">last sync: 방금</div></div>
    <div class="card"><b>kindergarten.db</b><br><span class="badge badge-green">● healthy</span><div style="margin-top:8px;font-size:13px">등원 ${stats.yuca_kindergarten||0}건</div><div style="font-size:11px;color:#9CA3AF">last sync: 방금</div></div>
    <div class="card"><b>hotel.db</b><br><span class="badge badge-green">● healthy</span><div style="margin-top:8px;font-size:13px">투숙 ${stats.yuca_hotel||0}건</div><div style="font-size:11px;color:#9CA3AF">last sync: 방금</div></div>
  </div>
  <div class="grid grid-2" style="margin-top:16px">
    <div class="card"><h3>모바일 미리보기</h3><div class="phone-frame" style="margin-top:12px"><div style="background:#FF7A00;color:#fff;padding:12px;text-align:center;font-weight:700">YUCA</div><div style="padding:12px;font-size:13px">고객 리스트 로딩중...</div><div style="padding:0 12px"><div style="border:1px solid #F3F4F6;border-radius:10px;padding:8px;margin-bottom:8px">콩이 (푸들) - 등원중</div><div style="border:1px solid #F3F4F6;border-radius:10px;padding:8px">보리 (비숑) - 미용중</div></div></div></div>
    <div class="card"><h3>모바일 설정</h3><div style="margin-top:12px"><label style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #F3F4F6"><span>푸시 알림</span><input type="checkbox" checked></label><label style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #F3F4F6"><span>자동 동기화</span><input type="checkbox" checked></label><label style="display:flex;justify-content:space-between;padding:12px 0"><span>다크 모드</span><input type="checkbox"></label></div><div style="margin-top:16px"><h4>DB 상태</h4><div style="font-size:12px;color:#6B7280;margin-top:8px;line-height:1.8">✅ grooming.db 연결됨<br>✅ kindergarten.db 연결됨<br>✅ hotel.db 연결됨</div></div></div>
  </div>`;
}
