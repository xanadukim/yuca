// YUCA v6.5 - 고객관리 v6.5 (전체입력 + 수정삭제 + 사진 NULL)
import { load, save, KEYS } from '../storage.js';

let editingIndex = null;
let tempDogPhoto = null; // NULL 허용!
let tempOwnerPhoto = null;

export function renderCustomers() {
  const customers = load(KEYS.customers, []);
  const tbody = document.querySelector('#customer-table tbody');
  if(!tbody) return;

  // 고객수 표시
  const countEl = document.getElementById('customer-count');
  if(countEl) countEl.textContent = customers.length;

  if(customers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px">고객이 없습니다. 🐶 새 고객을 등록해보세요!</td></tr>`;
    return;
  }

  tbody.innerHTML = customers.map((c, i) => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:42px;height:42px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
            ${c.dogPhoto? `<img src="${c.dogPhoto}" style="width:100%;height:100%;object-fit:cover">` : '🐾'}
          </div>
          <div>
            <div style="font-weight:600">${c.name}</div>
            <small style="color:#888">${c.phone || ''}</small>
          </div>
        </div>
      </td>
      <td>${c.dogName || ''}</td>
      <td>${c.breed || '-'}</td>
      <td>${c.visits || 0}회</td>
      <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis">${c.notes || '-'}</td>
      <td>
        <button onclick="editCustomer(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF8C00;background:white;color:#FF8C00;cursor:pointer">✏️ 수정</button>
        <button onclick="deleteCustomer(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;cursor:pointer;margin-left:4px">🗑️ 삭제</button>
      </td>
    </tr>
  `).join('');
}

// 전역으로 등록 (HTML onclick에서 사용)
window.editCustomer = (index) => {
  const customers = load(KEYS.customers, []);
  const data = customers[index];
  if(!data) return;

  editingIndex = index;
  tempDogPhoto = data.dogPhoto || null;
  tempOwnerPhoto = data.ownerPhoto || null;

  // 전체 입력 폼에 값 채우기 - 모든 필드가 한눈에 보임!
  document.getElementById('modal-title').textContent = '고객 수정';
  document.getElementById('inp-name').value = data.name || '';
  document.getElementById('inp-phone').value = data.phone || '';
  document.getElementById('inp-dogName').value = data.dogName || '';
  document.getElementById('inp-breed').value = data.breed || '';
  document.getElementById('inp-weight').value = data.weight || '';
  document.getElementById('inp-birth').value = data.birth || '';
  document.getElementById('inp-notes').value = data.notes || '';

  const dogPreview = document.getElementById('preview-dog');
  if(dogPreview) dogPreview.innerHTML = tempDogPhoto? `<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `🐾<small style="display:block;font-size:10px">사진 없음<br>(선택/NULL)</small>`;

  document.getElementById('customer-modal').style.display = 'flex';
};

window.deleteCustomer = (index) => {
  if(!confirm('정말 삭제할까요? Firebase 클라우드에서도 삭제됩니다!')) return;
  const customers = load(KEYS.customers, []);
  customers.splice(index, 1);
  save(KEYS.customers, customers);
  renderCustomers();
  alert('🗑️ 삭제 완료!');
};

// 새 고객 - 전체 폼으로!
export function openCustomerForm() {
  editingIndex = null;
  tempDogPhoto = null;
  tempOwnerPhoto = null;
  document.getElementById('modal-title').textContent = '새 고객 등록';
  document.getElementById('inp-name').value = '';
  document.getElementById('inp-phone').value = '';
  document.getElementById('inp-dogName').value = '';
  document.getElementById('inp-breed').value = '';
  document.getElementById('inp-weight').value = '';
  document.getElementById('inp-birth').value = '';
  document.getElementById('inp-notes').value = '';
  const dogPreview = document.getElementById('preview-dog');
  if(dogPreview) dogPreview.innerHTML = `🐾<small style="display:block;font-size:10px">사진 없음<br>(선택/NULL)</small>`;
  document.getElementById('customer-modal').style.display = 'flex';
}

window.closeCustomerModal = () => {
  document.getElementById('customer-modal').style.display = 'none';
  editingIndex = null;
  tempDogPhoto = null;
  tempOwnerPhoto = null;
};

// 사진 선택 - NULL 허용!
window.onDogPhotoChange = (event) => {
  const file = event.target.files[0];
  if(!file) { tempDogPhoto = null; return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    // 400px로 압축
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
      document.getElementById('preview-dog').innerHTML = `<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"><button type="button" onclick="removeDogPhoto()" style="position:absolute;top:-5px;right:-5px;width:20px;height:20px;border-radius:50%;border:none;background:#ff4444;color:white;cursor:pointer">X</button>`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

window.removeDogPhoto = () => {
  tempDogPhoto = null; // NULL로!
  document.getElementById('inp-dogPhoto').value = '';
  document.getElementById('preview-dog').innerHTML = `🐾<small style="display:block;font-size:10px">사진 없음<br>(선택/NULL)</small>`;
};

// 저장 - 사진 없어도 OK (NULL)
window.saveCustomer = (e) => {
  e?.preventDefault();
  const customers = load(KEYS.customers, []);

  const name = document.getElementById('inp-name').value.trim();
  const phone = document.getElementById('inp-phone').value.trim();
  const dogName = document.getElementById('inp-dogName').value.trim();

  if(!name ||!phone ||!dogName) {
    alert('보호자 이름, 전화번호, 강아지 이름은 필수입니다!');
    return;
  }

  const newData = {
    name,
    phone,
    dogName,
    breed: document.getElementById('inp-breed').value,
    weight: document.getElementById('inp-weight').value,
    birth: document.getElementById('inp-birth').value,
    notes: document.getElementById('inp-notes').value.trim(),
    dogPhoto: tempDogPhoto || null, // NULL 허용!
    ownerPhoto: tempOwnerPhoto || null, // NULL 허용!
    visits: editingIndex!== null? (customers[editingIndex].visits || 0) : 0,
    createdAt: editingIndex!== null? customers[editingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if(editingIndex!== null) {
    customers[editingIndex] = {...customers[editingIndex],...newData };
  } else {
    customers.push(newData);
  }

  save(KEYS.customers, customers); // 로컬 + Firebase 자동 저장!
  closeCustomerModal();
  renderCustomers();
  alert(editingIndex!== null? '✅ 수정 완료! (사진 NULL 가능)' : '✅ 등록 완료! (사진 없이도 OK)');
};

export function initCustomers() {
  renderCustomers();
  // 버튼 연결
  document.getElementById('btn-add-customer')?.addEventListener('click', openCustomerForm);
}