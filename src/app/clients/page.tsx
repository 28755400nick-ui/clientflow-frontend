'use client';

/**
 * clients/page.tsx — Dashboard principal.
 *
 * Centraliza TODA la lógica de estado del dashboard:
 * - Filtros aplicados vs. filtros en edición
 * - Apertura/cierre del modal de crear/editar
 * - Apertura/cierre del diálogo de confirmación de borrado
 * - Notificaciones de éxito/error
 *
 * Los componentes hijos son "presentacionales": solo muestran datos
 * y disparan callbacks definidos aquí.
 */

import { useState, useEffect, useCallback } from 'react';
import { useClients } from '@/hooks/useClients';
import FilterBar from '@/components/FilterBar/FilterBar';
import ClientsTable from '@/components/ClientsTable/ClientsTable';
import Pagination from '@/components/Pagination/Pagination';
import ClientModal from '@/components/ClientModal/ClientModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import type { Client, ClientFilters, ClientFormData } from '@/types';
import styles from './page.module.css';

export default function ClientsPage() {
  // ─── Estado de filtros ─────────────────────────────────────────────────────
  const [filterInputs, setFilterInputs] = useState({ name: '', phone: '' });
  const [appliedFilters, setAppliedFilters] = useState<ClientFilters>({ page: 1, per_page: 10 });

  // ─── Estado del modal ──────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // ─── Estado del diálogo de borrado ─────────────────────────────────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Notificación flotante ─────────────────────────────────────────────────
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const { data, isLoading, error, fetchClients, createClient, updateClient, deleteClient, exportClients } =
    useClients();

  // Carga inicial y cuando cambian los filtros aplicados
  useEffect(() => {
    fetchClients(appliedFilters);
  }, [appliedFilters, fetchClients]);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ─── Filtros ───────────────────────────────────────────────────────────────
  function handleSearch() {
    setAppliedFilters({ ...filterInputs, page: 1, per_page: 10 });
  }

  function handleClearFilters() {
    setFilterInputs({ name: '', phone: '' });
    setAppliedFilters({ page: 1, per_page: 10 });
  }

  function handlePageChange(page: number) {
    setAppliedFilters((prev) => ({ ...prev, page }));
  }

  // ─── Modal crear / editar ──────────────────────────────────────────────────
  function handleOpenCreate() {
    setEditingClient(null);
    setModalOpen(true);
  }

  function handleOpenEdit(client: Client) {
    setEditingClient(client);
    setModalOpen(true);
  }

  const handleModalSave = useCallback(
    async (formData: ClientFormData) => {
      if (editingClient) {
        const { ok, errors } = await updateClient(editingClient.id, formData);
        if (ok) {
          setModalOpen(false);
          showToast('Cliente actualizado correctamente.', 'success');
          fetchClients(appliedFilters);
        }
        return { ok, errors };
      } else {
        const { ok, errors } = await createClient(formData);
        if (ok) {
          setModalOpen(false);
          showToast('Cliente creado correctamente.', 'success');
          fetchClients({ ...appliedFilters, page: 1 });
        }
        return { ok, errors };
      }
    },
    [editingClient, updateClient, createClient, fetchClients, appliedFilters]
  );

  // ─── Borrado ───────────────────────────────────────────────────────────────
  function handleDeleteRequest(id: number) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return;
    setIsDeleting(true);
    const ok = await deleteClient(deletingId);
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setDeletingId(null);
    if (ok) {
      showToast('Cliente eliminado correctamente.', 'success');
      // Si borramos el último de la página, retrocedemos
      const isLastOnPage = data?.data.length === 1 && (appliedFilters.page ?? 1) > 1;
      const newPage = isLastOnPage ? (appliedFilters.page ?? 1) - 1 : appliedFilters.page;
      fetchClients({ ...appliedFilters, page: newPage });
    } else {
      showToast('No se pudo eliminar el cliente.', 'error');
    }
  }

  // ─── Exportar ──────────────────────────────────────────────────────────────
  async function handleExport() {
    await exportClients({ name: appliedFilters.name, phone: appliedFilters.phone });
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Cabecera de la página */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Clientes</h1>
          {data && (
            <p className={styles.pageCount}>
              {data.total} {data.total === 1 ? 'cliente registrado' : 'clientes registrados'}
            </p>
          )}
        </div>
        <button className={styles.btnPrimary} onClick={handleOpenCreate}>
          + Nuevo cliente
        </button>
      </div>

      {/* Barra de filtros */}
      <FilterBar
        values={filterInputs}
        onChange={setFilterInputs}
        onSearch={handleSearch}
        onClear={handleClearFilters}
        onExport={handleExport}
        isLoading={isLoading}
      />

      {/* Tabla */}
      <div className={styles.tableCard}>
        {error && (
          <div className={styles.alertError} role="alert">
            {error}
          </div>
        )}
        <ClientsTable
          clients={data?.data ?? []}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteRequest}
        />
      </div>

      {/* Paginación */}
      {data && data.last_page > 1 && (
        <Pagination
          currentPage={data.current_page}
          lastPage={data.last_page}
          from={data.from}
          to={data.to}
          total={data.total}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal crear / editar */}
      <ClientModal
        isOpen={modalOpen}
        client={editingClient}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />

      {/* Diálogo de confirmación de borrado */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Eliminar cliente"
        message="Esta acción es permanente y no se puede deshacer. ¿Confirmas que deseas eliminar este cliente?"
        isLoading={isDeleting}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toast de notificación */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
