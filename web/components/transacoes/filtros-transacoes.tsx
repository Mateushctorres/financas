// Cliente porque reage à troca dos selects. Mas repare: não há useState para os filtros.
// O valor de cada select vem da URL (via props) e trocar um filtro só muda a URL;
// a página (Server Component) lê os searchParams e busca os dados de novo.
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { components } from "@/lib/api-types";
import { comParametros, type Parametros } from "@/lib/url";
import { cn } from "@/lib/utils";

type Props = {
  parametros: Parametros; // filtros atuais, lidos da URL pela página
  contas: components["schemas"]["ContaDto"][];
  categorias: components["schemas"]["CategoriaDto"][];
};

export function FiltrosTransacoes({ parametros, contas, categorias }: Props) {
  const router = useRouter();
  // Enquanto a página nova carrega, `navegando` fica true e os filtros ficam esmaecidos.
  const [navegando, iniciarTransicao] = useTransition();

  function alterar(nome: string, valor: string) {
    // Filtro novo → volta para a página 1 (a página 3 do filtro anterior pode nem existir).
    const url = comParametros("/transacoes", parametros, { [nome]: valor, pagina: undefined });
    // router.push muda a URL sem recarregar a página, como clicar num <Link>.
    iniciarTransicao(() => router.push(url));
  }

  return (
    <div className={cn("flex flex-wrap gap-2 transition-opacity", navegando && "opacity-60")}>
      <NativeSelect
        aria-label="Filtrar por tipo"
        value={parametros.tipo ?? ""}
        onChange={(e) => alterar("tipo", e.target.value)}
      >
        <NativeSelectOption value="">Todos os tipos</NativeSelectOption>
        <NativeSelectOption value="Receita">Receitas</NativeSelectOption>
        <NativeSelectOption value="Despesa">Despesas</NativeSelectOption>
      </NativeSelect>

      <NativeSelect
        aria-label="Filtrar por conta"
        value={parametros.contaId ?? ""}
        onChange={(e) => alterar("contaId", e.target.value)}
      >
        <NativeSelectOption value="">Todas as contas</NativeSelectOption>
        {contas.map((c) => (
          <NativeSelectOption key={c.id} value={c.id}>
            {c.nome}
            {!c.ativa && " (arquivada)"}
          </NativeSelectOption>
        ))}
      </NativeSelect>

      <NativeSelect
        aria-label="Filtrar por categoria"
        value={parametros.categoriaId ?? ""}
        onChange={(e) => alterar("categoriaId", e.target.value)}
      >
        <NativeSelectOption value="">Todas as categorias</NativeSelectOption>
        {categorias.map((c) => (
          <NativeSelectOption key={c.id} value={c.id}>
            {c.nome}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
