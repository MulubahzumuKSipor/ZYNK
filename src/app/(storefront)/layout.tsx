import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/lib/cart-provider";
import AuthManager from "@/app/ui/components/auth-manager";
import Header from "@/app/ui/components/shared/header";
import Footer from "@/app/ui/components/shared/footer";

// Load the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | ZYNK Ecommerce", // "Home | ZYNK Ecommerce"
    default: "ZYNK Ecommerce",       // Default title
  },
  description:
    "Shop variety of electronics directly from local stores on ZYNK. Get the freshest, highest quality products delivered to your door.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    /* suppressHydrationWarning is MANDATORY here because
      next-themes modifies the HTML attributes at runtime (adding class="dark").
      Without this, you will get "Prop `class` did not match" errors.
    */
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Fallback Icon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Dynamic Theme Icons */}
        <link
          rel="icon"
          href="/favicon-light.ico"
          media="(prefers-color-scheme: light)"
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
        />

        {/* Browser Theme Colors */}
        <meta
          name="theme-color"
          content="#ffffff"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#0b1220"
          media="(prefers-color-scheme: dark)"
        />
      </head>

      {/* Apply the Font Class to Body */}
      <body className={inter.className}>
        <CartProvider>
          <AuthManager />
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}