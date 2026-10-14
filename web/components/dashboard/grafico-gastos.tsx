// Cliente pelo mesmo motivo do gráfico de evolução: o Recharts desenha e mede no navegador.
"use client";

import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from "recharts";

import { TooltipGrafico } from "@/components/dashboard/tooltip-grafico";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import type { components } from "@/lib/api-types";
import { formatarMoeda, formatarPercentual } from "@/lib/format";

type GastoCategoriaDto = components["schemas"]["GastoCategoriaDto"];

const config = { total: { label: "Gasto" } } satisfies ChartConfig;

const ALTURA_BARRA = 36; // espaço por categoria (barra de 20px + respiro)

/**
 * Barras horizontais, da maior para a menor (a API já manda ordenado).
 * Cada barra usa a cor da categoria, mas o nome está sempre escrito ao lado:
 * a cor reforça a identidade (a mesma das bolinhas em Transações), nunca é o único jeito de ler.
 */
export function GraficoGastos({ dados }: { dados: GastoCategoriaDto[] }) {
  return (
    // A altura acompanha a quantidade de categorias, então nada fica espremido nem cortado.
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: dados.length * ALTURA_BARRA + 8 }}>
      <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 88, bottom: 0, left: 0 }} accessibilityLayer>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="nome" width={104} tickLine={false} axisLine={false} interval={0} />
        <ChartTooltip
          cursor={{ opacity: 0.5 }}
          content={
            <TooltipGrafico
              titulo={(ponto) => String(ponto.nome)}
              detalhe={(ponto) => `${formatarPercentual(Number(ponto.percentual))} das despesas`}
            />
          }
        />
        {/* radius [0,4,4,0]: arredonda só a ponta (lado direito); a base fica reta, presa ao eixo.
            Sem animação: os valores na ponta (LabelList) só aparecem depois que a animação termina. */}
        <Bar isAnimationActive={false} dataKey="total" name="Gasto" barSize={20} radius={[0, 4, 4, 0]}>
          {/* <Cell> define a cor de cada barra individualmente: a cor cadastrada da categoria */}
          {dados.map((gasto) => (
            <Cell key={gasto.categoriaId} fill={gasto.cor} />
          ))}
          {/* Valor na ponta da barra, em cor de texto (não na cor da série) */}
          <LabelList
            dataKey="total"
            position="right"
            offset={8}
            className="fill-foreground tabular-nums"
            formatter={(valor) => formatarMoeda(Number(valor))}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
