import { useState } from 'react';

export default function LessonsSection({ onNavigateToFeedback }) {
  const initialLessons = [
    {
      id: 1,
      title: 'Lección 1: Introducción a la música',
      description: 'Objetivos y temas a cubrir.',
      content: 'Esta lección cubre los conceptos básicos...',
      status: 'En progreso',
      assignedDate: '2025-06-20',
      notes: '9.2',
    },
    {
      id: 2,
      title: 'Lección 2: Escalas y acordes',
      description: 'Exploración de escalas mayores y menores.',
      content: 'Aprenderemos sobre escalas...',
      status: 'No iniciada',
      assignedDate: '2025-06-22',
      notes: '', // Nota aún no asignada
    },
    {
      id: 3,
      title: 'Lección 3: Lectura rítmica',
      description: 'Ejercicios prácticos para mejorar el ritmo.',
      content: 'Vamos a practicar distintas figuras rítmicas...',
      status: 'Completada',
      assignedDate: '2025-06-26',
      notes: '8.5',
    },
  ];

  const [lessons] = useState(initialLessons);

  return (
    <div className="lessons-section">
      <h2>Mis Lecciones</h2>

      {/* Tabla resumen con notas */}
      <table className="lessons-table">
        <thead>
          <tr>
            <th>N°</th>
            <th>Actividad</th>
            <th>Nota</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson) => (
            <tr key={lesson.id}>
              <td>{lesson.id}</td>
              <td>{lesson.title}</td>
              <td>{lesson.notes ? lesson.notes : '—'}</td>
              <td>
                <button
                  className="feedback-link"
                  onClick={() => onNavigateToFeedback(lesson.id)}
                >
                  Ver feedback
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
