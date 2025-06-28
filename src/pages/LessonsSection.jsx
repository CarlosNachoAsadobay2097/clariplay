import { useState } from 'react';
import ScoreViewer from '../components/ScoreViewer';

const initialLessons = [
  {
    id: 1,
    title: 'Lección 1: Introducción a la música',
    description: 'Descripción general de la lección 1, con detalles sobre objetivos y temas a cubrir.',
    content: 'Esta lección cubre los conceptos básicos sobre notas y ritmos.',
    status: 'En progreso',
    assignedDate: '2025-06-20',
    notes: '',
  },
  {
    id: 2,
    title: 'Lección 2: Escalas y acordes',
    description: 'Descripción general de la lección 2, explorando escalas mayores y menores.',
    content: 'Aprenderemos sobre escalas mayores y menores, y cómo forman acordes.',
    status: 'No iniciada',
    assignedDate: '2025-06-22',
    notes: '',
  },
];

export default function LessonsSection() {
  const [lessons, setLessons] = useState(initialLessons);
  const [expandedIds, setExpandedIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNotesChange = (id, newNotes) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id ? { ...lesson, notes: newNotes } : lesson
      )
    );
  };

  const markCompleted = (id) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === id ? { ...lesson, status: 'Completada' } : lesson
      )
    );
  };

  return (
    <div className="lessons-section">
      <h2>Mis Lecciones</h2>
      {lessons.map((lesson) => (
        <div key={lesson.id} className="lesson-card">
          <div className="lesson-header">
            <h3>{lesson.title}</h3>
            <button onClick={() => toggleExpand(lesson.id)}>
              {expandedIds.includes(lesson.id) ? 'Ocultar' : 'Mostrar más'}
            </button>
          </div>

          <div className="lesson-meta">
            <span><strong>Estado:</strong> {lesson.status}</span>
            <span><strong>Asignada:</strong> {lesson.assignedDate}</span>
          </div>

          <div className="lesson-description">
            <em>{lesson.description}</em>
          </div>

          {expandedIds.includes(lesson.id) && (
            <div className="lesson-content">
              <p>{lesson.content}</p>

              <label>
                Notas personales:
                <textarea
                  value={lesson.notes}
                  onChange={(e) => handleNotesChange(lesson.id, e.target.value)}
                  placeholder="Escribe tus notas aquí..."
                />
              </label>

              {lesson.status !== 'Completada' && (
                <button className="complete-btn" onClick={() => markCompleted(lesson.id)}>
                  Marcar como completada
                </button>
              )}

              {/* Aquí agregamos el ScoreViewer */}
              <ScoreViewer />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
