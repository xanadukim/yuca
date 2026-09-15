
import {load,KEYS} from '../storage.js';
export function renderReports(c){
  c.innerHTML=`
  <div class="header"><h2>💰 매출리포트</h2><div><select class="select" style="width:120px" onchange="window.changeReportPeriod(this.value)"><option>일간</option><option>주간</option><option selected>월간</option><option>연간</option></select> <button class="btn btn-gray" style="margin-left:8px" onclick="window.exportCSV()">CSV 내보내기</button></div></div>
  <div class="grid grid-3"><div class="card"><div style="color:#6B7280;font-size:13px">총 매출</div><div class="stat-num">₩1,250,000</div></div><div class="card"><div style="color:#6B7280;font-size:13px">미용</div><div class="stat-num">₩850,000</div></div><div class="card"><div style="color:#6B7280;font-size:13px">유치원+호텔</div><div class="stat-num">₩400,000</div></div></div>
  <div class="grid grid-3" style="margin-top:16px">
    <div class="card"><h3>미용 매출</h3><div style="margin-top:12px"><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F3F4F6"><span>전체미용</span><span>₩500,000</span></div><div style="display:flex;justify-content:space-between;padding:8px 0"><span>부분미용</span><span>₩350,000</span></div></div></div>
    <div class="card"><h3>유치원 매출</h3><div style="margin-top:12px"><div style="display:flex;justify-content:space-between;padding:8px 0"><span>등원 12회</span><span>₩360,000</span></div></div></div>
    <div class="card"><h3>호텔 매출</h3><div style="margin-top:12px"><div style="display:flex;justify-content:space-between;padding:8px 0"><span>투숙 2건</span><span>₩100,000</span></div></div></div>
  </div>`;
}
