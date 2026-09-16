// YUCA v6.7 - 대시보드 v6.7 (실시간 데이터 연동)
import { load, KEYS } from '../storage.js';

export function renderDashboard(container){
  const target = container || document.getElementById('content');
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
  
  // 매출 (예약 1건당 3만원으로 가정 - 나중에 실제 매출 테이블로 교체)
  const estimatedSales = todayResCount * 32000;
  
  // 최근 예약 5개
  const recentRes = [...reservations].sort((a,b)=> (b.date||'').localeCompare(a.date||'')).slice(0,5);

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <div>
        <h2 style="margin:0">📊 대시보드</h2>
        <small style="color:#888">${today} 오늘 현황</small>
      </div>
      <button onclick="location.reload()" style="padding:8px 14px;border:1px solid #ddd;border-radius:8px;background:white;cursor:pointer">🔄 새로고침</button>
    </div>

    <!-- 통계 카드 4개 -->
    <div class="grid grid-4" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="card" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-left:4px solid #FF8C00">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="color:#888;font-size:13px">오늘 예약</div><div style="font-size:28px;font-weight:700;margin-top:4px">${todayResCount}건</div></div>
          <div style="font-size:36px">📅</div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:#666">전체 예약: ${reservations.length}건</div>
      </div>

      <div class="card" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-left:4px solid #4CAF50">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="color:#888;font-size:13px">오늘 예상 매출</div><div style="font-size:24px;font-weight:700;margin-top:4px">₩${estimatedSales.toLocaleString()}</div></div>
          <div style="font-size:36px">💰</div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:#666">고객 ${totalCustomers}명 · 제품 ${totalProducts}개</div>
      </div>

      <div class="card" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-left:4px solid #2196F3">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="color:#888;font-size:13px">유치원 등원</div><div style="font-size:28px;font-weight:700;margin-top:4px">${kindergarten.length}마리</div></div>
          <div style="font-size:36px">🏫</div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:#666">일 3만원 · 알림 필요</div>
      </div>

      <div class="card" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);border-left:4px solid #9C27B0">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="color:#888;font-size:13px">호텔 투숙</div><div style="font-size:28px;font-weight:700;margin-top:4px">${hotel.length}마리</div></div>
          <div style="font-size:36px">🏨</div>
        </div>
        <div style="margin-top:10px;font-size:12px;color:#666">S01 M01 L01 SUITE</div>
      </div>
    </div>

    <!-- 아래 2단 -->
    <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:16px">
      <div class="card" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <h3 style="margin:0 0 14px">📌 최근 예약</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead style="background:#f8f9fa"><tr><th style="padding:8px;text-align:left">날짜</th><th style="padding:8px;text-align:left">고객</th><th style="padding:8px">서비스</th><th style="padding:8px">상태</th></tr></thead>
          <tbody>
            ${recentRes.length===0? `<tr><td colspan="4" style="text-align:center;padding:24px;color:#888">예약 없음</td></tr>` :
              recentRes.map(r=>`
                <tr style="border-top:1px solid #f0f0f0">
                  <td style="padding:8px">${r.date||'-'}</td>
                  <td style="padding:8px">${r.name||'-'}</td>
                  <td style="padding:8px;text-align:center"><span style="background:#FFF3E0;color:#FF8C00;padding:2px 8px;border-radius:10px;font-size:12px">${r.service||'미용'}</span></td>
                  <td style="padding:8px;text-align:center"><span style="background:#E8F5E9;color:#2E7D32;padding:2px 8px;border-radius:10px;font-size:12px">${r.status||'확정'}</span></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <div class="card" style="background:white;border-radius:12px;padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <h3 style="margin:0 0 14px">⚡ 빠른 실행</h3>
        <div style="display:grid;gap:10px">
          <button onclick="navigate('customers')" style="padding:12px;border:1px solid #FF8C00;border-radius:8px;background:#FFF8F0;color:#FF8C00;font-weight:600;cursor:pointer;text-align:left">👥 고객관리 (${totalCustomers})</button>
          <button onclick="navigate('reservations')" style="padding:12px;border:1px solid #4CAF50;border-radius:8px;background:#F1F8E9;color:#2E7D32;font-weight:600;cursor:pointer;text-align:left">📅 예약관리 (${reservations.length})</button>
          <button onclick="navigate('products')" style="padding:12px;border:1px solid #2196F3;border-radius:8px;background:#E3F2FD;color:#1565C0;font-weight:600;cursor:pointer;text-align:left">📦 제품관리 (${totalProducts})</button>
          <button onclick="exportDB()" style="padding:12px;border:1px solid #ddd;border-radius:8px;background:white;color:#666;font-weight:600;cursor:pointer;text-align:left">💾 백업 내보내기</button>
        </div>
        <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#666">
          <div>💡 Firebase: ${localStorage.getItem('yuca_firebase_ok')?'연결됨':'확인중'}</div>
          <div style="margin-top:4px">📌 마지막 페이지: ${localStorage.getItem('yuca_last_page')||'dashboard'}</div>
        </div>
      </div>
    </div>
  `;
}