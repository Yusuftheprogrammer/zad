import type { Metadata } from "next";
import { Playpen_Sans_Arabic, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const playpenSans = Playpen_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  // No variable - use className directly
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "زاد - أصبح للعلم رواد",
  description: "منصة مدرسية لإدارة الطلاب والمعلمين",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${playpenSans.className} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}