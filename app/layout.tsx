import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shopee Thread Generator",
  description: "Bikin Twitter thread afiliasi Shopee yang natural dan ga keliatan iklan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
