'use client';

/**
 * useAuth — Carga el usuario autenticado al montar y expone logout.
 *
 * Si el usuario no está autenticado (no hay token o /me falla),
 * redirige automáticamente a /login.
 * Se usa en el Header para mostrar el nombre del usuario y el botón de logout.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    authService
      .me()
      .then(setUser)
      .catch(() => router.replace('/login'))
      .finally(() => setIsLoading(false));
  }, [router]);

  const logout = useCallback(async () => {
    await authService.logout();
    router.replace('/login');
  }, [router]);

  return { user, isLoading, logout };
}
