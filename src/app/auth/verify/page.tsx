'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, Mail, XCircle, CheckCircle } from 'lucide-react'
import styles from '@/app/ui/styles/verify.module.css'

// 1. Move the main logic into a separate "Content" component
function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!email) router.replace('/auth/register')
  }, [email, router])

  const handleResend = async () => {
    if (!email) return setError('Email is missing.')

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend email')

      setMessage('Verification email sent. Please check your inbox.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <Mail size={48} className={styles.icon} />
      <h1 className={styles.title}>Check Your Email</h1>
      <p className={styles.description}>
        A verification link has been sent to <strong>{email}</strong>. <br />
        Please check your inbox and click the link to activate your account.
      </p>

      {message && (
        <p className={styles.message}>
          <CheckCircle size={18} style={{ marginRight: 8 }} />
          {message}
        </p>
      )}
      {error && (
        <p className={styles.error}>
          <XCircle size={18} style={{ marginRight: 8 }} />
          {error}
        </p>
      )}

      <button
        className={styles.button}
        onClick={handleResend}
        disabled={loading}
      >
        {loading ? (
          <span className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={20} />
            Resending...
          </span>
        ) : (
          'Resend Verification Email'
        )}
      </button>

      <p className={styles.footerText}>
        {"Didn't receive the email? Click above to resend."}
      </p>
    </div>
  )
}

// 2. Create a Loading Fallback component (optional but recommended)
function VerifyFallback() {
  return (
    <div className={styles.card}>
      <Loader2 className={styles.spinner} size={48} />
      <p className={styles.description}>Loading verification details...</p>
    </div>
  )
}

// 3. Export the Main Page wrapping the content in Suspense
export default function VerifyPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={<VerifyFallback />}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}