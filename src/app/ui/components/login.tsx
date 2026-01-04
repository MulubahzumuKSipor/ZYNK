'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/client';
import { Loader2, AlertCircle, User } from 'lucide-react';
import styles from '@/app/ui/styles/login.module.css';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onSwitchToRegister,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Log the user in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        // 2. Fetch their role from the users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();
        router.refresh();
        onClose();

        setTimeout(() => {
          if (profile?.role === 'admin') {
            router.push("/dashboard/home");
          } else {
            router.push("/");
          }
        }, 150);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <User size={20} />
          </div>
          <h2 className={styles.title}>Welcome Back</h2>
          <p className={styles.subtitle}>Sign in to access your account</p>
        </div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={18} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? (
              <span className={styles.loaderContent}>
                <Loader2 className={styles.spinner} size={18} />
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <button onClick={onClose} className={styles.cancelBtn} disabled={loading}>
          Close
        </button>
      </div>
    </div>
  );
}