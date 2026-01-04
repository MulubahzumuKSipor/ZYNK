// components/dashboard/DashHeader.tsx
"use client"; // Important!

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/client';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/app/ui/styles/dashHeader.module.css';
import { useDashboardTheme } from '@/app/ui/components/shared/themeProvider';


const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41 -1.41"/><path d="M17.66 6.34l1.41 -1.41"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>
  </svg>
);

export default function DashHeader() {
    const { theme, toggleTheme } = useDashboardTheme();
    const isDarkMode = theme === 'dark';

    // 1. Create state for the user
    const [userDisplayName, setUserDisplayName] = useState<string>("Loading...");
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            // 2. Fetch the user session
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Prioritize full_name from metadata, fallback to email
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
                setUserDisplayName(name.toUpperCase());
            }
        }
        getUser();
    }, [supabase]);

    const userAvatarUrl = "/avatar.svg";

    return (
        <header className={`${styles.headerContainer} ${isDarkMode ? styles.darkTheme : styles.lightTheme}`}>
            {/* Logo Section */}
            <Link href="/dashboard/home" className={styles.logoLink}>
                <div className={styles.logo}>
                    <Image
                        src={isDarkMode ? "/logo.webp" : "/bag-black.PNG"}
                        alt="ZYNK Sales Logo"
                        width={32}
                        height={32}
                        className={styles.image}
                    />
                    <h1 className={styles.title}>ZYNK Sales</h1>
                </div>
            </Link>

            {/* Right Side Actions */}
            <div className={styles.actions}>
                <label className={styles.themeSwitch} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={toggleTheme}
                        aria-label="Toggle dark mode"
                    />
                    <div className={styles.switchTrack}>
                        <div className={styles.switchHandle}>
                            {isDarkMode ? <MoonIcon /> : <SunIcon />}
                        </div>
                    </div>
                </label>

                {/* Profile Section */}
                <div className={styles.profile}>
                    {/* 3. Display the dynamic name */}
                    <span className={styles.profileName}>{userDisplayName}</span>
                    <div className={styles.avatar}>
                        <Image
                            src={userAvatarUrl}
                            alt={userDisplayName}
                            width={38}
                            height={38}
                            className={styles.avatarImage}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}