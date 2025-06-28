// src/components/PrivateRouteByRole.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function PrivateRouteByRole({ children, role }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().role === role) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
      } catch (error) {
        console.error('Error al verificar rol:', error);
        setAllowed(false);
      }
    });

    return () => unsubscribe(); // Limpieza del observer
  }, [role]);

  if (allowed === null) return <p>Cargando...</p>;
  if (allowed === false) return <Navigate to="/dashboard" />;

  return children;
}

export default PrivateRouteByRole;
