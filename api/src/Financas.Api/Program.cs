using System.Text.Json.Serialization;
using Financas.Api.Categorias;
using Financas.Api.Common;
using Financas.Api.Contas;
using Financas.Api.Dashboard;
using Financas.Api.Data;
using Financas.Api.Orcamentos;
using Financas.Api.Transacoes;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// A connection string é lida ao criar o DbContext (e não aqui), para os testes poderem trocá-la.
builder.Services.AddDbContext<AppDbContext>((services, options) =>
    options.UseSqlite(services.GetRequiredService<IConfiguration>().GetConnectionString("Financas")));

builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Os padrões web aceitam números como string ("10"); desligar deixa o OpenAPI (e os tipos TS) com number puro.
    options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
    // Campos obrigatórios do construtor do record (ex.: Tipo) passam a ser exigidos no JSON,
    // em vez de assumirem o valor padrão silenciosamente.
    options.SerializerOptions.RespectRequiredConstructorParameters = true;
    options.SerializerOptions.RespectNullableAnnotations = true;
});

builder.Services.AddValidation();
builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = ProblemDetailsConfig.Personalizar);
builder.Services.AddOpenApi();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
    policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Exceções e respostas de erro sem corpo (404, 405...) também saem como ProblemDetails.
app.UseExceptionHandler(new ExceptionHandlerOptions { StatusCodeSelector = ProblemDetailsConfig.StatusCode });
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.UseCors();
    app.MapOpenApi();                 // /openapi/v1.json
    app.MapScalarApiReference();      // /scalar

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    SeedDesenvolvimento.Executar(db);
}

app.MapGet("/", () => TypedResults.Redirect("/scalar")).ExcludeFromDescription();

app.MapCategoriasEndpoints();
app.MapContasEndpoints();
app.MapTransacoesEndpoints();
app.MapOrcamentosEndpoints();
app.MapDashboardEndpoints();

app.Run();
