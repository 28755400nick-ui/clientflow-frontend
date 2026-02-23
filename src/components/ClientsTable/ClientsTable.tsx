'use client';

/**
 * ClientsTable.tsx — Tabla de clientes.
 *
 * Tres estados diferenciados:
 * 1. isLoading → muestra filas esqueleto (skeleton) para evitar el salto de layout.
 * 2. clients vacío → empty state con mensaje claro.
 * 3. Normal → tabla con datos y botones de acción por fila.
 */

import type { Client } from '@/types';
import styles from './ClientsTable.module.css';

// Avatar colors cycle — deterministic per client ID
const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#db2777', '#4f46e5',
];

function getInitials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function ClientAvatar({ client }: { client: Client }) {
  const color = AVATAR_COLORS[client.id % AVATAR_COLORS.length];
  return (
    <span
      className={styles.avatar}
      style={{ background: color }}
      aria-hidden="true"
    >
      {getInitials(client.first_name, client.last_name)}
    </span>
  );
}

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (id: number) => void;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className={styles.skeletonRow}>
          <td><span className={styles.skeleton} style={{ width: '60%' }} /></td>
          <td><span className={styles.skeleton} style={{ width: '70%' }} /></td>
          <td><span className={styles.skeleton} style={{ width: '55%' }} /></td>
          <td><span className={styles.skeleton} style={{ width: '40%' }} /></td>
          <td>
            <span className={styles.skeleton} style={{ width: 28, height: 28, borderRadius: 6 }} />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 21H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4Z"
                stroke="currentColor" strokeWidth="1.5"
              />
              <path d="M9 12h6M9 8h6M9 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>No hay clientes</p>
          <p className={styles.emptySubtitle}>
            Ajusta los filtros o crea un nuevo cliente con el botón de arriba.
          </p>
        </div>
      </td>
    </tr>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ClientsTable({ clients, isLoading, onEdit, onDelete }: ClientsTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Nombre</th>
            <th className={styles.th}>Email</th>
            <th className={styles.th}>Teléfono</th>
            <th className={styles.th}>Registro</th>
            <th className={`${styles.th} ${styles.thActions}`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : clients.length === 0 ? (
            <EmptyState />
          ) : (
            clients.map((client) => (
              <tr key={client.id} className={styles.row}>
                <td className={styles.td}>
                  <div className={styles.nameCell}>
                    <ClientAvatar client={client} />
                    <span className={styles.fullName}>
                      {client.first_name} {client.last_name}
                    </span>
                  </div>
                </td>
                <td className={styles.td}>
                  <span className={styles.email}>{client.email}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.phone}>{client.phone}</span>
                </td>
                <td className={styles.td}>
                  <span className={styles.date}>{formatDate(client.created_at)}</span>
                </td>
                <td className={`${styles.td} ${styles.tdActions}`}>
                  <button
                    className={styles.btnEdit}
                    onClick={() => onEdit(client)}
                    title="Editar cliente"
                    aria-label={`Editar ${client.first_name} ${client.last_name}`}
                  >
                    {/* Pencil icon */}
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M14.293 2.293a1 1 0 0 1 1.414 0l2 2a1 1 0 0 1 0 1.414l-9 9A1 1 0 0 1 8 15H6a1 1 0 0 1-1-1v-2a1 1 0 0 1 .293-.707l9-9Z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                      />
                      <path d="M12.5 4.5 15.5 7.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button
                    className={styles.btnDelete}
                    onClick={() => onDelete(client.id)}
                    title="Eliminar cliente"
                    aria-label={`Eliminar ${client.first_name} ${client.last_name}`}
                  >
                    {/* Trash icon */}
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M8 4h4M3 6h14M5 6l1 11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-11"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
