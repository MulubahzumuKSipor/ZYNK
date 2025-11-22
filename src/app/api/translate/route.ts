import { NextRequest, NextResponse } from "next/server";
import { TranslationServiceClient } from "@google-cloud/translate";

type CacheEntry = { html: string; expiresAt: number };
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

const client = new TranslationServiceClient();
const PROJECT_ID = process.env.GOOGLE_PROJECT_ID;

function cacheKey(html: string, target: string) {
  return `${target}|${html.slice(0, 600)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { html, target } = (await req.json()) as { html: string; target: string };

    if (!html || !target) {
      return NextResponse.json({ error: "Missing html or target" }, { status: 400 });
    }

    const key = cacheKey(html, target);
    const cached = CACHE.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ translatedHtml: cached.html });
    }

    // --- Translate using Google ---
    if (!PROJECT_ID) {
      return NextResponse.json({ error: "GOOGLE_PROJECT_ID missing" }, { status: 500 });
    }

    const [response] = await client.translateText({
      parent: `projects/${PROJECT_ID}/locations/global`,
      contents: [html],
      mimeType: "text/html", // preserves HTML formatting
      targetLanguageCode: target
    });

    const translatedHtml = response.translations?.[0]?.translatedText ?? "";

    // --- Cache result ---
    CACHE.set(key, { html: translatedHtml, expiresAt: Date.now() + CACHE_TTL_MS });

    return NextResponse.json({ translatedHtml });
  } catch (err) {
    console.error("Google Translate error:", err);
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 });
  }
}
