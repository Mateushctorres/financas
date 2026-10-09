// Cliente: confirmação + Server Action (mesmo padrão de excluir-categoria.tsx).
"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { excluirTransacao } from "@/app/transacoes/actions";
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

export function ExcluirTransacao({ id, descricao }: { id: number; descricao: string }) {
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  function confirmar() {
    iniciarTransicao(async () => {
      const resultado = await excluirTransacao(id);
      if (resultado.ok) toast.success(resultado.mensagem);
      else toast.error(resultado.mensagem);
      setAberto(false);
    });
  }

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Excluir ${descricao}`} />}>
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir &quot;{descricao}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            O saldo da conta e o dashboard serão recalculados. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pendente}>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirmar} disabled={pendente}>
            {pendente ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
