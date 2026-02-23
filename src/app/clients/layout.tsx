/**
 * clients/layout.tsx — Layout compartido para toda la sección de clientes.
 *
 * Es un Server Component (sin 'use client'): solo estructura HTML.
 * El Header es un Client Component que maneja la autenticación internamente.
 */

import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './layout.module.css';

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
