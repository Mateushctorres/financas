// error.tsx precisa ser Client Component: ele é um "Error Boundary" do React,
// que captura erros de renderização no navegador e mostra esta tela no lugar da página.
"use client";

import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Erro({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-center gap-2 font-medium text-destructive">
        <TriangleAlert className="size-5" />
        Não foi possível carregar os dados
      </div>
      <p className="text-sm text-muted-foreground">
        Verifique se a API está rodando em <code>http://localhost:5080</code> e tente de novo.
      </p>
      {/* Em produção o Next esconde a mensagem real do erro do servidor (só manda o `digest`);
          em desenvolvimento ela aparece aqui para ajudar a depurar. */}
      {process.env.NODE_ENV === "development" && (
        <pre className="max-w-full overflow-x-auto text-xs text-muted-foreground">{error.message}</pre>
      )}
      {/* retry() renderiza a página de novo (e refaz as chamadas à API). */}
      <Button onClick={retry}>Tentar de novo</Button>
    </div>
  );
}
