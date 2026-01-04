'use client'

import { useState, useEffect } from 'react'
import { Loader2, XCircle, X, Mail } from 'lucide-react'
import styles from '@/app/ui/styles/register.module.css'
import { supabase } from '@/lib/client'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function RegisterModal({
  isOpen,
  onClose,
  onSwitchToLogin
}: RegisterModalProps) {
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return
    }
    document.body.style.overflow = 'unset'
    const timer = setTimeout(() => {
      setIsSuccess(false)
      setError(null)
      setForm({ username: '', email: '', phone: '', password: '' })
    }, 300)
    return () => clearTimeout(timer)
  }, [isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: form.username.trim(),
            phone: form.phone || null,
          },
        },
      });

      if (authError) throw authError;
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} />
        </button>

        {!isSuccess ? (
          <>
            <h1 className={styles.title}>Create Your Account</h1>

            {error && (
              <p className={styles.error}>
                <XCircle size={18} />
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                name="username"
                placeholder="Full Name"
                value={form.username}
                onChange={handleChange}
                required
                className={styles.input}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className={styles.input}
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number (Optional)"
                value={form.phone}
                onChange={handleChange}
                className={styles.input}
              />
              <input
                type="password"
                name="password"
                placeholder="Password (min 6 chars)"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
                className={styles.input}
              />

              <button type="submit" disabled={loading} className={styles.button}>
                {loading ? <Loader2 className={styles.spinner} size={20} /> : 'Register'}
              </button>
            </form>

            <p className={styles.footerText}>
              Already have an account?
              <button onClick={onSwitchToLogin} className={styles.linkButton}>
                Sign In
              </button>
            </p>
          </>
        ) : (
          <div className={styles.successContainer}>
            <div className={styles.iconWrapper}>
              <Mail size={32} className={styles.successIcon} />
            </div>
            <h2 className={styles.title}>Check your email</h2>
            <p className={styles.message}>
              We sent a verification link to <strong className={styles.bold}>{form.email}</strong>.
            </p>
            <button onClick={onClose} className={styles.button}>
              Got it
            </button>
          </div>
        )}
      </div>
    </div>
  )
}