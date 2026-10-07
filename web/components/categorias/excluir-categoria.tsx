// Cliente porque abre um diálogo de confirmação e reage ao clique.
"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { excluirCategoria } from "@/app/categorias/actions";
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

export function ExcluirCategoria({ id, nome }: { id: number; nome: string }) {
  const [aberto, setAberto] = useState(false);
  // useTransition: chama a Server Action fora de um <form> e expõe `pendente` enquanto ela roda.
  const [pendente, iniciarTransicao] = useTransition();

  function confirmar() {
    iniciarTransicao(async () => {
      // Chamar uma Server Action é só chamar a função; o Next faz o POST por baixo.
      const resultado = await excluirCategoria(id);
      if (resultado.ok) toast.success(resultado.mensagem);
      else toast.error(resultado.mensagem); // ex.: 409 "tem transações ou orçamentos"
      setAberto(false);
    });
  }

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Excluir ${nome}`} />}>
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir a categoria &quot;{nome}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Categorias com transações ou orçamentos não podem ser excluídas.
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
