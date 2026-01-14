"use client";

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from '@/app/ui/styles/dashHeader.module.css';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react'; // Added icons

const BellIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

export default function DashHeader() {
    const router = useRouter();
    const supabase = createClient();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [userDisplayName, setUserDisplayName] = useState<string>("Loading...");
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        async function getUserData() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
                setUserDisplayName(name.toUpperCase());

                const { count } = await supabase
                    .from('notifications')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id)
                    .eq('is_read', false);

                setUnreadCount(count || 0);
            }
        }
        getUserData();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const handleNotificationClick = () => {
        router.push('/dashboard/notifications?tab=notifications');
    };

    return (
        <header className={styles.headerContainer}>
            {/* Logo Section */}
            <Link href="/dashboard/home" className={styles.logoLink}>
                <div className={styles.logo}>
                    <Image
                        src={"/bag-black.png"}
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
                <button
                    className={styles.notificationBtn}
                    onClick={handleNotificationClick}
                    aria-label="View notifications"
                >
                    <BellIcon />
                    {unreadCount > 0 && (
                        <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                </button>

                {/* Profile Section with Dropdown */}
                <div
                    className={styles.profileContainer}
                    ref={dropdownRef}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    <button
                        className={styles.profileTrigger}
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <span className={styles.profileName}>{userDisplayName}</span>
                        <div className={styles.avatar}>
                            <Image
                                src="/avatar.svg"
                                alt={userDisplayName}
                                width={38}
                                height={38}
                                className={styles.avatarImage}
                            />
                        </div>
                        <ChevronDown size={16} className={`${styles.chevron} ${showDropdown ? styles.rotate : ''}`} />
                    </button>

                    {showDropdown && (
                        <div className={styles.userDropdown}>
                            <Link href="/dashboard/settings" className={styles.dropdownItem}>
                                <UserIcon size={16} />
                                <span>Profile Settings</span>
                            </Link>
                            <hr className={styles.divider} />
                            <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutBtn}`}>
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}