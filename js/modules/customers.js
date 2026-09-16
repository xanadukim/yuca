// YUCA v6.5 - 고객관리 v6.5 (전체입력 + 수정삭제 + 사진 NULL) - app.js 호환
import { load, save, KEYS } from '../storage.js';

let editingIndex = null;
let tempDogPhoto = null;
let tempOwnerPhoto = null;

export function renderCustomers() {
  const customers = load(KEYS.customers, []);
  const tbody = document.querySelector('#customer-table tbody');
  if(!tbody) return;
  const countEl = document.getElementById('customer-count');
  if(countEl) countEl.textContent = customers.length;
  if(customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px">고객이 없습니다. 🐶</td></tr>`;
    return;
  }
  tbody.innerHTML = customers.map((c, i) => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:42px;height:42px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;overflow:hidden">
            ${c.dogPhoto? `<img src="${c.dogPhoto}" style="width:100%;height:100%;object-fit:cover">` : '🐾'}
          </div>
          <div><div style="font-weight:600">${c.name}</div><small>${c.phone||''}</small></div>
        </div>
      </td>
      <td>${c.dogName||''}</td>
      <td>${c.breed||'-'}</td>
      <td>${c.visits||0}회</td>
      <td>${c.notes||'-'}</td>
      <td>
        <button onclick="editCustomer(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF8C00;background:white;color:#FF8C00;cursor:pointer">✏️ 수정</button>
        <button onclick="deleteCustomer(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
      </td>
    </tr>
  `).join('');
}

window.editCustomer = (index) => {
  const customers = load(KEYS.customers, []);
  const data = customers[index];
  if(!data) return;
  editingIndex = index;
  tempDogPhoto = data.dogPhoto || null;
  tempOwnerPhoto = data.ownerPhoto || null;
  document.getElementById('modal-title').textContent = '고객 수정';
  document.getElementById('inp-name').value = data.name || '';
  document.getElementById('inp-phone').value = data.phone || '';
  document.getElementById('inp-dogName').value = data.dogName || '';
  document.getElementById('inp-breed').value = data.breed || '';
  document.getElementById('inp-weight').value = data.weight || '';
  document.getElementById('inp-birth').value = data.birth || '';
  document.getElementById('inp-notes').value = data.notes || '';
  const dogPreview = document.getElementById('preview-dog');
  if(dogPreview) dogPreview.innerHTML = tempDogPhoto? `<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `🐾<small>사진 없음<br>(선택/NULL)</small>`;
  document.getElementById('customer-modal').style.display = 'flex';
};

window.deleteCustomer = (index) => {
  if(!confirm('정말 삭제? 클라우드에서도 삭제됩니다!')) return;
  const customers = load(KEYS.customers, []);
  customers.splice(index, 1);
  save(KEYS.customers, customers);
  renderCustomers();
};

export function openCustomerForm() {
  editingIndex = null;
  tempDogPhoto = null;
  tempOwnerPhoto = null;
  const title = document.getElementById('modal-title');
  if(title) title.textContent = '새 고객 등록';
  const ids = ['inp-name','inp-phone','inp-dogName','inp-breed','inp-weight','inp-birth','inp-notes'];
  ids.forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
  const dogPreview = document.getElementById('preview-dog');
  if(dogPreview) dogPreview.innerHTML = `🐾<small>사진 없음<br>(선택/NULL)</small>`;
  document.getElementById('customer-modal').style.display = 'flex';
}

// 호환성: app.js가 addCustomer를 찾으므로!
export const addCustomer = openCustomerForm;

window.closeCustomerModal = () => {
  document.getElementById('customer-modal').style.display = 'none';
  editingIndex = null;
  tempDogPhoto = null;
  tempOwnerPhoto = null;
};

window.onDogPhotoChange = (event) => {
  const file = event.target.files[0];
  if(!file) { tempDogPhoto = null; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const max = 400;
      let w = img.width, h = img.height;
      if(w > max || h > max) {
        if(w > h) { h = h * max / w; w = max; }
        else { w = w * max / h; h = max; }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      tempDogPhoto = canvas.toDataURL('image/jpeg', 0.6);
      const preview = document.getElementById('preview-dog');
      if(preview) preview.innerHTML = `<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.removeDogPhoto = () => {
  tempDogPhoto = null;
  const inp = document.getElementById('inp-dogPhoto');
  if(inp) inp.value = '';
  const preview = document.getElementById('preview-dog');
  if(preview) preview.innerHTML = `🐾<small>사진 없음<br>(선택/NULL)</small>`;
};

window.saveCustomer = (e) => {
  e?.preventDefault();
  const customers = load(KEYS.customers, []);
  const name = document.getElementById('inp-name')?.value.trim() || '';
  const phone = document.getElementById('inp-phone')?.value.trim() || '';
  const dogName = document.getElementById('inp-dogName')?.value.trim() || '';
  if(!name ||!phone ||!dogName) { alert('보호자, 전화번호, 강아지 이름 필수!'); return; }
  const newData = {
    name, phone, dogName,
    breed: document.getElementById('inp-breed')?.value || '',
    weight: document.getElementById('inp-weight')?.value || '',
    birth: document.getElementById('inp-birth')?.value || '',
    notes: document.getElementById('inp-notes')?.value.trim() || '',
    dogPhoto: tempDogPhoto || null,
    ownerPhoto: tempOwnerPhoto || null,
    visits: editingIndex!== null? (customers[editingIndex].visits || 0) : 0,
    createdAt: editingIndex!== null? customers[editingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if(editingIndex!== null) customers[editingIndex] = {...customers[editingIndex],...newData};
  else customers.push(newData);
  save(KEYS.customers, customers);
  closeCustomerModal();
  renderCustomers();
  alert(editingIndex!== null? '✅ 수정 완료!' : '✅ 등록 완료! (사진 NULL 가능)');
};

export function initCustomers() {
  renderCustomers();
  document.getElementById('btn-add-customer')?.addEventListener('click', openCustomerForm);
}