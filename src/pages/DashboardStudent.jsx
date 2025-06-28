import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faMusic,
  faClipboard,
  faBook,
  faComments,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';

import LessonsSection from './LessonsSection';
import GradesSection from './GradesSection';
import CoursesSection from './CoursesSection';
import FeedbackSection from './FeedbackSection';
import ProfileSection from './ProfileSection';
import HomeStudent from './HomeStudent';

export default function DashboardStudent() {
  const [selectedSection, setSelectedSection] = useState('lessons');
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [feedbackLessonId, setFeedbackLessonId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No existe documento en Firestore para este usuario');
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    switch (selectedSection) {
      case 'home':
        return (
          <HomeStudent
            user={{
              firstName: userData?.firstName || 'Estudiante',
              lastName: userData?.lastName || '',
            }}
          />
        );
      case 'lessons':
        return (
          <LessonsSection
            onNavigateToFeedback={(lessonId) => {
              setFeedbackLessonId(lessonId);
              setSelectedSection('feedback');
            }}
          />
        );
      case 'grades':
        return <GradesSection />;
      case 'courses':
        return <CoursesSection />;
      case 'feedback':
        return <FeedbackSection lessonId={feedbackLessonId} />;
      case 'profile':
        return <ProfileSection />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">🎵 Musiconexión</h2>
        <nav className="nav">
          <button onClick={() => setSelectedSection('home')}>
            <FontAwesomeIcon icon={faHome} /> Inicio
          </button>
          <button onClick={() => setSelectedSection('lessons')}>
            <FontAwesomeIcon icon={faMusic} /> Mis lecciones
          </button>
          <button onClick={() => setSelectedSection('grades')}>
            <FontAwesomeIcon icon={faClipboard} /> Calificaciones
          </button>
          <button onClick={() => setSelectedSection('courses')}>
            <FontAwesomeIcon icon={faBook} /> Cursos
          </button>
          <button onClick={() => setSelectedSection('feedback')}>
            <FontAwesomeIcon icon={faComments} /> Retroalimentación
          </button>
          <button onClick={() => setSelectedSection('profile')}>
            <FontAwesomeIcon icon={faUserCog} /> Perfil
          </button>
        </nav>
      </aside>

      <main className="content">
        <h1 className="section-title">
          {{
            lessons: 'Mis lecciones',
            grades: 'Calificaciones',
            courses: 'Cursos',
            feedback: 'Retroalimentación',
            profile: 'Perfil',
            home: 'Inicio',
          }[selectedSection]}
        </h1>
        <div className="section-content">{renderContent()}</div>
      </main>
    </div>
  );
}
