import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import logoTop from '../assets/Logo_3.svg';
import logoBottom from '../assets/Logo_8.svg';

function Navbar({ onToggleSidebar }) {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      } else {
        setRole(null);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  const getLogoLink = () => {
    if (user && role === 'student') return '/dashboard-student';
    if (user && role === 'teacher') return '/dashboard-teacher';
    return '/';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <Link to={getLogoLink()}>
            <img src={logoTop} alt="Logo Musiconexión" className="logo" />
          </Link>
        </div>

        <div className="navbar-right">
          {user ? (
            <button onClick={handleLogout} className="logout-btn link-underlined hide-on-mobile">
              Cerrar sesión
            </button>
          ) : (
            <>
              <Link to="/login" className="link-underlined">Iniciar sesión</Link>
              <Link to="/register" className="link-underlined">Registrarse</Link>
            </>
          )}
        </div>
      </div>

      {/* Menú inferior responsive */}
      <div className="bottom-menu">
        {!user ? (
          <>
            <Link to="/login" className="menu-button">
              <i className="fas fa-sign-in-alt"></i>
              <span>Iniciar</span>
            </Link>

            <Link to={getLogoLink()} className="menu-center">
              <img src={logoBottom} alt="Musiconexión" />
            </Link>

            <Link to="/register" className="menu-button">
              <i className="fas fa-user-plus"></i>
              <span>Registro</span>
            </Link>
          </>
        ) : (
          <>
            <button className="menu-button" onClick={onToggleSidebar}>
              <i className="fas fa-bars"></i>
              <span>Menú</span>
            </button>

            <Link to={getLogoLink()} className="menu-center">
              <img src={logoBottom} alt="Musiconexión" />
            </Link>

            <button className="menu-button" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              <span>Salir</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
