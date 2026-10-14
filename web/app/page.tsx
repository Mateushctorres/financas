import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GraficoEvolucao } from "@/components/dashboard/grafico-evolucao";
import { GraficoGastos } from "@/components/dashboard/grafico-gastos";
import { SeletorMes } from "@/components/seletor-mes";
import { TituloPagina } from "@/components/titulo-pagina";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, exigirDados } from "@/lib/api";
import type { components } from "@/lib/api-types";
import { formatarData, formatarMesAno, formatarMesCurto, formatarMoeda, formatarPercentual } from "@/lib/format";
import { mesDaUrl } from "@/lib/parametros";
import { cn } from "@/lib/utils";

// O `template` do layout só vale para páginas em pastas filhas; esta página está no mesmo
// nível do layout raiz, então o título completo é informado aqui.
export const metadata: Metadata = { title: { absolute: "Dashboard | Finanças" } };

type EvolucaoMesDto = components["schemas"]["EvolucaoMesDto"];

// Server Component: busca tudo na API e entrega os dados prontos aos gráficos (Client Components).
// O mês vem da URL (?ano=&mes=), como em Transações; ler searchParams já torna a página dinâmica.
export default async function DashboardPage({ searchParams }: PageProps<"/">) {
  const { ano, mes } = mesDaUrl(await searchParams);
  const periodo = { ano, mes };

  // As quatro seções são independentes entre si. Promise.all dispara as quatro requisições
  // ao mesmo tempo e espera todas terminarem (o Task.WhenAll do C#).
  // Com quatro `await` em sequência, cada uma só começaria quando a anterior acabasse:
  // 4 × 50 ms = 200 ms em vez de ~50 ms. Esse "efeito cascata" (waterfall) é o erro de
  // performance mais comum em Server Components.
  const [resumo, gastos, evolucao, ultimas] = await Promise.all([
    api.GET("/api/dashboard/resumo", { params: { query: periodo } }),
    api.GET("/api/dashboard/gastos-por-categoria", { params: { query: periodo } }),
    api.GET("/api/dashboard/evolucao", { params: { query: { ...periodo, meses: 6 } } }),
    api.GET("/api/transacoes", { params: { query: { ...periodo, tamanhoPagina: 5 } } }),
  ]).then(([r, g, e, u]) => [exigirDados(r), exigirDados(g), exigirDados(e), exigirDados(u)] as const);

  // O último ponto da evolução é o mês selecionado; o penúltimo, o mês anterior (só para exibir).
  const mesAnterior: EvolucaoMesDto | undefined = evolucao.at(-2);
  const nomeMes = formatarMesAno(ano, mes);

  return (
    <>
      <TituloPagina titulo="Dashboard" descricao={`Resumo de ${nomeMes}`}>
        {/* O seletor fica acima de tudo e vale para todas as seções da página. */}
        <SeletorMes caminho="/" ano={ano} mes={mes} />
      </TituloPagina>

      {/* Linha 1: o saldo é o número principal (maior, coluna mais larga); os outros três dão contexto.
          grid-cols-[1.4fr_1fr_1fr_1fr]: colunas com larguras proporcionais, valor arbitrário do Tailwind. */}
      <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-[1.4fr_1fr_1fr_1fr]" aria-label="Resumo do mês">
        <Card className="sm:col-span-3 xl:col-span-1">
          <CardHeader>
            <CardDescription>Saldo total</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Número de destaque: grande, mas na mesma fonte do resto; sem tabular-nums (fica "frouxo" em tamanho grande) */}
            <p className={cn("text-4xl font-semibold tracking-tight md:text-5xl", resumo.saldoTotal < 0 && "text-red-600 dark:text-red-400")}>
              {formatarMoeda(resumo.saldoTotal)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Contas ativas, ao fim de {nomeMes}</p>
          </CardContent>
        </Card>

        <CardResumo
          titulo="Receitas"
          valor={resumo.receitas}
          marcador="bg-serie-receitas"
          comparacao={mesAnterior && { mes: formatarMesCurto(mesAnterior.ano, mesAnterior.mes), valor: mesAnterior.receitas }}
        />
        <CardResumo
          titulo="Despesas"
          valor={resumo.despesas}
          marcador="bg-serie-despesas"
          comparacao={mesAnterior && { mes: formatarMesCurto(mesAnterior.ano, mesAnterior.mes), valor: mesAnterior.despesas }}
        />
        <CardResultado resultado={resumo.resultado} />
      </section>

      {/* Linha 2: gráficos. No celular ficam um embaixo do outro; no desktop, lado a lado (3/5 e 2/5). */}
      <section className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Receitas e despesas</CardTitle>
            <CardDescription>Últimos 6 meses até {formatarMesCurto(ano, mes)}</CardDescription>
          </CardHeader>
          <CardContent>
            <GraficoEvolucao dados={[...evolucao]} />
            <TabelaAcessivel
              cabecalhos={["Mês", "Receitas", "Despesas", "Resultado"]}
              linhas={evolucao.map((e) => [
                formatarMesAno(e.ano, e.mes),
                formatarMoeda(e.receitas),
                formatarMoeda(e.despesas),
                formatarMoeda(e.resultado),
              ])}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
            <CardDescription>Despesas de {nomeMes}</CardDescription>
          </CardHeader>
          <CardContent>
            {gastos.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma despesa neste mês.</p>
            ) : (
              <>
                <GraficoGastos dados={[...gastos]} />
                <TabelaAcessivel
                  cabecalhos={["Categoria", "Total", "% das despesas"]}
                  linhas={gastos.map((g) => [g.nome, formatarMoeda(g.total), formatarPercentual(g.percentual)])}
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Linha 3: últimas transações do mês, com atalho para a lista completa já filtrada. */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Últimas transações</CardTitle>
          <CardDescription>
            {ultimas.totalItens} lançamento(s) em {nomeMes}
          </CardDescription>
          <CardAction>
            <Link href={`/transacoes?ano=${ano}&mes=${mes}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Ver todas <ArrowRight />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {ultimas.itens.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma transação neste mês.</p>
          ) : (
            <ul className="divide-y">
              {ultimas.itens.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.categoriaCor }} aria-hidden="true" />
                  {/* min-w-0 + truncate: textos longos ganham "..." em vez de empurrar o valor para fora */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.descricao}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatarData(t.data)} · {t.categoriaNome} · {t.contaNome}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-medium tabular-nums",
                      t.tipo === "Receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {t.tipo === "Receita" ? "+ " : "− "}
                    {formatarMoeda(t.valor)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/** Card de receitas/despesas: valor do mês e, abaixo, o do mês anterior para comparação. */
function CardResumo({
  titulo,
  valor,
  marcador,
  comparacao,
}: {
  titulo: string;
  valor: number;
  /** Classe com a cor da série (a mesma do gráfico), usada só no marcador, nunca no texto. */
  marcador: string;
  comparacao?: { mes: string; valor: number };
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <span className={cn("h-3 w-1 rounded-full", marcador)} aria-hidden="true" />
          {titulo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{formatarMoeda(valor)}</p>
        {comparacao && (
          <p className="mt-1 text-xs text-muted-foreground">
            Em {comparacao.mes}: {formatarMoeda(comparacao.valor)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/** Resultado do mês. O sinal fica claro por ícone + texto, não só pela cor. */
function CardResultado({ resultado }: { resultado: number }) {
  const positivo = resultado >= 0;
  const Icone = positivo ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Resultado</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{formatarMoeda(resultado)}</p>
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs",
            positivo ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
          )}
        >
          <Icone className="size-3.5" aria-hidden="true" />
          {positivo ? "Receitas cobriram as despesas" : "Despesas maiores que receitas"}
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * A mesma informação do gráfico, em tabela. Fica recolhida (<details> é HTML puro, abre e fecha
 * sem JavaScript) e serve para leitores de tela e para quem não distingue as cores.
 */
function TabelaAcessivel({ cabecalhos, linhas }: { cabecalhos: string[]; linhas: string[][] }) {
  return (
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Ver como tabela</summary>
      <table className="mt-2 w-full">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            {cabecalhos.map((c, i) => (
              <th key={c} className={cn("py-1.5 font-medium", i > 0 && "text-right")}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={linha[0]} className="border-b last:border-0">
              {linha.map((celula, i) => (
                <td key={i} className={cn("py-1.5", i > 0 && "text-right tabular-nums", i === 0 && "first-letter:uppercase")}>
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
