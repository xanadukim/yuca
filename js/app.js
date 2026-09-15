import {load,save,KEYS} from './storage.js';
import {seedCustomers,seedEmployees,seedProducts} from './data.js';
import {renderDashboard} from './modules/dashboard.js';
import {renderCustomers} from './modules/customers.js';
import {renderReservations} from './modules/reservations.js';
import {renderKindergarten} from './modules/kindergarten.js';
import {renderHotel} from './modules/hotel.js';
import {renderEmployees} from './modules/employees.js';
import {renderProducts} from './modules/products.js';
import {renderReports} from './modules/reports.js';
import {renderSMS} from './modules/sms.js';
import {renderMobile} from './modules/mobile.js';
import {renderSettings} from './modules/settings.js';

if(load(KEYS.customers).length===0) save(KEYS.customers, seedCustomers);
if(load(KEYS.employees).length===0) save(KEYS.employees, seedEmployees);
if(load(KEYS.products).length===0) save(KEYS.products, seedProducts);
if(load(KEYS.reservations).length===0) save(KEYS.reservations, [{id:'R1',date:'2026-09-15',time:'10:00',name:'콩이 보호자',service:'전체미용',staff:'김미용',status:'확정'}]);

const pages={dashboard:renderDashboard,customers:renderCustomers,reservations:renderReservations,kindergarten:renderKindergarten,hotel:renderHotel,employees:renderEmployees,products:renderProducts,reports:renderReports,sms:renderSMS,mobile:renderMobile,settings:renderSettings};

function navigate(page){
  document.querySelectorAll('.sidebar nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  const content=document.getElementById('content');
  content.innerHTML='';
  const wrapper=document.createElement('div');
  content.appendChild(wrapper);
  const fn=pages[page];
  if(fn) fn(wrapper);
  localStorage.setItem('yuca_last_page',page);
}

// global actions
window.openCustomerModal=()=>{
  const name=prompt('보호자 이름?'); if(!name) return;
  const dog=prompt('강아지 이름?'); if(!dog) return;
  const breed=prompt('견종?')||'믹스';
  const phone=prompt('전화?')||'010-0000-0000';
  const list=load(KEYS.customers); list.push({id:'C'+Date.now(),name,dog_name:dog,breed,phone,total_visits:0,last_visit:new Date().toISOString().slice(0,10),note:''}); save(KEYS.customers,list); navigate('customers');
};
window.editCustomer=(id)=>{
  const list=load(KEYS.customers); const c=list.find(x=>x.id===id); if(!c) return;
  const name=prompt('보호자 이름?',c.name); if(name) c.name=name;
  const dog=prompt('강아지 이름?',c.dog_name); if(dog) c.dog_name=dog;
  save(KEYS.customers,list); navigate('customers');
};
window.deleteCustomer=(id)=>{ if(!confirm('삭제?')) return; save(KEYS.customers, load(KEYS.customers).filter(x=>x.id!==id)); navigate('customers'); };
window.openResModal=()=>{
  const name=prompt('고객명?'); if(!name) return;
  const date=prompt('날짜 YYYY-MM-DD','2026-09-16')||'2026-09-16';
  const time=prompt('시간 HH:MM','10:00')||'10:00';
  const service=prompt('서비스','전체미용')||'전체미용';
  const list=load(KEYS.reservations); list.push({id:'R'+Date.now(),date,time,name,service,staff:'김미용',status:'확정'}); save(KEYS.reservations,list); navigate('reservations');
};
window.deleteRes=(id)=>{ save(KEYS.reservations, load(KEYS.reservations).filter(x=> (x.id||x.date)!==id)); navigate('reservations'); };
window.addKinder=()=>{
  const dog=prompt('강아지 이름?'); if(!dog) return;
  const list=load(KEYS.kindergarten); list.push({id:'K'+Date.now(),dog,time:new Date().toLocaleTimeString(),activity:'놀이',meal:'잘먹음',mood:'좋음'}); save(KEYS.kindergarten,list); navigate('kindergarten');
};
window.checkKinder=(id,dog)=>{ const list=load(KEYS.kindergarten); list.push({id:'K'+Date.now(),dog,time:new Date().toLocaleTimeString(),activity:prompt('활동?','놀이')||'놀이',meal:prompt('식사?','잘먹음')||'잘먹음',mood:prompt('기분?','좋음')||'좋음'}); save(KEYS.kindergarten,list); navigate('kindergarten'); };
window.addHotel=()=>{
  const dog=prompt('강아지 이름?'); if(!dog) return;
  const room=prompt('객실 (S01,S02,M01,L01,SUITE)','S01')||'S01';
  const checkin=prompt('입실일','2026-09-15')||'2026-09-15';
  const checkout=prompt('퇴실일','2026-09-16')||'2026-09-16';
  const list=load(KEYS.hotel); list.push({id:'H'+Date.now(),dog,room,checkin,checkout,nights:1,amount:50000,status:'투숙중'}); save(KEYS.hotel,list); navigate('hotel');
};
window.checkoutHotel=(id)=>{ const list=load(KEYS.hotel); const h=list.find(x=>x.id===id); if(h){h.status='퇴실완료'; save(KEYS.hotel,list); navigate('hotel'); } };
window.addEmployee=()=>{
  const name=prompt('직원 이름?'); if(!name) return;
  const role=prompt('역할 (디자이너/교사)','디자이너')||'디자이너';
  const phone=prompt('전화?')||'010-0000-0000';
  const list=load(KEYS.employees); list.push({id:'E'+Date.now(),name,role,phone,salary:2500000}); save(KEYS.employees,list); navigate('employees');
};
window.checkIn=(id)=> alert('출근 체크 완료! '+new Date().toLocaleString());
window.checkOut=(id)=> alert('퇴근 체크 완료! '+new Date().toLocaleString());
window.addProduct=()=>{
  const name=prompt('제품명?'); if(!name) return;
  const stock=parseInt(prompt('재고 수량?','10')||'10');
  const price=parseInt(prompt('가격?','10000')||'10000');
  const list=load(KEYS.products); list.push({id:'P'+Date.now(),name,stock,price,category:'미용'}); save(KEYS.products,list); navigate('products');
};
window.inProduct=(id)=>{
  const qty=parseInt(prompt('입고 수량?','5')||'5');
  const list=load(KEYS.products); const p=list.find(x=>x.id===id); if(p){p.stock+=qty; save(KEYS.products,list);
  const logs=load(KEYS.logs); logs.push({time:new Date().toLocaleString(),name:p.name,type:'입고',qty}); save(KEYS.logs,logs); navigate('products');}
};
window.outProduct=(id)=>{
  const qty=parseInt(prompt('출고 수량?','1')||'1');
  const list=load(KEYS.products); const p=list.find(x=>x.id===id); if(p){p.stock=Math.max(0,p.stock-qty); save(KEYS.products,list);
  const logs=load(KEYS.logs); logs.push({time:new Date().toLocaleString(),name:p.name,type:'출고',qty}); save(KEYS.logs,logs); navigate('products');}
};
window.exportCSV=()=>{
  const csv='날짜,서비스,금액\n2026-09-15,전체미용,50000\n2026-09-15,유치원,30000\n';
  const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='yuca_sales.csv'; a.click();
};
window.changeReportPeriod=(v)=> alert(v+' 리포트로 변경');
window.sendBulkSMS=()=>{ const text=prompt('발송할 문자 내용?','예약 확정 안내'); if(!text) return; const logs=load(KEYS.messages); load(KEYS.customers).forEach(c=>logs.push({time:new Date().toLocaleString(),to:c.name+'('+c.phone+')',text})); save(KEYS.messages,logs); alert('대량 발송 완료!'); navigate('sms'); };
window.useTemplate=(id)=>{ const t={T01:'{고객명}님 예약 확정',T02:'{강아지명} 미용 완료',T03:'{강아지명} 유치원 일지',T04:'{강아지명} 호텔 안내'}[id]; alert('템플릿: '+t); };
window.exportDB=()=>{
  const data={}; for(const k in KEYS){data[k]=load(KEYS[k]);}
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`yuca_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
};
window.importDB=(e)=>{
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader(); r.onload=()=>{try{const d=JSON.parse(r.result); for(const k in KEYS){if(d[KEYS[k]]) save(KEYS[k], d[KEYS[k]]); if(d[k]) save(k,d[k]);} alert('복원 완료!'); location.reload();}catch(err){alert('파일 오류')}}; r.readAsText(file);
};

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.sidebar nav button').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.page)));
  navigate(localStorage.getItem('yuca_last_page')||'dashboard');
});
