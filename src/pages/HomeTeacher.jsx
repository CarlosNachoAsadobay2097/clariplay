export default function HomeTeacher({ user }) {
  // Datos simulados (en un proyecto real vendrían de la base de datos)
  const courses = [
    { id: 1, title: 'Guitarra Avanzada', studentsCount: 25 },
    { id: 2, title: 'Piano para principiantes', studentsCount: 18 },
    { id: 3, title: 'Teoría musical intermedia', studentsCount: 12 },
  ];

  const notifications = [
    { id: 1, message: 'Nuevo estudiante inscrito en "Guitarra Avanzada".', date: '2025-06-29' },
    { id: 2, message: 'Comentario pendiente por revisar en "Piano para principiantes".', date: '2025-06-28' },
    { id: 3, message: 'Recuerda preparar la clase para mañana.', date: '2025-06-27' },
  ];

  if (!user || !user.firstName) {
    return (
      <div className="section-block">
        <p>Cargando perfil del profesor...</p>
      </div>
    );
  }

  return (
    <div className="section-block">
      <h2>👋 Bienvenido/a, {user.firstName} {user.lastName}</h2>
      <p>Este es tu panel de profesor/a. Desde aquí podrás crear cursos, agregar lecciones y gestionar estudiantes.</p>

      {/* Lista de cursos activos */}
      <section className="teacher-courses-summary" style={{ marginTop: '2rem' }}>
        <h3>Tus cursos activos</h3>
        {courses.length === 0 ? (
          <p>No tienes cursos activos. ¡Crea uno ahora!</p>
        ) : (
          <ul>
            {courses.map((course) => (
              <li key={course.id} className="course-item">
                <strong>{course.title}</strong> - {course.studentsCount} estudiantes inscritos
                <button className="btn-go-course" onClick={() => alert(`Ir al curso ${course.title}`)}>Ir al curso</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notificaciones importantes */}
      <section className="teacher-notifications" style={{ marginTop: '2rem' }}>
        <h3>Notificaciones importantes</h3>
        {notifications.length === 0 ? (
          <p>No hay nuevas notificaciones.</p>
        ) : (
          <ul className="notificaciones-lista">
            {notifications.map((note) => (
              <li key={note.id} className="notificacion-item">
                <p>{note.message}</p>
                <span className="fecha">{note.date}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
