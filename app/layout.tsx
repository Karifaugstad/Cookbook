import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mine oppskrifter",
  description: "En personlig oppskriftsamling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
