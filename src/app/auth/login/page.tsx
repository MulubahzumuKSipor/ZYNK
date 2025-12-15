'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import styles from '@/app/ui/styles/login.module.css'
import Link from 'next/link'
import { supabase } from '@/lib/client'

interface FormState {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [unverified, setUnverified] = useState(false)

  // --- Redirect if already logged in ---
  // useEffect(() => {
  //   const checkLoggedIn = async () => {
  //     const { data: { session } } = await supabase.auth.getSession()
  //     if (session?.user) {
  //       router.replace('/shop') // redirect to shop if user is already logged in
  //     }
  //   }
  //   checkLoggedIn()
  // }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUnverified(false)
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })

      if (signInError) {
        if (signInError.message.includes('Email not confirmed')) {
          setUnverified(true)
          return
        }
        throw new Error(signInError.message)
      }

      if (!data.session) {
        throw new Error('Login failed')
      }

      // Login successful — redirect
      router.push('/shop')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Welcome Back 👋</h1>

        {/* --- Message Area --- */}
        {error && <p className={styles.error}>{error}</p>}
        {unverified && (
          <p className={styles.unverified}>
            <Send size={18} style={{ marginRight: 8 }} />
            Your email is not verified. Please check your inbox.
            <a href="/auth/resend" className={styles.resendLink}>
              Resend verification email
            </a>
          </p>
        )}

        {/* --- Form --- */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="current-password"
          />

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <span className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={20} />
                Authenticating...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className={styles.footerLink}>
          <p>{"Don't have an account? "}<Link href="/auth/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  )
}
