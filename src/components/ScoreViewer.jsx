export default function ScoreViewer() {
  return (
    <div style={{
      marginTop: '2rem',
      padding: '1rem',
      backgroundColor: '#FFF1E6',
      border: '1px solid #ccc',
      borderRadius: '6px',
      textAlign: 'center',
      color: '#1D1D1B',
      fontWeight: '600',
    }}>
      <p>🎵 Aquí iría el editor o visor de partituras (próximamente)</p>
      <button style={{
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#E51B23',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: 'pointer',
      }}>
        ▶ Reproducir
      </button>
    </div>
  );
}
