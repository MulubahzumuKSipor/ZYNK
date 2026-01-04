import { supabase } from "@/lib/client";

async function enrichBrandDomains() {
  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name")
    .is("website_url", null);

  if (error) return;

  for (const brand of brands) {
    // Basic cleaning: "Apple Inc." -> "apple.com"
    const domain = brand.name
      .toLowerCase()
      .split(' ')[0]           // Take first word
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      + ".com";

    await supabase
      .from("brands")
      .update({ website_url: domain })
      .eq("id", brand.id);
  }
}

