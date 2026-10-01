using Financas.Api.Categorias;
using Financas.Api.Contas;
using Financas.Api.Orcamentos;
using Financas.Api.Transacoes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Financas.Api.Data;

public class ContaConfiguration : IEntityTypeConfiguration<Conta>
{
    public void Configure(EntityTypeBuilder<Conta> builder)
    {
        builder.Property(c => c.Nome).HasMaxLength(100);
        builder.Property(c => c.Tipo).HasConversion<string>().HasMaxLength(20);
    }
}

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        builder.Property(c => c.Nome).HasMaxLength(60);
        builder.Property(c => c.Tipo).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.Cor).HasMaxLength(7);
        builder.HasIndex(c => new { c.Nome, c.Tipo }).IsUnique();
    }
}

public class TransacaoConfiguration : IEntityTypeConfiguration<Transacao>
{
    public void Configure(EntityTypeBuilder<Transacao> builder)
    {
        builder.Property(t => t.Descricao).HasMaxLength(200);
        builder.Property(t => t.Observacao).HasMaxLength(500);
        builder.Property(t => t.Tipo).HasConversion<string>().HasMaxLength(20);

        // Restrict: excluir conta/categoria nunca apaga transações em cascata.
        builder.HasOne(t => t.Conta).WithMany(c => c.Transacoes)
            .HasForeignKey(t => t.ContaId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(t => t.Categoria).WithMany()
            .HasForeignKey(t => t.CategoriaId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.Data);
    }
}

public class OrcamentoConfiguration : IEntityTypeConfiguration<Orcamento>
{
    public void Configure(EntityTypeBuilder<Orcamento> builder)
    {
        builder.HasOne(o => o.Categoria).WithMany()
            .HasForeignKey(o => o.CategoriaId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(o => new { o.CategoriaId, o.Ano, o.Mes }).IsUnique();
    }
}
