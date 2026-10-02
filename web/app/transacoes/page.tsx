import type { Metadata } from "next";

import { TituloPagina } from "@/components/titulo-pagina";

export const metadata: Metadata = { title: "Transações" };

export default function TransacoesPage() {
  return (
    <>
      <TituloPagina titulo="Transações" descricao="Lista de receitas e despesas, com filtros." />
      <p className="text-sm text-muted-foreground">Em construção: chega na Fase 3.</p>
    </>
  );
}
