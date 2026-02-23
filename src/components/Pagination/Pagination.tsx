'use client';

/**
 * Pagination.tsx — Paginación con páginas inteligentes.
 *
 * Muestra un máximo de 7 números de página con puntos suspensivos
 * cuando hay muchas páginas. Siempre muestra la primera y la última.
 * Informa cuántos registros se están viendo (from-to de total).
 */

import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  total: number;
  onPageChange: (page: number) => void;
}

function buildPages(current: number, last: number): (number | '...')[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', last);
  } else if (current >= last - 3) {
    pages.push(1, '...', last - 4, last - 3, last - 2, last - 1, last);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', last);
  }

  return pages;
}

export default function Pagination({
  currentPage,
  lastPage,
  from,
  to,
  total,
  onPageChange,
}: PaginationProps) {
  const pages = buildPages(currentPage, lastPage);

  return (
    <div className={styles.wrapper}>
      {/* Info de registros */}
      <span className={styles.info}>
        {from !== null && to !== null ? (
          <>
            Mostrando <strong>{from}</strong>–<strong>{to}</strong> de{' '}
            <strong>{total}</strong>
          </>
        ) : (
          <strong>{total}</strong>
        )}
      </span>

      {/* Páginas */}
      <nav className={styles.nav} aria-label="Paginación">
        <button
          className={styles.btn}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        {pages.map((page, idx) =>
          page === '...' ? (
            <span key={`dots-${idx}`} className={styles.dots}>
              …
            </span>
          ) : (
            <button
              key={page}
              className={`${styles.btn} ${page === currentPage ? styles.btnActive : ''}`}
              onClick={() => onPageChange(page as number)}
              aria-label={`Ir a página ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          className={styles.btn}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </nav>
    </div>
  );
}
