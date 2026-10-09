import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { formatarMesAno } from "@/lib/format";
import { comParametros, type Parametros } from "@/lib/url";

/**
 * Navega entre meses mudando ?ano=&mes= na URL. É um Server Component: as setas são só
 * links (<Link>), sem JavaScript próprio. A página lê o mês da URL e busca os dados dele.
 */
export function SeletorMes({
  caminho,
  ano,
  mes,
  parametros = {},
}: {
  caminho: string;
  ano: number;
  mes: number;
  /** Outros filtros da URL, preservados ao trocar de mês. */
  parametros?: Parametros;
}) {
  // new Date(ano, mesIndice, 1) com mesIndice fora de 0..11 "dá a volta" no ano: (2026, -1) = dez/2025.
  const anterior = new Date(ano, mes - 2, 1);
  const proximo = new Date(ano, mes, 1);
  const hoje = new Date();
  const ehMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth() + 1;

  // Trocar de mês sempre volta para a página 1 da paginação.
  const linkPara = (data: Date) =>
    comParametros(caminho, parametros, {
      ano: String(data.getFullYear()),
      mes: String(data.getMonth() + 1),
      pagina: undefined,
    });

  return (
    <div className="flex items-center gap-1">
      <Link href={linkPara(anterior)} className={buttonVariants({ variant: "outline", size: "icon" })} aria-label="Mês anterior">
        <ChevronLeft />
      </Link>
      {/* first-letter:uppercase: "outubro de 2026" → "Outubro de 2026", só na exibição */}
      <span className="min-w-36 text-center text-sm font-medium first-letter:uppercase">{formatarMesAno(ano, mes)}</span>
      <Link href={linkPara(proximo)} className={buttonVariants({ variant: "outline", size: "icon" })} aria-label="Próximo mês">
        <ChevronRight />
      </Link>
      {!ehMesAtual && (
        <Link href={linkPara(hoje)} className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Mês atual
        </Link>
      )}
    </div>
  );
}
