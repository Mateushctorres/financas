using Financas.Api.Categorias;
using Financas.Api.Common;
using Financas.Api.Contas;
using Financas.Api.Orcamentos;
using Financas.Api.Transacoes;

namespace Financas.Api.Data;

/// <summary>
/// Dados de exemplo para Development: categorias padrão, 3 contas, transações dos 3 meses
/// anteriores + mês atual até hoje, e orçamentos do mês atual e do anterior.
/// As datas são relativas a hoje para o dashboard sempre ter o que mostrar.
/// </summary>
public static class SeedDesenvolvimento
{
    public static void Executar(AppDbContext db)
    {
        if (db.Categorias.Any() || db.Contas.Any())
            return;

        Categoria Cat(string nome, TipoTransacao tipo, string cor) => new() { Nome = nome, Tipo = tipo, Cor = cor };
        var salario = Cat("Salário", TipoTransacao.Receita, "#16A34A");
        var outrasReceitas = Cat("Outras receitas", TipoTransacao.Receita, "#0D9488");
        var alimentacao = Cat("Alimentação", TipoTransacao.Despesa, "#F97316");
        var moradia = Cat("Moradia", TipoTransacao.Despesa, "#6366F1");
        var transporte = Cat("Transporte", TipoTransacao.Despesa, "#0EA5E9");
        var saude = Cat("Saúde", TipoTransacao.Despesa, "#EF4444");
        var lazer = Cat("Lazer", TipoTransacao.Despesa, "#EC4899");
        var educacao = Cat("Educação", TipoTransacao.Despesa, "#A855F7");
        var outros = Cat("Outros", TipoTransacao.Despesa, "#64748B");
        db.Categorias.AddRange(salario, outrasReceitas, alimentacao, moradia, transporte, saude, lazer, educacao, outros);

        var corrente = new Conta { Nome = "Conta Corrente", Tipo = TipoConta.Corrente, SaldoInicial = 3000m };
        var poupanca = new Conta { Nome = "Poupança", Tipo = TipoConta.Poupanca, SaldoInicial = 10000m };
        var cartao = new Conta { Nome = "Cartão de Crédito", Tipo = TipoConta.Cartao, SaldoInicial = 0m };
        db.Contas.AddRange(corrente, poupanca, cartao);

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var mesAtual = new MesReferencia(hoje.Year, hoje.Month);

        // k = 0..3: três meses atrás, dois meses atrás, mês anterior, mês atual.
        // Os arrays dão uma variação realista de valores entre os meses.
        for (var k = 0; k < 4; k++)
        {
            var referencia = mesAtual.AdicionarMeses(k - 3);

            void Lancar(int dia, string descricao, decimal valor, Categoria categoria, Conta conta, string? observacao = null)
            {
                var data = new DateOnly(referencia.Ano, referencia.Mes, Math.Min(dia, referencia.Fim.Day));
                if (data > hoje)
                    return;
                db.Transacoes.Add(new Transacao
                {
                    Descricao = descricao, Valor = valor, Tipo = categoria.Tipo, Data = data,
                    Conta = conta, Categoria = categoria, Observacao = observacao
                });
            }

            // Receitas
            Lancar(5, "Salário", 6500m, salario, corrente);
            Lancar(1, "Rendimento da poupança", new[] { 61.20m, 63.85m, 66.10m, 68.40m }[k], outrasReceitas, poupanca);
            if (k == 1)
                Lancar(22, "Freelance — site institucional", 1200m, outrasReceitas, corrente, "Pagamento via Pix");

            // Moradia
            Lancar(10, "Aluguel", 1800m, moradia, corrente);
            Lancar(10, "Condomínio", 450m, moradia, corrente);
            Lancar(12, "Conta de luz", new[] { 182.40m, 214.90m, 196.35m, 205.10m }[k], moradia, corrente);
            Lancar(15, "Conta de água", new[] { 78.20m, 85.60m, 81.10m, 79.90m }[k], moradia, corrente);
            Lancar(15, "Internet", 119.90m, moradia, corrente);

            // Alimentação
            var mercado = new[] { 268.45m, 301.90m, 287.30m, 322.15m, 279.80m, 295.40m, 310.75m, 284.60m };
            Lancar(3, "Supermercado", mercado[k], alimentacao, corrente);
            Lancar(10, "Supermercado", mercado[k + 1], alimentacao, corrente);
            Lancar(17, "Supermercado", mercado[k + 2], alimentacao, corrente);
            Lancar(24, "Supermercado", mercado[k + 3], alimentacao, corrente);
            Lancar(4, "Padaria", new[] { 32.50m, 28.90m, 41.20m, 35.00m }[k], alimentacao, cartao);
            Lancar(8, "Restaurante", new[] { 87.40m, 112.00m, 95.80m, 104.30m }[k], alimentacao, cartao);
            Lancar(21, "Restaurante", new[] { 64.90m, 78.50m, 132.60m, 71.20m }[k], alimentacao, cartao);
            Lancar(13, "iFood", new[] { 54.80m, 61.30m, 47.90m, 58.70m }[k], alimentacao, cartao);
            Lancar(27, "iFood", new[] { 49.90m, 72.40m, 66.20m, 53.10m }[k], alimentacao, cartao);

            // Transporte
            Lancar(2, "Uber", new[] { 23.40m, 18.90m, 27.60m, 21.30m }[k], transporte, cartao);
            Lancar(9, "Uber", new[] { 31.20m, 25.70m, 19.80m, 28.40m }[k], transporte, cartao);
            Lancar(16, "Uber", new[] { 17.60m, 34.10m, 22.50m, 26.90m }[k], transporte, cartao);
            Lancar(14, "Combustível", new[] { 230.00m, 215.50m, 248.90m, 240.00m }[k], transporte, cartao);

            // Saúde
            Lancar(6, "Plano de saúde", 389.00m, saude, corrente);
            Lancar(18, "Farmácia", new[] { 46.80m, 89.30m, 37.50m, 62.10m }[k], saude, cartao);

            // Lazer
            Lancar(1, "Streaming", 55.90m, lazer, cartao, "Netflix + Spotify");
            Lancar(19, "Cinema", new[] { 68.00m, 82.00m, 74.00m, 70.00m }[k], lazer, cartao);
            if (k == 2)
                Lancar(26, "Show", 380.00m, lazer, cartao, "Ingresso + estacionamento");

            // Educação
            Lancar(20, "Curso online", 149.90m, educacao, cartao);

            // Outros
            Lancar(11, "Corte de cabelo", 60.00m, outros, corrente);
            if (k == 0)
                Lancar(23, "Presente de aniversário", 150.00m, outros, cartao);
        }

        foreach (var referencia in new[] { mesAtual.AdicionarMeses(-1), mesAtual })
        {
            void Orcar(Categoria categoria, decimal limite) => db.Orcamentos.Add(new Orcamento
            {
                Categoria = categoria, Ano = referencia.Ano, Mes = referencia.Mes, Limite = limite
            });

            Orcar(alimentacao, 1500m);
            Orcar(moradia, 2800m);
            Orcar(transporte, 600m);
            Orcar(lazer, 400m);
        }

        db.SaveChanges();
    }
}
