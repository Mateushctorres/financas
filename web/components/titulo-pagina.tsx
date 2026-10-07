// Componente simples e reutilizável: só recebe props e devolve markup.
// `children` aqui é opcional: são as ações da página (ex.: botão "Nova categoria"),
// mostradas à direita do título.
export function TituloPagina({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
        {/* Renderização condicional: se `descricao` for undefined, nada é renderizado */}
        {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
      </div>
      {children}
    </div>
  );
}
