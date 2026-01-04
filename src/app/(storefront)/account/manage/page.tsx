"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "@/app/ui/styles/account.module.css";
import { supabase } from "@/lib/client";

interface UpdateForm {
  full_name: string; // Changed from username
  email: string;
  phone: string;
  password?: string;
  // subscribed: boolean; // Removed unless you added this column to DB
}

export default function AccountPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UpdateForm>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [oldPassword, setOldPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // LOAD DATA DIRECTLY FROM SUPABASE
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/?auth=login"); // Use your modal trigger
        return;
      }

      setUserId(user.id);

      // Fetch public profile data
      const { data: profile, error } = await supabase
        .from('users')
        .select('full_name, phone, email')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Fetch error:", error);
      } else if (profile) {
        setForm({
          full_name: profile.full_name || "",
          email: user.email || "", // Auth email is the source of truth
          phone: profile.phone || "",
          password: "",
        });
      }
      setFetching(false);
    }
    loadProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Password Change
      if (form.password) {
         // Re-auth logic here (omitted for brevity, assume session is active)
         const { error: pwError } = await supabase.auth.updateUser({ password: form.password });
         if (pwError) throw pwError;
      }

      // 2. Profile Update (Database)
      const { error: dbError } = await supabase
        .from('users')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          // email is handled by auth.updateUser usually, not direct DB update
        })
        .eq('id', userId);

      if (dbError) throw dbError;

      setSuccess("Profile updated successfully!");
      setForm(prev => ({ ...prev, password: "" }));
      setOldPassword("");

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className={styles.pageWrapper}>Loading...</div>;

  return (
    <div className={styles.pageWrapper}>
      <h1 className={styles.pageTitle}>Account Settings</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {success && <div className={styles.successMessage}>{success}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.field}>
          <label>Full Name</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label>Email (Read Only)</label>
          <input
            name="email"
            value={form.email}
            disabled
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className={styles.field}>
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className={styles.field}>
          <label>New Password (Optional)</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
          />
        </div>

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}