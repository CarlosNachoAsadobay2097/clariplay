import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "../firebase"; // Asegúrate de exportar storage también
import ScoreViewer from "../components/ScoreViewer";

export default function LessonsSection() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [theoryClasses, setTheoryClasses] = useState([]);
  const [expandedLessons, setExpandedLessons] = useState({});
  const [expandedTheory, setExpandedTheory] = useState({});
  const [coursesData, setCoursesData] = useState({}); // id -> título
  const [uploading, setUploading] = useState(false);

  // 1. Obtener usuario autenticado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setEnrolledCourses([]);
        setLessons([]);
        setTheoryClasses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Obtener todos los cursos para mapear id -> título
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const coursesSnap = await getDocs(collection(db, "courses"));
        const coursesMap = {};
        coursesSnap.docs.forEach((doc) => {
          coursesMap[doc.id] = doc.data().title;
        });
        setCoursesData(coursesMap);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  // 3. Obtener inscripciones desde Firestore por studentId
  useEffect(() => {
    if (!user) return;

    const fetchEnrollments = async () => {
      try {
        const enrollmentSnap = await getDocs(
          query(collection(db, "enrollments"), where("studentId", "==", user.uid))
        );

        const courses = enrollmentSnap.docs.map((doc) => doc.data().course);
        setEnrolledCourses(courses);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        setEnrolledCourses([]);
      }
    };

    fetchEnrollments();
  }, [user]);

  // 4. Suscripción a lecciones y clases teóricas
  useEffect(() => {
    if (!user || enrolledCourses.length === 0) {
      setLessons([]);
      setTheoryClasses([]);
      return;
    }

    const qLessons = query(collection(db, "lessons"), where("course", "in", enrolledCourses));
    const unsubscribeLessons = onSnapshot(
      qLessons,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setLessons(data);
      },
      (error) => {
        console.error("Error fetching lessons:", error);
        setLessons([]);
      }
    );

    const qTheory = query(collection(db, "theoryClasses"), where("course", "in", enrolledCourses));
    const unsubscribeTheory = onSnapshot(
      qTheory,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTheoryClasses(data);
      },
      (error) => {
        console.error("Error fetching theory classes:", error);
        setTheoryClasses([]);
      }
    );

    return () => {
      unsubscribeLessons();
      unsubscribeTheory();
    };
  }, [user, enrolledCourses]);

  // Agrupar lecciones y teóricas por curso
  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.course]) acc[lesson.course] = { lessons: [], theory: [] };
    acc[lesson.course].lessons.push(lesson);
    return acc;
  }, {});

  theoryClasses.forEach((theory) => {
    if (!groupedLessons[theory.course]) groupedLessons[theory.course] = { lessons: [], theory: [] };
    groupedLessons[theory.course].theory.push(theory);
  });

  // === Función para subir audio a Firebase Storage y registrar en Firestore ===
  async function handleAudioUpload(audioBlob, lessonId, courseId) {
    if (!user) return alert("Debes iniciar sesión para subir audio.");

    try {
      setUploading(true);

      // Crear referencia en Storage
      const storageRef = ref(
        storage,
        `audio_recordings/${user.uid}/${lessonId}/${Date.now()}.webm`
      );



      // Subir archivo
      await uploadBytes(storageRef, audioBlob);

      // Obtener URL descargable
      const downloadUrl = await getDownloadURL(storageRef);

      // Guardar documento en Firestore en una colección 'audioRecordings'
      await addDoc(collection(db, "audioRecordings"), {
        lessonId,
        courseId,
        studentId: user.uid,
        audioUrl: downloadUrl,
        createdAt: serverTimestamp(),
      });

      alert("Audio subido correctamente!");
    } catch (error) {
      console.error("❌ Error al subir audio:", error);
      alert("Error al subir audio: " + (error?.message || JSON.stringify(error)));
    }finally {
      setUploading(false);
    }
  }

  return (
    <div className="lessons-section">
      <h2>📚 Contenido de tus cursos</h2>

      {uploading && <p>⏳ Subiendo audio...</p>}

      {Object.entries(groupedLessons).map(([courseId, content]) => (
        <div key={courseId} className="course-block">
          <h3>Curso: {coursesData[courseId] || courseId}</h3>

          {content.lessons.length > 0 && (
            <>
              <h4>🎼 Lecciones</h4>
              {content.lessons.map((lesson) => (
                <div key={lesson.id} className="lesson-card">
                  <div className="lesson-header">
                    <strong>{lesson.title}</strong>
                    <button
                      onClick={() =>
                        setExpandedLessons((prev) => ({
                          ...prev,
                          [lesson.id]: !prev[lesson.id],
                        }))
                      }
                    >
                      {expandedLessons[lesson.id] ? "Ocultar" : "Ver más"}
                    </button>
                  </div>
                  {expandedLessons[lesson.id] && (
                    <div className="lesson-content">
                      <p>
                        <em>{lesson.description}</em>
                      </p>
                      <p>{lesson.instructions}</p>
                      {lesson.xmlUrl && (
                        <ScoreViewer
                            xmlUrl={lesson.xmlUrl}
                            lessonId={lesson.id}
                            courseId={lesson.course}
                            userId={user.uid}
                            onAudioUploaded={async (audioBlob) => {
                              await handleAudioUpload(audioBlob, lesson.id, lesson.course);
                            }}
                          />


                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {content.theory.length > 0 && (
            <>
              <h4>🧠 Clases Teóricas</h4>
              {content.theory.map((cls) => (
                <div key={cls.id} className="theory-card">
                  <strong>{cls.title}</strong>
                  <p>{cls.content}</p>
                  {cls.imageUrl && (
                    <div className="image-container">
                      <button
                        onClick={() =>
                          setExpandedTheory((prev) => ({
                            ...prev,
                            [cls.id]: !prev[cls.id],
                          }))
                        }
                        className="toggle-image-button"
                      >
                        {expandedTheory[cls.id] ? "Ocultar imagen" : "Ver imagen"}
                      </button>
                      {expandedTheory[cls.id] && (
                        <img
                          src={cls.imageUrl}
                          alt="Infografía"
                          className="theory-image"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      ))}

      {Object.keys(groupedLessons).length === 0 && (
        <p>No hay contenido disponible todavía.</p>
      )}
    </div>
  );
}
