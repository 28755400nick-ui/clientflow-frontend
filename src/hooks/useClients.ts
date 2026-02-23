'use client';

/**
 * useClients — Gestiona el estado y las operaciones del CRUD de clientes.
 *
 * Centraliza la lógica de negocio lejos de los componentes UI.
 * Los errores de API se extraen del formato del backend Laravel:
 * { message: string, errors?: { field: string[] } }
 */

import { useState, useCallback } from 'react';
import { clientsService } from '@/services/clients.service';
import type {
  Client,
  ClientFilters,
  ClientFormData,
  PaginatedResponse,
  ApiError,
  ValidationErrors,
} from '@/types';
import { AxiosError } from 'axios';

function extractMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data?.message ?? 'Ha ocurrido un error inesperado.';
}

function extractValidationErrors(error: unknown): ValidationErrors {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data?.errors ?? {};
}

export function useClients() {
  const [data, setData] = useState<PaginatedResponse<Client> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (filters: ClientFilters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await clientsService.getAll(filters);
      setData(result);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createClient = useCallback(
    async (formData: ClientFormData): Promise<{ ok: boolean; errors: ValidationErrors }> => {
      try {
        await clientsService.create(formData);
        return { ok: true, errors: {} };
      } catch (err) {
        return { ok: false, errors: extractValidationErrors(err) };
      }
    },
    []
  );

  const updateClient = useCallback(
    async (
      id: number,
      formData: Partial<ClientFormData>
    ): Promise<{ ok: boolean; errors: ValidationErrors }> => {
      try {
        await clientsService.update(id, formData);
        return { ok: true, errors: {} };
      } catch (err) {
        return { ok: false, errors: extractValidationErrors(err) };
      }
    },
    []
  );

  const deleteClient = useCallback(async (id: number): Promise<boolean> => {
    try {
      await clientsService.delete(id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const exportClients = useCallback(
    async (filters: Pick<ClientFilters, 'name' | 'phone'> = {}) => {
      await clientsService.export(filters);
    },
    []
  );

  return {
    data,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    exportClients,
  };
}
