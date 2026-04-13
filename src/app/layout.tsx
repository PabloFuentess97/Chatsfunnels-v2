import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/lib/auth-provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "ChatsFunnels - Plataforma de Rotacion de Enlaces",
  description: "Distribuye trafico de forma inteligente con funnels, landing pages y analiticas avanzadas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="font-sans bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
