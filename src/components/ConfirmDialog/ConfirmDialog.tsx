'use client';

/**
 * ConfirmDialog.tsx — Diálogo de confirmación para acciones destructivas.
 *
 * Se usa para confirmar el borrado de un cliente.
 * Muestra un ícono de advertencia, el mensaje y dos botones.
 * Tiene estado de carga durante la operación para evitar doble click.
 */

import { useEffect } from 'react';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  isLoading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  // Cierre con Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !isLoading) onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => !isLoading && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Icono de advertencia */}
        <div className={styles.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            className={styles.btnCancel}
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            className={styles.btnConfirm}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} />
                Eliminando…
              </>
            ) : (
              'Sí, eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
