"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/client";
import { Download, Eye, Trash2, Filter, Search, Loader2 } from "lucide-react";
import styles from "@/app/ui/styles/admin-applications.module.css";

interface Application {
  id: string;
  name: string;
  email: string;
  position: string;
  cv_url: string | null;
  cv_file_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  job_id: string | null;
  jobs: {
    title: string;
  } | null;
  signedCvUrl?: string; // For displaying signed URLs
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch applications
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("job_applications")
        .select(`
          *,
          jobs (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      // Generate signed URLs for CVs
      const applicationsWithSignedUrls = await Promise.all(
        (data || []).map(async (app) => {
          if (app.cv_url) {
            try {
              const { data: signedData, error: signedError } = await supabase.storage
                .from("job-applications")
                .createSignedUrl(app.cv_url, 60 * 60 * 24); // Valid for 24 hours

              if (!signedError && signedData) {
                return { ...app, signedCvUrl: signedData.signedUrl };
              }
            } catch (err) {
              console.error("Error generating signed URL:", err);
            }
          }
          return app;
        })
      );

      setApplications(applicationsWithSignedUrls);
      setFilteredApps(applicationsWithSignedUrls);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = applications;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query) ||
          app.position.toLowerCase().includes(query)
      );
    }

    setFilteredApps(filtered);
  }, [searchQuery, statusFilter, applications]);

  // Update status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;
      
      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // Delete application
  const deleteApplication = async (id: string, cvPath: string | null) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    try {
      // Delete CV from storage if exists
      if (cvPath) {
        const { error: storageError } = await supabase.storage
          .from("job-applications")
          .remove([cvPath]);
        
        if (storageError) {
          console.error("Error deleting CV:", storageError);
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("job_applications")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Update local state
      setApplications((prev) => prev.filter((app) => app.id !== id));
      alert("Application deleted successfully");
    } catch (err) {
      console.error("Error deleting application:", err);
      alert("Failed to delete application");
    }
  };

  // Download CV
  const downloadCV = async (cvPath: string, fileName: string) => {
    try {
      // Generate a fresh signed URL for download
      const { data: signedData, error: signedError } = await supabase.storage
        .from("job-applications")
        .createSignedUrl(cvPath, 60); // Valid for 1 minute

      if (signedError || !signedData) {
        throw new Error("Failed to generate download URL");
      }

      const response = await fetch(signedData.signedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "cv.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading CV:", err);
      alert("Failed to download CV");
    }
  };

  // View details modal
  const viewDetails = (app: Application) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "reviewing":
        return styles.statusReviewing;
      case "interviewed":
        return styles.statusInterviewed;
      case "hired":
        return styles.statusHired;
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} stroke="#1ab26e" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Job Applications</h1>
        <p className={styles.subtitle}>
          Manage and review all job applications ({applications.length} total)
        </p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.statusFilters}>
          <button
            className={`${styles.filterBtn} ${statusFilter === "all" ? styles.filterBtnActive : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All ({applications.length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === "pending" ? styles.filterBtnActive : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pending ({applications.filter((a) => a.status === "pending").length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === "reviewing" ? styles.filterBtnActive : ""}`}
            onClick={() => setStatusFilter("reviewing")}
          >
            Reviewing ({applications.filter((a) => a.status === "reviewing").length})
          </button>
          <button
            className={`${styles.filterBtn} ${statusFilter === "interviewed" ? styles.filterBtnActive : ""}`}
            onClick={() => setStatusFilter("interviewed")}
          >
            Interviewed ({applications.filter((a) => a.status === "interviewed").length})
          </button>
        </div>
      </div>

      {/* Applications Table */}
      <div className={styles.tableWrapper}>
        {filteredApps.length === 0 ? (
          <div className={styles.noResults}>
            <p>No applications found</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Applied For</th>
                <th>Status</th>
                <th>Applied Date</th>
                <th>CV</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className={styles.applicantInfo}>
                      <strong>{app.name}</strong>
                      <span className={styles.email}>{app.email}</span>
                    </div>
                  </td>
                  <td>{app.position}</td>
                  <td>{app.jobs?.title || "General Application"}</td>
                  <td>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className={`${styles.statusSelect} ${getStatusBadgeClass(app.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="interviewed">Interviewed</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  <td>
                    {app.signedCvUrl ? (
                      <div className={styles.cvActions}>
                        <button
                          onClick={() => window.open(app.signedCvUrl!, "_blank")}
                          className={styles.iconBtn}
                          title="View CV"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => downloadCV(app.cv_url!, app.cv_file_name || "cv.pdf")}
                          className={styles.iconBtn}
                          title="Download CV"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className={styles.noCV}>No CV</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => viewDetails(app)}
                        className={styles.viewBtn}
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => deleteApplication(app.id, app.cv_url)}
                        className={styles.deleteBtn}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedApp && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Application Details</h2>
              <button onClick={() => setShowModal(false)} className={styles.closeBtn}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <strong>Name:</strong>
                <span>{selectedApp.name}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Email:</strong>
                <span>{selectedApp.email}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Position:</strong>
                <span>{selectedApp.position}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Applied For:</strong>
                <span>{selectedApp.jobs?.title || "General Application"}</span>
              </div>
              <div className={styles.detailRow}>
                <strong>Status:</strong>
                <span className={getStatusBadgeClass(selectedApp.status)}>
                  {selectedApp.status}
                </span>
              </div>
              <div className={styles.detailRow}>
                <strong>Applied Date:</strong>
                <span>{new Date(selectedApp.created_at).toLocaleString()}</span>
              </div>
              {selectedApp.signedCvUrl && (
                <div className={styles.detailRow}>
                  <strong>CV:</strong>
                  <div className={styles.cvButtons}>
                    <button
                      onClick={() => window.open(selectedApp.signedCvUrl!, "_blank")}
                      className={styles.primaryBtn}
                    >
                      <Eye size={16} /> View CV
                    </button>
                    <button
                      onClick={() =>
                        downloadCV(
                          selectedApp.cv_url!,
                          selectedApp.cv_file_name || "cv.pdf"
                        )
                      }
                      className={styles.secondaryBtn}
                    >
                      <Download size={16} /> Download CV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}