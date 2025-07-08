import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getDocs } from 'firebase/firestore';

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export default function LessonsByCourse() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [courses, setCourses] = useState([]);
  const [lessonsByCourse, setLessonsByCourse] = useState({}); // { courseId: [lessons] }

  // Cargar cursos creados por usuario (profesor)
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'courses'), where('createdBy', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(fetchedCourses);
    });

    return () => unsubscribe();
  }, [user]);

  // Para cada curso, cargar sus lecciones
useEffect(() => {
  if (courses.length === 0) return;

  const fetchLessons = async () => {
    let newLessonsByCourse = {};
    for (const course of courses) {
      const q = query(
        collection(db, 'lessons'),
        where('courseId', '==', course.id),
        where('createdBy', '==', user.uid)
        );

      const snapshot = await getDocs(q);
      newLessonsByCourse[course.id] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    console.log('Lecciones por curso:', newLessonsByCourse);
    setLessonsByCourse(newLessonsByCourse);
  };

  fetchLessons();
}, [courses, user?.uid]);



  // Función para eliminar lección (con confirmación)
  const handleDeleteLesson = async (lessonId, courseId, xmlFileUrl, imageUrl) => {
    if (!window.confirm('¿Estás seguro de eliminar esta lección? Esta acción no se puede deshacer.')) return;

    try {
      // Eliminar archivo XML de storage si existe
      if (xmlFileUrl) {
        const xmlRef = ref(storage, xmlFileUrl);
        await deleteObject(xmlRef);
      }

      // Eliminar imagen teórica de storage si existe
      if (imageUrl) {
        const imgRef = ref(storage, imageUrl);
        await deleteObject(imgRef);
      }

      // Eliminar documento en Firestore
      const lessonDocRef = doc(db, 'lessons', lessonId);
      await deleteDoc(lessonDocRef);

      alert('Lección eliminada correctamente.');
    } catch (error) {
      console.error('Error al eliminar lección:', error);
      alert('Error al eliminar la lección.');
    }
  };

  return (
    <div>
      <h2>Mis Cursos y Lecciones</h2>

      {courses.length === 0 && <p>No tienes cursos creados.</p>}

      {courses.map(course => {
        const isTeacher = course.createdBy === user.uid;
        const lessons = lessonsByCourse[course.id] || [];

        return (
          <div key={course.id} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '6px' }}>
            <h3>{course.title} — Nivel: {course.level} — Instrumento: {course.instrument}</h3>

            {lessons.length === 0 && <p>No hay lecciones en este curso.</p>}

            {lessons.map(lesson => (
              <div key={lesson.id} style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px' }}>
                <strong>{lesson.title}</strong> — Tipo: {lesson.type === 'practical' ? 'Práctica' : 'Teoría'}
                <p>{lesson.description}</p>

                {isTeacher && (
                  <>
                    {/* Aquí puedes agregar función editar si quieres */}
                    <button
                      style={{ marginRight: '0.5rem', backgroundColor: '#E51B23', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}
                      onClick={() => handleDeleteLesson(lesson.id, course.id, lesson.xmlFileUrl, lesson.imageUrl)}
                    >
                      Eliminar
                    </button>
                  </>
                )}

                <button
                  onClick={() => alert('Aquí mostrarías detalle de la lección')}
                  style={{ backgroundColor: '#1D1D1B', color: 'white', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Ver más
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
