import type { Metadata } from "next";
// Removed Geist font imports for lighter, more app-like feel
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "GymTracker", // Updated title
  description: "Your personal gym and health tracker", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    {/* Using a system font stack for better performance and native feel */}
    <body className="font-sans antialiased bg-gray-900 text-white">
      <Providers>{children}</Providers>
    </body>
    </html>
  );
}
