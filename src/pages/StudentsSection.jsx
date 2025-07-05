import React, { useState } from 'react';

export default function StudentsSection() {
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);

  const courses = [
    {
      id: 'c1',
      title: 'Curso de Guitarra Básica',
      students: [
        {
          id: 's1',
          name: 'Ana',
          average: 8.5,
          grades: { 'Lección 1': 9, 'Lección 2': 8 },
        },
        {
          id: 's2',
          name: 'Luis',
          average: 7.2,
          grades: { 'Lección 1': 7, 'Lección 2': 7.4 },
        },
      ],
    },
    {
      id: 'c2',
      title: 'Teoría Musical Intermedia',
      students: [
        {
          id: 's3',
          name: 'Carlos',
          average: 9.0,
          grades: { 'Lección 1': 9 },
        },
      ],
    },
  ];

  const toggleCourse = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
    setEditingStudentId(null); // cerrar edición si se cambia de curso
  };

  const toggleEditGrades = (studentId) => {
    setEditingStudentId(editingStudentId === studentId ? null : studentId);
  };

  return (
    <div className="section-block student-courses-section">
      <h2>Lista de Estudiantes</h2>
      <p>Aquí podrás ver y gestionar los estudiantes inscritos en tus cursos.</p>

      <div className="student-course-cards">
        {courses.map((course) => (
          <div key={course.id} className="student-course-card">
            <div className="student-course-header" onClick={() => toggleCourse(course.id)}>
              <h3>{course.title}</h3>
              <button className="student-toggle-btn">
                {expandedCourse === course.id ? 'Ocultar' : 'Ver estudiantes'}
              </button>
            </div>

            {expandedCourse === course.id && (
              <ul className="student-course-list">
                {course.students.map((student) => (
                  <li key={student.id} className="student-course-item">
                    <div className="student-course-top">
                      <span className="student-course-name">{student.name}</span>
                      <span className="student-average">Promedio: {student.average}</span>
                    </div>

                    <div className="student-course-actions">
                      <button
                        className="student-btn edit"
                        onClick={() => toggleEditGrades(student.id)}
                      >
                        {editingStudentId === student.id
                          ? 'Cancelar edición'
                          : 'Editar calificación'}
                      </button>
                      <button className="student-btn view">Ver calificaciones</button>
                    </div>

                    {editingStudentId === student.id && (
                      <div className="edit-grades-box">
                        <table className="edit-grades-table">
                          <thead>
                            <tr>
                              <th>Lección</th>
                              <th>Nota</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(student.grades).map(([lesson, grade]) => (
                              <tr key={lesson}>
                                <td>{lesson}</td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    defaultValue={grade}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="edit-grades-buttons">
                          <button className="student-btn save">Guardar</button>
                          <button
                            className="student-btn cancel"
                            onClick={() => setEditingStudentId(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
