"use client";

import { useState, FormEvent } from "react";
import { supabase } from "@/lib/client";
import styles from "@/app/ui/styles/contact.module.css";

export default function ContactUsPage() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    // Validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
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
      // Insert into Supabase
      const { data, error: insertError } = await supabase
        .from("contact_submissions")
        .insert([
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim() || null,
            message: message.trim(),
            status: "new",
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Success
      setSuccess("Thank you! Your message has been sent successfully. We'll get back to you soon.");

      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("Contact form error:", err);
      setError(
        err instanceof Error
          ? `Failed to send message: ${err.message}`
          : "An error occurred while sending your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Get in Touch</h1>
        <p className={styles.heroSubtitle}>
          {"We'd love to hear from you. Whether you have a question, feedback, or want to collaborate, our team is here to help."}
        </p>
      </section>

      {/* Contact Info */}
      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h3>Email</h3>
          <p>sipormulubah@outlook.com</p>
        </div>
        <div className={styles.infoCard}>
          <h3>Phone</h3>
          <p>+231-886-678786</p>
        </div>
        <div className={styles.infoCard}>
          <h3>Address</h3>
          <p>Liberian Learning Center, 78C3+MFF, Mills Center, Liberia</p>
        </div>
        <div className={styles.infoCard}>
          <h3>Follow Us</h3>
          <p>
            <a href="https://www.linkedin.com/in/mulubahzumu-kemmeh-sipor-526a74197/" target="_blank" rel="noopener noreferrer">LinkedIn</a> |{" "}
            <a href="https://app.daily.dev/mulubahzumukemmehsipor" target="_blank" rel="noopener noreferrer">Daily Dev</a> |{" "}
            <a href="https://github.com/MulubahzumuKSipor" target="_blank" rel="noopener noreferrer">Github</a>
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <h2>Send Us a Message</h2>

          {success && (
            <div className={styles.successMessage}>
              {success}
            </div>
          )}

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry Subject"
                disabled={loading}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={5}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* Map Section */}
      <section className={styles.mapSection}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d466.8773008573339!2d-10.696064609968674!3d6.271536329283255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1765329283035!5m2!1sen!2s"
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Liberian Learning Center Location"
        ></iframe>
      </section>
    </div>
  );
}