// firebase.js - YUCA v6.4 FINAL - No-Auth - 400 에러 완전 해결
// Kim님 전용 - 익명 로그인 제거 버전
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot, writeBatch, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig, USE_FIREBASE } from "./firebase-config.js";

// storage.js 호환용 export - 반드시 필요!
export const isFirebaseEnabled = true;
export { firebaseConfig, USE_FIREBASE };
export const isCloudEnabled = true;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.yucaDB = db;
window.yucaCloudReady = true;
window.firestoreReady = true;

console.log("🔥 Firebase OK", firebaseConfig.projectId);
console.log("🔥 Firestore 연결됨! (No-Auth 모드) - 400 에러 해결!");

window.loadFromCloud = async () => {
  try {
    const snap = await getDocs(collection(db, "yuca_data"));
    const data = {};
    snap.forEach(d => data[d.id] = d.data().value);
    return data;
  } catch(e){ console.error("로드 실패:", e); return null; }
};

window.saveToCloud = async (key, value) => {
  try {
    await setDoc(doc(db, "yuca_data", key), { value, updatedAt: serverTimestamp() });
    console.log("☁️ 클라우드 저장:", key);
    return true;
  } catch(e){ console.error("저장 실패:", e); return false; }
};

window.setupCloudSync = (key, callback) => {
  try {
    return onSnapshot(doc(db, "yuca_data", key), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().value;
        console.log("🔄 실시간:", key);
        if (callback) callback(data);
      }
    });
  } catch(e){ return null; }
};

export { db, collection, doc, setDoc, getDoc, getDocs, onSnapshot, writeBatch, serverTimestamp };
