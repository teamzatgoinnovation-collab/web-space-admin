import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZatGo Space — Admin Console",
  description: "Fleet-wide sites, servers, and monitoring for ZatGo Space.",
};

export const viewport: Viewport = {
  themeColor: "#090d14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
