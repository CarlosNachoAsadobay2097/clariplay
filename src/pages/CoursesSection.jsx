import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";

export default function CoursesSection() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(); // ✅ mover aquí

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const enrollmentSnap = await getDocs(
          query(collection(db, "enrollments"), where("studentId", "==", user.uid))
        );
        const enrolledIds = enrollmentSnap.docs.map(doc => doc.data().course);

        const coursesSnap = await getDocs(collection(db, "courses"));
        const allCourses = coursesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const enrolled = allCourses.filter(course => enrolledIds.includes(course.id));
        const available = allCourses.filter(course => !enrolledIds.includes(course.id));

        setEnrolledCourses(enrolled);
        setAvailableCourses(available);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEnroll = async (courseId) => {
    const auth = getAuth(); // ✅ declarar aquí también
    const user = auth.currentUser;
    if (!user) return alert("Inicia sesión para inscribirte.");

    const enrollmentId = `${user.uid}_${courseId}`;

    try {
      await setDoc(doc(db, "enrollments", enrollmentId), {
        course: courseId,
        studentId: user.uid,
        enrolledAt: new Date()
      });

      const course = availableCourses.find(c => c.id === courseId);
      setEnrolledCourses(prev => [...prev, course]);
      setAvailableCourses(prev => prev.filter(c => c.id !== courseId));

      alert("✅ Te has inscrito en el curso.");
    } catch (error) {
      console.error("Error al inscribirse:", error);
      alert("❌ No se pudo completar la inscripción.");
    }
  };

  return (
    <div className="courses-section">
      <h2>Cursos Inscritos</h2>
      {loading && <p>Cargando cursos...</p>}
      <div className="course-list">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="course-card enrolled">
            <h3>{course.title}</h3>
            <p><strong>Profesor:</strong> {course.teacherName || "Profesor asignado"}</p>
            <p><strong>Instrumento:</strong> {course.instrument}</p>
            <p><strong>Nivel:</strong> {course.level}</p>
          </div>
        ))}
        {enrolledCourses.length === 0 && !loading && <p>No estás inscrito en ningún curso.</p>}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Cursos Disponibles</h2>
      <div className="course-list">
        {availableCourses.map((course) => (
          <div key={course.id} className="course-card available">
            <h3>{course.title}</h3>
            <p><strong>Profesor:</strong> {course.teacherName || "Profesor asignado"}</p>
            <p><strong>Instrumento:</strong> {course.instrument}</p>
            <p><strong>Nivel:</strong> {course.level}</p>
            <div className="course-buttons">
              <button className="enroll-btn" onClick={() => handleEnroll(course.id)}>
                Inscribirse
              </button>
              <button className="details-btn">Ver más</button>
            </div>
          </div>
        ))}
        {availableCourses.length === 0 && !loading && <p>No hay cursos disponibles en este momento.</p>}
      </div>
    </div>
  );
}
