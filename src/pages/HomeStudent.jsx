export default function HomeStudent({ user }) {
  const nombre = user?.firstName || 'Estudiante';
  const apellido = user?.lastName || '';

  const notificaciones = [
    {
      id: 1,
      mensaje: 'Tu profesor te dejó retroalimentación en la lección 3.',
      fecha: '2025-06-30',
    },
    {
      id: 2,
      mensaje: 'Nueva clase disponible en el curso "Técnica del clarinete".',
      fecha: '2025-06-28',
    },
  ];

  return (
    <>
      <div className="home-welcome">
        <h2>Bienvenido {nombre} {apellido}</h2>
      </div>

      <div className="section-block">
        <h2>Notificaciones</h2>
        <ul className="notificaciones-lista">
          {notificaciones.map((n) => (
            <li key={n.id} className="notificacion-item">
              <p>{n.mensaje}</p>
              <span className="fecha">{n.fecha}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
