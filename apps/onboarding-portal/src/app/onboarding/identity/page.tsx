'use client';

import { useState } from 'react';

export default function IdentityPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const startVerification = async () => {
    setStatus('loading');
    // In production: call API to get Sumsub verification URL
    // then redirect or embed Sumsub WebSDK
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/clients/me/kyc/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.kycUrl) {
        window.location.href = data.kycUrl;
      }
    } catch {
      setStatus('idle');
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px' }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Etape 1 sur 4</span>
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 8, color: '#1a1a2e' }}>
          Verification d'identite
        </h2>
        <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: 32 }}>
          Conformement a la reglementation europeenne (MiCA / AMLD5),
          nous devons verifier votre identite avant d'activer votre service de custody.
        </p>

        <div style={{
          padding: 20,
          borderRadius: 8,
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          marginBottom: 32,
        }}>
          <p style={{ fontSize: 14, color: '#0369a1', margin: 0 }}>
            <strong>Documents requis :</strong><br />
            - Piece d'identite en cours de validite (passeport ou CNI)<br />
            - Selfie pour verification de vivacite (liveness check)
          </p>
        </div>

        <button
          onClick={startVerification}
          disabled={status === 'loading'}
          style={{
            width: '100%',
            padding: '14px 0',
            background: status === 'loading' ? '#93c5fd' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: status === 'loading' ? 'wait' : 'pointer',
          }}
        >
          {status === 'loading' ? 'Chargement...' : 'Lancer la verification'}
        </button>
      </div>
    </main>
  );
}
