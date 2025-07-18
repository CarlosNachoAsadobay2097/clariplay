import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar el documento del usuario con rol por defecto: 'student'
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: 'student', // o 'teacher' si quieres personalizarlo más adelante
      });

      // Redirige a dashboard común
      navigate('/dashboard');
    } catch (err) {
      setError('Error al registrar: ' + err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Crear cuenta</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Ingresa aquí</Link>
      </p>
    </div>
  );
}
