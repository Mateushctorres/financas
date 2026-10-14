// Cliente porque o Recharts precisa do navegador: mede a largura disponível (ResizeObserver),
// desenha o SVG e reage ao mouse para o tooltip. A página (Server Component) busca os dados
// e só entrega a lista pronta aqui, via props.
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { TooltipGrafico } from "@/components/dashboard/tooltip-grafico";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import type { components } from "@/lib/api-types";
import { formatarMesAno, formatarMesCurto, formatarMoedaCompacta } from "@/lib/format";

type EvolucaoMesDto = components["schemas"]["EvolucaoMesDto"];

// Cada série aponta para a variável CSS definida em globals.css; o tema escuro troca o valor sozinho.
// `satisfies` confere o formato sem perder os tipos exatos (parecido com uma checagem de interface).
const config = {
  receitas: { label: "Receitas", color: "var(--serie-receitas)" },
  despesas: { label: "Despesas", color: "var(--serie-despesas)" },
} satisfies ChartConfig;

// Props precisam ser "serializáveis" (dados JSON), porque atravessam do servidor para o navegador.
// Por isso a página passa a lista de meses, e as funções de formatação são importadas aqui dentro.
export function GraficoEvolucao({ dados }: { dados: EvolucaoMesDto[] }) {
  const pontos = dados.map((d) => ({ ...d, rotulo: formatarMesCurto(d.ano, d.mes) }));

  return (
    // Altura fixa que já inclui o eixo X e a legenda (sem rolagem dentro do card).
    <ChartContainer config={config} className="aspect-auto h-72 w-full">
      <BarChart data={pontos} margin={{ top: 8, right: 4, left: 4 }} barGap={2} accessibilityLayer>
        {/* Só linhas horizontais, finas e contínuas: guiam o olho sem competir com as barras */}
        <CartesianGrid vertical={false} />
        <XAxis dataKey="rotulo" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          tickFormatter={(v: number) => formatarMoedaCompacta(v)}
          tickLine={false}
          axisLine={false}
          width={72}
          className="tabular-nums"
        />
        <ChartTooltip
          cursor={{ opacity: 0.5 }}
          content={
            <TooltipGrafico titulo={(ponto) => formatarMesAno(Number(ponto.ano), Number(ponto.mes))} />
          }
        />
        {/* itemSorter={null}: legenda na ordem das barras (o padrão do Recharts 3 é ordem alfabética) */}
        <ChartLegend content={<ChartLegendContent />} itemSorter={null} />
        {/* maxBarSize 24: barras finas, sobra "ar" entre os meses. radius: cantos arredondados só no topo.
            isAnimationActive={false}: o gráfico aparece pronto, sem "crescer" a cada troca de mês. */}
        <Bar isAnimationActive={false} dataKey="receitas" fill="var(--color-receitas)" radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar isAnimationActive={false} dataKey="despesas" fill="var(--color-despesas)" radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ChartContainer>
  );
}
