"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Link from "next/link"; // Import Link for the login redirect
import { supabase } from "@/lib/client";
import styles from "@/app/ui/styles/career.module.css";

const VALUES = [
  { title: "Customer First", desc: "We prioritize the shopping experience above all else." },
  { title: "Innovation", desc: "We build technology to solve real local challenges." },
  { title: "Transparency", desc: "We are honest with our vendors, customers, and each other." },
  { title: "Teamwork", desc: "We win together. Every role matters in our ecosystem." },
];

type Job = {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  salary_range?: string;
};

export default function CareerPage() {
  // Job state
  const [openPositions, setOpenPositions] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [cv, setCv] = useState<File | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch jobs from Supabase
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoadingJobs(true);
        const { data, error: fetchError } = await supabase
          .from("jobs")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (fetchError) throw fetchError;
        setOpenPositions(data ?? []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setJobsError("Unable to load job opportunities at this time.");
      } finally {
        setLoadingJobs(false);
      }
    }
    fetchJobs();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setCv(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    // Validation
    if (!name.trim() || !email.trim() || !position.trim()) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!cv) {
      setError("Please upload your CV.");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      let cvUrl = null;
      const cvFilename = cv.name;

      // Upload CV to Supabase Storage
      if (cv) {
        const fileExt = cv.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `cvs/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("job-applications")
          .upload(filePath, cv, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError; // Throw directly to catch block
        }

        cvUrl = filePath;
      }

      // Insert application into database
      const { data, error: insertError } = await supabase
        .from("job_applications")
        .insert([
          {
            job_id: selectedJobId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            position: position.trim(),
            cv_url: cvUrl,
            cv_file_name: cvFilename,
            status: "pending",
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Success
      setSuccess("Application received! We will be in touch soon.");

      // Reset form
      setName("");
      setEmail("");
      setPosition("");
      setSelectedJobId(null);
      setCv(null);

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      console.error("Application submission error:", err);

      // Check for 401 Unauthorized or RLS Policy Violation (42501)
      if (err.status === 401 || err.code === "42501" || err.message?.includes("JWT")) {
        setError("You must be logged in to apply for a job.");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to submit application. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: Job) => {
    setPosition(job.title);
    setSelectedJobId(job.id);
    document.getElementById("application-form")?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Build the Future of Commerce in Liberia</h1>
        <p className={styles.heroSubtitle}>
          {"We're building the most reliable online shopping experience."}
          Join a team that values innovation, customer satisfaction, and simplicity.
        </p>
        <a href="#open-roles" className={styles.ctaButton}>View Open Positions</a>
      </section>

      {/* Mission & Values */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Values</h2>
        <div className={styles.valuesGrid}>
          {VALUES.map((val, index) => (
            <div key={index} className={styles.valueCard}>
              <h3>{val.title}</h3>
              <p>{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Work With Us */}
      <section className={styles.sectionAlt}>
        <div className={styles.contentContainer}>
          <h2 className={styles.sectionTitle}>Why Work With Us?</h2>
          <ul className={styles.benefitsList}>
            <li><strong>Growth Opportunities:</strong> {"Be part of a startup where your work directly impacts the company's direction."}</li>
            <li><strong>Learn from Founders:</strong> Direct access to leadership and mentorship.</li>
            <li><strong>Flexible Environment:</strong> We value output over hours. We foster creativity and ownership.</li>
            <li><strong>Build for Liberia:</strong> Solve unique logistical and technical challenges in our local market.</li>
          </ul>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className={styles.section}>
        <h2 className={styles.sectionTitle}>Open Roles</h2>
        {loadingJobs ? (
          <p>Loading job opportunities...</p>
        ) : jobsError ? (
          <p className={styles.errorMessage}>{jobsError}</p>
        ) : openPositions.length > 0 ? (
          <div className={styles.jobsList}>
            {openPositions.map((job) => (
              <div key={job.id} className={styles.jobCard}>
                <div>
                  <h3 className={styles.jobTitle}>{job.title}</h3>
                  <p className={styles.jobDetails}>
                    {job.department} • {job.location} • {job.type}
                  </p>
                  {job.salary_range && (
                    <p className={styles.jobSalary}>{job.salary_range}</p>
                  )}
                </div>
                <button
                  className={styles.applyButtonSmall}
                  onClick={() => handleApplyClick(job)}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noJobs}>
            <p>{"No specific positions are open right now, but don't let that stop you!"}</p>
            <p>We are always looking for talent. Submit your details below to join our talent pool.</p>
          </div>
        )}
      </section>

      {/* Talent Pool / Application Form */}
      <section id="application-form" className={styles.formSection}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>General Application</h2>
          <p className={styles.formSubtitle}>
            {"Don't see a role that fits? Or applying for an open position? Fill out the form below."}
            We keep strong talent in our system for future opportunities.
          </p>

          {success && <div className={styles.successMessage}>{success}</div>}

          {/* Enhanced Error Display for Login Requirement */}
          {error && (
            <div className={styles.errorMessage}>
              {error}
              {error.includes("logged in") && (
                <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
                  <Link href="/login" style={{ textDecoration: "underline" }}>
                    Click here to Log In
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name" className={styles.label}>Full Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className={styles.input}
                placeholder="John Doe"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>Email Address *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={styles.input}
                placeholder="john@example.com"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="position" className={styles.label}>Position / Skillset *</label>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                required
                disabled={loading}
                className={styles.input}
                placeholder="e.g. Frontend Developer, Logistics, Internship"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="cv" className={styles.label}>Upload CV (PDF/Doc, max 5MB) *</label>
              <div className={styles.fileInputWrapper}>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                  disabled={loading}
                  className={styles.fileInput}
                />
                <span className={styles.fileLabel}>
                  {cv ? `Selected: ${cv.name}` : "Click to upload your CV"}
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Sending..." : "Submit Application"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer Info */}
      <section className={styles.footerInfo}>
        <div className={styles.infoBlock}>
          <h3>🎓 Internship Opportunities</h3>
          <p>Looking to start your career? We offer internships for students passionate about e-commerce, coding, and business management. Use the form above and mention &quot;Internship&quot;.</p>
        </div>
        <div className={styles.infoBlock}>
          <h3>🌍 Diversity & Inclusion</h3>
          <p>We welcome people from all backgrounds. Whether you are self-taught or hold a degree, what matters most is your skill, character, and passion for building great things.</p>
        </div>
      </section>
    </div>
  );
}