export default function CompletePage() {
  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px' }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: '#10b981', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 24px',
        }}>
          ✓
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 8, color: '#1a1a2e' }}>
          Activation en cours
        </h2>
        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 32 }}>
          Votre demande est en cours de traitement. Votre conseiller Swiss Life
          sera notifie des que vos wallets seront actifs.
        </p>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>
          Delai de traitement : 24-48h ouvrables
        </p>
      </div>
    </main>
  );
}
