// Componente simples e reutilizável: só recebe props e devolve markup.
export function TituloPagina({ titulo, descricao }: { titulo: string; descricao?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{titulo}</h1>
      {/* Renderização condicional: se `descricao` for undefined, nada é renderizado */}
      {descricao && <p className="text-sm text-muted-foreground">{descricao}</p>}
    </div>
  );
}
