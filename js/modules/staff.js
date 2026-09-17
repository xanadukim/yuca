// staff.js - YUCA v8.5 직원관리
import { load, save, KEYS } from '../storage.js';

export function renderStaff(container){
  const staff = load(KEYS.staff) || [
    { name: '김원장', role: '원장', phone: '010-1234-5678' },
    { name: '이미용', role: '미용사', phone: '010-2345-6789' }
  ];

  container.innerHTML = `
  <div style="padding:20px">
    <h2>👨‍💼 직원관리 <small style="color:#888">v8.5</small></h2>
    <div style="margin-top:16px;background:#fff;padding:16px;border-radius:16px">
      <div style="display:grid;gap:8px">
        ${staff.map(s=>`
          <div style="display:flex;justify-content:space-between;padding:12px;border:1px solid #eee;border-radius:10px">
            <div><b>${s.name}</b> - ${s.role}<br><small>${s.phone}</small></div>
            <span style="padding:4px 10px;background:#e0f2fe;border-radius:20px;font-size:11px">${s.role}</span>
          </div>
        `).join('')}
      </div>
    </div>
  </div>`;
}