import './globals.css';

export const metadata = {
  title: 'ERP Puma — Gestión de Embarcación',
  description: 'Sistema ERP personal para la gestión integral de tu embarcación: mantenimiento, inventario, provisiones, seguridad y más.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
