import type { Metadata } from "next";
import { Space_Grotesk, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/StoreContext";
import { CartProvider } from "@/lib/CartContext";
import { ThemeProvider } from "@/lib/ThemeContext";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invictus | Catálogo Mayorista",
  description: "Catálogo mayorista de iPhone y repuestos de Invictus.",
  icons: {
    icon: "/logo-invictus.png",
    shortcut: "/logo-invictus.png",
    apple: "/logo-invictus.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${interTight.variable} ${jetbrainsMono.variable} antialiased min-h-[100dvh] font-body bg-[var(--background)] text-[var(--foreground)] selection:bg-primary selection:text-white flex flex-col`}
      >
        <ThemeProvider>
          <StoreProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
