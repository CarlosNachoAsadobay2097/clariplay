import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo_6.svg'; // Asegúrate de tener el logo en esta ruta
//import './Landing.css';

function Landing() {
  return (
    <div className="landing">
      <div className="hero">
        <div className="hero-content">
            <img src={logo} alt="Musiconexión Logo" className="hero-logo" />
            <p>Una nueva forma de aprender, practicar y compartir música.</p>
            <Link to="/register" className="cta-button">Empieza ahora</Link>
        </div>
      </div>

      <section className="about">
        
            <h2>¿Qué es Musiconexión?</h2>

            <img 
                src={require('../assets/about-image.jpg')} 
                alt="Sobre Musiconexión" 
                className="about-image" 
            />

            <p>
                Musiconexión es una plataforma educativa donde estudiantes y profesores de música pueden compartir lecciones, partituras interactivas y grabaciones para retroalimentación directa.
            </p>

            <ul className="features-list">
                <li>
                <i className="fas fa-music"></i>
                <span>Editor de partituras fácil de usar</span>
                </li>
                <li>
                <i className="fas fa-headphones-alt"></i>
                <span>Graba tu interpretación desde la plataforma</span>
                </li>
                <li>
                <i className="fas fa-chalkboard-teacher"></i>
                <span>Recibe calificaciones y consejos reales</span>
                </li>
            </ul>
     </section>


      <section className="video-section">
        <h2>Conoce más</h2>
        <div className="video-container">
          <iframe
            width="100%"
            height="415"
            src="https://www.youtube.com/embed/JRy1fz2MOPk?si=FXn1oy1W3Xnh9eTc"
            title="Presentación Musiconexión"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />

        </div>
      </section>
    </div>
  );
}

export default Landing;
