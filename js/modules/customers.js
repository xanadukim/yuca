// YUCA v6.6 - 클로저 버그 해결 + 수정/등록 버튼 완전 작동
import { load, save, KEYS } from '../storage.js';

let editingIndex = null;
let tempDogPhoto = null;

function getCustomers(){ return load(KEYS.customers, []); }

export function addCustomer(obj){
  const customers = getCustomers();
  const newData = {
    name: obj.name || obj.owner || '보호자',
    dogName: obj.dog_name || obj.dogName || '강아지',
    phone: obj.phone || '010-0000-0000',
    breed: obj.breed || '믹스',
    weight: obj.weight || '',
    birth: obj.birth || '',
    notes: obj.notes || '',
    dogPhoto: obj.dogPhoto || null,
    ownerPhoto: null,
    visits: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customers.push(newData);
  save(KEYS.customers, customers);
  return newData;
}

export function renderCustomers(container){
  const customers = getCustomers();
  const target = container || document.getElementById('content');
  if(!target) return;

  target.innerHTML = `
    <div class="header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2>👥 고객관리 <span style="background:#FF8C00;color:white;padding:2px 10px;border-radius:12px;font-size:14px">${customers.length}명</span></h2>
      <button onclick="openCustomerFormFull()" style="padding:10px 20px;background:#FF8C00;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer">+ 새 고객 등록</button>
    </div>

    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06)">
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:#f8f9fa;text-align:left"><tr>
          <th style="padding:12px">보호자/강아지</th><th style="padding:12px">견종</th><th style="padding:12px">전화번호</th><th style="padding:12px">메모</th><th style="padding:12px">관리</th>
        </tr></thead>
        <tbody>
          ${customers.length===0? `<tr><td colspan="5" style="text-align:center;padding:40px;color:#888">고객이 없습니다. 🐶</td></tr>` :
            customers.map((c,i)=>{
              const dogName = c.dogName || c.dog_name || c.dog || '강아지';
              const ownerName = c.name || c.owner || '보호자';
              return `
              <tr style="border-top:1px solid #f0f0f0">
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:42px;height:42px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;overflow:hidden">
                      ${c.dogPhoto? `<img src="${c.dogPhoto}" style="width:100%;height:100%;object-fit:cover">` : '🐾'}
                    </div>
                    <div><div style="font-weight:600">${ownerName}</div><div style="font-size:13px;color:#666">${dogName} ${c.weight? `(${c.weight}kg)`:''}</div></div>
                  </div>
                </td>
                <td style="padding:12px">${c.breed||'-'}</td>
                <td style="padding:12px;font-size:13px">${c.phone||'-'}</td>
                <td style="padding:12px;font-size:13px">${c.notes||'-'}</td>
                <td style="padding:12px">
                  <button onclick="editCustomerFull(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF8C00;background:white;color:#FF8C00;cursor:pointer">✏️ 수정</button>
                  <button onclick="deleteCustomerFull(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
                </td>
              </tr>`
            }).join('')}
        </tbody>
      </table>
    </div>

    <div id="customer-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:92%;max-width:640px;max-height:92vh;overflow-y:auto;padding:24px;position:relative">
        <h3 id="modal-title">새 고객 등록</h3>
        <p style="color:#888;font-size:12px;margin:0 0 16px">* 필수 / 사진 선택 (NULL 허용)</p>
        <div style="display:flex;justify-content:center;margin-bottom:16px">
          <div style="text-align:center">
            <div id="preview-dog" onclick="document.getElementById('inp-dogPhoto').click()" style="width:110px;height:110px;border-radius:50%;border:2px dashed #FF8C00;background:#FFF8F0;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden">🐾<small>사진 없음</small></div>
            <input type="file" id="inp-dogPhoto" accept="image/*" style="display:none" onchange="onDogPhotoChange(event)">
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label style="font-size:13px">보호자* <input id="inp-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">전화번호* <input id="inp-phone" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">강아지* <input id="inp-dogName" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">견종 <select id="inp-breed" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"><option value="">선택</option><option>푸들</option><option>비숑</option><option>말티즈</option><option>포메</option><option>웰시코기</option><option>믹스</option><option>기타</option></select></label>
          <label style="font-size:13px">생일 <input id="inp-birth" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">몸무게 <input id="inp-weight" type="number" step="0.1" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
        </div>
        <label style="display:block;margin-top:10px;font-size:13px">메모 <textarea id="inp-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeCustomerModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveCustomerFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#FF8C00;color:white;font-weight:600;cursor:pointer">💾 저장</button>
        </div>
      </div>
    </div>
  `;
}

// --- 전역 함수들은 항상 document에서 찾음! (클로저 버그 해결) ---
window.openCustomerFormFull = () => {
  editingIndex = null; tempDogPhoto = null;
  const modal = document.getElementById('customer-modal');
  if(!modal) return;
  document.getElementById('modal-title').textContent = '새 고객 등록';
  ['inp-name','inp-phone','inp-dogName','inp-breed','inp-weight','inp-birth','inp-notes'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('preview-dog').innerHTML = `🐾<small>사진 없음</small>`;
  document.getElementById('inp-dogPhoto').value='';
  modal.style.display='flex';
};

window.closeCustomerModalFull = () => {
  const modal = document.getElementById('customer-modal');
  if(modal) modal.style.display='none';
  editingIndex=null; tempDogPhoto=null;
};

window.editCustomerFull = (i) => {
  const customers = getCustomers();
  const c = customers[i]; if(!c) return;
  editingIndex=i; tempDogPhoto=c.dogPhoto||null;
  document.getElementById('modal-title').textContent='고객 수정';
  document.getElementById('inp-name').value=c.name||c.owner||'';
  document.getElementById('inp-phone').value=c.phone||'';
  document.getElementById('inp-dogName').value=c.dogName||c.dog_name||'';
  document.getElementById('inp-breed').value=c.breed||'';
  document.getElementById('inp-weight').value=c.weight||'';
  document.getElementById('inp-birth').value=c.birth||'';
  document.getElementById('inp-notes').value=c.notes||'';
  const prev=document.getElementById('preview-dog');
  if(prev) prev.innerHTML = tempDogPhoto? `<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `🐾<small>사진 없음</small>`;
  document.getElementById('customer-modal').style.display='flex';
};

window.deleteCustomerFull = (i) => {
  if(!confirm('정말 삭제?')) return;
  const list=getCustomers(); list.splice(i,1); save(KEYS.customers,list);
  renderCustomers(document.getElementById('content'));
};

window.onDogPhotoChange = (e)=>{
  const file=e.target.files[0]; if(!file){ tempDogPhoto=null; return; }
  const reader=new FileReader();
  reader.onload=(ev)=>{
    const img=new Image(); img.onload=()=>{
      const canvas=document.createElement('canvas'); const max=400; let w=img.width,h=img.height;
      if(w>max||h>max){ if(w>h){ h=h*max/w; w=max; } else { w=w*max/h; h=max; } }
      canvas.width=w; canvas.height=h; canvas.getContext('2d').drawImage(img,0,0,w,h);
      tempDogPhoto=canvas.toDataURL('image/jpeg',0.6);
      const p=document.getElementById('preview-dog');
      if(p) p.innerHTML=`<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    }; img.src=ev.target.result;
  }; reader.readAsDataURL(file);
};

window.saveCustomerFull = ()=>{
  const name=document.getElementById('inp-name').value.trim();
  const phone=document.getElementById('inp-phone').value.trim();
  const dogName=document.getElementById('inp-dogName').value.trim();
  if(!name||!phone||!dogName){ alert('필수 입력!'); return; }
  const list=getCustomers();
  const newData={
    name, phone, dogName,
    breed:document.getElementById('inp-breed').value,
    weight:document.getElementById('inp-weight').value,
    birth:document.getElementById('inp-birth').value,
    notes:document.getElementById('inp-notes').value.trim(),
    dogPhoto: tempDogPhoto||null,
    visits: editingIndex!==null? (list[editingIndex].visits||0):0,
    createdAt: editingIndex!==null? list[editingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingIndex!==null) list[editingIndex]={...list[editingIndex],...newData};
  else list.push(newData);
  save(KEYS.customers,list);
  closeCustomerModalFull();
  renderCustomers(document.getElementById('content'));
};

export function openCustomerForm(){ openCustomerFormFull(); }