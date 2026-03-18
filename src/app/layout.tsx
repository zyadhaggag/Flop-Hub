import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "sonner";
import { OnboardingModal } from "@/components/onboarding-modal";
import NextTopLoader from "nextjs-toploader";
import { useRouteProtection } from "@/components/route-protector";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const tajawal = Tajawal({ 
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "FlopHub | منصة الفشل والتعلم",
    template: "فلوب هب | %s"
  },
  description: "شارك قصص فشلك، وتعلم من الآخرين. الفشل هو بداية النجاح.",
  icons: {
    icon: "/top.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.dicebear.com" />
        <link rel="dns-prefetch" href="//**.supabase.co" />
        {/* Security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' data:; style-src 'self' 'unsafe-inline' data:; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https: data:; media-src 'self' https: data:; object-src 'none'; base-uri 'self'; form-action 'self';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      </head>
      <body className="font-tajawal antialiased bg-background text-foreground overflow-x-hidden min-h-screen selection:bg-primary/20 transition-colors duration-300 pb-20 md:pb-0">
        <NextTopLoader 
          color="#7c3aed"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #7c3aed,0 0 5px #7c3aed"
        />
        <Providers>
          {children}
          <OnboardingModal />
          <BottomNav />
          <Toaster position="top-center" richColors theme="system" />
        </Providers>
      </body>
    </html>
  );
}
