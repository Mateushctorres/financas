import type { Metadata } from "next";
import Link from "next/link";

import { Paginacao } from "@/components/paginacao";
import { SeletorMes } from "@/components/seletor-mes";
import { TituloPagina } from "@/components/titulo-pagina";
import { DialogoTransacao } from "@/components/transacoes/dialogo-transacao";
import { ExcluirTransacao } from "@/components/transacoes/excluir-transacao";
import { FiltrosTransacoes } from "@/components/transacoes/filtros-transacoes";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, exigirDados } from "@/lib/api";
import { formatarData, formatarMoeda } from "@/lib/format";
import type { Parametros } from "@/lib/url";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Transações" };

const TAMANHO_PAGINA = 20;

/** Lê um número inteiro positivo da URL; qualquer outra coisa vira undefined. */
function numero(valor: string | string[] | undefined): number | undefined {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

// Os filtros vêm da URL: /transacoes?ano=2026&mes=9&contaId=1&tipo=Despesa&pagina=2
// É o mesmo modelo de uma action GET do MVC com parâmetros de query string:
//   public IActionResult Index(int? ano, int? mes, int? contaId, ...)
// `searchParams` é uma Promise no Next recente (precisa de await). Ler searchParams já torna
// a página dinâmica (renderizada a cada requisição), então aqui não é preciso connection().
export default async function TransacoesPage({ searchParams }: PageProps<"/transacoes">) {
  const query = await searchParams;

  const hoje = new Date();
  const mesInformado = numero(query.mes);
  const ano = numero(query.ano) ?? hoje.getFullYear();
  const mes = mesInformado && mesInformado <= 12 ? mesInformado : hoje.getMonth() + 1;
  const contaId = numero(query.contaId);
  const categoriaId = numero(query.categoriaId);
  const tipo = query.tipo === "Receita" || query.tipo === "Despesa" ? query.tipo : undefined;
  const pagina = numero(query.pagina) ?? 1;

  // Parâmetros atuais, como texto, para montar links que preservam os filtros.
  const parametros: Parametros = {
    ano: String(ano),
    mes: String(mes),
    contaId: contaId?.toString(),
    categoriaId: categoriaId?.toString(),
    tipo,
  };

  // As três chamadas são independentes; Promise.all dispara todas ao mesmo tempo e espera
  // a última, como Task.WhenAll no C#. Em sequência, o tempo seria a soma das três.
  const [resultado, contas, categorias] = await Promise.all([
    api.GET("/api/transacoes", {
      params: { query: { ano, mes, contaId, categoriaId, tipo, pagina, tamanhoPagina: TAMANHO_PAGINA } },
    }),
    api.GET("/api/contas", { params: { query: { incluirInativas: true } } }),
    api.GET("/api/categorias"),
  ]).then(([t, c, cat]) => [exigirDados(t), exigirDados(c), exigirDados(cat)] as const);

  const temFiltro = contaId || categoriaId || tipo;

  return (
    <>
      <TituloPagina titulo="Transações" descricao={`${resultado.totalItens} lançamento(s) no período.`}>
        <DialogoTransacao contas={contas} categorias={categorias} />
      </TituloPagina>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SeletorMes caminho="/transacoes" ano={ano} mes={mes} parametros={parametros} />
        <div className="flex flex-wrap items-center gap-2">
          <FiltrosTransacoes parametros={parametros} contas={contas} categorias={categorias} />
          {temFiltro && (
            <Link
              href={`/transacoes?ano=${ano}&mes=${mes}`}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Limpar filtros
            </Link>
          )}
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          {resultado.itens.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma transação encontrada{temFiltro ? " com esses filtros" : " neste mês"}.
            </p>
          ) : (
            // A tabela do shadcn já rola na horizontal em telas estreitas;
            // colunas menos importantes somem no celular (hidden md:table-cell).
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden lg:table-cell">Conta</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-0 pr-4">
                    <span className="sr-only">Ações</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultado.itens.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-4 text-muted-foreground tabular-nums">{formatarData(t.data)}</TableCell>
                    <TableCell className="max-w-64">
                      <div className="truncate font-medium">{t.descricao}</div>
                      {t.observacao && <div className="truncate text-xs text-muted-foreground">{t.observacao}</div>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: t.categoriaCor }} aria-hidden="true" />
                        {t.categoriaNome}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">{t.contaNome}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium tabular-nums",
                        t.tipo === "Receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
                      )}
                    >
                      {t.tipo === "Receita" ? "+ " : "− "}
                      {formatarMoeda(t.valor)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-1">
                        <DialogoTransacao transacao={t} contas={contas} categorias={categorias} />
                        <ExcluirTransacao id={t.id} descricao={t.descricao} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Paginacao
        caminho="/transacoes"
        parametros={parametros}
        numeroPagina={resultado.numeroPagina}
        totalPaginas={resultado.totalPaginas ?? 1}
      />
    </>
  );
}
