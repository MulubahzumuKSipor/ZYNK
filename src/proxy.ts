import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ADMIN_PREFIX = '/dashboard'
const PROTECTED_ROUTES = ['/account', '/checkout', '/orders']

// Next.js 16 requires 'export default' or a named export 'proxy'
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Critical: Refresh session so the server can "see" the login
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const isAdminPath = path.startsWith(ADMIN_PREFIX)
  const isProtectedPath = PROTECTED_ROUTES.some(route => path.startsWith(route))

  // 1. REDIRECT IF NOT LOGGED IN
  if ((isAdminPath || isProtectedPath) && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.set('auth', 'login')
    return NextResponse.redirect(redirectUrl)
  }

  // 2. ADMIN CHECK (Using Metadata to bypass RLS loops)
  if (isAdminPath && user) {
    const role = user.app_metadata?.role
    const isSuperAdmin = user.app_metadata?.is_super_admin === true

    if (role !== 'admin' && !isSuperAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}