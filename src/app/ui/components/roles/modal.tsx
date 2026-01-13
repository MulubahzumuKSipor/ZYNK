'use client';

import { useState } from 'react';
import { inviteUser } from '@/lib/actions/roles';
import styles from '@/app/ui/styles/roles-permissions.module.css';

export default function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    
    try {
      await inviteUser(formData);
      onClose(); // Close modal on success
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        
        <div className={styles.modalHeader}>
          <h2>Invite Team Member</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <form action={handleSubmit} className={styles.modalBody}>
          {error && (
            <div style={{ 
              background: '#fee2e2', color: '#991b1b', padding: '0.75rem', 
              borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' 
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              Email Address
            </label>
            <input 
              name="email" 
              type="email" 
              required 
              placeholder="colleague@company.com"
              style={{
                width: '96%', padding: '0.6rem', borderRadius: '6px',
                border: '1px solid #cbd5e1', fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
              Assign Role
            </label>
            <select 
              name="role" 
              required
              className={styles.roleSelect} 
              style={{ width: '100%', padding: '0.6rem' }}
            >
              <option value="staff">Staff (Limited Access)</option>
              <option value="manager">Manager (Operations)</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: 'white', border: '1px solid #cbd5e1', padding: '0.6rem 1rem',
                borderRadius: '6px', cursor: 'pointer', fontWeight: 500
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                background: '#0f172a', color: 'white', border: 'none', padding: '0.6rem 1rem',
                borderRadius: '6px', cursor: 'pointer', fontWeight: 500, opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}