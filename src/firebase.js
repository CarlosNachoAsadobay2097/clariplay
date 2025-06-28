// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC5_ROr3x_G8kO1X6KvvW-YOmheGK8etwE",
  authDomain: "musiconexion.firebaseapp.com",
  projectId: "musiconexion",
  storageBucket: "musiconexion.appspot.com", // ✅ CORREGIDO
  messagingSenderId: "175805742821",
  appId: "1:175805742821:web:07a99cc7d29ae2829cde0c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
