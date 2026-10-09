import type { Metadata } from "next";
import { connection } from "next/server";

import { ArquivarConta } from "@/components/contas/arquivar-conta";
import { DialogoConta } from "@/components/contas/dialogo-conta";
import { IconeConta } from "@/components/contas/icone-conta";
import { TituloPagina } from "@/components/titulo-pagina";
import { Card, CardAction, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api, exigirDados } from "@/lib/api";
import type { components } from "@/lib/api-types";
import { formatarMoeda } from "@/lib/format";
import { rotulosTipoConta } from "@/lib/rotulos";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contas" };

type ContaDto = components["schemas"]["ContaDto"];

// Mesmo padrão de Categorias: Server Component busca, componentes cliente interagem,
// Server Actions (app/contas/actions.ts) gravam e revalidam.
export default async function ContasPage() {
  await connection();
  const contas = exigirDados(await api.GET("/api/contas", { params: { query: { incluirInativas: true } } }));

  const ativas = contas.filter((c) => c.ativa);
  const arquivadas = contas.filter((c) => !c.ativa);
  // reduce: "acumula" a lista num único valor, como o Sum() do LINQ. Só para exibir:
  // o saldo de cada conta já vem calculado pela API.
  const saldoTotal = ativas.reduce((soma, conta) => soma + conta.saldoAtual, 0);

  return (
    <>
      <TituloPagina titulo="Contas" descricao={`Saldo total das contas ativas: ${formatarMoeda(saldoTotal)}`}>
        <DialogoConta />
      </TituloPagina>

      {ativas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma conta ativa. Crie a primeira em &quot;Nova conta&quot;.</p>
      ) : (
        <GradeContas contas={ativas} />
      )}

      {arquivadas.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Arquivadas</h2>
          <GradeContas contas={arquivadas} />
        </section>
      )}
    </>
  );
}

function GradeContas({ contas }: { contas: ContaDto[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {contas.map((conta) => (
        // opacity-60: contas arquivadas aparecem "apagadas"
        <Card key={conta.id} className={cn(!conta.ativa && "opacity-60")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconeConta tipo={conta.tipo} className="size-4 text-muted-foreground" />
              <span className="truncate">{conta.nome}</span>
            </CardTitle>
            <CardDescription>{rotulosTipoConta[conta.tipo]}</CardDescription>
            <CardAction className="flex gap-1">
              <DialogoConta conta={conta} />
              <ArquivarConta id={conta.id} nome={conta.nome} ativa={conta.ativa} />
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Saldo atual</p>
            {/* tabular-nums: dígitos com a mesma largura, os valores alinham melhor */}
            <p className={cn("text-2xl font-semibold tabular-nums", conta.saldoAtual < 0 && "text-red-600 dark:text-red-400")}>
              {formatarMoeda(conta.saldoAtual)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Saldo inicial: {formatarMoeda(conta.saldoInicial)}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
