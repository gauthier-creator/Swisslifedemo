export default function Home() {
  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1a1a2e' }}>
          CryptoVault
        </h1>
        <p style={{ color: '#6b7280', fontSize: 16 }}>
          Service de custody crypto — Swiss Life
        </p>
      </div>

      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: 20, marginBottom: 24, color: '#1a1a2e' }}>
          Bienvenue dans votre espace d'activation
        </h2>

        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 24 }}>
          Pour activer votre service de custody de crypto-actifs, vous devez
          completer les etapes suivantes :
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: 1, title: 'Verification d\'identite', desc: 'Document d\'identite + selfie' },
            { step: 2, title: 'Questionnaire', desc: 'Source des fonds et profil de risque' },
            { step: 3, title: 'Convention de custody', desc: 'Signature electronique' },
            { step: 4, title: 'Activation', desc: 'Creation de vos wallets' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#3b82f6', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 600, fontSize: 14, flexShrink: 0,
              }}>
                {step}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{title}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <a
          href="/onboarding/identity"
          style={{
            display: 'block',
            width: '100%',
            padding: '14px 0',
            marginTop: 32,
            textAlign: 'center',
            background: '#3b82f6',
            color: 'white',
            borderRadius: 8,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Commencer l'activation
        </a>

        <p style={{
          marginTop: 24,
          fontSize: 12,
          color: '#9ca3af',
          textAlign: 'center',
          lineHeight: 1.5,
        }}>
          Vos donnees sont traitees conformement au RGPD.
          Service de custody fourni par Fraktion SAS, conforme au reglement MiCA (UE 2023/1114).
        </p>
      </div>
    </main>
  );
}
