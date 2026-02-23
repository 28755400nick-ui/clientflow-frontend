/**
 * Tests for useClients hook
 *
 * Uses renderHook from @testing-library/react to test hook state.
 * Mocks the clientsService to control API responses.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useClients } from '@/hooks/useClients';

jest.mock('@/services/clients.service', () => ({
  clientsService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    export: jest.fn(),
  },
}));

import { clientsService } from '@/services/clients.service';
const mockedClientsService = jest.mocked(clientsService);

const mockPaginatedResponse = {
  data: [
    {
      id: 1,
      first_name: 'Juan',
      last_name: 'García',
      phone: '+54 9 11 11111111',
      email: 'juan@example.com',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 1,
  from: 1,
  to: 1,
};

describe('useClients', () => {
  // ─── fetchClients ────────────────────────────────────────────────────────────

  describe('fetchClients', () => {
    it('sets isLoading to true during fetch, false after', async () => {
      mockedClientsService.getAll = jest.fn().mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useClients());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.fetchClients();
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('populates data with the API response', async () => {
      mockedClientsService.getAll = jest.fn().mockResolvedValue(mockPaginatedResponse);

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.fetchClients();
      });

      expect(result.current.data).toEqual(mockPaginatedResponse);
      expect(result.current.error).toBeNull();
    });

    it('sets error message when the API call fails', async () => {
      const axiosError = {
        response: { data: { message: 'Error de servidor.' } },
      };
      mockedClientsService.getAll = jest.fn().mockRejectedValue(axiosError);

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.fetchClients();
      });

      expect(result.current.error).toBe('Error de servidor.');
      expect(result.current.data).toBeNull();
    });

    it('sets fallback error when error has no message', async () => {
      mockedClientsService.getAll = jest.fn().mockRejectedValue(new Error('unknown'));

      const { result } = renderHook(() => useClients());

      await act(async () => {
        await result.current.fetchClients();
      });

      expect(result.current.error).toBe('Ha ocurrido un error inesperado.');
    });
  });

  // ─── createClient ────────────────────────────────────────────────────────────

  describe('createClient', () => {
    it('returns ok:true when creation succeeds', async () => {
      mockedClientsService.create = jest.fn().mockResolvedValue(mockPaginatedResponse.data[0]);

      const { result } = renderHook(() => useClients());

      let response: { ok: boolean; errors: Record<string, string[]> };
      await act(async () => {
        response = await result.current.createClient({
          first_name: 'Juan',
          last_name: 'García',
          phone: '+54 9 11 11111111',
          email: 'juan@example.com',
        });
      });

      expect(response!.ok).toBe(true);
      expect(response!.errors).toEqual({});
    });

    it('returns ok:false with validation errors when creation fails', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Error de validación.',
            errors: { email: ['Ya existe un cliente registrado con este email.'] },
          },
        },
      };
      mockedClientsService.create = jest.fn().mockRejectedValue(validationError);

      const { result } = renderHook(() => useClients());

      let response: { ok: boolean; errors: Record<string, string[]> };
      await act(async () => {
        response = await result.current.createClient({
          first_name: 'Test',
          last_name: 'User',
          phone: '+1234567890',
          email: 'existing@example.com',
        });
      });

      expect(response!.ok).toBe(false);
      expect(response!.errors.email).toContain(
        'Ya existe un cliente registrado con este email.'
      );
    });
  });

  // ─── updateClient ────────────────────────────────────────────────────────────

  describe('updateClient', () => {
    it('returns ok:true when update succeeds', async () => {
      mockedClientsService.update = jest.fn().mockResolvedValue(mockPaginatedResponse.data[0]);

      const { result } = renderHook(() => useClients());

      let response: { ok: boolean; errors: Record<string, string[]> };
      await act(async () => {
        response = await result.current.updateClient(1, { first_name: 'Updated' });
      });

      expect(response!.ok).toBe(true);
    });

    it('returns ok:false with errors when update fails with validation error', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Error de validación.',
            errors: { email: ['Ya existe un cliente registrado con este email.'] },
          },
        },
      };
      mockedClientsService.update = jest.fn().mockRejectedValue(validationError);

      const { result } = renderHook(() => useClients());

      let response: { ok: boolean; errors: Record<string, string[]> };
      await act(async () => {
        response = await result.current.updateClient(1, { email: 'taken@example.com' });
      });

      expect(response!.ok).toBe(false);
      expect(response!.errors.email).toBeDefined();
    });
  });

  // ─── deleteClient ────────────────────────────────────────────────────────────

  describe('deleteClient', () => {
    it('returns true when delete succeeds', async () => {
      mockedClientsService.delete = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useClients());

      let success: boolean;
      await act(async () => {
        success = await result.current.deleteClient(1);
      });

      expect(success!).toBe(true);
    });

    it('returns false when delete fails', async () => {
      mockedClientsService.delete = jest.fn().mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useClients());

      let success: boolean;
      await act(async () => {
        success = await result.current.deleteClient(1);
      });

      expect(success!).toBe(false);
    });
  });
});
