'use client';

import { useState } from 'react';
import { updateStoreSettings, updateProfile } from '@/lib/actions/settings';
import styles from '@/app/ui/styles/settings.module.css';

// 1. Define specific types instead of 'any' to satisfy ESLint
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
}

interface StoreSettings {
  id: string;
  store_name: string;
  support_email: string | null;
  currency: string;
}

interface SettingsProps {
  user: UserProfile;
  storeSettings: StoreSettings;
}

// 2. Define a type for Server Actions
type ServerAction = (formData: FormData) => Promise<{ success: boolean }>;

// 3. Define valid tab keys
type Tab = 'general' | 'profile' | 'security';

export default function SettingsManager({ user, storeSettings }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(false);

  // Helper to handle form submission
  async function handleSubmit(formData: FormData, action: ServerAction) {
    setLoading(true);
    try {
      await action(formData);
      // Use window.alert to be explicit, though a Toast notification is better for UX
      window.alert('Settings saved successfully!');
    } catch (e) {
      console.error(e); // Log error for debugging
      window.alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      
      {/* 1. Sidebar Navigation */}
      <nav className={styles.sidebar}>
        <button 
          type="button" // Explicit type prevents form submission issues
          onClick={() => setActiveTab('general')}
          className={`${styles.navButton} ${activeTab === 'general' ? styles.active : ''}`}
        >
          General Store
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`${styles.navButton} ${activeTab === 'profile' ? styles.active : ''}`}
        >
          My Profile
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('security')}
          className={`${styles.navButton} ${activeTab === 'security' ? styles.active : ''}`}
        >
          Security
        </button>
      </nav>

      {/* 2. Content Area */}
      <main className={styles.card}>
        
        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && (
          <form action={(fd) => handleSubmit(fd, updateStoreSettings)}>
            <div className={styles.sectionHeader}>
              <h2>Store Configuration</h2>
              <p>Manage your global store settings.</p>
            </div>
            
            <input type="hidden" name="id" value={storeSettings.id} />

            <div className={styles.formGroup}>
              <label htmlFor="store_name" className={styles.label}>Store Name</label>
              <input 
                id="store_name"
                name="store_name" 
                className={styles.input} 
                defaultValue={storeSettings.store_name} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="support_email" className={styles.label}>Support Email</label>
              <input 
                id="support_email"
                name="support_email" 
                type="email" 
                className={styles.input} 
                defaultValue={storeSettings.support_email || ''}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currency" className={styles.label}>Currency</label>
              <select
                id="currency"
                name="currency"
                className={styles.select}
                defaultValue={storeSettings.currency}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="LRD">LRD ($)</option>
              </select>
            </div>

            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === 'profile' && (
          <form action={(fd) => handleSubmit(fd, updateProfile)}>
            <div className={styles.sectionHeader}>
              <h2>My Profile</h2>
              <p>Update your personal administrator details.</p>
            </div>

            <input type="hidden" name="userId" value={user.id} />

            <div className={styles.formGroup}>
              <label htmlFor="full_name" className={styles.label}>Full Name</label>
              <input 
                id="full_name"
                name="full_name" 
                className={styles.input} 
                defaultValue={user.full_name || ''}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Address</label>
              <input 
                id="email"
                name="email" 
                className={styles.input} 
                defaultValue={user.email} 
                readOnly 
                style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                title="Contact support to change email"
              />
            </div>

            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        )}
        
         {/* --- SECURITY TAB --- */}
         {activeTab === 'security' && (
          <div>
            <div className={styles.sectionHeader}>
              <h2>Security</h2>
              <p>Manage your password and session.</p>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>
              Password updates are handled via Supabase Auth reset flow.
            </p>
            <button 
              type="button" 
              className={styles.saveBtn} 
              style={{ background: 'white', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => window.alert('Trigger password reset email logic here')}
            >
              Send Password Reset Email
            </button>
          </div>
        )}

      </main>
    </div>
  );
}