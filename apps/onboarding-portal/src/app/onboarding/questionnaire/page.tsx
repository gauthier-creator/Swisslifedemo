'use client';

import { useState } from 'react';

export default function QuestionnairePage() {
  const [form, setForm] = useState({
    sourceOfFunds: '',
    cryptoKnowledge: '',
    investmentObjective: '',
    expectedVolume: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // POST to API
    window.location.href = '/onboarding/agreement';
  };

  const fieldStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid #d1d5db',
    fontSize: 14,
    marginTop: 6,
    boxSizing: 'border-box' as const,
  };

  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px' }}>
      <div style={{
        background: 'white',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <span style={{ fontSize: 12, color: '#6b7280' }}>Etape 2 sur 4</span>
        <h2 style={{ fontSize: 20, marginBottom: 8, color: '#1a1a2e' }}>Questionnaire</h2>
        <p style={{ color: '#4b5563', marginBottom: 32 }}>
          Ces informations sont requises par la reglementation MiCA et AMLD5.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
              Source des fonds
            </label>
            <select
              value={form.sourceOfFunds}
              onChange={e => setForm(f => ({ ...f, sourceOfFunds: e.target.value }))}
              required
              style={fieldStyle}
            >
              <option value="">Selectionnez</option>
              <option value="professional_income">Revenus professionnels</option>
              <option value="savings">Epargne</option>
              <option value="inheritance">Heritage</option>
              <option value="investment_returns">Rendements d'investissements</option>
              <option value="real_estate_sale">Vente immobiliere</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
              Niveau de connaissance en crypto-actifs
            </label>
            <select
              value={form.cryptoKnowledge}
              onChange={e => setForm(f => ({ ...f, cryptoKnowledge: e.target.value }))}
              required
              style={fieldStyle}
            >
              <option value="">Selectionnez</option>
              <option value="none">Aucune experience</option>
              <option value="basic">Connaissances de base</option>
              <option value="intermediate">Experience intermediaire</option>
              <option value="advanced">Experience avancee</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
              Objectif d'investissement
            </label>
            <select
              value={form.investmentObjective}
              onChange={e => setForm(f => ({ ...f, investmentObjective: e.target.value }))}
              required
              style={fieldStyle}
            >
              <option value="">Selectionnez</option>
              <option value="diversification">Diversification patrimoniale</option>
              <option value="long_term">Investissement long terme</option>
              <option value="speculation">Trading actif</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
              Volume annuel estime (EUR)
            </label>
            <select
              value={form.expectedVolume}
              onChange={e => setForm(f => ({ ...f, expectedVolume: e.target.value }))}
              required
              style={fieldStyle}
            >
              <option value="">Selectionnez</option>
              <option value="10000">Moins de 10 000 EUR</option>
              <option value="50000">10 000 - 50 000 EUR</option>
              <option value="100000">50 000 - 100 000 EUR</option>
              <option value="500000">100 000 - 500 000 EUR</option>
              <option value="1000000">Plus de 500 000 EUR</option>
            </select>
          </div>

          <button type="submit" style={{
            padding: '14px 0', background: '#3b82f6', color: 'white',
            border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16,
            cursor: 'pointer', marginTop: 8,
          }}>
            Continuer
          </button>
        </form>
      </div>
    </main>
  );
}
