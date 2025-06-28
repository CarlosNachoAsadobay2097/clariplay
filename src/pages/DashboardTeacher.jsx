import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faChalkboardTeacher,
  faBookOpen,
  faUsers,
  faComments,
  faUserCog,
} from '@fortawesome/free-solid-svg-icons';

import HomeTeacher from './HomeTeacher';
import CoursesTeacherSection from './CoursesTeacherSection';
import CreateLessonsSection from './CreateLessonsSection';
import StudentsSection from './StudentsSection';
import FeedbackSectionTeacher from './FeedbackSectionTeacher';
import ProfileSectionTeacher from './ProfileSectionTeacher';

export default function DashboardTeacher() {
  const [selectedSection, setSelectedSection] = useState('home');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No existe documento en Firestore para este usuario');
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const renderContent = () => {
    if (!userData) {
      return (
        <div className="section-block">
          <p>Cargando datos del perfil...</p>
        </div>
      );
    }

    switch (selectedSection) {
      case 'home':
        return <HomeTeacher user={userData} />;
      case 'courses':
        return <CoursesTeacherSection />;
      case 'lessons':
        return <CreateLessonsSection />;
      case 'students':
        return <StudentsSection />;
      case 'feedback':
        return <FeedbackSectionTeacher />;
      case 'profile':
        return <ProfileSectionTeacher />;
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
          <button onClick={() => setSelectedSection('courses')}>
            <FontAwesomeIcon icon={faChalkboardTeacher} /> Mis cursos
          </button>
          <button onClick={() => setSelectedSection('lessons')}>
            <FontAwesomeIcon icon={faBookOpen} /> Crear lecciones
          </button>
          <button onClick={() => setSelectedSection('students')}>
            <FontAwesomeIcon icon={faUsers} /> Estudiantes
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
            home: 'Inicio',
            courses: 'Mis cursos',
            lessons: 'Crear lecciones',
            students: 'Estudiantes',
            feedback: 'Retroalimentación',
            profile: 'Perfil',
          }[selectedSection]}
        </h1>
        <div className="section-content">{renderContent()}</div>
      </main>
    </div>
  );
}
