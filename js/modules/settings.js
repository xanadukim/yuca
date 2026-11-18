// settings.js - YUCA v10.3 설정: 매장정보/계정/연동/데이터/앱정보/도움말
import { load, save, KEYS, localToday, getMode } from '../storage.js';

const SETTINGS_KEY='yuca_settings';
const getSettings=()=>JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');
const APP_VER=(document.title.match(/v[\d.]+/)||['v?'])[0];

export function renderSettings(container){
  const target=container||document.getElementById('main-content');
  if(!target) return;
  const st=getSettings();
  const allData={};
  Object.keys(KEYS).forEach(k=>{ allData[k]=load(KEYS[k])||[]; });
  const user=window.yucaUser||null;

  const inp=(id,val,ph='',type='text')=>`<input id="${id}" type="${type}" value="${String(val||'').replace(/"/g,'&quot;')}" placeholder="${ph}" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:13px">`;
  const card=(title,inner,bg='#f9fafb',border='')=>`
    <div style="padding:16px;background:${bg};border-radius:12px;${border?`border:${border}`:''}">
      <h4 style="margin:0 0 4px">${title}</h4>${inner}
    </div>`;

  target.innerHTML=`
  <div class="yu-page" style="padding:24px;max-width:1100px">
    <div style="margin-bottom:14px">
      <h2 style="margin:0;font-size:22px;font-weight:800">⚙️ 설정</h2>
      <div style="font-size:13px;color:#6b7280;margin-top:4px">매장 정보 · 계정 · 연동 · 데이터 관리</div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:0;border-bottom:2px solid #eee;flex-wrap:wrap">
      ${[['shop','🏪 매장 정보'],['account','👤 계정 & 보안'],['link','🔗 연동 & 알림'],['data','📦 데이터 관리'],['app','ℹ️ 앱 정보'],['help','❓ 도움말']].map(([id,label],i)=>`
        <button class="set-tab" data-tab="${id}" style="padding:10px 16px;border:none;border-bottom:3px solid ${i===0?'#f97316':'transparent'};background:${i===0?'#fff':'#f9fafb'};font-weight:${i===0?'bold':'normal'};cursor:pointer;border-radius:10px 10px 0 0;font-size:13px">${label}</button>`).join('')}
    </div>

    <!-- 1. 매장 정보 -->
    <div class="set-pane" data-pane="shop" style="background:#fff;padding:20px;border-radius:0 16px 16px 16px;border:1px solid #eee;border-top:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${card('🏪 기본 정보',`
          ${inp('cfgShopName',st.shopName,'매장명 (예: 예견미용실)')}
          ${inp('cfgPhone',st.shopPhone,'대표 전화번호')}
          ${inp('cfgAddr',st.shopAddr,'주소','text')}
          <label style="display:block;font-size:12px;color:#555;margin-top:10px">영업시간<input id="cfgHours" value="${st.businessHours||'10:00 - 19:00'}" placeholder="예: 10:00-19:00 (화요일 휴무)" style="width:100%;margin-top:4px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:13px"></label>
          <label style="display:block;font-size:12px;color:#555;margin-top:10px">매장 소개/안내 문구<textarea id="cfgIntro" rows="2" placeholder="문자 발송 시 서명으로 사용됩니다" style="width:100%;margin-top:4px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:13px">${st.intro||''}</textarea></label>
        `)}
        ${card('📱 표시 미리보기',`
          <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;padding:14px;font-size:13px;line-height:1.8">
            <b id="pv-name">${st.shopName||'YUCA 애견'}</b><br>
            <span id="pv-phone">${st.shopPhone||'전화번호 미등록'}</span><br>
            <span id="pv-addr" style="color:#6b7280">${st.addr||st.shopAddr||''}</span><br>
            <span style="color:#6b7280">🕐 ${st.businessHours||'10:00 - 19:00'}</span>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:8px">입력하면 위 미리보기가 실시간으로 바뀝니다. 문자/영수증에 사용됩니다.</div>
        `,'#eff6ff')}
      </div>
      <button class="yu-btn yu-s" id="btnSaveShop" style="margin-top:16px;padding:11px 22px">💾 매장 정보 저장</button>
    </div>

    <!-- 2. 계정 & 보안 -->
    <div class="set-pane" data-pane="account" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;border:1px solid #eee;border-top:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${card('👤 로그인 계정',`
          <div style="font-size:13px;line-height:2">
            이메일: <b>${user?.email||'로그인 정보 없음'}</b><br>
            인증 방식: <b>${user?.providerData?.[0]?.providerId==='password'?'이메일/비밀번호':'알 수 없음'}</b><br>
            상태: <b style="color:#059669">${user?'로그인됨':'로그인 안됨'}</b>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:8px">비밀번호 변경/계정 추가는 Firebase 콘솔에서 관리합니다.</div>
        `)}
        ${card('🚪 세션',`
          <button id="btnLogout" style="width:100%;padding:11px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer;font-size:13px">로그아웃</button>
          <div style="font-size:11px;color:#9ca3af;margin-top:8px">로그아웃 후 로그인 화면으로 이동합니다. 데이터는 클라우드에 안전하게 보관됩니다.</div>
        `,'#fef2f2','1px solid #fecaca')}
      </div>
    </div>

    <!-- 3. 연동 & 알림 -->
    <div class="set-pane" data-pane="link" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;border:1px solid #eee;border-top:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${card('🟢 네이버 예약 연동',`
          <label style="display:flex;gap:8px;padding:8px;background:#fff;border-radius:8px;margin-top:8px;font-size:13px"><input type="checkbox" id="cfgUseNaver" ${st.useNaver!==false?'checked':''}> 네이버 예약 링크 사용</label>
          ${inp('cfgNaverBooking',st.naverBookingUrl,'네이버 예약 URL (스마트플레이스에서 복사)','url')}
          ${inp('cfgNaverPlace',st.naverPlaceUrl,'네이버 플레이스 URL','','url')}
          <div style="font-size:11px;color:#9ca3af;margin-top:8px">스마트플레이스(smartplace.naver.com)에서 예약 링크를 발급받아 붙여넣으세요.</div>
        `,'#f0fdf4','1px solid #bbf7d0')}
        ${card('💬 문자(SMS) 상태',`
          <div style="font-size:13px;line-height:2">
            현재 모드: <b>${getMode()}</b><br>
            상태: <b style="color:#d97706">시뮬레이션 모드</b><br>
            실제 발송: 솔라피/알리고 API 키 등록 필요
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:8px">문자 탭에서 템플릿 편집/미리보기는 가능합니다.</div>
        `)}
      </div>
      <button class="yu-btn yu-s" id="btnSaveLink" style="margin-top:16px;padding:11px 22px">💾 연동 설정 저장</button>
    </div>

    <!-- 4. 데이터 관리 -->
    <div class="set-pane" data-pane="data" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;border:1px solid #eee;border-top:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${card('💾 백업 & 내보내기',`
          <button id="btnExportJson" class="yu-btn yu-s" style="width:100%;margin-top:8px;padding:12px">📤 전체 내보내기 (JSON)</button>
          <button id="btnExportCsv" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer;font-size:13px">📊 고객 CSV 내보내기</button>
          <button id="btnBackupLocal" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer;font-size:13px">💾 로컬 백업 생성</button>
          <div style="margin-top:10px;font-size:11px;color:#888">마지막 백업: ${localStorage.getItem('yuca_last_backup')||'없음'}</div>
        `,'#fff7ed','1px solid #fed7aa')}
        ${card('📥 복구 & 가져오기',`
          <label style="display:block;padding:10px;background:#fff;border-radius:10px;border:1px dashed #ddd;cursor:pointer;text-align:center;margin-top:8px;font-size:13px">📥 JSON 가져오기<input type="file" id="fileImportJson" accept=".json" style="display:none"></label>
          <button id="btnRestoreBackup" style="width:100%;margin-top:8px;padding:10px;border-radius:10px;background:#fff;border:1px solid #ddd;cursor:pointer;font-size:13px">♻️ 로컬 백업 복구</button>
        `)}
      </div>

      <div style="margin-top:16px;padding:16px;background:#f9fafb;border-radius:12px">
        <h4>📊 현재 데이터 현황</h4>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:10px;font-size:12px">
          ${Object.entries(allData).map(([k,v])=>`<div style="padding:8px;background:#fff;border-radius:8px;border:1px solid #eee"><b>${k}</b>: ${Array.isArray(v)?v.length:0}개</div>`).join('')}
        </div>
      </div>

      <div style="margin-top:16px;padding:18px;background:#fef2f2;border:2px solid #fecaca;border-radius:12px">
        <h4 style="color:#dc2626;margin:0 0 6px">⚠️ 위험 구역</h4>
        <div style="font-size:12px;color:#7f1d1d;margin-bottom:10px">전체 초기화는 모든 고객/예약/제품 데이터를 삭제합니다. 반드시 백업 후 진행하세요.</div>
        <button id="btnClearAll" style="padding:10px 20px;border-radius:10px;background:#dc2626;color:#fff;border:none;font-weight:bold;cursor:pointer">🗑️ 전체 데이터 초기화</button>
      </div>
    </div>

    <!-- 5. 앱 정보 -->
    <div class="set-pane" data-pane="app" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;border:1px solid #eee;border-top:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${card('📱 YUCA 앱 정보',`
          <div style="font-size:13px;line-height:2">
            버전: <b>${APP_VER}</b><br>
            저장 방식: <b>${getMode()}</b><br>
            플랫폼: 웹 / PWA (홈 화면 추가 가능)<br>
            마지막 백업: <b>${localStorage.getItem('yuca_last_backup')||'없음'}</b>
          </div>
        `)}
        ${card('📲 모바일 설치',`
          <div style="font-size:13px;line-height:1.8;color:#374151">
            📱 안드로이드 Chrome: 메뉴 → <b>홈 화면에 추가</b><br>
            🍎 iPhone Safari: 공유 버튼 → <b>홈 화면에 추가</b><br>
            설치 후에도 데이터는 동일하게 동기화됩니다.
          </div>
        `,'#eff6ff','1px solid #bae6fd')}
      </div>
    </div>

    <!-- 6. 도움말 -->
    <div class="set-pane" data-pane="help" style="display:none;background:#fff;padding:20px;border-radius:0 16px 16px 16px;border:1px solid #eee;border-top:none">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${card('💬 문자 템플릿 변수',`
          <div style="font-size:12px;line-height:1.9">
            <code>{이름}</code> 보호자명 · <code>{반려견}</code> 강아지명 · <code>{날짜}</code> 예약일 · <code>{서비스}</code> 서비스 · <code>{시간}</code> 예약시간 · <code>{가격}</code> 금액<br><br>
            예시: <div style="padding:8px;background:#fff;border-radius:8px;margin-top:6px">안녕하세요 {이름}님! {반려견}의 {날짜} {서비스} 예약이 확정되었습니다.</div>
          </div>
        `,'#fff7ed','1px solid #fed7aa')}
        ${card('🟢 네이버 예약 연동',`
          <div style="font-size:12px;line-height:1.8">
            1. <b>smartplace.naver.com</b>에서 매장 등록<br>
            2. 예약 상품/링크 발급<br>
            3. 링크를 위 "연동 & 알림" 탭에 붙여넣기 → 저장<br><br>
            네이버에서 들어온 예약은 YUCA에서 가격 계산 후 확정하면 됩니다.
          </div>
        `,'#f0fdf4','1px solid #bbf7d0')}
        ${card('❓ 자주 묻는 질문',`
          <div style="font-size:12px;line-height:1.9">
            <b>데이터가 사라졌어요</b> → 설정 > 데이터 관리 > JSON 가져오기로 백업 복구<br>
            <b>다른 기기와 동기화</b> → 같은 Firebase 계정으로 로그인하면 자동 동기화<br>
            <b>가격을 바꾸고 싶어요</b> → 가격표 메뉴에서 수정 → 기존 예약 가격은 유지됩니다<br>
            <b>강아지가 여러 마리</b> → 고객 수정에서 "강아지 추가" 버튼 사용
          </div>
        `)}
        ${card('📞 문의',`
          <div style="font-size:12px;line-height:1.8;color:#374151">
            기능 추가/오류 문의는 개발자에게 연락하세요.<br>
            백업 파일(JSON)은 정기적으로 다운로드해 안전하게 보관하세요.
          </div>
        `)}
      </div>
    </div>
  </div>`;

  // ---- 탭 전환 ----
  target.querySelectorAll('.set-tab').forEach(btn=>{
    btn.onclick=()=>{
      target.querySelectorAll('.set-tab').forEach(b=>{b.style.borderBottom='3px solid transparent';b.style.background='#f9fafb';b.style.fontWeight='normal'});
      btn.style.borderBottom='3px solid #f97316';btn.style.background='#fff';btn.style.fontWeight='bold';
      target.querySelectorAll('.set-pane').forEach(p=>p.style.display='none');
      target.querySelector(`.set-pane[data-pane="${btn.dataset.tab}"]`).style.display='block';
    };
  });

  // ---- 매장 정보 저장 + 실시간 미리보기 ----
  const saveShopFields=['cfgShopName','cfgPhone','cfgAddr','cfgHours','cfgIntro'];
  const syncPreview=()=>{
    const n=document.getElementById('pv-name'),p=document.getElementById('pv-phone'),a=document.getElementById('pv-addr');
    if(n)n.textContent=document.getElementById('cfgShopName').value||'YUCA 애견';
    if(p)p.textContent=document.getElementById('cfgPhone').value||'전화번호 미등록';
    if(a)a.textContent=document.getElementById('cfgAddr').value||'';
  };
  saveShopFields.forEach(id=>document.getElementById(id)?.addEventListener('input',syncPreview));
  document.getElementById('btnSaveShop').onclick=()=>{
    const cur=getSettings();
    const next={...cur,shopName:document.getElementById('cfgShopName').value,shopPhone:document.getElementById('cfgPhone').value,shopAddr:document.getElementById('cfgAddr').value,businessHours:document.getElementById('cfgHours').value,intro:document.getElementById('cfgIntro').value};
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));
    localStorage.setItem('yuca_ts_'+SETTINGS_KEY,String(Date.now()));
    if(window.saveToCloud) window.saveToCloud(SETTINGS_KEY,next);
    alert('✅ 매장 정보 저장 완료!');
  };

  // ---- 연동 설정 저장 ----
  document.getElementById('btnSaveLink').onclick=()=>{
    const cur=getSettings();
    const next={...cur,useNaver:document.getElementById('cfgUseNaver').checked,naverBookingUrl:document.getElementById('cfgNaverBooking').value,naverPlaceUrl:document.getElementById('cfgNaverPlace').value};
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));
    localStorage.setItem('yuca_ts_'+SETTINGS_KEY,String(Date.now()));
    if(window.saveToCloud) window.saveToCloud(SETTINGS_KEY,next);
    alert('✅ 연동 설정 저장 완료!');
  };

  // ---- 계정 ----
  document.getElementById('btnLogout')?.addEventListener('click',async()=>{
    if(!confirm('로그아웃할까요?'))return;
    try{ await window.yucaSignOut?.(); }catch(e){}
    location.reload();
  });

  // ---- 데이터 관리 (기존 로직 유지) ----
  const BACKUP_KEY='yuca_local_backup';
  const snapshot=()=>{
    const snap={};
    Object.keys(KEYS).forEach(k=>{snap[k]=load(KEYS[k])||[]});
    snap.settings=getSettings();
    return snap;
  };
  const restore=(snap)=>{
    if(!snap||typeof snap!=='object')throw new Error('백업 형식이 올바르지 않습니다');
    Object.keys(KEYS).forEach(name=>{if(Array.isArray(snap[name]))save(KEYS[name],snap[name])});
    if(snap.settings&&typeof snap.settings==='object'){
      localStorage.setItem(SETTINGS_KEY,JSON.stringify(snap.settings));
      localStorage.setItem('yuca_ts_'+SETTINGS_KEY,String(Date.now()));
      if(window.saveToCloud)window.saveToCloud(SETTINGS_KEY,snap.settings);
    }
  };

  document.getElementById('btnExportJson').onclick=()=>{
    const blob=new Blob([JSON.stringify(allData,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`YUCA_backup_${localToday()}.json`;a.click();
    localStorage.setItem('yuca_last_backup',new Date().toLocaleString());
  };
  document.getElementById('btnExportCsv').onclick=()=>{
    const rows=[['보호자','전화번호','강아지들','견종','주소','메모']];
    (allData.customers||[]).forEach(c=>{
      const pets=(c.pets||[]).map(p=>p.name).join(', ')||c.dogName||'';
      const breeds=[...new Set((c.pets||[]).map(p=>p.breed).filter(Boolean))].join(', ')||c.breed||'';
      rows.push([c.name||'',c.phone||'',pets,breeds,c.address||'',(c.notes||'').replace(/\n/g,' ')]);
    });
    const csv='﻿'+rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`YUCA_customers_${localToday()}.csv`;a.click();
    URL.revokeObjectURL(url);
  };
  document.getElementById('btnBackupLocal').onclick=()=>{
    localStorage.setItem(BACKUP_KEY,JSON.stringify(snapshot()));
    localStorage.setItem('yuca_last_backup',new Date().toLocaleString());
    alert('✅ 로컬 백업 저장 완료!');
  };
  document.getElementById('btnRestoreBackup').onclick=()=>{
    const raw=localStorage.getItem(BACKUP_KEY);
    if(!raw){alert('저장된 백업이 없습니다. 먼저 [로컬 백업 생성]을 눌러주세요.');return}
    if(!confirm('현재 데이터를 백업 시점으로 복구할까요?'))return;
    try{restore(JSON.parse(raw));alert('✅ 복구 완료! 새로고침합니다.');location.reload()}
    catch(e){alert('복구 실패: '+e.message)}
  };
  document.getElementById('fileImportJson').onchange=(e)=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(reader.result);
        const snap={};
        Object.keys(KEYS).forEach(name=>{
          if(Array.isArray(data[name]))snap[name]=data[name];
          else if(Array.isArray(data[KEYS[name]]))snap[name]=data[KEYS[name]];
        });
        if(data.settings)snap.settings=data.settings;
        if(!confirm(`가져온 데이터로 복구할까요? (${Object.keys(snap).length}개 항목)`))return;
        restore(snap);alert('✅ 가져오기 완료! 새로고침합니다.');location.reload();
      }catch(err){alert('가져오기 실패: '+err.message)}
    };
    reader.readAsText(file);e.target.value='';
  };
  document.getElementById('btnClearAll').onclick=()=>{
    if(!confirm('⚠️ 정말 전체 초기화할까요? 모든 데이터가 삭제됩니다.'))return;
    if(!confirm('한 번 더 확인: 되돌릴 수 없습니다. 계속할까요?'))return;
    Object.keys(localStorage).filter(k=>k.startsWith('yuca_')).forEach(k=>localStorage.removeItem(k));
    alert('초기화 완료! 새로고침합니다.');location.reload();
  };
}
