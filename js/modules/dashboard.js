
import {load,KEYS} from '../storage.js';
export function renderDashboard(c){
  const customers=load(KEYS.customers).length;
  const res=load(KEYS.reservations).length;
  const kinder=load(KEYS.kindergarten).length;
  const hotel=load(KEYS.hotel).length;
  const today=new Date().toISOString().slice(0,10);
  c.innerHTML=`
  <div class="header"><h2>📊 대시보드 - ${today}</h2><span class="badge badge-green">운영중</span></div>
  <div class="grid grid-4">
    <div class="card"><div style="color:#6B7280;font-size:13px">오늘 예약</div><div class="stat-num">${res}</div><div style="font-size:12px;color:#059669">▲ 어제보다 +1</div></div>
    <div class="card"><div style="color:#6B7280;font-size:13px">총 고객</div><div class="stat-num">${customers}</div><div style="font-size:12px;color:#6B7280">신규 +2 이번주</div></div>
    <div class="card"><div style="color:#6B7280;font-size:13px">유치원</div><div class="stat-num">${kinder}마리</div><div style="font-size:12px">등원중</div></div>
    <div class="card"><div style="color:#6B7280;font-size:13px">호텔</div><div class="stat-num">${hotel}마리</div><div style="font-size:12px">투숙중</div></div>
  </div>
  <div class="grid grid-2" style="margin-top:16px">
    <div class="card"><h3>7일 매출 차트</h3><div style="display:flex;align-items:end;gap:8px;height:120px;margin-top:16px">${[40,65,30,80,55,90,70].map(h=>`<div style="flex:1;background:#FF7A00;border-radius:6px 6px 0 0;height:${h}%"></div>`).join('')}<div style="display:flex;gap:8px;margin-top:8px;font-size:11px;color:#9CA3AF"><span>9/9</span><span>9/10</span><span>9/11</span><span>9/12</span><span>9/13</span><span>9/14</span><span>9/15</span></div></div></div>
    <div class="card"><h3>오늘 방문</h3><div style="margin-top:12px;font-size:14px;line-height:2"><div>10:00 콩이 (푸들) - 전체미용</div><div>13:00 보리 (비숑) - 부분미용</div><div>15:00 초코 (말티즈) - 목욕</div></div></div>
  </div>`;
}
