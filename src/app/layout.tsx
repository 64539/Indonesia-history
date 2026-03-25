import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import { AiChatbot } from "@/components/ai-chatbot";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "RUANG WAKTU 12",
    template: "%s | RUANG WAKTU 12",
  },
  description: "Platform edukasi Sejarah Indonesia kelas 10–12. Menelusuri jejak waktu, merawat ingatan bangsa.",
  keywords: ["sejarah indonesia", "ruang waktu 12", "edukasi sma", "materi sejarah"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
            <AiChatbot />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
