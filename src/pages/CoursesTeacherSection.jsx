import React, { useState } from 'react'; // Quité useEffect

export default function CoursesTeacherSection() {
  const [courses] = useState([
    { id: 'c1', title: 'Curso de Guitarra Básica' },
    { id: 'c2', title: 'Teoría Musical Intermedia' },
  ]); // Quité setCourses porque no lo usas

  return (
    <div className="section-block">
      <h2>Mis Cursos</h2>
      {courses.length === 0 ? (
        <p>No tienes cursos creados aún.</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>{course.title}</li>
          ))}
        </ul>
      )}
      <button onClick={() => alert('Aquí puedes implementar la creación de nuevos cursos')}>
        + Crear nuevo curso
      </button>
    </div>
  );
}
