'use client';

/**
 * FilterBar.tsx — Barra de filtros y acciones del dashboard.
 *
 * Recibe el estado de los inputs desde la página padre (controlled component).
 * No hace fetch directamente: solo notifica al padre vía callbacks.
 * Esto mantiene la fuente de verdad en un solo lugar (clients/page.tsx).
 */

import styles from './FilterBar.module.css';

interface FilterValues {
  name: string;
  phone: string;
}

interface FilterBarProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onSearch: () => void;
  onClear: () => void;
  onExport: () => void;
  isLoading: boolean;
}

export default function FilterBar({
  values,
  onChange,
  onSearch,
  onClear,
  onExport,
  isLoading,
}: FilterBarProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') onSearch();
  }

  const hasFilters = values.name.trim() !== '' || values.phone.trim() !== '';

  return (
    <div className={styles.bar}>
      <div className={styles.inputs}>
        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>
            {/* Search icon */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="m14 14 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.input}
            placeholder="Buscar por nombre…"
            value={values.name}
            onChange={(e) => onChange({ ...values, name: e.target.value })}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>

        <div className={styles.inputWrap}>
          <span className={styles.inputIcon}>
            {/* Phone icon */}
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M6.5 3A1.5 1.5 0 0 1 8 4.5v2A1.5 1.5 0 0 1 6.5 8h-.25A8.25 8.25 0 0 0 12 13.75v-.25A1.5 1.5 0 0 1 13.5 12h2A1.5 1.5 0 0 1 17 13.5v.5a3 3 0 0 1-3 3C7.268 17 3 12.732 3 7a3 3 0 0 1 3-3h.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <input
            type="text"
            className={styles.input}
            placeholder="Buscar por teléfono…"
            value={values.phone}
            onChange={(e) => onChange({ ...values, phone: e.target.value })}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.btnSearch}
          onClick={onSearch}
          disabled={isLoading}
        >
          {isLoading ? <span className={styles.spinner} /> : null}
          Buscar
        </button>

        {hasFilters && (
          <button className={styles.btnClear} onClick={onClear} disabled={isLoading}>
            Limpiar
          </button>
        )}

        <button className={styles.btnExport} onClick={onExport} disabled={isLoading}>
          {/* Download icon */}
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 3v10m0 0-3.5-3.5M10 13l3.5-3.5M4 17h12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Exportar Excel
        </button>
      </div>
    </div>
  );
}
