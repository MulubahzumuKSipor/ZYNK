"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/client";
import { useCart } from "@/lib/cart-provider";
import ProductGrid from "./components/product_list";
import {
  ChevronDown, User as UserIcon, LogOut, Settings,
  Package, Menu, X, Sparkles, Flame, Info, HelpCircle,
  ChevronLeft, ChevronRight, ShieldCheck
} from "lucide-react";
import CartButton from "./components/buttons/cart";
import CartDrawer from "./components/buttons/mini-cart";
import styles from "../ui/styles/navbar.module.css";

interface DbUser {
  full_name: string | null;
  email: string;
  role: string;
}

function NavContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { items } = useCart();

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  /* ---------------- CAROUSEL LOGIC ---------------- */
  const checkScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  const scrollCarousel = (direction: number) => {
    if (carouselRef.current) {
      const firstChild = carouselRef.current.firstChild as HTMLElement | null;
      const cardWidth = firstChild?.clientWidth ?? 160;
      carouselRef.current.scrollBy({
        left: direction * (cardWidth + 12),
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const el = carouselRef.current;
    el?.addEventListener("scroll", checkScroll);
    // Initial check after content loads
    const timer = setTimeout(checkScroll, 500);
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      clearTimeout(timer);
    };
  }, [checkScroll, isMobileMenuOpen]);

  /* ---------------- AUTH LOGIC ---------------- */
  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("users")
        .select("full_name, role")
        .eq("id", userId)
        .single();
      if (data) setDbUser({ full_name: data.full_name, role: data.role, email: "" });
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchProfile(session.user.id);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setDbUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ---------------- HELPERS ---------------- */
  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    setOpenMenu(null);
    router.push(href);
  };

  const toggleAccordion = (menu: string) => setOpenMenu(openMenu === menu ? null : menu);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpenMenu(null);
    setIsMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const displayName = (
    dbUser?.full_name || supabaseUser?.email?.split("@")[0] || "Account"
  ).toUpperCase();

  // Active state logic
  const isShopActive = pathname.startsWith("/shop") || pathname === "/specials" || pathname === "/arrivals" || pathname === "/sale";
  const isAboutActive = pathname === "/about" || pathname === "/careers" || pathname === "/contact";

  return (
    <>
      <CartDrawer />

      <div className={styles.navWrapper}>
        {/* --- MOBILE HAMBURGER --- */}
        <button
          className={styles.mobileToggle}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>

        {/* --- DESKTOP NAVIGATION --- */}
        <ul className={styles.desktopLinks}>
          <li className={styles.navItem}>
            <button
              className={`${styles.navButton} ${pathname === "/" ? styles.active : ""}`}
              onClick={() => handleNavClick("/")}
            >
              Home
            </button>
          </li>

          {/* SHOP MEGA MENU */}
          <li
            className={styles.navItem}
            onMouseEnter={() => setOpenMenu("shop")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className={`${styles.navButton} ${isShopActive ? styles.active : ""}`}>
              Shop <ChevronDown size={14} className={styles.chevron} />
            </button>
            <div className={`${styles.megaMenu} ${openMenu === "shop" ? styles.show : ""}`}>
              <div className={styles.megaGrid}>
                <div className={styles.megaColumn}>
                  <h4><Sparkles size={14} className={styles.iconBlue}/> Discover</h4>
                  <button onClick={() => handleNavClick("/shop")}>All Products</button>
                  <button onClick={() => handleNavClick("/arrivals")}>New Arrivals</button>
                  <button onClick={() => handleNavClick("/specials")}>Specials</button>
                </div>
                <div className={styles.megaColumn}>
                  <h4><Flame size={14} className={styles.iconOrange}/> Curated</h4>
                  <button onClick={() => handleNavClick("/bestsellers")}>Best Sellers</button>
                  <button onClick={() => handleNavClick("/sale")} className={styles.hotSale}>Hot Sale 🔥</button>
                </div>
              </div>
            </div>
          </li>

          {/* ABOUT MEGA MENU */}
          <li
            className={styles.navItem}
            onMouseEnter={() => setOpenMenu("about")}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <button className={`${styles.navButton} ${isAboutActive ? styles.active : ""}`}>
              About <ChevronDown size={14} className={styles.chevron} />
            </button>
            <div className={`${styles.megaMenu} ${openMenu === "about" ? styles.show : ""}`}>
              <div className={styles.megaGrid}>
                <div className={styles.megaColumn}>
                  <h4><Info size={14}/> Company</h4>
                  <button onClick={() => handleNavClick("/about")}>Our Story</button>
                  <button onClick={() => handleNavClick("/careers")}>Careers</button>
                </div>
                <div className={styles.megaColumn}>
                  <h4><HelpCircle size={14}/> Support</h4>
                  <button onClick={() => handleNavClick("/contact")}>Contact Us</button>
                  <button onClick={() => handleNavClick("/faq")}>FAQ</button>
                </div>
              </div>
            </div>
          </li>

          {dbUser?.role === "admin" && (
            <li className={styles.navItem}>
              <button className={styles.adminBadge} onClick={() => handleNavClick("/dashboard/home")}>
                <ShieldCheck size={14} /> Admin
              </button>
            </li>
          )}
        </ul>

        {/* --- SHARED ACTIONS --- */}
        <div className={styles.navActions}>
          {supabaseUser && !supabaseUser.is_anonymous ? (
            <div className={styles.accountContainer} onMouseLeave={() => setOpenMenu(null)}>
              <button
                className={styles.accountBtn}
                onMouseEnter={() => setOpenMenu("account")}
                onClick={() => setOpenMenu(openMenu === "account" ? null : "account")}
              >
                <span className={styles.userLabel}>{displayName}</span>
                <UserIcon size={18} />
              </button>
              {openMenu === "account" && (
                <div className={styles.userDropdown}>
                  <div className={styles.dropdownHeader}>
                    <p>{displayName}</p>
                    <span>{supabaseUser.email}</span>
                  </div>
                  <button onClick={() => handleNavClick("/account/orders")}><Package size={14}/> Orders</button>
                  <button onClick={() => handleNavClick("/account/manage")}><Settings size={14}/> Settings</button>
                  <hr className={styles.divider} />
                  <button onClick={handleLogout} className={styles.logoutBtn}><LogOut size={14}/> Log Out</button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.authGroup}>
              <button className={styles.loginBtn} onClick={() => handleNavClick("?auth=login")}>Login</button>
              <button className={styles.joinBtn} onClick={() => handleNavClick("?auth=register")}>Join</button>
            </div>
          )}
          <CartButton />
        </div>

        {/* --- MOBILE DRAWER --- */}
        <div className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.drawerOpen : ""}`}>
          <div className={styles.drawerHeader}>
            <span className={styles.drawerLogo}>ZYNK<span>.</span></span>
            <button className={styles.drawerCloseBtn} onClick={() => setIsMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <div className={styles.drawerContent}>
            <button className={styles.mobileLink} onClick={() => handleNavClick("/")}>Home</button>

            {/* MOBILE SHOP ACCORDION */}
            <div className={styles.mobileAccordion}>
              <button onClick={() => toggleAccordion("mobileShop")}>
                Shop <ChevronDown size={16} className={openMenu === "mobileShop" ? styles.rotate : ""} />
              </button>
              <div className={`${styles.accContent} ${openMenu === "mobileShop" ? styles.accShow : ""}`}>
                <button onClick={() => handleNavClick("/shop")}>All Products</button>
                <button onClick={() => handleNavClick("/arrivals")}>New Arrivals</button>
                <button onClick={() => handleNavClick("/specials")}>Specials</button>
                <button onClick={() => handleNavClick("/bestsellers")}>Best Sellers</button>
                <button onClick={() => handleNavClick("/sale")}>Sale 🔥</button>
              </div>
            </div>

            {/* MOBILE ABOUT ACCORDION */}
            <div className={styles.mobileAccordion}>
              <button onClick={() => toggleAccordion("mobileAbout")}>
                About <ChevronDown size={16} className={openMenu === "mobileAbout" ? styles.rotate : ""} />
              </button>
              <div className={`${styles.accContent} ${openMenu === "mobileAbout" ? styles.accShow : ""}`}>
                <button onClick={() => handleNavClick("/about")}>Our Story</button>
                <button onClick={() => handleNavClick("/careers")}>Careers</button>
                <button onClick={() => handleNavClick("/contact")}>Contact Us</button>
                <button onClick={() => handleNavClick("/faq")}>FAQ</button>
              </div>
            </div>

            {/* Recommended Carousel */}
            <div className={styles.drawerCarouselWrapper}>
              <h4 className={styles.drawerCarouselTitle}>Recommended for You</h4>
              <div className={styles.carouselContainer}>
                {canScrollLeft && (
                  <button className={`${styles.drawerArrow} ${styles.drawerArrowLeft}`} onClick={() => scrollCarousel(-1)}>
                    <ChevronLeft size={16} />
                  </button>
                )}
                {canScrollRight && (
                  <button className={`${styles.drawerArrow} ${styles.drawerArrowRight}`} onClick={() => scrollCarousel(1)}>
                    <ChevronRight size={16} />
                  </button>
                )}
                <div ref={carouselRef} className={styles.drawerProductGrid}>
                   {/* Wrapping ProductGrid to ensure smooth scroll sizing */}
                  <div className={styles.productGridInner}>
                    <ProductGrid limit={6} shuffle={true} />
                  </div>
                </div>
              </div>
            </div>

            {/* Authenticated Options for Mobile */}
            {supabaseUser && !supabaseUser.is_anonymous && (
              <div className={styles.mobileAuthGroup}>
                <span className={styles.authLabel}>Account</span>
                <button className={styles.mobileAuthBtn} onClick={() => handleNavClick("/account/orders")}>
                  <Package size={16} /> My Orders
                </button>
                <button className={styles.mobileAuthBtn} onClick={() => handleNavClick("/account/manage")}>
                  <Settings size={16} /> Settings
                </button>
              </div>
            )}
          </div>

          <div className={styles.drawerFooter}>
            {supabaseUser && !supabaseUser.is_anonymous ? (
              <button className={styles.mobileLogout} onClick={handleLogout}>Log Out</button>
            ) : (
              <div className={styles.mobileAuthButtons}>
                <button className={styles.mobileJoin} onClick={() => handleNavClick("?auth=register")}>Create Account</button>
                <button className={styles.mobileLogin} onClick={() => handleNavClick("?auth=login")}>Log In</button>
              </div>
            )}
          </div>
        </div>

        {/* Backdrop */}
        {isMobileMenuOpen && <div className={styles.backdrop} onClick={() => setIsMobileMenuOpen(false)} />}
      </div>
    </>
  );
}

export default function Nav() {
  return (
    <Suspense fallback={<div className={styles.navLoading} />}>
      <NavContent />
    </Suspense>
  );
}