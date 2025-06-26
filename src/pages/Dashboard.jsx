import React from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="navbar">
            Musiconexión 🎵
      </div>
      <h2>Bienvenido a Musiconexión 🎶</h2>
      <p>Pronto podrás ver tus lecciones, grabaciones y comentarios del profesor.</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
