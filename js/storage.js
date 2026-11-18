import {KEYS as LK} from './storage-local.js';
import {load as LL, save as SL, getDBStats as GS} from './storage-local.js';
import {isFirebaseEnabled} from './firebase.js';

export const KEYS=LK;

// 로컬 시간 기준 오늘 날짜 (toISOString은 UTC라 KST에서 하루 밀림)
export function localToday(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function load(k,f=[]){
  return LL(k,f);
}

export function save(k,d){
  // 1. 로컬에 먼저 저장
  const result = SL(k,d);
  try{ localStorage.setItem('yuca_ts_'+k, String(Date.now())); }catch(e){}
  // 2. Firebase 클라우드에도 저장!
  if(window.saveToCloud){
    window.saveToCloud(k, d).then(ok => {
      if(ok) console.log("☁️ 클라우드 저장 성공:", k);
    });
  }
  return result;
}

export function getDBStats(){return GS()}

export function getMode(){
  // 괄호() 제거! isFirebaseEnabled는 값이므로 함수처럼 호출하면 안됨!
  return isFirebaseEnabled ? '🔥 Firebase 클라우드 (실시간 동기화)' : '📦 로컬 (기기별 저장)';
}
