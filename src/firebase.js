// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔥 Configuración del nuevo proyecto ClariPlay
const firebaseConfig = {
  apiKey: "AIzaSyBKGAcU-lSRJBgvfogHELJV6CAQzxhOT4g",
  authDomain: "clariplay.firebaseapp.com",
  projectId: "clariplay",
  storageBucket: "clariplay.appspot.com", // ⚠️ CORREGIDO
  messagingSenderId: "915804289978",
  appId: "1:915804289978:web:94ccb97c991a30da4ebb83"
};

// Inicialización de Firebase y exportación de servicios
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
