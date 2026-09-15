// firebase.js - YUCA v6.4 Firebase No-Auth Fix - Kim님 전용
// 400 에러 우회: 익명 로그인 없이 Firestore 바로 연결

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  collection, 
  onSnapshot,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

console.log("🔥 Firebase 초기화 중...", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 전역으로 노출
window.yucaDB = db;
window.yucaCloudReady = true;
window.firestoreReady = true;

console.log("🔥 Firebase OK", firebaseConfig.projectId);
console.log("🔥 Firestore 연결됨! (No-Auth 모드)");

// --- 클라우드 동기화 함수 ---
window.loadFromCloud = async () => {
  try {
    const snapshot = await getDocs(collection(db, "yuca_data"));
    const cloudData = {};
    snapshot.forEach(docSnap => {
      cloudData[docSnap.id] = docSnap.data().value;
    });
    console.log("☁️ 클라우드에서 로드:", Object.keys(cloudData));
    return cloudData;
  } catch (e) {
    console.error("클라우드 로드 실패:", e);
    return null;
  }
};

window.saveToCloud = async (key, value) => {
  try {
    await setDoc(doc(db, "yuca_data", key), {
      value: value,
      updatedAt: serverTimestamp()
    });
    console.log("☁️ 클라우드 저장: "+key);
    return true;
  } catch (e) {
    console.error("클라우드 저장 실패:", e);
    return false;
  }
};

window.setupCloudSync = (key, callback) => {
  try {
    return onSnapshot(doc(db, "yuca_data", key), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().value;
        console.log("🔄 실시간 업데이트: "+key);
        if (callback) callback(data);
      }
    });
  } catch (e) {
    console.error("실시간 리스너 실패:", e);
    return null;
  }
};

export { db, collection, doc, setDoc, getDoc, getDocs, onSnapshot, writeBatch };
