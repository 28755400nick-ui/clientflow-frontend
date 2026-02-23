'use client';

/**
 * ClientModal.tsx — Modal para crear o editar un cliente.
 *
 * Detecta el modo (crear vs. editar) según si `client` es null.
 * Tiene dos capas de validación:
 *   1. Frontend (antes de enviar) — valida requeridos, formato email y teléfono.
 *   2. Backend (tras enviar) — muestra errores por campo del servidor (422).
 *
 * Al guardar exitosamente, el padre cierra el modal y recarga la tabla.
 * Usa `useEffect` para resetear el formulario al abrirse/cambiar de cliente.
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import type { Client, ClientFormData, ValidationErrors } from '@/types';
import styles from './ClientModal.module.css';

interface ClientModalProps {
  isOpen: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (data: ClientFormData) => Promise<{ ok: boolean; errors: ValidationErrors }>;
}

const EMPTY_FORM: ClientFormData = { first_name: '', last_name: '', phone: '', email: '' };

function validate(data: ClientFormData): Record<keyof ClientFormData, string> {
  const err = {} as Record<keyof ClientFormData, string>;

  if (!data.first_name.trim()) err.first_name = 'El nombre es obligatorio.';
  else if (data.first_name.length > 100) err.first_name = 'Máximo 100 caracteres.';

  if (!data.last_name.trim()) err.last_name = 'El apellido es obligatorio.';
  else if (data.last_name.length > 100) err.last_name = 'Máximo 100 caracteres.';

  if (!data.phone.trim()) err.phone = 'El teléfono es obligatorio.';
  else if (!/^[+\d\s\-()\s]+$/.test(data.phone)) err.phone = 'Solo números, +, -, espacios, ( y ).';
  else if (data.phone.length > 20) err.phone = 'Máximo 20 caracteres.';

  if (!data.email.trim()) err.email = 'El email es obligatorio.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) err.email = 'Email no válido.';

  return err;
}

export default function ClientModal({ isOpen, client, onClose, onSave }: ClientModalProps) {
  const [form, setForm] = useState<ClientFormData>(EMPTY_FORM);
  const [frontErrors, setFrontErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});
  const [backErrors, setBackErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset del formulario cada vez que el modal se abre o cambia el cliente
  useEffect(() => {
    if (isOpen) {
      setForm(
        client
          ? { first_name: client.first_name, last_name: client.last_name, phone: client.phone, email: client.email }
          : EMPTY_FORM
      );
      setFrontErrors({});
      setBackErrors({});
      // Focus en el primer campo con un pequeño delay para que el modal esté visible
      setTimeout(() => firstInputRef.current?.focus(), 60);
    }
  }, [isOpen, client]);

  // Cierre con Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  function handleChange(field: keyof ClientFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al editar
    if (frontErrors[field]) setFrontErrors((prev) => ({ ...prev, [field]: undefined }));
    if (backErrors[field]) setBackErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setFrontErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setBackErrors({});
    const { ok, errors } = await onSave(form);
    setIsLoading(false);

    if (!ok) {
      setBackErrors(errors);
    }
    // Si ok, el padre cierra el modal
  }

  function getFieldError(field: keyof ClientFormData): string | undefined {
    return frontErrors[field] ?? backErrors[field]?.[0];
  }

  if (!isOpen) return null;

  const isEditing = client !== null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h2>
          <button className={styles.btnClose} onClick={onClose} aria-label="Cerrar modal">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <Field
              id="first_name"
              label="Nombre"
              value={form.first_name}
              onChange={(v) => handleChange('first_name', v)}
              error={getFieldError('first_name')}
              placeholder="Juan"
              inputRef={firstInputRef}
              disabled={isLoading}
            />
            <Field
              id="last_name"
              label="Apellido"
              value={form.last_name}
              onChange={(v) => handleChange('last_name', v)}
              error={getFieldError('last_name')}
              placeholder="García"
              disabled={isLoading}
            />
          </div>

          <Field
            id="phone"
            label="Teléfono"
            type="tel"
            value={form.phone}
            onChange={(v) => handleChange('phone', v)}
            error={getFieldError('phone')}
            placeholder="+34 612 345 678"
            disabled={isLoading}
          />

          <Field
            id="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => handleChange('email', v)}
            error={getFieldError('email')}
            placeholder="juan@ejemplo.com"
            disabled={isLoading}
          />

          {/* Pie del modal */}
          <div className={styles.footer}>
            <button type="button" className={styles.btnCancel} onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  Guardando…
                </>
              ) : isEditing ? (
                'Guardar cambios'
              ) : (
                'Crear cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Sub-componente Field ────────────────────────────────────────────────── */
interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

function Field({ id, label, value, onChange, error, placeholder, type = 'text', disabled, inputRef }: FieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  );
}
