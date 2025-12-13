'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import CartButton from './components/buttons/cart'
import styles from '../ui/styles/navbar.module.css'
import { supabase } from '@/lib/client'

interface DbUser {
  username: string
  email: string
  role: string
  status: string
}

export default function Nav() {
  const router = useRouter()
  const navRef = useRef<HTMLElement | null>(null)

  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [dbUser, setDbUser] = useState<DbUser | null>(null)

  const toggleMenu = (menuName: string) => setOpenMenu(prev => (prev === menuName ? null : menuName))
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev)
    setOpenMenu(null)
  }

  const handleNavClick = (href?: string) => {
    setIsMobileMenuOpen(false)
    setOpenMenu(null)
    if (href) router.push(href)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[Nav] signOut error', err)
    }
    setSupabaseUser(null)
    setDbUser(null)
    handleNavClick('/auth/login')
  }

  // --- Supabase Auth Listeners ---
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      if (data.session?.user) setSupabaseUser(data.session.user)
    }).catch(err => {
      console.debug('[Nav] getSession error', err)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSupabaseUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // --- Fetch DB User ---
  useEffect(() => {
    const controller = new AbortController()
    let mounted = true

    const fetchDbUser = async () => {
      if (!supabaseUser?.id) {
        if (mounted) setDbUser(null)
        return
      }

      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData.session?.access_token ?? null

        const res = await fetch(`/api/users/${supabaseUser.id}`, {
          method: 'GET',
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
          signal: controller.signal,
        })

        if (!mounted) return

        if (!res.ok) {
          setDbUser(null)
          return
        }

        const data = await res.json()
        setDbUser(data.user ?? null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[Nav] Error fetching user', err)
        if (mounted) setDbUser(null)
      }
    }

    fetchDbUser()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [supabaseUser])

  // --- Click Outside / Escape to Close ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null)
        setIsMobileMenuOpen(false)
      }
    }
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null)
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  return (
    <nav className={styles.navbar} ref={navRef}>
      {/* Hamburger Icon */}
      <button
        className={styles.hamburger}
        onClick={toggleMobileMenu}
        aria-expanded={isMobileMenuOpen}
        aria-label="Toggle navigation"
      >
        {isMobileMenuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        )}
      </button>

      {/* Main Nav List */}
      <ul className={`${styles.navList} ${isMobileMenuOpen ? styles.open : ''}`}>

        {/* Home */}
        <li className={`${styles.navItem} ${styles.mobileOnly}`}>
          <button className={styles.link} onClick={() => handleNavClick('/')}>Home</button>
        </li>

        {/* SHOP DROPDOWN */}
        <li className={styles.navItem}>
          <button
            aria-haspopup="true"
            aria-expanded={openMenu === 'shop'}
            onClick={() => toggleMenu('shop')}
            className={styles.navButton}
          >
            Shop
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: openMenu === 'shop' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={`${styles.megaMenu} ${openMenu === 'shop' ? styles.visible : ''}`}>
            <div className={styles.megaMenuColumn}>
              <h3>Categories</h3>
              <ul>
                <li><button onClick={() => handleNavClick('/shop')}>All Products</button></li>
                <li><button onClick={() => handleNavClick('/specials')}>Specials</button></li>
                <li><button onClick={() => handleNavClick('/arrivals')}>New Arrivals</button></li>
              </ul>
            </div>
            <div className={styles.megaMenuColumn}>
              <h3>Featured</h3>
              <ul>
                <li><button onClick={() => handleNavClick('/bestsellers')}>Best Sellers</button></li>
                <li><button onClick={() => handleNavClick('/sale')} style={{color: '#ef4444'}}>Hot Sale 🔥</button></li>
              </ul>
            </div>
          </div>
        </li>

        {/* ABOUT DROPDOWN */}
        <li className={styles.navItem}>
          <button
            aria-haspopup="true"
            aria-expanded={openMenu === 'about'}
            onClick={() => toggleMenu('about')}
            className={styles.navButton}
          >
            About
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: openMenu === 'about' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className={`${styles.megaMenu} ${openMenu === 'about' ? styles.visible : ''}`}>
            <div className={styles.megaMenuColumn}>
              <h3>Company</h3>
              <ul>
                <li><button onClick={() => handleNavClick('/about')}>Our Story</button></li>
                <li><button onClick={() => handleNavClick('/careers')}>Careers</button></li>
              </ul>
            </div>
            <div className={styles.megaMenuColumn}>
              <h3>Support</h3>
              <ul>
                <li><button onClick={() => handleNavClick('/contact')}>Contact Us</button></li>
                <li><button onClick={() => handleNavClick('/faq')}>FAQ</button></li>
              </ul>
            </div>
          </div>
        </li>

        {/* AUTH SECTION */}
        {dbUser ? (
          <li className={styles.navItem}>
            <button
              aria-haspopup="true"
              aria-expanded={openMenu === 'account'}
              onClick={() => toggleMenu('account')}
              className={styles.navButton}
            >
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {dbUser.username || 'Account'}
              </span>
            </button>

            <div className={`${styles.megaMenu} ${styles.miniMenu} ${openMenu === 'account' ? styles.visible : ''}`}>
              <div className={styles.megaMenuColumn}>
                <ul>
                  <li><button onClick={() => handleNavClick('/account/manage')}>Manage Account</button></li>
                  <li><button onClick={() => handleNavClick('/account/orders')}>My Orders</button></li>
                  <li>
                    <button
                      onClick={handleLogout}
                      style={{
                        color: '#ef4444',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: '4px 0',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.95rem'
                      }}
                    >
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        ) : (
          <>
            <li className={styles.navItem}><button onClick={() => handleNavClick('/auth/login')}>Login</button></li>
            <li className={styles.navItem}><button onClick={() => handleNavClick('/auth/register')} style={{ backgroundColor: 'blue', color: 'white', padding: '8px 20px', boxShadow: '0 4px 14px rgba(13,71,161,0.39)', borderRadius: '10px' }}>Register</button></li>
          </>
        )}

        {/* CART */}
        <li className={styles.navItem}>
          <CartButton />
        </li>
      </ul>
    </nav>
  )
}
