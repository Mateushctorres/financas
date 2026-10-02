import type { Metadata } from "next";

import { TituloPagina } from "@/components/titulo-pagina";

export const metadata: Metadata = { title: "Contas" };

export default function ContasPage() {
  return (
    <>
      <TituloPagina titulo="Contas" descricao="Suas contas e saldos." />
      <p className="text-sm text-muted-foreground">Em construção: chega na Fase 3.</p>
    </>
  );
}
