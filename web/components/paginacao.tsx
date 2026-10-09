import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { comParametros, type Parametros } from "@/lib/url";
import { cn } from "@/lib/utils";

/** Paginação por links (?pagina=N), preservando os outros parâmetros da URL. */
export function Paginacao({
  caminho,
  parametros,
  numeroPagina,
  totalPaginas,
}: {
  caminho: string;
  parametros: Parametros;
  numeroPagina: number;
  totalPaginas: number;
}) {
  if (totalPaginas <= 1) return null;

  const link = (pagina: number) => comParametros(caminho, parametros, { pagina: String(pagina) });
  const temAnterior = numeroPagina > 1;
  const temProxima = numeroPagina < totalPaginas;
  const estilo = buttonVariants({ variant: "outline", size: "sm" });

  return (
    <nav className="mt-4 flex items-center justify-between gap-2" aria-label="Paginação">
      <span className="text-sm text-muted-foreground">
        Página {numeroPagina} de {totalPaginas}
      </span>
      <div className="flex gap-2">
        {/* Sem página anterior, mostra um "botão" desabilitado (span) em vez de um link */}
        {temAnterior ? (
          <Link href={link(numeroPagina - 1)} className={estilo}>
            <ChevronLeft /> Anterior
          </Link>
        ) : (
          <span className={cn(estilo, "pointer-events-none opacity-50")} aria-disabled="true">
            <ChevronLeft /> Anterior
          </span>
        )}
        {temProxima ? (
          <Link href={link(numeroPagina + 1)} className={estilo}>
            Próxima <ChevronRight />
          </Link>
        ) : (
          <span className={cn(estilo, "pointer-events-none opacity-50")} aria-disabled="true">
            Próxima <ChevronRight />
          </span>
        )}
      </div>
    </nav>
  );
}
