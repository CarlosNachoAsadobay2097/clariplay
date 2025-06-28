import { useEffect, useState } from 'react';
import { getAuth, updateProfile, updateEmail, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProfileSection() {
  const auth = getAuth();
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    courses: [],
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: user.email,
            courses: data.courses || [],
          });
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            email: user.email,
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      if (formData.email !== user.email) {
        await updateEmail(user, formData.email);
      }

      setUserData({ ...formData, courses: userData.courses });
      setEditing(false);
    } catch (err) {
      console.error('Error actualizando perfil:', err);
    }
  };

  return (
    <div className="section-block">
      <h2>Perfil del Estudiante 👤</h2>

      <div className="profile-info">
        <label>
          Nombre:
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!editing}
          />
        </label>

        <label>
          Apellido:
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!editing}
          />
        </label>

        <label>
          Correo electrónico:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!editing}
          />
        </label>

        <div className="profile-actions">
          {!editing ? (
            <button onClick={() => setEditing(true)}>Editar perfil</button>
          ) : (
            <>
              <button onClick={handleSave}>Guardar cambios</button>
              <button onClick={() => setEditing(false)}>Cancelar</button>
            </>
          )}
        </div>
      </div>

      <div className="student-courses">
        <h3>Cursos inscritos:</h3>
        {userData.courses.length > 0 ? (
          <ul>
            {userData.courses.map((course, index) => (
              <li key={index}>{course}</li>
            ))}
          </ul>
        ) : (
          <p>Aún no estás inscrito en ningún curso.</p>
        )}
      </div>

      <div className="danger-zone">
        <h4>⚠️ Eliminar cuenta</h4>
        <button className="delete-account-btn" disabled>
          Eliminar mi cuenta
        </button>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          (Esta función aún no está habilitada por seguridad).
        </p>
      </div>
    </div>
  );
}
