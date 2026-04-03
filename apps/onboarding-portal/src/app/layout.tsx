import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CryptoVault — Onboarding',
  description: 'Activez votre service de custody crypto Swiss Life',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>
        {children}
      </body>
    </html>
  );
}
