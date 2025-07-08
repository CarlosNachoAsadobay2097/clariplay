import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function StudentLessons() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchLessons() {
      try {
        // Paso 1: Obtener cursos inscritos
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);

        if (courseIds.length === 0) {
          setLessons([]);
          setLoading(false);
          return;
        }

        // Paso 2: Obtener lecciones filtrando por courseId
        // Nota: Firestore limita "in" a máximo 10 elementos, si hay más, debes hacer varias consultas
        const lessonsQuery = query(
          collection(db, 'lessons'),
          where('courseId', 'in', courseIds)
        );
        const lessonsSnapshot = await getDocs(lessonsQuery);

        const fetchedLessons = lessonsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setLessons(fetchedLessons);
      } catch (error) {
        console.error('Error al obtener lecciones:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLessons();
  }, [user]);

  return (
    <div>
      <h2>Mis Lecciones</h2>
      {loading && <p>Cargando lecciones...</p>}
      {!loading && lessons.length === 0 && <p>No tienes lecciones disponibles.</p>}
      <ul>
        {lessons.map(lesson => (
          <li key={lesson.id}>
            <strong>{lesson.title}</strong> — Tipo: {lesson.type}
            <p>{lesson.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
