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
  faAngleLeft,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';

import Navbar from '../components/Navbar';
import LessonsSection from './LessonsSection';
import GradesSection from './GradesSection';
import CoursesSection from './CoursesSection';
import FeedbackSection from './FeedbackSection';
import ProfileSection from './ProfileSection';
import HomeStudent from './HomeStudent';

export default function DashboardStudent() {
  const [selectedSection, setSelectedSection] = useState('lessons');
  const [userData, setUserData] = useState(null);
  const [feedbackLessonId, setFeedbackLessonId] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // móvil
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // escritorio

  useEffect(() => {
    // Activar la clase body-dashboard al entrar al dashboard
    document.body.classList.add('body-dashboard');

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    });

    return () => {
      // Limpiar la suscripción y remover clase al desmontar el componente
      unsubscribe();
      document.body.classList.remove('body-dashboard');
    };
  }, []);


  const renderContent = () => {
    switch (selectedSection) {
      case 'home':
        return <HomeStudent user={{ firstName: userData?.firstName || 'Estudiante', lastName: userData?.lastName || '' }} />;
      case 'lessons':
        return <LessonsSection onNavigateToFeedback={(lessonId) => {
          setFeedbackLessonId(lessonId);
          setSelectedSection('feedback');
        }} />;
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

  const handleNavClick = (section) => {
    setSelectedSection(section);
    setIsSidebarOpen(false); // solo en móvil, cerrar al hacer clic
  };

  return (
    <>
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="dashboard">
        <aside className={`menu-dashboard ${isSidebarOpen ? 'active' : ''} ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <h2 className="logo">Clariplay</h2>
          <nav className="nav">
            <button onClick={() => handleNavClick('home')}>
              <FontAwesomeIcon icon={faHome} /> <span>Inicio</span>
            </button>
            <button onClick={() => handleNavClick('lessons')}>
              <FontAwesomeIcon icon={faMusic} /> <span>Mis lecciones</span>
            </button>
            <button onClick={() => handleNavClick('grades')}>
              <FontAwesomeIcon icon={faClipboard} /> <span>Calificaciones</span>
            </button>
            <button onClick={() => handleNavClick('courses')}>
              <FontAwesomeIcon icon={faBook} /> <span>Cursos</span>
            </button>
            <button onClick={() => handleNavClick('feedback')}>
              <FontAwesomeIcon icon={faComments} /> <span>Retroalimentación</span>
            </button>
            <button onClick={() => handleNavClick('profile')}>
              <FontAwesomeIcon icon={faUserCog} /> <span>Perfil</span>
            </button>

            {/* Botón solo visible en escritorio */}
            <div className="collapse-toggle desktop-only">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                <FontAwesomeIcon icon={isSidebarCollapsed ? faAngleRight : faAngleLeft} />
              </button>
            </div>
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
    </>
  );
}
