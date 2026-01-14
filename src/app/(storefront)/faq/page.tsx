"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/client";
import { Loader2, ChevronDown, ChevronUp, Search } from "lucide-react";
import styles from "@/app/ui/styles/faq.module.css";

// --- Types ---
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  display_order: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Get unique categories
  const categories = [
    "All",
    ...Array.from(new Set(faqs.map(f => f.category).filter((c): c is string => c !== null)))
  ];

  // --- Fetch FAQs ---
  useEffect(() => {
    async function fetchFAQs() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (sbError) throw sbError;
        setFaqs(data ?? []);
        setFilteredFaqs(data ?? []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    }

    fetchFAQs();
  }, []);

  // --- Filter FAQs ---
  useEffect(() => {
    let filtered = faqs;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  }, [searchQuery, selectedCategory, faqs]);

  // --- Toggle FAQ ---
  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className={styles.loaderContainer}>
        <Loader2 className="animate-spin" size={40} stroke="#1ab26e" />
      </div>
    );
  }

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Find answers to common questions about our products and services.
        </p>
      </header>

      {/* --- Search Bar --- */}
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* --- Category Filters --- */}
      <div className={styles.categoryFilter}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`${styles.categoryBtn} ${
              selectedCategory === category ? styles.categoryBtnActive : ""
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* --- FAQ List --- */}
      {filteredFaqs.length === 0 ? (
        <div className={styles.noResults}>
          <p>No FAQs found matching your search.</p>
        </div>
      ) : (
        <div className={styles.faqList}>
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className={`${styles.faqItem} ${
                expandedId === faq.id ? styles.faqItemExpanded : ""
              }`}
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className={styles.faqQuestion}
                aria-expanded={expandedId === faq.id}
              >
                <span className={styles.questionText}>{faq.question}</span>
                {expandedId === faq.id ? (
                  <ChevronUp className={styles.icon} size={20} />
                ) : (
                  <ChevronDown className={styles.icon} size={20} />
                )}
              </button>

              {expandedId === faq.id && (
                <div className={styles.faqAnswer}>
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- Contact Section --- */}
      <div className={styles.contactSection}>
        <h2 className={styles.contactTitle}>Still have questions?</h2>
        <p className={styles.contactText}>
          {"Can't find the answer you're looking for? Please contact our support team."}
        </p>
        <a href="/contact" className={styles.contactBtn}>
          Contact Support
        </a>
      </div>
    </main>
  );
}