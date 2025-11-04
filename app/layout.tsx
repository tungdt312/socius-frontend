import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/ThemeProvider";
import {Toaster} from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Socius",
  description: "Trên Socius, mọi khoảnh khắc đều đáng chia sẻ – vì mỗi kết nối đều có thể trở thành nguồn cảm hứng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <ThemeProvider>
          {children}
          <Toaster position="top-center" richColors expand={true} closeButton />
      </ThemeProvider>
      </body>
    </html>
  );
}
