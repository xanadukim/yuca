// YUCA v7.1 - 직원관리 완전 복구 (역할별 + 급여 + 입사일 + 고객연동 패턴)
import { load, save, KEYS } from '../storage.js';

let editingEmpIdx = null;
let empFilter = 'all'; // all, working, groomer, teacher

function getEmployees(){
  try{ return load(KEYS.employees, []); }catch(e){ return load('yuca_employees', []); }
}
function saveEmployees(list){
  save(KEYS.employees, list);
  try{ save('yuca_employees', list); }catch(e){}
}

export function renderEmployees(container){
  const target = container || document.getElementById('content');
  if(!target) return;
  const empList = getEmployees();

  let filtered = empList;
  if(empFilter==='working') filtered = empList.filter(e=>e.status==='재직');
  else if(empFilter==='groomer') filtered = empList.filter(e=>e.role?.includes('미용'));
  else if(empFilter==='teacher') filtered = empList.filter(e=>e.role?.includes('유치원') || e.role?.includes('호텔'));

  filtered = [...filtered].sort((a,b)=>(a.name||'').localeCompare(b.name||''));

  const working = empList.filter(e=>e.status==='재직').length;
  const totalSalary = filtered.reduce((s,e)=>s+(parseInt(e.salary)||0),0);

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px">
      <h2>👩‍💼 직원관리 <span style="background:#FF6F00;color:white;padding:2px 10px;border-radius:12px;font-size:14px">${filtered.length}명</span>
        <small style="font-size:13px;color:#888;margin-left:8px">재직 ${working}명 · 월급여 합 ₩${totalSalary.toLocaleString()}</small>
      </h2>
      <div style="display:flex;gap:8px">
        <div style="display:flex;border:1px solid #ddd;border-radius:8px;overflow:hidden">
          <button onclick="setEmpFilter('all')" style="padding:8px 12px;border:none;background:${empFilter==='all'?'#FF6F00':'white'};color:${empFilter==='all'?'white':'#666'};cursor:pointer;font-size:13px">전체</button>
          <button onclick="setEmpFilter('working')" style="padding:8px 12px;border:none;background:${empFilter==='working'?'#FF6F00':'white'};color:${empFilter==='working'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">재직</button>
          <button onclick="setEmpFilter('groomer')" style="padding:8px 12px;border:none;background:${empFilter==='groomer'?'#FF6F00':'white'};color:${empFilter==='groomer'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">미용사</button>
          <button onclick="setEmpFilter('teacher')" style="padding:8px 12px;border:none;background:${empFilter==='teacher'?'#FF6F00':'white'};color:${empFilter==='teacher'?'white':'#666'};cursor:pointer;font-size:13px;border-left:1px solid #ddd">유치원/호텔</button>
        </div>
        <button onclick="openEmpFormFull()" style="padding:10px 20px;background:#FF6F00;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">+ 직원 등록</button>
      </div>
    </div>

    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8f9fa;text-align:left"><tr>
          <th style="padding:12px">직원</th><th style="padding:12px">역할</th><th style="padding:12px">연락처/입사일</th><th style="padding:12px">급여</th><th style="padding:12px">상태</th><th style="padding:12px">관리</th>
        </tr></thead>
        <tbody>
          ${filtered.length===0? `<tr><td colspan="6" style="text-align:center;padding:40px;color:#888">등록된 직원이 없습니다. 👩‍💼<br><small>+ 직원 등록으로 추가!</small></td></tr>` :
            filtered.map((e)=>{
              const origIdx = empList.indexOf(e);
              const roleColor = e.role==='원장'?'#D32F2F':e.role?.includes('미용')?'#FF8C00':e.role?.includes('유치원')?'#2196F3':e.role?.includes('호텔')?'#9C27B0':'#4CAF50';
              return `
              <tr style="border-top:1px solid #f0f0f0">
                <td style="padding:12px"><div style="display:flex;align-items:center;gap:10px">
                  <div style="width:40px;height:40px;border-radius:50%;background:${roleColor}15;display:flex;align-items:center;justify-content:center;font-size:20px;border:2px solid ${roleColor}30">${e.role==='원장'?'👑':e.role?.includes('미용')?'✂️':e.role?.includes('유치원')?'🏫':e.role?.includes('호텔')?'🏨':'👩'}</div>
                  <div><div style="font-weight:700;font-size:14px">${e.name||'-'}</div><div style="font-size:12px;color:#888">${e.nickname||''}</div></div>
                </div></td>
                <td style="padding:12px"><span style="background:${roleColor}15;color:${roleColor};border:1px solid ${roleColor}30;padding:5px 12px;border-radius:12px;font-size:12px;font-weight:700">${e.role||'스태프'}</span></td>
                <td style="padding:12px"><div style="font-size:13px">${e.phone||'-'}</div><div style="font-size:11px;color:#888">입사 ${e.hireDate||'-'}</div></td>
                <td style="padding:12px"><div style="font-weight:600">₩${(e.salary||0).toLocaleString()}</div><div style="font-size:11px;color:#888">${e.salaryType||'월급'}</div></td>
                <td style="padding:12px"><span style="padding:4px 10px;border-radius:12px;font-size:12px;background:${e.status==='재직'?'#E8F5E9':e.status==='휴직'?'#FFF3E0':'#FFEBEE'};color:${e.status==='재직'?'#2E7D32':e.status==='휴직'?'#EF6C00':'#C62828'}">${e.status||'재직'}</span></td>
                <td style="padding:12px">
                  <button onclick="editEmpFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF6F00;background:white;color:#FF6F00;cursor:pointer">✏️ 수정</button>
                  <button onclick="deleteEmpFull(${origIdx})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
                </td>
              </tr>`;
            }).join('')}
        </tbody>
      </table>
    </div>

    <div id="emp-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:92%;max-width:560px;max-height:92vh;overflow-y:auto;padding:24px">
        <h3 id="emp-modal-title">직원 등록</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px">
          <label style="font-size:13px">이름* <input id="emp-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="김미용"></label>
          <label style="font-size:13px">별명 <input id="emp-nickname" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="미용실장"></label>
          <label style="font-size:13px">역할*
            <select id="emp-role" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="원장">👑 원장</option>
              <option value="미용사">✂️ 미용사</option>
              <option value="미용 보조">✂️ 미용 보조</option>
              <option value="유치원 교사">🏫 유치원 교사</option>
              <option value="호텔 매니저">🏨 호텔 매니저</option>
              <option value="인턴">👩 인턴</option>
              <option value="스태프">스태프</option>
            </select>
          </label>
          <label style="font-size:13px">전화번호 <input id="emp-phone" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="010-..."></label>
          <label style="font-size:13px">입사일 <input id="emp-hireDate" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">급여 <input id="emp-salary" type="number" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="2500000"></label>
          <label style="font-size:13px">급여 형태
            <select id="emp-salaryType" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="월급">월급</option>
              <option value="시급">시급</option>
              <option value="일급">일급</option>
              <option value="수습">수습</option>
            </select>
          </label>
          <label style="font-size:13px">상태
            <select id="emp-status" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px">
              <option value="재직">재직</option>
              <option value="휴직">휴직</option>
              <option value="퇴사">퇴사</option>
            </select>
          </label>
        </div>
        <label style="display:block;margin-top:10px;font-size:13px">메모 <textarea id="emp-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="특기, 자격증 등"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeEmpModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveEmpFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#FF6F00;color:white;font-weight:600;cursor:pointer">💾 저장</button>
        </div>
      </div>
    </div>
  `;
}

window.setEmpFilter = (mode)=>{ empFilter=mode; renderEmployees(document.getElementById('content')); };
window.openEmpFormFull = ()=>{
  editingEmpIdx=null;
  document.getElementById('emp-modal-title').textContent='직원 등록';
  document.getElementById('emp-name').value='';
  document.getElementById('emp-nickname').value='';
  document.getElementById('emp-role').value='미용사';
  document.getElementById('emp-phone').value='';
  document.getElementById('emp-hireDate').value=new Date().toISOString().slice(0,10);
  document.getElementById('emp-salary').value='2500000';
  document.getElementById('emp-salaryType').value='월급';
  document.getElementById('emp-status').value='재직';
  document.getElementById('emp-notes').value='';
  document.getElementById('emp-modal').style.display='flex';
};
window.closeEmpModalFull = ()=>{ document.getElementById('emp-modal').style.display='none'; editingEmpIdx=null; };
window.editEmpFull = (idx)=>{
  const list=getEmployees(); const e=list[idx]; if(!e) return;
  editingEmpIdx=idx;
  document.getElementById('emp-modal-title').textContent='직원 수정';
  document.getElementById('emp-name').value=e.name||'';
  document.getElementById('emp-nickname').value=e.nickname||'';
  document.getElementById('emp-role').value=e.role||'스태프';
  document.getElementById('emp-phone').value=e.phone||'';
  document.getElementById('emp-hireDate').value=e.hireDate||'';
  document.getElementById('emp-salary').value=e.salary||'';
  document.getElementById('emp-salaryType').value=e.salaryType||'월급';
  document.getElementById('emp-status').value=e.status||'재직';
  document.getElementById('emp-notes').value=e.notes||'';
  document.getElementById('emp-modal').style.display='flex';
};
window.deleteEmpFull = (idx)=>{
  if(!confirm('정말 삭제?')) return;
  const list=getEmployees(); list.splice(idx,1); saveEmployees(list);
  renderEmployees(document.getElementById('content'));
};
window.saveEmpFull = ()=>{
  const name=document.getElementById('emp-name').value.trim();
  if(!name){ alert('이름 필수!'); return; }
  const list=getEmployees();
  const data={
    name,
    nickname:document.getElementById('emp-nickname').value.trim(),
    role:document.getElementById('emp-role').value,
    phone:document.getElementById('emp-phone').value.trim(),
    hireDate:document.getElementById('emp-hireDate').value,
    salary:document.getElementById('emp-salary').value,
    salaryType:document.getElementById('emp-salaryType').value,
    status:document.getElementById('emp-status').value,
    notes:document.getElementById('emp-notes').value.trim(),
    createdAt: editingEmpIdx!==null? list[editingEmpIdx].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingEmpIdx!==null) list[editingEmpIdx]={...list[editingEmpIdx],...data};
  else list.push(data);
  saveEmployees(list);
  closeEmpModalFull();
  renderEmployees(document.getElementById('content'));
};