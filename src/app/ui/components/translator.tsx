"use client";
import React, { useState, useRef } from "react";
import { TOP5_LANGS } from "@/lib/top5";

export default function TranslatePanel() {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("en");
  const originalRef = useRef<string | null>(null);

  async function doTranslate(target: string) {
    // Use the whole body for translation
    const el = document.body;
    if (!el) return alert("Body not found");

    if (!originalRef.current) originalRef.current = el.innerHTML;
    const html = el.innerHTML;

    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html, target })
      });
      const data = await res.json();
      if (data.translatedHtml) {
        el.innerHTML = data.translatedHtml;
        el.setAttribute("lang", target);
        setLang(target);
      } else {
        console.error(data);
        alert("Translation failed, check console.");
      }
    } catch (e) {
      console.error(e);
      alert("Translation request failed.");
    } finally {
      setLoading(false);
    }
  }

  function revert() {
    const el = document.body;
    if (!el || !originalRef.current) return;
    el.innerHTML = originalRef.current;
    el.removeAttribute("lang");
    originalRef.current = null;
    setLang("en");
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select value={lang} onChange={e => doTranslate(e.target.value)} disabled={loading}>
        {TOP5_LANGS.map(l => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>

      <button onClick={() => doTranslate(lang)} disabled={loading}>
        Translate
      </button>

      <button onClick={revert} disabled={loading}>
        Revert
      </button>

      {loading && <span>Translating…</span>}
    </div>
  );
}
