"use client";
import React, { useState, useEffect, useRef, KeyboardEvent } from "react";
import { SearchBarProps } from "@/app/types/search_prop";
import { Suggestion } from "@/app/types/suggestion";
import styles from '@/app/ui/styles/search.module.css'



export default function SearchBar<T = string>({
  placeholder = "Search...",
  minChars = 2,
  debounceMs = 250,
  onSearch,
  fetchSuggestions,
  value,
  onSelect,
  onChange,
  className = "",
}: SearchBarProps<T>) {
  const [query, setQuery] = useState<string>(value ?? "");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion<T>[]>([]);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mountedRef = useRef(true);
  const timer = useRef<number | null>(null);

  // keep controlled -> uncontrolled in sync
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!fetchSuggestions) return;
    if (timer.current) window.clearTimeout(timer.current);
    if (!query || query.length < minChars) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetchSuggestions(query);
        if (!mountedRef.current) return;
        setSuggestions(res ?? []);
        setOpen(true);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Suggestion fetch failed", err);
        if (mountedRef.current) setSuggestions([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }, debounceMs);

    // cleanup on new query
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, fetchSuggestions, debounceMs, minChars]);

  const submit = (q = query) => {
    setOpen(false);
    onSearch?.(q);
  };

  const handleInputChange = (v: string) => {
    if (onChange) onChange(v);
    setQuery(v);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) {
      if (e.key === "Enter") submit(query);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const picked = suggestions[highlightedIndex];
      if (picked) {
        handleInputChange(picked.label);
        submit(picked.label);
      } else submit(query);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlightedIndex(-1);
    }
  };

  function pickSuggestion(s: Suggestion<T>) {
  handleInputChange(s.label);

  if (onSelect) {
    onSelect(s.id);
  } else {
    submit(s.label);
  }

  setOpen(false);
}


  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <div className={styles.inputWrapper}>
        <input
          id="search-input"
          ref={inputRef}
          className={styles.input}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
          aria-autocomplete={fetchSuggestions ? "list" : "none"}
          aria-expanded={open}
          aria-controls="search-suggestion-list"
          role="combobox"
        />

        <button
          type="button"
          aria-label="Search"
          onClick={() => submit(query)}
          className={styles.button}
        >
          {/* Simple SVG search icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestion-list"
          role="listbox"
          className={styles.suggestionsDropdown}
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.id}
              role="option"
              aria-selected={idx === highlightedIndex}
              onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              onClick={() => pickSuggestion(s)}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`${styles.suggestion} ${idx === highlightedIndex ? styles.highlighted : ""}`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}

      {loading && (
        <div className={styles.loading}>Loading…</div>
      )}
    </div>
  );
}


