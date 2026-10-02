import type { Metadata } from "next";
import { connection } from "next/server";

import { TituloPagina } from "@/components/titulo-pagina";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, exigirDados } from "@/lib/api";
import { formatarMesAno, formatarMoeda } from "@/lib/format";
import { cn } from "@/lib/utils";

// O `template` do layout só vale para páginas em pastas filhas; esta página está no mesmo
// nível do layout raiz, então o título completo é informado aqui.
export const metadata: Metadata = { title: { absolute: "Dashboard | Finanças" } };

// Server Component assíncrono: pode usar `await` direto, como uma action async no ASP.NET.
// Roda só no servidor; o navegador recebe o HTML já com os valores.
export default async function DashboardPage() {
  // Sem isso, o Next tentaria pré-renderizar esta página no `npm run build` (como um HTML estático)
  // e chamaria a API naquele momento. connection() diz: "renderize a cada requisição".
  await connection();

  // Chamada tipada: o TypeScript conhece a rota, os parâmetros e o formato de `resumo`.
  const resumo = exigirDados(await api.GET("/api/dashboard/resumo"));

  const cards = [
    { titulo: "Saldo total", valor: resumo.saldoTotal },
    { titulo: "Receitas", valor: resumo.receitas, cor: "text-emerald-600 dark:text-emerald-400" },
    { titulo: "Despesas", valor: resumo.despesas, cor: "text-red-600 dark:text-red-400" },
    { titulo: "Resultado", valor: resumo.resultado },
  ];

  return (
    <>
      {/* <>...</> é um Fragment: agrupa elementos sem criar uma <div> extra no HTML. */}
      <TituloPagina titulo="Dashboard" descricao={`Resumo de ${formatarMesAno(resumo.ano, resumo.mes)}`} />

      {/* Grid responsivo: 1 coluna no celular, 2 a partir de sm (640px), 4 a partir de xl (1280px). */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.titulo}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn("text-2xl font-semibold tabular-nums", card.cor)}>{formatarMoeda(card.valor)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">Gráficos e seletor de mês chegam na Fase 4.</p>
    </>
  );
}
