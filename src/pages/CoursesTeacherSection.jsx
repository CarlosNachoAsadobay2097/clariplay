import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

export default function CoursesTeacherSection() {
  const [courses, setCourses] = useState([]);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', level: '', instrument: '' });

  const auth = getAuth();
  const user = auth.currentUser;

  // Cargar cursos del profesor autenticado
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'courses'), where('createdBy', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(data);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleCourse = (id) => setOpenCourseId(prev => (prev === id ? null : id));
  const toggleAddForm = () => setShowAddForm(prev => !prev);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!user || !newCourse.title || !newCourse.level || !newCourse.instrument) {
      alert('Completa todos los campos');
      return;
    }

    try {
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        teacherId: user.uid,     // Opcional, por compatibilidad
        createdBy: user.uid,     // Obligatorio según reglas de Firestore
        createdAt: new Date(),   // Puedes usar serverTimestamp si prefieres
      });
      setNewCourse({ title: '', level: '', instrument: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error al guardar curso:', err);
      alert('Error al guardar curso');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const confirm = window.confirm('¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.');

    if (!confirm) return;

    try {
      await deleteDoc(doc(db, 'courses', courseId));
      alert('Curso eliminado correctamente ✅');
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      alert('No se pudo eliminar el curso ❌');
    }
  };


  return (
    <div className="section-block">
      <h2>Mis Cursos</h2>

      <button onClick={toggleAddForm} style={{ marginBottom: '1rem' }}>
        {showAddForm ? 'Cancelar' : 'Agregar nuevo curso'}
      </button>

      {showAddForm && (
        <form onSubmit={handleAddCourse} className="add-course-form" style={{ marginBottom: '2rem' }}>
          <label>
            Título:
            <input type="text" name="title" value={newCourse.title} onChange={handleInputChange} />
          </label>

          <label>
            Nivel:
            <select name="level" value={newCourse.level} onChange={handleInputChange}>
              <option value="">Selecciona nivel</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </label>

          <label>
            Instrumento:
            <input type="text" name="instrument" value={newCourse.instrument} onChange={handleInputChange} />
          </label>

          <button type="submit">Agregar Curso</button>
        </form>
      )}

      <ul className="courses-list">
        {courses.map((course) => (
          <li key={course.id} className="course-item">
            <div className="course-header" onClick={() => toggleCourse(course.id)}>
              <strong>{course.title}</strong> — Nivel: {course.level} — Instrumento: {course.instrument}
              <span className="toggle-text">{openCourseId === course.id ? '▼ Ocultar' : '▶ Ver alumnos'}</span>
              <button onClick={() => handleDeleteCourse(course.id)}>
                Eliminar curso
              </button>

            </div>

            {openCourseId === course.id && (
              <div className="students-table-wrapper">
                <p>No hay estudiantes inscritos aún.</p> {/* Implementaremos luego */}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
