export default function CoursesSection() {
  const enrolledCourses = [
    {
      id: 1,
      title: 'Guitarra Acústica - Nivel Principiante',
      teacher: 'Juan Pérez',
      instrument: 'Guitarra',
      level: 'Principiante',
      modality: 'Virtual',
      schedule: 'Lunes y miércoles - 18h00',
    },
    {
      id: 2,
      title: 'Piano Clásico - Nivel Intermedio',
      teacher: 'María López',
      instrument: 'Piano',
      level: 'Intermedio',
      modality: 'Presencial',
      schedule: 'Martes y jueves - 15h30',
    },
  ];

  const availableCourses = [
    {
      id: 3,
      title: 'Violín Básico para Niños',
      teacher: 'Carlos Jiménez',
      instrument: 'Violín',
      level: 'Básico',
      modality: 'Virtual',
      schedule: 'Sábados - 10h00',
    },
    {
      id: 4,
      title: 'Canto Popular - Nivel Avanzado',
      teacher: 'Ana Torres',
      instrument: 'Voz',
      level: 'Avanzado',
      modality: 'Virtual',
      schedule: 'Viernes - 17h00',
    },
  ];

  return (
    <div className="courses-section">
      <h2>🎓 Cursos Inscritos</h2>
      <div className="course-list">
        {enrolledCourses.map((course) => (
          <div key={course.id} className="course-card enrolled">
            <h3>{course.title}</h3>
            <p><strong>Profesor:</strong> {course.teacher}</p>
            <p><strong>Instrumento:</strong> {course.instrument}</p>
            <p><strong>Nivel:</strong> {course.level}</p>
            <p><strong>Modalidad:</strong> {course.modality}</p>
            <p><strong>Horario:</strong> {course.schedule}</p>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '2rem' }}>🆕 Cursos Disponibles</h2>
      <div className="course-list">
        {availableCourses.map((course) => (
          <div key={course.id} className="course-card available">
            <h3>{course.title}</h3>
            <p><strong>Profesor:</strong> {course.teacher}</p>
            <p><strong>Instrumento:</strong> {course.instrument}</p>
            <p><strong>Nivel:</strong> {course.level}</p>
            <p><strong>Modalidad:</strong> {course.modality}</p>
            <p><strong>Horario:</strong> {course.schedule}</p>
            <div className="course-buttons">
              <button className="enroll-btn">Inscribirse</button>
              <button className="details-btn">Ver más</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
