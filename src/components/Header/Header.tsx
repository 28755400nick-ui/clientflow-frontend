'use client';

/**
 * Header.tsx — Barra de navegación superior.
 *
 * Usa `useAuth` para cargar el nombre del usuario autenticado.
 * Si la carga falla (token inválido), useAuth redirige automáticamente a /login.
 * El botón de logout llama a authService.logout() que limpia tokens y cookies.
 */

import { useAuth } from '@/hooks/useAuth';
import styles from './Header.module.css';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>CF</div>
          <span className={styles.brandName}>ClientFlow</span>
        </div>

        {/* Usuario + logout */}
        <div className={styles.right}>
          {isLoading ? (
            <span className={styles.userSkeleton} />
          ) : (
            user && (
              <div className={styles.userInfo}>
                <div className={styles.userAvatar} title={user.name}>
                  {getInitials(user.name)}
                </div>
                <span className={styles.userName}>{user.name}</span>
              </div>
            )
          )}
          <button className={styles.btnLogout} onClick={logout} disabled={isLoading}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
