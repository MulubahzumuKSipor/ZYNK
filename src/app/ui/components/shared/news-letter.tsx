"use client"

import styles from "@/app/ui/styles/news-letter.module.css"

export default function NewsletterSection() {
  return (
    <section className={styles.newsletterSection}>
      <div className={styles.container}>
        <h2>Don’t Miss What’s Next</h2>
        <p>
          Be the first to know about new arrivals, limited deals, and exclusive
          offers — straight to your inbox.
        </p>

        <form className={styles.form}>
          <input
            type="email"
            placeholder="Your email address"
            aria-label="Email address"
            required
          />
          <button type="submit">Join the List</button>
        </form>

        <span className={styles.note}>
          No spam. Unsubscribe anytime.
        </span>
      </div>
    </section>
  )
}
