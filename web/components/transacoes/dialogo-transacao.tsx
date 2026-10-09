// Cliente: diálogo com formulário (padrão de Categorias) + estado local para o tipo,
// porque a lista de categorias muda conforme Receita/Despesa.
"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { salvarTransacao } from "@/app/transacoes/actions";
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
import { Textarea } from "@/components/ui/textarea";
import type { components } from "@/lib/api-types";
import { estadoInicial, type EstadoAcao } from "@/lib/estado-acao";
import { hojeIso } from "@/lib/format";

type TransacaoDto = components["schemas"]["TransacaoDto"];
type ContaDto = components["schemas"]["ContaDto"];
type CategoriaDto = components["schemas"]["CategoriaDto"];
type TipoTransacao = components["schemas"]["TipoTransacao"];

type Props = {
  transacao?: TransacaoDto;
  contas: ContaDto[];
  categorias: CategoriaDto[];
};

export function DialogoTransacao({ transacao, contas, categorias }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      {transacao ? (
        <DialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Editar ${transacao.descricao}`} />}>
          <Pencil />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button />}>
          <Plus /> Nova transação
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transacao ? "Editar transação" : "Nova transação"}</DialogTitle>
        </DialogHeader>
        <FormularioTransacao
          transacao={transacao}
          contas={contas}
          categorias={categorias}
          aoConcluir={() => setAberto(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function FormularioTransacao({ transacao, contas, categorias, aoConcluir }: Props & { aoConcluir: () => void }) {
  async function enviar(estadoAnterior: EstadoAcao, formData: FormData) {
    const resultado = await salvarTransacao(estadoAnterior, formData);
    if (resultado.ok) {
      toast.success(resultado.mensagem);
      aoConcluir();
    }
    return resultado;
  }

  const [estado, acao, pendente] = useActionState(enviar, estadoInicial);
  const valor = (campo: string, padrao: string) => estado.valores?.[campo] ?? padrao;

  // O tipo é "controlado" (value + onChange): precisamos dele a cada render para filtrar as categorias.
  // Os demais campos são "não controlados" (defaultValue): o navegador guarda o valor e o
  // FormData o lê no envio. Controlar só o necessário deixa o código mais simples.
  const [tipo, setTipo] = useState<TipoTransacao>(transacao?.tipo ?? "Despesa");
  const categoriasDoTipo = categorias.filter((c) => c.tipo === tipo);

  // Contas arquivadas não recebem lançamentos novos, mas a conta atual da transação
  // precisa aparecer na edição, mesmo se tiver sido arquivada.
  const contasDisponiveis = contas.filter((c) => c.ativa || c.id === transacao?.contaId);

  return (
    <form action={acao} className="grid gap-4">
      <div key={JSON.stringify(estado.valores)} className="grid gap-4">
        {transacao && <input type="hidden" name="id" value={transacao.id} />}

        <div className="grid gap-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Input
            id="descricao"
            name="descricao"
            defaultValue={valor("descricao", transacao?.descricao ?? "")}
            maxLength={200}
            required
            aria-invalid={!!estado.erros?.descricao}
          />
          <ErroCampo mensagens={estado.erros?.descricao} />
        </div>

        {/* sm:grid-cols-2: no celular os campos ficam um embaixo do outro; a partir de 640px, lado a lado */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="tipo">Tipo</Label>
            <NativeSelect
              id="tipo"
              name="tipo"
              className="w-full"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoTransacao)}
              aria-invalid={!!estado.erros?.tipo}
            >
              <NativeSelectOption value="Despesa">Despesa</NativeSelectOption>
              <NativeSelectOption value="Receita">Receita</NativeSelectOption>
            </NativeSelect>
            <ErroCampo mensagens={estado.erros?.tipo} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="valor">Valor (R$)</Label>
            <Input
              id="valor"
              name="valor"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              defaultValue={valor("valor", transacao ? String(transacao.valor) : "")}
              required
              aria-invalid={!!estado.erros?.valor}
            />
            <ErroCampo mensagens={estado.erros?.valor} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="categoriaId">Categoria</Label>
            {/* key={tipo}: ao trocar o tipo, o select é recriado e volta ao "Selecione...",
                em vez de ficar com uma categoria do outro tipo */}
            <NativeSelect
              key={tipo}
              id="categoriaId"
              name="categoriaId"
              className="w-full"
              defaultValue={valor("categoriaId", transacao?.tipo === tipo ? String(transacao.categoriaId) : "")}
              required
              aria-invalid={!!estado.erros?.categoriaId}
            >
              <NativeSelectOption value="">Selecione...</NativeSelectOption>
              {categoriasDoTipo.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.nome}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <ErroCampo mensagens={estado.erros?.categoriaId} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contaId">Conta</Label>
            <NativeSelect
              id="contaId"
              name="contaId"
              className="w-full"
              defaultValue={valor("contaId", transacao ? String(transacao.contaId) : "")}
              required
              aria-invalid={!!estado.erros?.contaId}
            >
              <NativeSelectOption value="">Selecione...</NativeSelectOption>
              {contasDisponiveis.map((c) => (
                <NativeSelectOption key={c.id} value={c.id}>
                  {c.nome}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <ErroCampo mensagens={estado.erros?.contaId} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            name="data"
            type="date" // o valor é sempre "AAAA-MM-DD", independente de como o navegador exibe
            className="w-fit"
            defaultValue={valor("data", transacao?.data ?? hojeIso())}
            required
            aria-invalid={!!estado.erros?.data}
          />
          <ErroCampo mensagens={estado.erros?.data} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="observacao">
            Observação <span className="font-normal text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="observacao"
            name="observacao"
            rows={2}
            maxLength={500}
            defaultValue={valor("observacao", transacao?.observacao ?? "")}
          />
          <ErroCampo mensagens={estado.erros?.observacao} />
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
