import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import ScoreViewer from '../components/ScoreViewer'; // Ajusta la ruta si es necesario
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

export default function LessonsSection() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [courses, setCourses] = useState([]); // Aquí guardamos datos completos de cursos
  const [lessonsByCourse, setLessonsByCourse] = useState({}); // { courseId: [lessons...] }
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        // Paso 1: Obtener cursos donde el estudiante está inscrito (ids)
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('studentId', '==', user.uid)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);

        if (courseIds.length === 0) {
          setCourses([]);
          setLessonsByCourse({});
          setLoading(false);
          return;
        }

        // Paso 2: Obtener detalles completos de cada curso
        const coursesData = [];
        for (const courseId of courseIds) {
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          if (courseDoc.exists()) {
            coursesData.push({ id: courseId, ...courseDoc.data() });
          }
        }
        setCourses(coursesData);

        // Paso 3: Obtener lecciones agrupadas por cursoId
        const lessonsMap = {}; // courseId -> [lessons]

        // Consultar lecciones por lotes
        for (let i = 0; i < courseIds.length; i += 10) {
          const chunk = courseIds.slice(i, i + 10);
          const lessonsQuery = query(
            collection(db, 'lessons'),
            where('courseId', 'in', chunk)
          );
          const lessonsSnapshot = await getDocs(lessonsQuery);

          lessonsSnapshot.docs.forEach(docSnap => {
            const lesson = { id: docSnap.id, ...docSnap.data() };
            if (!lessonsMap[lesson.courseId]) {
              lessonsMap[lesson.courseId] = [];
            }
            lessonsMap[lesson.courseId].push(lesson);
          });
        }

        setLessonsByCourse(lessonsMap);

      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const toggleSelectedLesson = (id) => {
    setSelectedLessonId(prev => (prev === id ? null : id));
  };

  return (
    <div className="lessons-section-wrapper">
      <h2 className="lessons-section-title">
        <span><FontAwesomeIcon icon={faMusic} /> </span>Mis Lecciones
      </h2>

      {loading && <p className="lessons-section-loading">Cargando lecciones...</p>}
      {!loading && courses.length === 0 && <p className="lessons-section-empty">No tienes lecciones disponibles.</p>}

      {courses.map(course => (
        <div key={course.id} className="course-group">
          <h3 className="course-title">{course.title} — Nivel: {course.level} — Instrumento: {course.instrument}</h3>

          <div className="lessons-section-grid">
            {(lessonsByCourse[course.id] && lessonsByCourse[course.id].length > 0) ? (
              lessonsByCourse[course.id].map(lesson => {
                const isSelected = selectedLessonId === lesson.id;
                const isPractical = lesson.type === 'practical';
                const isTheory = lesson.type === 'theory';

                return (
                  <div className="lessons-card" key={lesson.id}>
                    <h4 className="lessons-card-title">{lesson.title}</h4>
                    <p className="lessons-card-type">
                      <strong>Tipo:</strong> {isPractical ? 'Práctica' : 'Teoría'}
                    </p>
                    <p className="lessons-card-description">{lesson.description}</p>

                    {(isPractical && lesson.xmlFileUrl) || (isTheory && lesson.imageUrl) ? (
                      <button
                        onClick={() => toggleSelectedLesson(lesson.id)}
                        className="lessons-card-button"
                      >
                        {isSelected ? 'Ocultar' : isPractical ? 'Ver partitura' : 'Ver infografía'}
                      </button>
                    ) : null}

                    {isSelected && (
                      <div className="lessons-card-score">
                        {isPractical && lesson.xmlFileUrl && (
                          <ScoreViewer xmlUrl={lesson.xmlFileUrl} />
                        )}

                        {isTheory && lesson.imageUrl && (
                          <>
                            <img
                              src={lesson.imageUrl}
                              alt="Infografía"
                              className="lessons-card-image"
                            />
                          </>
                        )}

                        {isTheory && lesson.content && (
                          <div
                            className="lessons-card-content"
                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No hay lecciones para este curso.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
