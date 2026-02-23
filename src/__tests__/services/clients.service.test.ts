/**
 * Tests for clients.service.ts
 *
 * All HTTP calls are mocked via the `api` module.
 */

jest.mock('@/services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

import api from '@/services/api';
import { clientsService } from '@/services/clients.service';
import type { Client, PaginatedResponse } from '@/types';

const mockedApi = jest.mocked(api);

const mockClient: Client = {
  id: 1,
  first_name: 'Juan',
  last_name: 'García',
  phone: '+54 9 11 12345678',
  email: 'juan@example.com',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const mockPaginatedResponse: PaginatedResponse<Client> = {
  data: [mockClient],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 1,
  from: 1,
  to: 1,
};

describe('clientsService', () => {
  // ─── getAll ─────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('calls GET /clients and returns paginated data', async () => {
      mockedApi.get = jest.fn().mockResolvedValue({ data: mockPaginatedResponse });

      const result = await clientsService.getAll();

      expect(mockedApi.get).toHaveBeenCalledWith('/clients', { params: {} });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('sends name filter as query param', async () => {
      mockedApi.get = jest.fn().mockResolvedValue({ data: mockPaginatedResponse });

      await clientsService.getAll({ name: 'Juan' });

      expect(mockedApi.get).toHaveBeenCalledWith('/clients', {
        params: { name: 'Juan' },
      });
    });

    it('sends phone filter as query param', async () => {
      mockedApi.get = jest.fn().mockResolvedValue({ data: mockPaginatedResponse });

      await clientsService.getAll({ phone: '12345' });

      expect(mockedApi.get).toHaveBeenCalledWith('/clients', {
        params: { phone: '12345' },
      });
    });

    it('converts numeric page to string param', async () => {
      mockedApi.get = jest.fn().mockResolvedValue({ data: mockPaginatedResponse });

      await clientsService.getAll({ page: 3 });

      expect(mockedApi.get).toHaveBeenCalledWith('/clients', {
        params: { page: '3' },
      });
    });

    it('does not include undefined filters in params', async () => {
      mockedApi.get = jest.fn().mockResolvedValue({ data: mockPaginatedResponse });

      await clientsService.getAll({ name: undefined, phone: undefined });

      expect(mockedApi.get).toHaveBeenCalledWith('/clients', { params: {} });
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('calls POST /clients and returns the created client', async () => {
      mockedApi.post = jest.fn().mockResolvedValue({ data: mockClient });

      const payload = {
        first_name: 'Juan',
        last_name: 'García',
        phone: '+54 9 11 12345678',
        email: 'juan@example.com',
      };

      const result = await clientsService.create(payload);

      expect(mockedApi.post).toHaveBeenCalledWith('/clients', payload);
      expect(result).toEqual(mockClient);
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('calls PUT /clients/:id with partial data', async () => {
      const updated = { ...mockClient, first_name: 'Carlos' };
      mockedApi.put = jest.fn().mockResolvedValue({ data: updated });

      const result = await clientsService.update(1, { first_name: 'Carlos' });

      expect(mockedApi.put).toHaveBeenCalledWith('/clients/1', { first_name: 'Carlos' });
      expect(result.first_name).toBe('Carlos');
    });
  });

  // ─── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('calls DELETE /clients/:id', async () => {
      mockedApi.delete = jest.fn().mockResolvedValue({});

      await clientsService.delete(1);

      expect(mockedApi.delete).toHaveBeenCalledWith('/clients/1');
    });
  });

  // ─── export ─────────────────────────────────────────────────────────────────

  describe('export', () => {
    it('calls GET /clients/export with blob responseType', async () => {
      // Mock DOM methods used in the export function
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement);
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as unknown as Node);
      jest.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as unknown as Node);
      global.URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();

      mockedApi.get = jest.fn().mockResolvedValue({
        data: new Blob(['mock excel content']),
      });

      await clientsService.export({ name: 'Juan' });

      expect(mockedApi.get).toHaveBeenCalledWith('/clients/export', {
        params: { name: 'Juan' },
        responseType: 'blob',
      });

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toBe('clientes.xlsx');
    });
  });
});
