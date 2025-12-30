import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // 👈 必须引入这个文件！

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI BI Platform",
  description: "Generative UI Dashboard powered by Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}