// YUCA v6.5 FINAL - app.js 호환 + 전체입력폼 + 수정삭제 + 사진 NULL 허용
import { load, save, KEYS } from '../storage.js';

let editingIndex = null;
let tempDogPhoto = null;

function getCustomers(){ return load(KEYS.customers, []); }

export function addCustomer(obj){
  // app.js 옛날 prompt 호환 + 새 폼 호환
  const customers = getCustomers();
  const newData = {
    name: obj.name || obj.owner || '보호자',
    dogName: obj.dog_name || obj.dogName || '강아지',
    phone: obj.phone || '010-0000-0000',
    breed: obj.breed || '믹스',
    weight: obj.weight || '',
    birth: obj.birth || '',
    notes: obj.notes || '',
    dogPhoto: obj.dogPhoto || null, // NULL 허용!
    ownerPhoto: null,
    visits: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  customers.push(newData);
  save(KEYS.customers, customers);
  return newData;
}

// app.js가 호출하는 메인 함수 - d라는 박스에 그림 그리기!
export function renderCustomers(container){
  const customers = getCustomers();
  const d = container || document.createElement('div');

  d.innerHTML = `
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
          ${customers.length===0? `<tr><td colspan="5" style="text-align:center;padding:40px;color:#888">고객이 없습니다. 🐶 새 고객을 등록해보세요!</td></tr>` :
            customers.map((c,i)=>`
              <tr style="border-top:1px solid #f0f0f0">
                <td style="padding:12px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <div style="width:42px;height:42px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0">
                      ${c.dogPhoto? `<img src="${c.dogPhoto}" style="width:100%;height:100%;object-fit:cover">` : '🐾'}
                    </div>
                    <div><div style="font-weight:600">${c.name}</div><div style="font-size:13px;color:#666">${c.dogName} ${c.weight? `(${c.weight}kg)`:''}</div></div>
                  </div>
                </td>
                <td style="padding:12px">${c.breed||'-'}</td>
                <td style="padding:12px;font-size:13px">${c.phone||'-'}</td>
                <td style="padding:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;font-size:13px">${c.notes||'-'}</td>
                <td style="padding:12px">
                  <button onclick="editCustomerFull(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #FF8C00;background:white;color:#FF8C00;cursor:pointer">✏️ 수정</button>
                  <button onclick="deleteCustomerFull(${i})" style="padding:6px 10px;border-radius:6px;border:1px solid #ff4444;background:white;color:#ff4444;margin-left:4px;cursor:pointer">🗑️ 삭제</button>
                </td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>

    <!-- 전체 입력 폼 모달 + 사진 NULL 허용 -->
    <div id="customer-modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;justify-content:center;align-items:center">
      <div style="background:white;border-radius:16px;width:92%;max-width:640px;max-height:92vh;overflow-y:auto;padding:24px;position:relative">
        <h3 id="modal-title" style="margin:0 0 6px">새 고객 등록</h3>
        <p style="color:#888;font-size:12px;margin:0 0 16px">* 필수 / 사진은 선택 (없어도 저장 OK - NULL 허용)</p>
        <div style="display:flex;justify-content:center;margin-bottom:16px">
          <div style="text-align:center">
            <div id="preview-dog" onclick="document.getElementById('inp-dogPhoto').click()" style="width:110px;height:110px;border-radius:50%;border:2px dashed #FF8C00;background:#FFF8F0;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;overflow:hidden">🐾<small style="font-size:10px">사진 없음<br>(선택)</small></div>
            <input type="file" id="inp-dogPhoto" accept="image/*" style="display:none" onchange="onDogPhotoChange(event)">
            <div style="font-size:11px;margin-top:6px"><span style="background:#e8f5e9;color:#2e7d32;padding:2px 6px;border-radius:4px">NULL 허용</span></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <label style="font-size:13px">보호자* <input id="inp-name" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">전화번호* <input id="inp-phone" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px" placeholder="010-1234-5678"></label>
          <label style="font-size:13px">강아지* <input id="inp-dogName" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">견종 <select id="inp-breed" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"><option value="">선택</option><option>푸들</option><option>비숑</option><option>말티즈</option><option>포메</option><option>웰시코기</option><option>믹스</option><option>기타</option></select></label>
          <label style="font-size:13px">생일 <input id="inp-birth" type="date" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
          <label style="font-size:13px">몸무게 <input id="inp-weight" type="number" step="0.1" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></label>
        </div>
        <label style="display:block;margin-top:10px;font-size:13px">메모 <textarea id="inp-notes" rows="2" style="width:100%;padding:9px;border:1px solid #ddd;border-radius:7px;margin-top:3px"></textarea></label>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
          <button onclick="closeCustomerModalFull()" style="padding:9px 18px;border:1px solid #ddd;border-radius:7px;background:white;cursor:pointer">취소</button>
          <button onclick="saveCustomerFull()" style="padding:9px 20px;border:none;border-radius:7px;background:#FF8C00;color:white;font-weight:600;cursor:pointer">💾 저장 (사진 없어도 OK)</button>
        </div>
        <button onclick="closeCustomerModalFull()" style="position:absolute;top:12px;right:12px;border:none;background:#f5f5f5;width:28px;height:28px;border-radius:50%;cursor:pointer">✕</button>
      </div>
    </div>
  `;

  // 전역 함수 연결
  window.openCustomerFormFull = () => {
    editingIndex = null; tempDogPhoto = null;
    d.querySelector('#modal-title').textContent = '새 고객 등록';
    ['inp-name','inp-phone','inp-dogName','inp-breed','inp-weight','inp-birth','inp-notes'].forEach(id=>{ const el=d.querySelector('#'+id); if(el) el.value=''; });
    const prev = d.querySelector('#preview-dog');
    if(prev) prev.innerHTML = `🐾<small style="font-size:10px">사진 없음<br>(선택)</small>`;
    d.querySelector('#customer-modal').style.display='flex';
  };

  window.closeCustomerModalFull = () => {
    d.querySelector('#customer-modal').style.display='none';
    editingIndex=null; tempDogPhoto=null;
  };

  window.editCustomerFull = (i) => {
    const c = customers[i]; if(!c) return;
    editingIndex=i; tempDogPhoto=c.dogPhoto||null;
    d.querySelector('#modal-title').textContent='고객 수정';
    d.querySelector('#inp-name').value=c.name||''; d.querySelector('#inp-phone').value=c.phone||'';
    d.querySelector('#inp-dogName').value=c.dogName||''; d.querySelector('#inp-breed').value=c.breed||'';
    d.querySelector('#inp-weight').value=c.weight||''; d.querySelector('#inp-birth').value=c.birth||''; d.querySelector('#inp-notes').value=c.notes||'';
    d.querySelector('#preview-dog').innerHTML = tempDogPhoto? `<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : `🐾<small style="font-size:10px">사진 없음<br>(선택)</small>`;
    d.querySelector('#customer-modal').style.display='flex';
  };

  window.deleteCustomerFull = (i) => {
    if(!confirm('정말 삭제? Firebase에서도 삭제됩니다!')) return;
    const list=getCustomers(); list.splice(i,1); save(KEYS.customers,list);
    renderCustomers(d.parentElement? d.parentElement : document.getElementById('content'));
    const main = document.getElementById('content');
    if(main) { main.innerHTML=''; renderCustomers(main); }
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
        d.querySelector('#preview-dog').innerHTML=`<img src="${tempDogPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
      }; img.src=ev.target.result;
    }; reader.readAsDataURL(file);
  };

  window.saveCustomerFull = ()=>{
    const name=d.querySelector('#inp-name').value.trim();
    const phone=d.querySelector('#inp-phone').value.trim();
    const dogName=d.querySelector('#inp-dogName').value.trim();
    if(!name||!phone||!dogName){ alert('보호자, 전화번호, 강아지 필수!'); return; }
    const list=getCustomers();
    const newData={
      name, phone, dogName,
      breed:d.querySelector('#inp-breed').value,
      weight:d.querySelector('#inp-weight').value,
      birth:d.querySelector('#inp-birth').value,
      notes:d.querySelector('#inp-notes').value.trim(),
      dogPhoto: tempDogPhoto||null,
      ownerPhoto:null,
      visits: editingIndex!==null? (list[editingIndex].visits||0):0,
      createdAt: editingIndex!==null? list[editingIndex].createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if(editingIndex!==null) list[editingIndex]={...list[editingIndex],...newData};
    else list.push(newData);
    save(KEYS.customers,list);
    closeCustomerModalFull();
    // 다시 그리기
    const main=document.getElementById('content');
    if(main){ main.innerHTML=''; renderCustomers(main); }
    else renderCustomers(d);
  };

  // app.js가 innerHTML을 가져가므로 d 자체를 리턴하지 않고 내부에 이미 그려짐
  if(container && container!==d){
    container.innerHTML = d.innerHTML;
    // 이벤트 재연결을 위해 container에서 함수 재정의 필요 없음 - 이미 window에 있음
  }

  return d;
}

// 호환성
export const renderCustomersOld = renderCustomers;
export function openCustomerForm(){
  const main=document.getElementById('content');
  if(main) renderCustomers(main);
  setTimeout(()=>{ window.openCustomerFormFull&&window.openCustomerFormFull(); },100);
}
export const addCustomerModal = openCustomerForm;