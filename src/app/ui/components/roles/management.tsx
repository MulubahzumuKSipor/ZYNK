'use client';

import { useState, useTransition } from 'react';
import { updateUserRole, removeUser } from '@/lib/actions/roles';
import InviteUserModal from './modal'; // Ensure you created this file from the previous step
import styles from '@/app/ui/styles/roles-permissions.module.css';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

// Configuration for the Permission Matrix
const ROLE_DEFINITIONS = {
  admin: {
    label: 'Administrator',
    description: 'Full access to all settings, financial data, and user management.',
    perms: ['Manage Users', 'View Revenue', 'Edit Orders', 'Delete Products']
  },
  manager: {
    label: 'Store Manager',
    description: 'Can manage daily operations but restricted from sensitive settings.',
    perms: ['View Revenue', 'Edit Orders', 'Edit Products', 'View Customers']
  },
  staff: {
    label: 'Support Staff',
    description: 'Limited access for order fulfillment and customer support.',
    perms: ['View Orders', 'Update Order Status', 'View Products']
  }
};

export default function RolesManager({ users }: { users: User[] }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticUsers, setOptimisticUsers] = useState(users);

  // Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Handle Role Change (Dropdown)
  const handleRoleChange = (userId: string, newRole: string) => {
    // 1. Optimistic UI Update
    setOptimisticUsers((prev) =>
      prev.map((u) => u.id === userId ? { ...u, role: newRole } : u)
    );

    // 2. Server Action
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
      } catch (e) {
        console.error(e);
        alert('Failed to update role. Please try again.');
        // Revert UI on failure (optional but recommended)
      }
    });
  };

  // Handle User Removal
  const handleRemove = (userId: string) => {
    if(!confirm('Are you sure you want to deactivate this user? They will lose access immediately.')) return;
    
    // 1. Optimistic UI Update
    setOptimisticUsers((prev) => prev.filter((u) => u.id !== userId));

    // 2. Server Action
    startTransition(async () => {
      try {
        await removeUser(userId);
      } catch (e) {
        console.error(e);
        alert('Failed to deactivate user.');
      }
    });
  };

  return (
    <div className={styles.container}>
      
      {/* --- LEFT COLUMN: User Management Table --- */}
      <div className={styles.userCard}>
        <div className={styles.header}>
          <h2>Active Users ({optimisticUsers.length})</h2>

          <button
            className={styles.inviteBtn}
            onClick={() => setIsInviteOpen(true)}
          >
            + Invite User
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Current Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {optimisticUsers.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No active users found. Invite someone to get started.
                </td>
              </tr>
            ) : (
              optimisticUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.nameBlock}>
                        <h3>{user.full_name || 'Pending Invite...'}</h3>
                        <p>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className={styles.roleSelect}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={isPending}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemove(user.id)}
                      disabled={isPending}
                      title="Deactivate User"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- RIGHT COLUMN: Permission Matrix --- */}
      <div className={styles.matrixCard}>
        <h3 className={styles.matrixTitle}>Role Capabilities</h3>
        
        {Object.entries(ROLE_DEFINITIONS).map(([key, def]) => (
          <div key={key} className={styles.roleDefinition}>
            <div className={styles.roleHeader}>
              <span className={styles.roleName}>{def.label}</span>
            </div>
            <p className={styles.roleDesc}>
              {def.description}
            </p>
            <div className={styles.permList}>
              {def.perms.map((perm) => (
                <span 
                  key={perm} 
                  className={`
                    ${styles.permBadge} 
                    ${perm.includes('Manage') || perm.includes('Delete') ? styles.full : ''}
                    ${perm.includes('Edit') || perm.includes('Update') ? styles.edit : ''}
                    ${perm.includes('View') ? styles.read : ''}
                  `}
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL (Conditionally Rendered) --- */}
      {isInviteOpen && (
        <InviteUserModal onClose={() => setIsInviteOpen(false)} />
      )}

    </div>
  );
}