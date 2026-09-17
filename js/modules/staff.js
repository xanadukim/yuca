// staff.js - YUCA v8.6 직원관리 FINAL
import { load, save, KEYS } from '../storage.js';

export function renderStaff(container){
  let staff = load(KEYS.staff) || [
    { id: 1, name: '김원장', role: '원장', phone: '010-1234-5678', status: '근무중' },
    { id: 2, name: '이미용', role: '미용사', phone: '010-2345-6789', status: '근무중' },
    { id: 3, name: '박돌봄', role: '유치원 교사', phone: '010-3456-7890', status: '휴무' },
  ];

  function refresh(){
    container.innerHTML = `
    <div style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h2>👨‍💼 직원관리 <small style="color:#888">v8.6</small></h2>
        <button id="btnAddStaff" style="padding:10px 16px;border-radius:20px;background:#f97316;color:#fff;border:none;cursor:pointer;font-weight:bold">+ 직원 등록</button>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px">
        <div style="background:#fff;padding:16px;border-radius:12px;border-left:4px solid #22c55e">
          <div style="color:#888;font-size:12px">전체 직원</div>
          <div style="font-size:24px;font-weight:bold">${staff.length}명</div>
        </div>
        <div style="background:#fff;padding:16px;border-radius:12px;border-left:4px solid #3b82f6">
          <div style="color:#888;font-size:12px">근무중</div>
          <div style="font-size:24px;font-weight:bold">${staff.filter(s=>s.status==='근무중').length}명</div>
        </div>
        <div style="background:#fff;padding:16px;border-radius:12px;border-left:4px solid #f97316">
          <div style="color:#888;font-size:12px">오늘 출근</div>
          <div style="font-size:24px;font-weight:bold">${staff.length}명</div>
        </div>
      </div>

      <div style="margin-top:16px;background:#fff;border-radius:16px;overflow:hidden">
        <div style="padding:16px;display:grid;grid-template-columns:1fr 120px 140px 100px 100px;gap:10px;font-weight:bold;border-bottom:2px solid #f5f5f5">
          <div>이름/직책</div><div>연락처</div><div>담당</div><div>상태</div><div>관리</div>
        </div>
        ${staff.map(s=>`
          <div style="padding:12px 16px;display:grid;grid-template-columns:1fr 120px 140px 100px 100px;gap:10px;align-items:center;border-bottom:1px solid #f9fafb">
            <div><b>${s.name}</b><br><small style="color:#888">${s.role}</small></div>
            <div style="font-size:13px">${s.phone}</div>
            <div style="font-size:12px"><span style="padding:4px 8px;background:#fff7ed;border-radius:20px">${s.role}</span></div>
            <div><span style="padding:4px 10px;border-radius:20px;font-size:11px;background:${s.status==='근무중'?'#dcfce7':'#fee2e2'}">${s.status}</span></div>
            <div style="display:flex;gap:4px">
              <button onclick="alert('${s.name} 수정')" style="padding:6px 10px;border-radius:20px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:11px">수정</button>
              <button data-del="${s.id}" style="padding:6px 10px;border-radius:20px;border:1px solid #fecaca;background:#fff;color:#ef4444;cursor:pointer;font-size:11px">삭제</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

    container.querySelector('#btnAddStaff')?.addEventListener('click', ()=>{
      const name = prompt('직원 이름:');
      if(!name) return;
      const role = prompt('직책 (원장/미용사/유치원 교사):','미용사');
      staff.push({ id: Date.now(), name, role, phone: '010-0000-0000', status: '근무중' });
      save(KEYS.staff, staff);
      refresh();
    });

    container.querySelectorAll('[data-del]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        staff = staff.filter(s=>s.id != btn.dataset.del);
        save(KEYS.staff, staff);
        refresh();
      });
    });
  }
  refresh();
}