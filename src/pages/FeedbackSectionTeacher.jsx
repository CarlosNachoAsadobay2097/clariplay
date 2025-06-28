import React, { useState } from 'react';

export default function FeedbackSectionTeacher() {
  // Solo extraemos feedbackList, no necesitamos setFeedbackList
  const [feedbackList] = useState([
    { id: 'f1', studentName: 'María', comment: 'Excelente explicación en la lección 1.' },
    { id: 'f2', studentName: 'Luis', comment: 'Me gustaría más ejemplos en la lección 2.' },
  ]);

  return (
    <div className="section-block">
      <h2>Retroalimentación de Estudiantes</h2>
      {feedbackList.length === 0 ? (
        <p>No hay comentarios de retroalimentación aún.</p>
      ) : (
        <ul>
          {feedbackList.map(({ id, studentName, comment }) => (
            <li key={id}>
              <strong>{studentName}:</strong> {comment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
