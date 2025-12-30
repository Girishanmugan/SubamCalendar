import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBXehL4LPO-RjmyFcY8ig0hZHbALs-cGz8",
  authDomain: "calendar-shop-app.firebaseapp.com",
  projectId: "calendar-shop-app",
  storageBucket: "calendar-shop-app.appspot.com",
  messagingSenderId: "134800962385",
  appId: "1:134800962385:web:9d6eabcfb715d023165970"
};

const app = initializeApp(firebaseConfig);

// ✅ SIMPLE & SAFE AUTH (works on Web + Android + iOS)
const auth = getAuth(app);

const db = getFirestore(app);

export { auth, db };
