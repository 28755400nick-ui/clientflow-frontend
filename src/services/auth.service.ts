/**
 * auth.service.ts — Lógica de autenticación.
 *
 * Usa axios directo para /login (no tiene token aún).
 * Usa la instancia `api` (con interceptores) para /logout y /me.
 */

import axios from 'axios';
import api, { clearSession, setSessionCookie } from './api';
import type { AuthTokens, User } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await axios.post<AuthTokens>(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    setSessionCookie();

    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/logout');
    } finally {
      // Limpia siempre, aunque el endpoint falle
      clearSession();
    }
  },

  async me(): Promise<User> {
    const response = await api.get<User>('/me');
    return response.data;
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },
};
