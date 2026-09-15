# Corretagem

Calculadora de corretagem imobiliária, em um único arquivo HTML: informe o
valor do negócio e veja quanto sobra para o corretor depois dos repasses,
em dólar, guarani e real.

**Página no ar:** https://holdbtcever.github.io/corretagem/

## Como a conta é feita

A comissão do negócio é a que o cliente aceita no cadastro:

| Tipo de negócio | Comissão |
|---|---|
| Venda | 2,75% sobre o valor total da compra |
| Aluguel | 50% do valor equivalente a um aluguel |

Dela saem os repasses, em cascata — cada um incidindo sobre o saldo que
sobrou do anterior:

| Etapa | Taxa | Incide sobre |
|---|---|---|
| Century 21 Nacional | 50% | a comissão do negócio |
| Century 21 Black | 10% | o saldo que sobrou |
| **Corretor** | **45% da comissão** | — |

As cotações usadas para converter entre as três moedas são editáveis na
própria página e ficam guardadas no navegador de quem a abre.

## Como publicar

É um arquivo estático, sem build e sem dependências: o GitHub Pages serve
`index.html` direto da branch `main`. Editar o arquivo e dar push atualiza
a página no ar.

## Origem

Versão avulsa da página `/admin/corretagem` do app Imóveis Assunção, para
consulta rápida fora do sistema. A conta acontece toda no navegador: o
valor do negócio digitado não é enviado nem guardado em servidor nenhum.
