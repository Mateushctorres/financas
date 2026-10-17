import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import { formatarMoeda, formatarPercentual } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Faixas do ROADMAP: verde até 80%, amarelo de 80% a 100%, vermelho acima de 100%. */
function situacao(percentual: number) {
  if (percentual > 100) return { rotulo: "Estourou", cor: "bg-status-estourado", icone: CircleAlert, texto: "text-red-600 dark:text-red-400" };
  if (percentual >= 80) return { rotulo: "Atenção", cor: "bg-status-atencao", icone: TriangleAlert, texto: "text-amber-700 dark:text-amber-400" };
  return { rotulo: "Dentro do limite", cor: "bg-status-ok", icone: CircleCheck, texto: "text-emerald-700 dark:text-emerald-400" };
}

/**
 * Barra de progresso de um orçamento (gasto em relação ao limite). Server Component:
 * é só markup, usado na tela de Orçamentos e no Dashboard.
 * O estado nunca é só a cor: há ícone + texto ("Atenção") e o percentual escrito.
 */
export function BarraOrcamento({ gasto, limite, percentual }: { gasto: number; limite: number; percentual: number }) {
  const { rotulo, cor, icone: Icone, texto } = situacao(percentual);

  return (
    <div className="grid gap-1.5">
      {/* role="meter": diz ao leitor de tela que é uma medida dentro de uma faixa (0 até o limite) */}
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={limite}
        aria-valuenow={gasto}
        aria-valuetext={`${formatarMoeda(gasto)} de ${formatarMoeda(limite)}, ${formatarPercentual(percentual)}`}
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        {/* A largura vem de um cálculo, então vai em style (como as cores do banco).
            Acima de 100% a barra fica cheia; o valor real aparece no texto ao lado. */}
        <div className={cn("h-full rounded-full", cor)} style={{ width: `${Math.min(percentual, 100)}%` }} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-3 text-xs">
        <span className={cn("inline-flex items-center gap-1 font-medium", texto)}>
          <Icone className="size-3.5" aria-hidden="true" />
          {rotulo}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {formatarMoeda(gasto)} de {formatarMoeda(limite)} · {formatarPercentual(percentual)}
        </span>
      </div>
    </div>
  );
}
