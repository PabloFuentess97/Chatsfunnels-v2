import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/auth-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";

export const metadata: Metadata = {
  title: "ChatsFunnels - Smart Link Rotation SaaS",
  description: "Intelligent link rotation and traffic distribution platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
