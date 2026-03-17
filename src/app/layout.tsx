import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import NextTopLoader from 'nextjs-toploader';

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: {
    default: "FlopHub | منصة الفشل والتعلم",
    template: "%s | FlopHub"
  },
  description: "شارك قصص فشلك، وتعلم من الآخرين. الفشل هو بداية النجاح.",
  icons: {
    icon: "/top.svg",
  },
};

import { OnboardingModal } from "@/components/onboarding-modal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable}`} suppressHydrationWarning>
      <body className="font-tajawal antialiased bg-background text-foreground overflow-x-hidden min-h-screen selection:bg-primary/20 transition-colors duration-300">
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
          <Toaster position="top-center" richColors theme="system" />
        </Providers>
      </body>
    </html>
  );
}
