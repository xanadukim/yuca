import {KEYS as LK} from './storage-local.js';
import {load as LL, save as SL, getDBStats as GS} from './storage-local.js';
import {isFirebaseEnabled} from './firebase.js';
export const KEYS=LK;
export function load(k,f=[]){return LL(k,f)}
export function save(k,d){return SL(k,d)}
export function getDBStats(){return GS()}
export function getMode(){return isFirebaseEnabled()? '🔥 Firebase 클라우드 (실시간 동기화)' : '📦 로컬 (기기별 저장)';}
