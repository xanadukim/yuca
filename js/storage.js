import {KEYS as LK} from './storage-local.js';
import {load as LL, save as SL, getDBStats as GS} from './storage-local.js';
import {isFirebaseEnabled} from './firebase.js';

export const KEYS=LK;

export function load(k,f=[]){
  return LL(k,f);
}

export function save(k,d){
  // 1. 로컬에 먼저 저장
  const result = SL(k,d);
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
