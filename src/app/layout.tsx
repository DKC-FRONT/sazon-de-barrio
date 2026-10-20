import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  themeColor: "#090D16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Sazón de Barrio · Sistema Gastronómico & DIAN POS",
  description: "Sistema integral moderno para restaurantes: Punto de Venta POS, Facturación Electrónica DIAN, sincronización en tiempo real mesera-caja y cierre de caja.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%20width=%22100%22%20height=%22100%22><text y=%22.9em%22 font-size=%2290%22>🍽️</text></svg>" />
      </head>
      <body className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-[#00A6A6] selection:text-white">
        {children}
      </body>
    </html>
  );
}
