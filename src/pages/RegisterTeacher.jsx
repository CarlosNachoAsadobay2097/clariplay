import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function RegisterTeacher() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [claveSecreta, setClaveSecreta] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const CLAVE_CORRECTA = 'PROFESOR2025'; // Puedes cambiar esta clave luego o cargarla desde un entorno seguro

  const handleRegister = async (e) => {
    e.preventDefault();

    if (claveSecreta !== CLAVE_CORRECTA) {
      setError('Clave secreta incorrecta. Solo profesores autorizados pueden registrarse.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        role: 'teacher',
        email: user.email,
        nombre,
        apellido,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error al registrar profesor:', error);
      setError('Hubo un problema al registrar. Intenta nuevamente.');
    }
  };

  return (
    <div className="form-container">
      <h2>Registro Profesor</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          required
        />
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
        <input
          type="text"
          placeholder="Clave secreta de profesor"
          value={claveSecreta}
          onChange={(e) => setClaveSecreta(e.target.value)}
          required
        />
        <button type="submit">Registrarse como Profesor</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}

export default RegisterTeacher;
