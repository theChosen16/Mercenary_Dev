import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mercenary - Plataforma de Freelancers Gamificada",
  description: "La plataforma de freelancers gamificada que conecta talento con oportunidades. Sistema de ranking, badges y experiencia única.",
  keywords: "freelancer, trabajo remoto, gamificación, ranking, Chile",
  authors: [{ name: "Mercenary Team" }],
  openGraph: {
    title: "Mercenary - Plataforma de Freelancers Gamificada",
    description: "Conecta con los mejores freelancers y proyectos en una plataforma gamificada única.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
