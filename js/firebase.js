// 🔥 YUCA Firebase - No Auth Mode (익명로그인 우회)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, setDoc, getDocs, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBv1fV2rK1v... (기존 firebase-config.js에서 복사)",
  authDomain: "yuca-2026-c22e8.firebaseapp.com",
  projectId: "yuca-2026-c22e8",
  storageBucket: "yuca-2026-c22e8.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456:web:abcdef"
};

// 기존 config 있으면 그거 쓰기
let cfg = window.firebaseConfig || firebaseConfig;
try {
  const imported = await import("./firebase-config.js");
  if(imported.firebaseConfig) cfg = imported.firebaseConfig;
} catch(e){}

const app = initializeApp(cfg);
const db = getFirestore(app);

window.yucaDB = db;
window.yucaCloudReady = true;

console.log("🔥 Firebase OK", cfg.projectId);
console.log("🔥 Firestore 연결됨! (No-Auth 모드)");

export { db, collection, doc, setDoc, getDocs, onSnapshot };
