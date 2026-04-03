'use client';

import { useState } from 'react';

export default function AgreementPage() {
  const [accepted, setAccepted] = useState(false);

  const handleSign = async () => {
    // In production: redirect to DocuSign/Yousign for e-signature
    window.location.href = '/onboarding/complete';
  };

  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px' }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Etape 3 sur 4</span>
        <h2 style={{ fontSize: 20, marginBottom: 8, color: '#1a1a2e' }}>Convention de custody</h2>
        <p style={{ color: '#4b5563', marginBottom: 24 }}>
          Veuillez lire et signer la convention de custody conformement a l'Article 75 du reglement MiCA.
        </p>

        <div style={{
          maxHeight: 300,
          overflow: 'auto',
          padding: 20,
          borderRadius: 8,
          border: '1px solid #e5e7eb',
          background: '#fafafa',
          fontSize: 13,
          lineHeight: 1.7,
          color: '#374151',
          marginBottom: 24,
        }}>
          <h3>CONVENTION DE CUSTODY DE CRYPTO-ACTIFS</h3>
          <p><strong>Entre :</strong></p>
          <p>Fraktion SAS, prestataire de services sur crypto-actifs (CASP), ci-apres "le Custodian"</p>
          <p><strong>Et :</strong></p>
          <p>Le Client, identifie lors de la procedure de verification KYC</p>

          <h4>Article 1 — Objet</h4>
          <p>La presente convention a pour objet de definir les conditions dans lesquelles le Custodian assure la conservation et l'administration de crypto-actifs pour le compte du Client.</p>

          <h4>Article 2 — Custodian backend</h4>
          <p>Les crypto-actifs sont conserves via l'infrastructure Taurus-PROTECT (Taurus SA, Geneve, Suisse), prestataire certifie FINMA et conforme DORA.</p>

          <h4>Article 3 — Segregation des actifs</h4>
          <p>Les crypto-actifs du Client sont legalement et operationnellement separes des actifs propres du Custodian. Chaque client dispose d'adresses blockchain dediees, verifiables on-chain.</p>

          <h4>Article 4 — Restitution</h4>
          <p>Le Client peut demander la restitution de ses crypto-actifs a tout moment, sous reserve du delai de traitement (24-72h ouvrables).</p>

          <h4>Article 5 — Risques</h4>
          <p>Le Client reconnait les risques inherents aux crypto-actifs : volatilite, risque technologique, risque reglementaire.</p>

          <h4>Article 6 — Responsabilite</h4>
          <p>Le Custodian est responsable envers le Client pour toute perte de crypto-actifs resultant d'un incident attribuable au prestataire (Article 75 MiCA).</p>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={e => setAccepted(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <span style={{ fontSize: 14, color: '#374151' }}>
            J'ai lu et j'accepte la convention de custody
          </span>
        </label>

        <button
          onClick={handleSign}
          disabled={!accepted}
          style={{
            width: '100%',
            padding: '14px 0',
            background: accepted ? '#3b82f6' : '#d1d5db',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: accepted ? 'pointer' : 'not-allowed',
          }}
        >
          Signer electroniquement
        </button>
      </div>
    </main>
  );
}
