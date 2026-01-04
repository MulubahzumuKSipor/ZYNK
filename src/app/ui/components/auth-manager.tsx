'use client'

import { useCallback, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import LoginModal from '@/app/ui/components/login'
import RegisterModal from './register'

function AuthManagerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const authAction = searchParams.get('auth') as 'login' | 'register' | null

  // 2. Navigation Handlers: Instead of setting local state, we update the URL.
  // This keeps the URL and UI perfectly in sync without cascading renders.
  const handleClose = useCallback(() => {
    if (searchParams.has('auth')) {
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, pathname, router])

  const switchToRegister = useCallback(() => {
    router.replace(`${pathname}?auth=register`, { scroll: false })
  }, [pathname, router])

  const switchToLogin = useCallback(() => {
    router.replace(`${pathname}?auth=login`, { scroll: false })
  }, [pathname, router])

  return (
    <>
      <LoginModal 
        isOpen={authAction === 'login'}
        onClose={handleClose} 
        onSwitchToRegister={switchToRegister} 
      />
      <RegisterModal 
        isOpen={authAction === 'register'}
        onClose={handleClose}
        onSwitchToLogin={switchToLogin}
      />
    </>
  )
}

export default function AuthManager() {
  return (
    <Suspense fallback={null}>
      <AuthManagerContent />
    </Suspense>
  )
}