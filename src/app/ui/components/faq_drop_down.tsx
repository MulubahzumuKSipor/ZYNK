"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Why does Next.js complain about 'unconfigured host'?",
    a: "The Next/Image component blocks external domains by default for security & performance. You must whitelist every hostname in next.config.ts."
  },
  {
    q: "Do I need remotePatterns or domains?",
    a: "Use domains: [...] for simple cases (one line). Use remotePatterns when you need protocol/port/path control. Both work."
  },
  {
    q: "Will the old domains option be removed?",
    a: "No. Next.js still supports domains in v14.2+ and has no deprecation date."
  },
  {
    q: "Why delete allowedDevOrigins?",
    a: "It’s not a real Next.js option—you invented it! Removing fake keys prevents silent config bugs."
  },
  {
    q: "Do I need to restart the dev server?",
    a: "Yes. Run rm -rf .next && npm run dev after every next.config.ts change."
  },
  {
    q: "Can I lazy-load the mascara image?",
    a: "Add loading='lazy' or remove priority prop. Priority = preload (use only for LCP images)."
  },
];

export default function FaqDropdown() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-4xl font-bold text-center mb-12">
        FAQ – Next/Image Fixes
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
            className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-medium text-gray-800 hover:bg-gray-50 transition">
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-indigo-600 transition-transform duration-300 ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </summary>

            <div className="px-6 pb-5 text-gray-600 leading-relaxed">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}