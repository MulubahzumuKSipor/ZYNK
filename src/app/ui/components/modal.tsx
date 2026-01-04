'use client';
import { useEffect, useCallback } from 'react';
import styles from '@/app/ui/styles/modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isDirty?: boolean;
}

export default function Modal({ isOpen, onClose, title, children, isDirty }: ModalProps) {
  const handleClose = useCallback(() => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    onClose();
  }, [isDirty, onClose]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={handleClose} />
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button onClick={handleClose} className={styles.closeBtn}>✕</button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}