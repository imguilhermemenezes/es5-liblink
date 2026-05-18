import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, lastPage, onPageChange }) {
    if (lastPage <= 1) return null;

    const pages = [];
    for (let i = 1; i <= lastPage; i++) {
        // Show first, last, and pages around current
        if (
            i === 1 || 
            i === lastPage || 
            (i >= currentPage - 1 && i <= currentPage + 1)
        ) {
            pages.push(i);
        } else if (
            (i === currentPage - 2 && i > 1) || 
            (i === currentPage + 2 && i < lastPage)
        ) {
            pages.push('...');
        }
    }

    // Remove duplicates from '...'
    const uniquePages = pages.filter((p, index) => pages.indexOf(p) === index);

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '0.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <ChevronLeft size={16} />
            </button>

            {uniquePages.map((p, i) => (
                p === '...' ? (
                    <span key={`dots-${i}`} style={{ padding: '0 0.5rem', color: 'var(--color-text-muted)' }}>...</span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            border: p === currentPage ? 'none' : '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: p === currentPage ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: p === currentPage ? 'var(--color-primary-text, white)' : 'var(--color-text-main)',
                            fontWeight: p === currentPage ? 600 : 'normal',
                            cursor: 'pointer'
                        }}
                    >
                        {p}
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                style={{
                    padding: '0.5rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface)',
                    cursor: currentPage === lastPage ? 'not-allowed' : 'pointer',
                    opacity: currentPage === lastPage ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
