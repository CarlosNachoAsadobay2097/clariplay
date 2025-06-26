// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";          // Para autenticación
import { getFirestore } from "firebase/firestore"; // Para base de datos Firestore
import { getStorage } from "firebase/storage";     // Para almacenamiento de archivos

const firebaseConfig = {
  apiKey: "AIzaSyC5_ROr3x_G8kO1X6KvvW-YOmheGK8etwE",
  authDomain: "musiconexion.firebaseapp.com",
  projectId: "musiconexion",
  storageBucket: "musiconexion.firebasestorage.app",
  messagingSenderId: "175805742821",
  appId: "1:175805742821:web:07a99cc7d29ae2829cde0c"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta servicios para usarlos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
