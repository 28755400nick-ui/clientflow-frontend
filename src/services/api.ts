/**
 * api.ts — Instancia central de Axios con interceptores de autenticación.
 *
 * Patrón de refresh con cola:
 * Si hay múltiples peticiones fallidas simultáneas (401), solo una hace
 * el refresh. Las demás esperan en la cola y se reintentan con el nuevo token.
 * Esto evita múltiples llamadas a /refresh al mismo tiempo.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Axios request extendido para marcar reintentos
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor ────────────────────────────────────────────────────
// Añade el access_token de localStorage a cada petición como Bearer token.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Variables de estado para la cola de refresh ───────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
}

// ─── Response interceptor ───────────────────────────────────────────────────
// En 401: intenta renovar el token. Si falla, limpia la sesión y redirige.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Si ya hay un refresh en curso, poner esta petición en cola
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers!.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;

    if (!refreshToken) {
      isRefreshing = false;
      clearSession();
      return Promise.reject(error);
    }

    try {
      // Usar axios directo (no la instancia) para evitar interceptores en bucle
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/refresh`,
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { access_token, refresh_token: newRefreshToken } = data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', newRefreshToken);
      setSessionCookie();

      api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      processQueue(null, access_token);

      originalRequest.headers!.Authorization = `Bearer ${access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ─── Helpers de sesión ──────────────────────────────────────────────────────
export function setSessionCookie() {
  // Cookie de 7 días — usada solo por el middleware de Next.js para proteger rutas.
  // El token real vive en localStorage.
  document.cookie = `has_session=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  document.cookie = 'has_session=; path=/; max-age=0';
  window.location.href = '/login';
}

export default api;
