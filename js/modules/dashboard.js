// YUCA v6.7 - 대시보드 v6.7 (실시간 데이터 연동)
import { load, KEYS } from '../storage.js';

export function renderDashboard(container){
  const target = container || document.getElementById('main-content');
  if(!target) return;

  // 데이터 불러오기
  const customers = load(KEYS.customers, []);
  const reservations = load(KEYS.reservations, []);
  const products = load(KEYS.products, []);
  
  // 오늘 날짜
  const today = new Date().toISOString().slice(0,10);
  const todayRes = reservations.filter(r => r.date === today || r.date === today.replace(/-/g,'/'));
  
  // 유치원/호텔은 아직 데이터가 없으면 0
  let kindergarten = [];
  let hotel = [];
  try{ kindergarten = load(KEYS.kindergarten, []); }catch(e){}
  try{ hotel = load(KEYS.hotel, []); }catch(e){}
  if(!Array.isArray(kindergarten)) kindergarten = [];
  if(!Array.isArray(hotel)) hotel = [];

  // 통계 계산
  const todayResCount = todayRes.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  
  // 오늘 매출 (취소 제외, price 없으면 예약폼 기본가 32000)
  const estimatedSales = todayRes.filter(r=>r.status!=='취소').reduce((s,r)=>s+(parseInt(r.price)||32000),0);
  
  // 최근 예약 5개
  const recentRes = [...reservations].sort((a,b)=> (b.date||'').localeCompare(a.date||'')).slice(0,5);

  // 오늘의 일정 (예약+유치원+호텔 시간순)
  const todayItems = [];
  todayRes.forEach(r=>todayItems.push({t:r.time||'',icon:'✂️',title:`${r.petName||r.name||'고객'} 미용`,sub:r.service||'',st:r.status||'확정'}));
  kindergarten.filter(k=>k.date===today||k.checkIn===today||k.checkin===today).forEach(k=>todayItems.push({t:k.time||'09:00',icon:'🏫',title:`${k.childName||k.petName||k.name||'-'} 등원`,sub:'유치원',st:'확정'}));
  hotel.filter(h=>h.checkIn===today||h.checkin===today||h.startDate===today||h.date===today).forEach(h=>todayItems.push({t:h.checkInTime||h.time||'15:00',icon:'🏨',title:`${h.petName||h.name||'-'} 투숙`,sub:h.room||h.roomType||'호텔',st:'확정'}));
  todayItems.sort((a,b)=>String(a.t).localeCompare(String(b.t)));

  const hour = new Date().getHours();
  const greet = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '좋은 오후예요' : '좋은 저녁이에요';

  target.innerHTML = `
    <div style="display:grid;gap:20px">

      <!-- Duo 히어로 (한 줄) -->
      <div class="duo-hero" style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:30px 42px">
        <div>
          <div style="font-family:'Jua',sans-serif;font-size:34px;font-weight:400;color:#fff;letter-spacing:0.5px">${greet}, YUCA 팀! 👋 오늘도 활기찬 하루예요.</div>
          <div style="font-size:15px;color:rgba(255,255,255,.92);margin-top:20px">📅 ${today} · 오늘 예약 ${todayResCount}건 · 예상 매출 ₩${estimatedSales.toLocaleString()} · 투숙 ${hotel.length}마리 · 등원 ${kindergarten.length}마리</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1;flex:none">
          <button class="duo-btn duo-btn--white" onclick="navigate('reservations')">예약 보기</button>
          <button class="duo-btn duo-btn--white" style="background:rgba(255,255,255,.85)" onclick="navigate('sms')">문자 보내기</button>
        </div>
      </div>

      <!-- 스탯 카드 4개 -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px">
        <div class="duo-card">
          <div class="duo-stat">
            <div class="duo-stat__icon">📅</div>
            <div>
              <div class="duo-stat__label">오늘 예약</div>
              <div class="duo-stat__value">${todayResCount}<span style="font-size:15px;color:#777">건</span></div>
              <div class="duo-stat__sub">전체 ${reservations.length}건</div>
            </div>
          </div>
        </div>
        <div class="duo-card">
          <div class="duo-stat">
            <div class="duo-stat__icon" style="background:#fff1d9">💰</div>
            <div>
              <div class="duo-stat__label">오늘 예상 매출</div>
              <div class="duo-stat__value" style="font-size:22px">₩${estimatedSales.toLocaleString()}</div>
              <div class="duo-stat__sub">고객 ${totalCustomers}명 · 제품 ${totalProducts}개</div>
            </div>
          </div>
        </div>
        <div class="duo-card">
          <div class="duo-stat">
            <div class="duo-stat__icon" style="background:#ddf4fe">🏫</div>
            <div>
              <div class="duo-stat__label">유치원 등원</div>
              <div class="duo-stat__value">${kindergarten.length}<span style="font-size:15px;color:#777">마리</span></div>
              <div class="duo-stat__sub">일 3만원 · 알림 필요</div>
            </div>
          </div>
        </div>
        <div class="duo-card">
          <div class="duo-stat">
            <div class="duo-stat__icon" style="background:#f3e8ff">🏨</div>
            <div>
              <div class="duo-stat__label">호텔 투숙</div>
              <div class="duo-stat__value">${hotel.length}<span style="font-size:15px;color:#777">마리</span></div>
              <div class="duo-stat__sub">S01 M01 L01 SUITE</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 오늘의 일정 -->
      <div class="duo-card">
        <h3 style="margin:0 0 12px">🗓️ 오늘의 일정 <span style="font-size:12px;color:#888;font-weight:400">${todayItems.length}건</span></h3>
        ${todayItems.length===0 ? '<div style="padding:16px;text-align:center;color:#999;font-size:13px">오늘 등록된 일정이 없습니다</div>' :
        `<div style="display:flex;gap:10px;flex-wrap:wrap">${todayItems.map(it=>`
          <div style="display:flex;align-items:center;gap:8px;background:#f7f7f7;border:1px solid #eee;border-radius:12px;padding:8px 14px">
            <span style="font-size:15px">${it.icon}</span>
            <span style="font-size:12px;color:#888;min-width:38px">${it.t||'--:--'}</span>
            <b style="font-size:13px">${it.title}</b>
            ${it.sub?`<span style="font-size:11px;color:#999">${it.sub}</span>`:''}
            ${it.st==='취소'?'<span class="pb pb-red">취소</span>':'<span class="pb pb-green">확정</span>'}
          </div>`).join('')}</div>`}
      </div>

      <!-- 아래 2단 -->
      <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:14px">
        <div class="duo-card">
          <h3 style="margin:0 0 14px">📌 최근 예약</h3>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr><th style="padding:8px;text-align:left">날짜</th><th style="padding:8px;text-align:left">고객</th><th style="padding:8px">서비스</th><th style="padding:8px">상태</th></tr></thead>
            <tbody>
              ${recentRes.length===0? `<tr><td colspan="4" style="text-align:center;padding:24px;color:#888">예약 없음</td></tr>` :
                recentRes.map(r=>`
                <tr style="border-top:1px solid #f0f0f0">
                  <td style="padding:8px">${r.date||'-'}</td>
                  <td style="padding:8px">${r.name||'-'}</td>
                  <td style="padding:8px;text-align:center"><span class="duo-tag duo-tag--orange">${r.service||'미용'}</span></td>
                  <td style="padding:8px;text-align:center"><span class="duo-tag ${r.status==='취소'?'duo-tag--red':'duo-tag--green'}">${r.status||'확정'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="duo-card">
          <h3 style="margin:0 0 14px">⚡ 빠른 실행</h3>
          <div style="display:grid;gap:10px">
            <button class="duo-btn duo-btn--primary" style="justify-content:flex-start" onclick="navigate('customers')">👥 고객관리 (${totalCustomers})</button>
            <button class="duo-btn duo-btn--primary" style="justify-content:flex-start;background:#1cb0f6;box-shadow:0 4px 0 #1899d6" onclick="navigate('reservations')">📅 예약관리 (${reservations.length})</button>
            <button class="duo-btn duo-btn--primary" style="justify-content:flex-start;background:#9c27b0;box-shadow:0 4px 0 #7b1fa2" onclick="navigate('products')">📦 제품관리 (${totalProducts})</button>
            <button class="duo-btn duo-btn--ghost" style="justify-content:flex-start;border:2px solid #e5e5e5" onclick="exportDB()">💾 백업 내보내기</button>
          </div>
          <div style="margin-top:16px;padding:12px;background:#f7f7f7;border:2px solid #e5e5e5;border-radius:12px;font-size:12px;color:#777">
            <div>💡 Firebase: ${localStorage.getItem('yuca_firebase_ok')?'연결됨':'확인중'}</div>
            <div style="margin-top:4px">📌 마지막 페이지: ${localStorage.getItem('yuca_page')||'dashboard'}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}