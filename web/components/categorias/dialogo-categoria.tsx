// Cliente porque tem estado (diálogo aberto/fechado, resultado do envio) e eventos.
"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { salvarCategoria } from "@/app/categorias/actions";
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

type CategoriaDto = components["schemas"]["CategoriaDto"];

/** Sem `categoria`: botão "Nova categoria". Com `categoria`: ícone de lápis para editar. */
export function DialogoCategoria({ categoria }: { categoria?: CategoriaDto }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      {categoria ? (
        <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Editar ${categoria.nome}`} />}>
          <Pencil />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus /> Nova categoria
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>
        {/* O formulário só existe enquanto o diálogo está aberto: ao reabrir, começa limpo
            (sem os erros da tentativa anterior). */}
        <FormularioCategoria categoria={categoria} aoConcluir={() => setAberto(false)} />
      </DialogContent>
    </Dialog>
  );
}

function FormularioCategoria({ categoria, aoConcluir }: { categoria?: CategoriaDto; aoConcluir: () => void }) {
  // Embrulha a Server Action para reagir ao sucesso aqui no navegador (toast + fechar o diálogo).
  async function enviar(estadoAnterior: EstadoAcao, formData: FormData) {
    const resultado = await salvarCategoria(estadoAnterior, formData);
    if (resultado.ok) {
      toast.success(resultado.mensagem);
      aoConcluir();
    }
    return resultado;
  }

  // useActionState liga o <form> a uma action e guarda o último resultado:
  //  - estado: o que a action devolveu (erros, mensagem...)
  //  - acao: o que vai no <form action={...}>
  //  - pendente: true enquanto a action roda (para desabilitar o botão)
  const [estado, acao, pendente] = useActionState(enviar, estadoInicial);

  // Em caso de erro, mostra de volta o que o usuário digitou; senão, os dados atuais.
  const valor = (campo: "nome" | "tipo" | "cor", padrao: string) => estado.valores?.[campo] ?? padrao;

  return (
    // action={acao}: ao enviar, o React monta o FormData e chama a action. Sem onSubmit,
    // sem preventDefault, sem fetch manual.
    <form action={acao} className="grid gap-4">
      {/* key força recriar os campos quando os valores devolvidos mudam (o React 19 limpa o form após o envio) */}
      <div key={JSON.stringify(estado.valores)} className="grid gap-4">
        {categoria && <input type="hidden" name="id" value={categoria.id} />}

        <div className="grid gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={valor("nome", categoria?.nome ?? "")}
            maxLength={60}
            required
            aria-invalid={!!estado.erros?.nome}
          />
          <ErroCampo mensagens={estado.erros?.nome} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="tipo">Tipo</Label>
          <NativeSelect
            id="tipo"
            name="tipo"
            className="w-full"
            defaultValue={valor("tipo", categoria?.tipo ?? "Despesa")}
            aria-invalid={!!estado.erros?.tipo}
          >
            <NativeSelectOption value="Despesa">Despesa</NativeSelectOption>
            <NativeSelectOption value="Receita">Receita</NativeSelectOption>
          </NativeSelect>
          <ErroCampo mensagens={estado.erros?.tipo} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cor">Cor</Label>
          <Input
            id="cor"
            name="cor"
            type="color" // seletor de cor nativo do navegador; o valor é "#rrggbb"
            className="h-9 w-20 p-1"
            defaultValue={valor("cor", categoria?.cor.toLowerCase() ?? "#64748b")}
            aria-invalid={!!estado.erros?.cor}
          />
          <ErroCampo mensagens={estado.erros?.cor} />
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

function ErroCampo({ mensagens }: { mensagens?: string[] }) {
  if (!mensagens) return null; // retornar null = não renderizar nada
  return <p className="text-sm text-destructive">{mensagens.join(" ")}</p>;
}
