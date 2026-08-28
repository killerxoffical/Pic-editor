import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CutoutPro AI — Professional HD Background Remover",
  description:
    "Remove image backgrounds instantly with AI — hair-level precision, transparent or custom backgrounds, HD downloads.",
  keywords: ["background remover", "AI", "remove bg", "image editing", "cutout"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
