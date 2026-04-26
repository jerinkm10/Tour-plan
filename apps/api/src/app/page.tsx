export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'Arial, sans-serif', background: '#f7efe5' }}>
      <section style={{ textAlign: 'center', background: 'white', padding: 40, borderRadius: 18, boxShadow: '0 20px 80px rgba(0,0,0,.12)' }}>
        <p style={{ letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 800, color: '#7b4f35' }}>Next backend</p>
        <h1>Tour Plan API</h1>
        <p>Use POST /api/generate-trip from the Angular frontend.</p>
        <p>Health: /api/health</p>
      </section>
    </main>
  );
}