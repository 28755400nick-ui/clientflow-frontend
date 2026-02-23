'use client';

/**
 * login/page.tsx — Página de login.
 *
 * Valida los campos en el frontend antes de enviar.
 * Muestra los errores del backend si las credenciales son incorrectas.
 * Al hacer login exitoso, redirige a /clients.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import styles from './page.module.css';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4C5.5 4 2 10 2 10s3.5 6 8 6 8-6 8-6-3.5-6-8-6Z" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0 0 12.4 12M10 4C5.5 4 2 10 2 10s1.2 2 3.4 3.6M16.6 13.6C18.8 12 20 10 20 10S16.5 4 10 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El email no tiene un formato válido.';
    }
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria.';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await authService.login(email, password);
      router.replace('/clients');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg = axiosErr.response?.data?.message ?? 'Error al iniciar sesión.';
      setErrors({ general: msg });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.brand}>
          <div className={styles.brandIcon}>CF</div>
          <h1 className={styles.brandName}>ClientFlow</h1>
        </div>

        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.subtitle}>Accede a tu panel de clientes</p>

        {errors.general && (
          <div className={styles.alertError} role="alert">
            {errors.general}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clientflow.com"
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`${styles.input} ${styles.inputPassword} ${errors.password ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.btnTogglePassword}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                Iniciando sesión…
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
