// Cliente: confirmação + chamada da Server Action (mesmo padrão de excluir-categoria.tsx).
"use client";

import { Archive, ArchiveRestore } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { definirContaAtiva } from "@/app/contas/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/** Arquiva uma conta ativa ou reativa uma arquivada. */
export function ArquivarConta({ id, nome, ativa }: { id: number; nome: string; ativa: boolean }) {
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  function confirmar() {
    iniciarTransicao(async () => {
      const resultado = await definirContaAtiva(id, !ativa);
      if (resultado.ok) toast.success(resultado.mensagem);
      else toast.error(resultado.mensagem);
      setAberto(false);
    });
  }

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`${ativa ? "Arquivar" : "Reativar"} ${nome}`} />}
      >
        {ativa ? <Archive /> : <ArchiveRestore />}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {ativa ? "Arquivar" : "Reativar"} a conta &quot;{nome}&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {ativa
              ? "A conta sai das listas e do saldo total, e não aceita novas transações. O histórico é mantido e você pode reativá-la depois."
              : "A conta volta a aparecer nas listas, no saldo total e pode receber transações."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pendente}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={confirmar} disabled={pendente}>
            {pendente ? "Salvando..." : ativa ? "Arquivar" : "Reativar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
