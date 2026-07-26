import type { Metadata } from "next";
import "./globals.css";
import { DevOverlayErrorShield } from "../components/samurai/DevOverlayErrorShield";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: "THE WAY OF CRAFT // Samurai Portfolio",
  description: "A premium, minimalist personal portfolio inspired by award-winning creative agency designs, reimagined with a timeless retro samurai aesthetic. Explore work in AI, Game Development, and Creative Design.",
  keywords: ["Samurai Portfolio", "Creative Technologist", "AI Engineer", "Game Developer", "Sumi-e Aesthetic", "Next.js Portfolio", "Framer Motion", "GSAP ScrollTrigger"],
  authors: [{ name: "Samurai Engineer" }],
  openGraph: {
    title: "THE WAY OF CRAFT // Samurai Portfolio",
    description: "Reimagined with a timeless retro samurai aesthetic. discipline, craftsmanship, and mastery.",
    type: "website",
    url: "https://thewayofcraft.io"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth notranslate" translate="no" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Share+Tech+Mono&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="bg-sumi-black text-washi-light antialiased min-h-screen notranslate" translate="no" suppressHydrationWarning>
        <ThemeProvider>
          {/* Dev Overlay Error Shield for third-party extensions */}
          <DevOverlayErrorShield />
          {/* Washi paper background texture */}
          <div className="washi-paper-overlay" />
          {/* Cinematic shading vignette */}
          <div className="cinematic-vignette" />
          <div className="notranslate" translate="no" suppressHydrationWarning>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
