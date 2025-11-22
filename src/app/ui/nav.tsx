"use client";

import Link from "next/link";
import CartButton from "./components/buttons/cart";
import { useState, useRef, useEffect } from "react";
// 1. Import your CSS Module file
import styles from "../ui/styles/navbar.module.css";

export default function Nav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  // Effect to close menu on click outside or 'Escape' key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleMenuClick = (event: MouseEvent) => {

    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    // 2. Use the 'styles' object for class names
    <nav className={styles.navbar} aria-label="Main Navigation" ref={navRef}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link href="/" className="Link">Home</Link>
        </li>

        {/* SHOP MENU */}
        <li className={`${styles.navItem} ${styles.megaMenuParent}`}>
          <button
          className="down_button"
            aria-haspopup="true"
            aria-expanded={openMenu === "shop"}
            onClick={() => toggleMenu("shop")} // Use onClick
          >
            Shop <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M36 18L24 30L12 18"/></svg>
          </button>
          {openMenu === "shop" && (
            <div className={`${styles.megaMenu} ${styles.main_wrapper}`}>
              <div className={styles.megaMenuColumn}>
                <Link href="/shop" className="Link">Products</Link>
              </div>
              <div className={styles.megaMenuColumn}>
                <Link href="/specials" className="Link">Special</Link>
              </div>
              <div className={styles.megaMenuColumn}>
                <Link href="/arrivals" className="Link">New Arrivals</Link>
              </div>
              <div className={styles.megaMenuColumn}>
                <h3>Featured</h3>
                <ul>
                  <li>
                    <Link href="/shop/bestsellers" className="Link">Best Sellers</Link>
                  </li>
                  <li>
                    <Link href="/shop/sale" className="Link">Hot Sale</Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </li>

        {/* ABOUT US MENU */}
        <li className={styles.navItem}>
          <button
            className="down_button"
            aria-haspopup="true"
            aria-expanded={openMenu === "about"}
            onClick={() => toggleMenu("about")} // Use onClick
          >
            About Us <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M36 18L24 30L12 18"/></svg>
          </button>
          {openMenu === "about" && (
            <div className={`${styles.megaMenu} ${styles.main_wrapper}`}>
              <div className={styles.megaMenuColumn}>
                <Link href="/about">Learn About Us</Link>
              </div>
              <div className={styles.megaMenuColumn}>
                <Link href="/contact">Contact Us</Link>
              </div>
              <div className={styles.megaMenuColumn}>
                <Link href="/faq">Frequently Asked Questions</Link>
              </div>
            </div>
          )}
        </li>

        {/* CART */}
        <li className={`${styles.navItem} ${styles.cart}`}>
            <CartButton />
        </li>

        <li>
          <Link href="/account" className={styles.Link}>Account</Link>
        </li>
        {/* <li>
          <Link href="/login" className={styles.Link}>Login</Link>
        </li>
        /
        <li>
          <Link href="/register" className={styles.Link}>Register</Link>
        </li> */}
      </ul>
    </nav>
  );
}