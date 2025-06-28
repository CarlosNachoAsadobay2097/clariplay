// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <h1>404</h1>
      <p>La página que buscas no existe 😢</p>
      <Link to="/" className="cta-button">Volver al inicio</Link>
    </div>
  );
}
