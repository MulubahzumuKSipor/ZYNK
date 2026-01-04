'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react'
import styles from '@/app/ui/styles/resend.module.css'

export default function ResendVerificationPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to resend email')

      setMessage(data.message || 'Verification email sent! Check your inbox.')
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Mail size={40} className={styles.icon} />
        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>
          We sent a confirmation email after your registration. Check your inbox to activate your account.
        </p>

        {message && (
          <div className={styles.messageBox}>
            <CheckCircle size={20} className={styles.successIcon} />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className={styles.messageBox}>
            <XCircle size={20} className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (
              <span className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={20} />
                Sending...
              </span>
            ) : (
              'Resend Verification Email'
            )}
          </button>
        </form>

        <p className={styles.footerText}>
          Already verified? <span onClick={() => router.push('/?auth=login')} className={styles.link}>Login here</span>
        </p>
      </div>
    </div>
  )
}
