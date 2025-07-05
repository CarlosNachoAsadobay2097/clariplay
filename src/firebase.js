// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 Nueva configuración de Firebase (clariplay-86df4)
const firebaseConfig = {
  apiKey: "AIzaSyA4f3Ysn05Kh6lgfxTwRQJ5ddyZmHzPAeE",
  authDomain: "clariplay-86df4.firebaseapp.com",
  projectId: "clariplay-86df4",
  storageBucket: "clariplay-86df4.appspot.com", // ⚠️ corregido .app -> .com
  messagingSenderId: "367526023581",
  appId: "1:367526023581:web:68313f71594cfa00849f74"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
