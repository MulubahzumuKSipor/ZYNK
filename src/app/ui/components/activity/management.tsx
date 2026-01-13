'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/client';
import styles from '@/app/ui/styles/activity.module.css'; // Reusing your existing style file

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

// Reusing your Log interface
interface Log {
  id: string;
  actor_name: string;
  action: string;
  entity: string;
  created_at: string;
}

interface Props {
  initialNotifications: Notification[];
  initialLogs: Log[];
}

export default function ActivityManager({ initialNotifications, initialLogs }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  
  // Default to 'audit' if no param, unless user clicked bell which sends 'notifications'
  const activeTab = searchParams.get('tab') || 'audit';
  
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleTabChange = (tab: string) => {
    router.replace(`/dashboard/notifications?tab=${tab}`);
  };

  const markRead = async (id: string) => {
    // Optimistic Update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    router.refresh(); // Update header badge
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    router.refresh();
  };

  return (
    <div className={styles.wrapper}>
      
      {/* 1. TABS */}
      <div className={styles.tabContainer}>
        <button 
          onClick={() => handleTabChange('notifications')}
          className={`${styles.tabBtn} ${activeTab === 'notifications' ? styles.active : ''}`}
        >
          My Notifications
          {notifications.some(n => !n.is_read) && <span className={styles.tabDot} />}
        </button>
        <button 
          onClick={() => handleTabChange('audit')}
          className={`${styles.tabBtn} ${activeTab === 'audit' ? styles.active : ''}`}
        >
          System Audit Log
        </button>
      </div>

      {/* 2. NOTIFICATIONS CONTENT */}
      {activeTab === 'notifications' && (
        <div className={styles.contentArea}>
          <div className={styles.actionHeader}>
            <h3>Unread Alerts</h3>
            <button onClick={markAllRead} className={styles.textBtn}>Mark all as read</button>
          </div>

          <div className={styles.notifList}>
            {notifications.length === 0 ? (
              <p className={styles.emptyState}>{"You're all caught up!"}</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`${styles.notifCard} ${!notif.is_read ? styles.unread : ''}`}
                  onClick={() => !notif.is_read && markRead(notif.id)}
                >
                  <div className={`${styles.iconIndicator} ${styles[notif.type]}`}></div>
                  <div className={styles.notifContent}>
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className={styles.time}>
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  {!notif.is_read && <div className={styles.unreadDot}></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. AUDIT LOG CONTENT (Reusing your existing Timeline) */}
      {activeTab === 'audit' && (
        <div className={styles.contentArea}>
           {/* You can inject the timeline component code here or pass it as children */}
           {/* For simplicity, I'm rendering the logs list here using the same style logic */}
           <div className={styles.timeline}>
             {initialLogs.map(log => (
               <div key={log.id} className={styles.item}>
                 <div className={styles.header}>
                    <span className={styles.actor}>{log.actor_name || 'System'}</span>
                    <span className={styles.time}>{new Date(log.created_at).toLocaleTimeString()}</span>
                 </div>
                 <p className={styles.action}>{log.action.replace(/_/g, ' ')}</p>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
}