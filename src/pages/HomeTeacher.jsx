export default function HomeTeacher({ user }) {
  if (!user || !user.firstName) {
    return (
      <div className="section-block">
        <p>Cargando perfil del profesor...</p>
      </div>
    );
  }

  return (
    <div className="section-block">
      <h2>👋 Bienvenido/a, {user.firstName} {user.lastName}</h2>
      <p>Este es tu panel de profesor/a. Desde aquí podrás crear cursos, agregar lecciones y gestionar estudiantes.</p>
    </div>
  );
}
