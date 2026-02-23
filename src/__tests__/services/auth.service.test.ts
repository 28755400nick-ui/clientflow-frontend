/**
 * Tests for auth.service.ts
 *
 * Mocks axios to avoid real HTTP calls.
 * Verifies token storage, logout cleanup, and isAuthenticated logic.
 */

import axios from 'axios';
import { authService } from '@/services/auth.service';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Mock the api module (prevents real Axios instance from being created)
jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    defaults: { headers: { common: {} } },
  },
  clearSession: jest.fn(),
  setSessionCookie: jest.fn(),
}));

import api, { clearSession, setSessionCookie } from '@/services/api';
const mockedApi = jest.mocked(api);

describe('authService', () => {
  // ─── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('stores tokens in localStorage after successful login', async () => {
      const mockTokens = {
        access_token: 'access.token.here',
        refresh_token: 'refresh.token.here',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockedAxios.post = jest.fn().mockResolvedValue({ data: mockTokens });

      await authService.login('admin@test.com', 'password123');

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'access_token',
        'access.token.here'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'refresh.token.here'
      );
    });

    it('calls setSessionCookie after successful login', async () => {
      mockedAxios.post = jest.fn().mockResolvedValue({
        data: {
          access_token: 'tok',
          refresh_token: 'ref',
          token_type: 'Bearer',
          expires_in: 900,
        },
      });

      await authService.login('admin@test.com', 'password123');

      expect(setSessionCookie).toHaveBeenCalled();
    });

    it('returns the tokens object from the API', async () => {
      const mockTokens = {
        access_token: 'access',
        refresh_token: 'refresh',
        token_type: 'Bearer',
        expires_in: 900,
      };

      mockedAxios.post = jest.fn().mockResolvedValue({ data: mockTokens });

      const result = await authService.login('test@test.com', 'pass');

      expect(result).toEqual(mockTokens);
    });

    it('throws when the API returns an error', async () => {
      mockedAxios.post = jest.fn().mockRejectedValue(new Error('Network Error'));

      await expect(
        authService.login('bad@test.com', 'wrong')
      ).rejects.toThrow('Network Error');
    });
  });

  // ─── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('calls the /logout API endpoint', async () => {
      mockedApi.post = jest.fn().mockResolvedValue({});

      await authService.logout();

      expect(mockedApi.post).toHaveBeenCalledWith('/logout');
    });

    it('calls clearSession even when the API call fails', async () => {
      mockedApi.post = jest.fn().mockRejectedValue(new Error('Server error'));

      await authService.logout();

      expect(clearSession).toHaveBeenCalled();
    });
  });

  // ─── me ─────────────────────────────────────────────────────────────────────

  describe('me', () => {
    it('returns the user object from /me', async () => {
      const mockUser = { id: 1, name: 'Admin', email: 'admin@test.com' };
      mockedApi.get = jest.fn().mockResolvedValue({ data: mockUser });

      const result = await authService.me();

      expect(result).toEqual(mockUser);
      expect(mockedApi.get).toHaveBeenCalledWith('/me');
    });
  });

  // ─── isAuthenticated ────────────────────────────────────────────────────────

  describe('isAuthenticated', () => {
    it('returns true when access_token exists in localStorage', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue('some.token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false when access_token is null', () => {
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
