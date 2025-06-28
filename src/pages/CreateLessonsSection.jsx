import React, { useState } from 'react';

export default function CreateLessonsSection() {
  const [lessons, setLessons] = useState([
    { id: 'l1', title: 'Lección 1: Introducción' },
    { id: 'l2', title: 'Lección 2: Escalas básicas' },
  ]);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  const handleAddLesson = () => {
    if (newLessonTitle.trim() === '') return;

    const newLesson = {
      id: `l${lessons.length + 1}`,
      title: newLessonTitle.trim(),
    };
    setLessons([...lessons, newLesson]);
    setNewLessonTitle('');
  };

  return (
    <div className="section-block">
      <h2>Crear Lecciones</h2>
      <div>
        <input
          type="text"
          placeholder="Título de la nueva lección"
          value={newLessonTitle}
          onChange={(e) => setNewLessonTitle(e.target.value)}
        />
        <button onClick={handleAddLesson}>Agregar Lección</button>
      </div>

      {lessons.length === 0 ? (
        <p>No hay lecciones creadas aún.</p>
      ) : (
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>{lesson.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
