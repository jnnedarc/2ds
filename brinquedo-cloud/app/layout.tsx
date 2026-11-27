import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "Brinquedo Cloud",
  description: "Loja de brinquedos com Next.js, Supabase e Vercel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        <Nav />
        <main className="mx-auto max-w-6xl p-6">{children}</main>
        <footer className="mx-auto max-w-6xl p-6 text-sm text-slate-400">
          Brinquedo Cloud · projeto de aula · dados fictícios
        </footer>
      </body>
    </html>
  );
}