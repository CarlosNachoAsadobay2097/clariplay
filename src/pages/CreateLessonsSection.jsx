import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db, storage } from '../firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import ScoreEditor from '../components/ScoreEditor';

export default function CreateLessonsSection() {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);

  const [lessons, setLessons] = useState([]);
  const [newLesson, setNewLesson] = useState({
    title: '',
    course: '',
    description: '',
    instructions: '',
    xmlUrl: '',
    xmlPath: ''
  });
  const [scoreData, setScoreData] = useState({ notes: [], audioUrl: null, xmlContent: null });
  const [editLessonId, setEditLessonId] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [showEditMessage, setShowEditMessage] = useState(false);
  const [userCourses, setUserCourses] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'courses'), where('teacherId', '==', user.uid)),
      (snapshot) => {
        const coursesData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserCourses(coursesData);
      }
    );
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'lessons'), where('teacherId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lessonsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLessons(lessonsData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLesson(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xml') || file.name.endsWith('.musicxml'))) {
      setXmlFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const xmlText = event.target.result;
        setScoreData(prev => ({ ...prev, xmlContent: xmlText }));
      };
      reader.readAsText(file);
    } else {
      alert('Por favor selecciona un archivo .xml o .musicxml válido.');
    }
  };

  const uploadXmlFile = async (file, lessonId) => {
    if (!user || !user.uid) throw new Error('Usuario no autenticado');
    const filePath = `lessons/${user.uid}/${lessonId}/${file.name}`; // ✅ Sí funciona

    console.log('📁 Subiendo archivo a:', filePath);
    const fileRef = ref(storage, filePath);
    try {
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return { url, path: filePath };
    } catch (error) {
      console.error('❌ Error subiendo a Storage:', error.message);
      throw error;
    }
  };

  const deletePreviousXmlFile = async (xmlPath) => {
    if (!xmlPath) return;
    try {
      const fileRef = ref(storage, xmlPath);
      await deleteObject(fileRef);
    } catch (err) {
      console.warn('No se pudo borrar archivo anterior:', err.message);
    }
  };

  const resetForm = () => {
    setEditLessonId(null);
    setShowEditMessage(false);
    setXmlFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setNewLesson({
      title: '', course: '', description: '', instructions: '', xmlUrl: '', xmlPath: ''
    });
    setScoreData({ notes: [], audioUrl: null, xmlContent: null });
    console.log('Formulario limpiado manualmente');
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title || !newLesson.course || !user) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
    console.log('👤 Usuario autenticado:', user.uid);

    try {
      if (editLessonId) {
        const lessonRef = doc(db, 'lessons', editLessonId);
        const updatedLesson = {
          ...newLesson,
          ...scoreData,
          updatedAt: new Date()
        };

        if (xmlFile) {
          await deletePreviousXmlFile(newLesson.xmlPath);
          const { url, path } = await uploadXmlFile(xmlFile, editLessonId);
          updatedLesson.xmlUrl = url;
          updatedLesson.xmlPath = path;
        }

        await updateDoc(lessonRef, updatedLesson);
        setTimeout(() => alert('✅ Lección actualizada correctamente.'), 100);
      } else {
        const newLessonDoc = await addDoc(collection(db, 'lessons'), {
          ...newLesson,
          ...scoreData,
          teacherId: user.uid,
          createdAt: new Date()
        });

        if (xmlFile) {
          const result = await uploadXmlFile(xmlFile, newLessonDoc.id);
          await updateDoc(newLessonDoc, { xmlUrl: result.url, xmlPath: result.path });
        }

        setTimeout(() => alert('✅ Lección guardada correctamente.'), 100);
      }

      resetForm();
    } catch (error) {
      console.error('❌ Error al guardar lección:', error.message);
      if (error.message.includes('permission')) {
        alert('⚠️ No tienes permisos suficientes para guardar esta lección. Revisa las reglas de Firebase Storage.');
      } else {
        alert('❌ Hubo un error al guardar la lección. Intenta nuevamente.');
      }
    }
  };

  const handleEdit = async (lesson) => {
    setEditLessonId(lesson.id);
    setNewLesson({
      title: lesson.title || '',
      course: lesson.course || '',
      description: lesson.description || '',
      instructions: lesson.instructions || '',
      xmlUrl: lesson.xmlUrl || '',
      xmlPath: lesson.xmlPath || ''
    });

    if (lesson.xmlUrl) {
      try {
        const response = await fetch(lesson.xmlUrl);
        const xmlText = await response.text();
        setScoreData({
          notes: lesson.notes || [],
          audioUrl: lesson.audioUrl || null,
          xmlContent: xmlText
        });
      } catch {
        setScoreData({
          notes: lesson.notes || [],
          audioUrl: lesson.audioUrl || null,
          xmlContent: null
        });
      }
    } else {
      setScoreData({
        notes: lesson.notes || [],
        audioUrl: lesson.audioUrl || null,
        xmlContent: null
      });
    }

    setShowEditMessage(true);
    setTimeout(() => setShowEditMessage(false), 4000);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Seguro quieres eliminar esta lección?')) {
      try {
        const lessonToDelete = lessons.find(l => l.id === id);
        if (lessonToDelete?.xmlPath) await deletePreviousXmlFile(lessonToDelete.xmlPath);
        await deleteDoc(doc(db, 'lessons', id));
        alert('🗑️ Lección eliminada');
        if (editLessonId === id) resetForm();
      } catch (error) {
        console.error('Error eliminando lección:', error);
        alert('❌ Error al eliminar');
      }
    }
  };

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.course]) acc[lesson.course] = [];
    acc[lesson.course].push(lesson);
    return acc;
  }, {});

  return (
    <div className="section-block create-lesson" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>{editLessonId ? 'Editar Lección' : 'Crear Lección'}</h2>

      {showEditMessage && (
        <div style={{ backgroundColor: '#FFF4E5', padding: '1rem', borderLeft: '4px solid #E51B23', marginBottom: '1rem' }}>
          <span>✏️ Los datos de la lección se han cargado en el formulario.</span>
          <button onClick={() => setShowEditMessage(false)} style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.2rem' }}>✖</button>
        </div>
      )}

      <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <label>
          Curso:
          <select name="course" value={newLesson.course || ''} onChange={handleChange} required>
            <option value="">Selecciona un curso</option>
            {userCourses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </label>

        <label>
          Título de la Lección:
          <input type="text" name="title" value={newLesson.title || ''} onChange={handleChange} required />
        </label>

        <label>
          Descripción:
          <textarea name="description" value={newLesson.description || ''} onChange={handleChange} />
        </label>

        <label>
          Instrucciones para el estudiante:
          <textarea name="instructions" value={newLesson.instructions || ''} onChange={handleChange} />
        </label>

        <label>
          Archivo MusicXML (.xml o .musicxml):
          <input type="file" accept=".xml,.musicxml" onChange={handleFileChange} ref={fileInputRef} />
        </label>

        <ScoreEditor xmlContent={scoreData.xmlContent} onDataChange={setScoreData} />

        <button type="submit" style={{ background: '#E51B23', color: '#fff', padding: '10px', borderRadius: '6px' }}>
          {editLessonId ? 'Actualizar Lección' : 'Guardar Lección'}
        </button>

        <button type="button" onClick={resetForm} style={{ background: '#ccc', color: '#000', padding: '10px', borderRadius: '6px' }}>
          🧹 Borrar contenido
        </button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3>Lecciones creadas</h3>
        {Object.entries(groupedLessons).length === 0 && <p>No hay lecciones guardadas.</p>}

        {Object.entries(groupedLessons).map(([course, courseLessons]) => (
          <div key={course} style={{ marginBottom: '2rem', backgroundColor: '#fff' }}>
            <h4>{userCourses.find(c => c.id === course)?.title || course}</h4>
            {courseLessons.map(lesson => (
              <div key={lesson.id} style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '1rem' }}>
                <strong>{lesson.title}</strong>
                <p>{lesson.description}</p>
                {lesson.xmlUrl && <a href={lesson.xmlUrl} target="_blank" rel="noreferrer">📄 Ver archivo XML</a>}
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                  <button onClick={() => handleEdit(lesson)}>✏️ Editar</button>
                  <button onClick={() => handleDelete(lesson.id)} style={{ color: 'red' }}>🗑️ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}