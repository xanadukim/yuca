
import {load,KEYS,getDBStats} from '../storage.js';
export function renderSettings(c){
  const stats=getDBStats();
  c.innerHTML=`
  <div class="header"><h2>⚙️ 설정</h2></div>
  <div class="grid grid-2">
    <div class="card"><h3>테마</h3><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-orange" onclick="document.body.className='theme-orange'">오렌지</button><button class="btn btn-gray" onclick="document.body.className='theme-blue'">블루</button><button class="btn btn-gray" onclick="document.body.className='theme-green'">그린</button><button class="btn btn-gray" onclick="document.body.className='theme-purple'">퍼플</button></div></div>
    <div class="card"><h3>DB 모니터 (3개)</h3><div style="margin-top:12px;font-size:13px;line-height:1.8">
      <div>grooming.db: 고객 ${stats.yuca_customers} / 예약 ${stats.yuca_reservations} / 방문 ${stats.yuca_visits}</div>
      <div>kindergarten.db: ${stats.yuca_kindergarten}건</div>
      <div>hotel.db: ${stats.yuca_hotel}건</div>
    </div></div>
  </div>
  <div class="card" style="margin-top:16px"><h3>데이터 관리</h3><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn btn-orange" onclick="window.exportDB()">전체 내보내기 (JSON)</button><button class="btn btn-gray" onclick="document.getElementById('importFile').click()">가져오기</button><input type="file" id="importFile" style="display:none" onchange="window.importDB(event)"><button class="btn btn-gray" style="background:#FEE2E2;color:#991B1B" onclick="if(confirm('정말 모든 데이터 삭제?')){localStorage.clear();location.reload()}">⚠️ 전체 삭제</button></div><div style="margin-top:12px;font-size:12px;color:#9CA3AF">localStorage에 저장됨. 브라우저 캐시 삭제 시 데이터 삭제될 수 있음. 정기적으로 내보내기 하세요.</div></div>`;
}
