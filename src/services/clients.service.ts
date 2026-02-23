/**
 * clients.service.ts — CRUD de clientes + exportación Excel.
 *
 * Toda petición pasa por la instancia `api` (con interceptores de auth).
 * La exportación usa `responseType: 'blob'` para descargar el archivo
 * directamente desde el mismo Axios (también protegida por el interceptor).
 */

import api from './api';
import type { Client, ClientFilters, ClientFormData, PaginatedResponse } from '@/types';

export const clientsService = {
  async getAll(filters: ClientFilters = {}): Promise<PaginatedResponse<Client>> {
    const params: Record<string, string> = {};
    if (filters.name) params.name = filters.name;
    if (filters.phone) params.phone = filters.phone;
    if (filters.page) params.page = String(filters.page);
    if (filters.per_page) params.per_page = String(filters.per_page);

    const response = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return response.data;
  },

  async create(data: ClientFormData): Promise<Client> {
    const response = await api.post<Client>('/clients', data);
    return response.data;
  },

  async update(id: number, data: Partial<ClientFormData>): Promise<Client> {
    const response = await api.put<Client>(`/clients/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/clients/${id}`);
  },

  async export(filters: Pick<ClientFilters, 'name' | 'phone'> = {}): Promise<void> {
    const params: Record<string, string> = {};
    if (filters.name) params.name = filters.name;
    if (filters.phone) params.phone = filters.phone;

    const response = await api.get('/clients/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clientes.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
