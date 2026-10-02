// Cliente porque precisa saber a URL atual (usePathname) para destacar o item ativo.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { itensNavegacao } from "@/lib/navegacao";
import { cn } from "@/lib/utils";

// `onNavegar?` é uma prop opcional (o "?" é como um parâmetro com valor padrão null).
// O menu mobile usa para fechar a gaveta depois do clique.
export function LinksNavegacao({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = usePathname(); // ex.: "/transacoes"

  return (
    <nav className="flex flex-col gap-1">
      {/* .map() transforma a lista em elementos, como um @foreach no Razor.
          A prop `key` identifica cada item para o React atualizar a lista com eficiência. */}
      {itensNavegacao.map(({ href, titulo, icone: Icone }) => {
        const ativo = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          // <Link> é o <a> do Next: navega sem recarregar a página (só troca o `children` do layout)
          // e faz prefetch da rota quando o link aparece na tela.
          <Link
            key={href}
            href={href}
            onClick={onNavegar}
            aria-current={ativo ? "page" : undefined}
            // cn() junta classes condicionalmente e resolve conflitos do Tailwind
            // (ex.: se vierem "px-2" e "px-4", fica só a última).
            className={cn(
              // flex + items-center + gap-3: ícone e texto lado a lado, centralizados, com espaço de 0.75rem.
              // rounded-md: cantos arredondados; px/py: padding horizontal/vertical.
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              ativo
                ? "bg-accent text-accent-foreground" // cores vêm das variáveis do tema (globals.css)
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground", // /50 = 50% de opacidade
            )}
          >
            <Icone className="size-4" />
            {titulo}
          </Link>
        );
      })}
    </nav>
  );
}
