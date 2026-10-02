import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Cabecalho } from "@/components/cabecalho";
import { Sidebar } from "@/components/sidebar";
import { TemaProvider } from "@/components/tema-provider";
import "./globals.css";

// next/font baixa a fonte no build e a serve junto com o app (sem requisição ao Google
// no navegador). `variable` cria uma variável CSS, usada pelo Tailwind em globals.css.
const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Metadados da página (o <title> e as <meta>). Equivale ao ViewData["Title"], mas declarativo:
// cada página exporta o seu `metadata`, e o `template` monta "Contas | Finanças".
export const metadata: Metadata = {
  title: { default: "Finanças", template: "%s | Finanças" },
  description: "Painel de finanças pessoais",
};

// Layout raiz: o equivalente ao _Layout.cshtml. Envolve TODAS as páginas.
// `children` é a página atual (o @RenderBody()). Ao navegar, o layout não é recriado:
// só o `children` muda, então a sidebar mantém o estado.
// LayoutProps<"/"> é um tipo global gerado pelo Next a partir das rotas.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o next-themes muda a classe do <html> (light/dark) antes de o
    // React "assumir" a página no navegador. Isso avisa o React de que a diferença é esperada.
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
      <body>
        <TemaProvider>
          {/* flex: sidebar e conteúdo lado a lado. min-h-screen: ocupa pelo menos a altura da tela. */}
          <div className="flex min-h-screen">
            <Sidebar />
            {/* flex-1: ocupa o espaço restante. min-w-0: deixa o conteúdo encolher (tabelas largas
                rolam em vez de estourar o layout). */}
            <div className="flex min-w-0 flex-1 flex-col">
              <Cabecalho />
              <main className="flex-1 p-4 md:p-8">{children}</main>
            </div>
          </div>
        </TemaProvider>
      </body>
    </html>
  );
}
