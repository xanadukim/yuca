// v7.8 매출리포트 - 마지막 메뉴
export function renderReports(container){
  const r = JSON.parse(localStorage.getItem('yuca_reservations')||'[]');
  const k = JSON.parse(localStorage.getItem('yuca_kindergarten')||'[]');
  const h = JSON.parse(localStorage.getItem('yuca_hotel')||'[]');
  const p = JSON.parse(localStorage.getItem('yuca_products')||'[]');
  const e = JSON.parse(localStorage.getItem('yuca_employees')||'[]');
  const total = r.length*50000 + k.length*30000 + h.length*50000;
  const prodVal = p.reduce((s,x)=>s+x.price*x.stock,0);

  container.innerHTML=`
  <div style="padding:20px">
    <h2>📊 매출리포트 <small style="color:#888">v7.8 완성!</small></h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:16px 0">
      <div style="background:#fff7ed;padding:18px;border-radius:14px"><div style="font-size:12px;color:#888">미용 예약</div><div style="font-size:20px;font-weight:bold">₩${(r.length*50000).toLocaleString()}</div><small>${r.length}건</small></div>
      <div style="background:#fef3c7;padding:18px;border-radius:14px"><div style="font-size:12px;color:#888">유치원</div><div style="font-size:20px;font-weight:bold">₩${(k.length*30000).toLocaleString()}</div><small>${k.length}건</small></div>
      <div style="background:#dcfce7;padding:18px;border-radius:14px"><div style="font-size:12px;color:#888">호텔</div><div style="font-size:20px;font-weight:bold">₩${(h.length*50000).toLocaleString()}</div><small>${h.length}박</small></div>
      <div style="background:#f97316;color:#fff;padding:18px;border-radius:14px"><div>총 매출</div><div style="font-size:24px;font-weight:bold">₩${total.toLocaleString()}</div><small>재고가치 ₩${prodVal.toLocaleString()}</small></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="background:#fff;padding:16px;border-radius:12px"><h4>📦 현황</h4><div style="line-height:2">직원 ${e.length}명<br>제품 ${p.length}개 (${p.reduce((s,x)=>s+x.stock,0)}개 재고)<br>재고부족 <b style="color:#dc2626">${p.filter(x=>x.stock<=3).length}개</b></div></div>
      <div style="background:#fff;padding:16px;border-radius:12px"><h4>🎯 목표</h4><div style="background:#f3f4f6;border-radius:8px;height:12px;overflow:hidden;margin-top:8px"><div style="width:${Math.min(100,total/10000)}%;background:#f97316;height:100%"></div></div><div style="margin-top:8px;font-size:13px">달성률 ${Math.min(100,Math.floor(total/1000000*100))}% / 100만원<br><br>평균 일매출 ₩${Math.floor(total/30).toLocaleString()}</div></div>
    </div>
    <div style="margin-top:12px;background:#fff;padding:16px;border-radius:12px"><h4>⚠️ 재고 부족</h4><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${p.filter(x=>x.stock<=3).map(x=>`<span style="padding:6px 12px;background:#fee2e2;border-radius:20px;font-size:12px">${x.name} (${x.stock})</span>`).join('')||'없음 👍'}</div></div>
  </div>`;
}