import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreelAi — Work Smarter. Earn Bigger.",
  description:
    "FreelAi is the AI-powered freelancer platform built for creative professionals. Find clients, manage projects, and get paid — all in one place.",
  keywords: ["freelancer", "AI", "creative", "designer", "video editor", "illustrator", "platform"],
  openGraph: {
    title: "FreelAi — Work Smarter. Earn Bigger.",
    description: "The AI-powered platform for creative freelancers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased`}>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface-2)",
                border: "0.5px solid var(--border-strong)",
                color: "var(--text-primary)",
                fontSize: "13px",
                borderRadius: "var(--radius-lg)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
