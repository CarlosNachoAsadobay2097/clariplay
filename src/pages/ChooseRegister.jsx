// ChooseRegister.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../css/main.css';

function ChooseRegister() {
  return (
    <div className="choose-register-container">
        <h2>¿Cómo deseas registrarte?</h2>
        <div className="role-buttons">
            <Link to="/register-student" className="role-btn">
            <i className="fas fa-graduation-cap"></i>
            Estudiante
            </Link>
            <Link to="/register-teacher" className="role-btn">
            <i className="fas fa-chalkboard-user"></i>
            Profesor
            </Link>
        </div>
    </div>

  );
}

export default ChooseRegister;
