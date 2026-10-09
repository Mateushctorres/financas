// Cliente: diálogo com formulário (mesmo padrão de components/categorias/dialogo-categoria.tsx).
"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { salvarConta } from "@/app/contas/actions";
import { ErroCampo } from "@/components/erro-campo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { components } from "@/lib/api-types";
import { estadoInicial, type EstadoAcao } from "@/lib/estado-acao";
import { rotulosTipoConta, tiposConta } from "@/lib/rotulos";

type ContaDto = components["schemas"]["ContaDto"];

export function DialogoConta({ conta }: { conta?: ContaDto }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      {conta ? (
        <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Editar ${conta.nome}`} />}>
          <Pencil />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus /> Nova conta
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{conta ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>
        <FormularioConta conta={conta} aoConcluir={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}

function FormularioConta({ conta, aoConcluir }: { conta?: ContaDto; aoConcluir: () => void }) {
  async function enviar(estadoAnterior: EstadoAcao, formData: FormData) {
    const resultado = await salvarConta(estadoAnterior, formData);
    if (resultado.ok) {
      toast.success(resultado.mensagem);
      aoConcluir();
    }
    return resultado;
  }

  const [estado, acao, pendente] = useActionState(enviar, estadoInicial);
  const valor = (campo: string, padrao: string) => estado.valores?.[campo] ?? padrao;

  return (
    <form action={acao} className="grid gap-4">
      <div key={JSON.stringify(estado.valores)} className="grid gap-4">
        {conta && (
          <>
            <input type="hidden" name="id" value={conta.id} />
            <input type="hidden" name="ativa" value={String(conta.ativa)} />
          </>
        )}

        <div className="grid gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={valor("nome", conta?.nome ?? "")}
            maxLength={100}
            required
            aria-invalid={!!estado.erros?.nome}
          />
          <ErroCampo mensagens={estado.erros?.nome} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tipo">Tipo</Label>
          <NativeSelect id="tipo" name="tipo" className="w-full" defaultValue={valor("tipo", conta?.tipo ?? "Corrente")}>
            {tiposConta.map((tipo) => (
              <NativeSelectOption key={tipo} value={tipo}>
                {rotulosTipoConta[tipo]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <ErroCampo mensagens={estado.erros?.tipo} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="saldoInicial">Saldo inicial (R$)</Label>
          <Input
            id="saldoInicial"
            name="saldoInicial"
            type="number" // o navegador valida e envia com ponto decimal ("1234.5"), mesmo em pt-BR
            step="0.01"
            inputMode="decimal" // no celular, abre o teclado numérico
            defaultValue={valor("saldoInicial", String(conta?.saldoInicial ?? 0))}
            required
            aria-invalid={!!estado.erros?.saldoInicial}
          />
          <p className="text-xs text-muted-foreground">Saldo antes da primeira transação. Pode ser negativo.</p>
          <ErroCampo mensagens={estado.erros?.saldoInicial} />
        </div>
      </div>

      {!estado.ok && estado.mensagem && (
        <p role="alert" className="text-sm text-destructive">
          {estado.mensagem}
        </p>
      )}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando..." : "Salvar"}
        </Button>
      </DialogFooter>
    </form>
  );
}
