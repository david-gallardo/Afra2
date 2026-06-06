import './globals.css';

export const metadata = {
  title: "ERP Afra II — Gestió d'Embarcació",
  description: "Sistema ERP personal per a la gestió integral de la teva embarcació: manteniment, inventari, provisions, seguretat i més.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body>{children}</body>
    </html>
  );
}
