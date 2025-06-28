export default function HomeStudent({ user }) {
  const nombre = user?.firstName || 'Estudiante';
  const apellido = user?.lastName || '';

  return (
    <>
      <div className="home-welcome">
        <h2>
          Bienvenido {nombre} {apellido}
        </h2>
      </div>
      <div className="home-paragraf">
        <p>Aqui va la seccion de Notificaciones</p>
      </div>
    </>
  );

}
