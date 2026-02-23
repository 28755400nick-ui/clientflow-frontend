import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClientFlow · by N.',
  description: 'Sistema de gestión de clientes — Proyecto Full Stack desarrollado con Laravel, Next.js y AWS.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
