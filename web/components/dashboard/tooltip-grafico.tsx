// Cliente porque é desenhado pelo Recharts no navegador, ao passar o mouse.
"use client";

import { formatarMoeda } from "@/lib/format";

// O Recharts injeta estas props no componente passado em <Tooltip content={...} />.
// `payload` de cada item é o objeto original da lista de dados (o ponto do gráfico).
type Ponto = Record<string, unknown>;
type Item = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number; payload?: Ponto };
type Props = {
  active?: boolean;
  payload?: readonly Item[];
  /** Título a partir do ponto (ex.: "outubro de 2026"); se ausente, não mostra título. */
  titulo?: (ponto: Ponto) => string | undefined;
  /** Texto extra a partir do ponto (ex.: "27,6% das despesas"). */
  detalhe?: (ponto: Ponto) => string | undefined;
};

/** Tooltip dos gráficos: o valor em destaque, o nome em segundo plano e um traço com a cor da série. */
export function TooltipGrafico({ active, payload, titulo, detalhe }: Props) {
  if (!active || !payload?.length) return null;

  const ponto = payload[0].payload ?? {};
  const textoTitulo = titulo?.(ponto);

  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {textoTitulo && <div className="font-medium first-letter:uppercase">{textoTitulo}</div>}
      {payload.map((item) => (
        <div key={String(item.dataKey ?? item.name)} className="flex items-center gap-2">
          {/* Traço vertical na cor da série: a identidade vem da marca, o texto fica na cor normal */}
          <span className="h-3 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
          <span className="text-muted-foreground">{item.name}</span>
          <span className="ml-auto pl-3 font-semibold tabular-nums">{formatarMoeda(Number(item.value ?? 0))}</span>
          {detalhe?.(item.payload ?? {}) && <span className="text-muted-foreground">{detalhe(item.payload ?? {})}</span>}
        </div>
      ))}
    </div>
  );
}
