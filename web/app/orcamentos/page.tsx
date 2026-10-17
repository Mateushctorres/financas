import type { Metadata } from "next";

import { BarraOrcamento } from "@/components/orcamentos/barra-orcamento";
import { LimiteInline } from "@/components/orcamentos/limite-inline";
import { SeletorMes } from "@/components/seletor-mes";
import { TituloPagina } from "@/components/titulo-pagina";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, exigirDados } from "@/lib/api";
import type { components } from "@/lib/api-types";
import { formatarMesAno, formatarMoeda } from "@/lib/format";
import { mesDaUrl } from "@/lib/parametros";

export const metadata: Metadata = { title: "Orçamentos" };

type OrcamentoDto = components["schemas"]["OrcamentoDto"];

// Mesmo padrão das outras telas: o mês vem da URL, a página busca no servidor,
// e cada linha tem um formulário cliente (LimiteInline) que chama uma Server Action.
export default async function OrcamentosPage({ searchParams }: PageProps<"/orcamentos">) {
  const { ano, mes } = mesDaUrl(await searchParams);
  // A API devolve uma linha por categoria de despesa; as sem orçamento vêm com limite null.
  const linhas = exigirDados(await api.GET("/api/orcamentos", { params: { query: { ano, mes } } }));

  const comLimite = linhas
    .filter((o) => o.limite !== null)
    .sort((a, b) => (b.percentual ?? 0) - (a.percentual ?? 0)); // as mais "apertadas" primeiro
  const semLimite = linhas.filter((o) => o.limite === null);

  return (
    <>
      <TituloPagina titulo="Orçamentos" descricao={`Limites de gasto por categoria em ${formatarMesAno(ano, mes)}`}>
        <SeletorMes caminho="/orcamentos" ano={ano} mes={mes} />
      </TituloPagina>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Com limite</CardTitle>
            <CardDescription>
              Verde até 80% do limite, amarelo de 80% a 100%, vermelho acima. Edite o valor e confirme com ✓ ou Enter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {comLimite.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum limite definido neste mês. Defina um nas categorias abaixo.
              </p>
            ) : (
              <ul className="divide-y">
                {comLimite.map((o) => (
                  <LinhaOrcamento key={o.categoriaId} orcamento={o} ano={ano} mes={mes} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {semLimite.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sem limite</CardTitle>
              <CardDescription>Categorias de despesa sem orçamento neste mês, com o quanto já foi gasto.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {semLimite.map((o) => (
                  <LinhaOrcamento key={o.categoriaId} orcamento={o} ano={ano} mes={mes} />
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function LinhaOrcamento({ orcamento: o, ano, mes }: { orcamento: OrcamentoDto; ano: number; mes: number }) {
  return (
    // No celular: nome + barra em cima, formulário embaixo. A partir de md: lado a lado.
    <li className="grid gap-3 py-3 md:grid-cols-[1fr_auto] md:items-center md:gap-6">
      <div className="grid min-w-0 gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: o.categoriaCor }} aria-hidden="true" />
          <span className="truncate font-medium">{o.categoriaNome}</span>
          {o.limite === null && (
            <span className="ml-auto text-sm text-muted-foreground tabular-nums md:ml-2">
              gasto: {formatarMoeda(o.gasto)}
            </span>
          )}
        </div>
        {o.limite !== null && o.percentual !== null && (
          <BarraOrcamento gasto={o.gasto} limite={o.limite} percentual={o.percentual} />
        )}
      </div>
      <LimiteInline
        id={o.id}
        categoriaId={o.categoriaId}
        categoriaNome={o.categoriaNome}
        ano={ano}
        mes={mes}
        limite={o.limite}
      />
    </li>
  );
}
