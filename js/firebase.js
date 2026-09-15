import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { firebaseConfig, USE_FIREBASE } from "./firebase-config.js";
let db=null; let isReady=false;
try{
 if(USE_FIREBASE && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_")){
  const app=initializeApp(firebaseConfig);
  db=getFirestore(app);
  const auth=getAuth(app);
  signInAnonymously(auth).catch(()=>{});
  isReady=true;
  console.log("🔥 Firebase OK", firebaseConfig.projectId);
 }
}catch(e){ console.warn(e); }
export {db, isReady};
export {collection, getDocs, doc, setDoc, query, orderBy};
export function isFirebaseEnabled(){return isReady;}
