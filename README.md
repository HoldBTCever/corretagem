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
| Aluguel | 50% do valor equivalente a um aluguel, **por lado** |

No aluguel, dono e inquilino pagam 50% de um aluguel cada um. Quando o
corretor atende os dois, a caixa "sou o corretor dos dois lados" dobra a
comissão do negócio (100% de um aluguel). A opção só aparece no aluguel —
numa venda a comissão sai inteira do valor da compra.

Dela saem os repasses, em cascata — cada um incidindo sobre o saldo que
sobrou do anterior:

| Etapa | Taxa | Incide sobre |
|---|---|---|
| Century 21 Nacional | 50% | a comissão do negócio |
| Century 21 Black | 10% | o saldo que sobrou |
| **Corretor** | **45% da comissão** | — |

## Cotações

As cotações vêm do [Brascambio](https://brascambio.com.py) (filial Matriz) e
não são editáveis na página. O site publica duas taxas:

| Publicado | Exemplo |
|---|---|
| Gs por 1 Real (transferência) | 1.100 |
| Reais por 1 Dólar | 5,24 |

O guarani por dólar não é publicado: sai da composição das duas
(`1.100 × 5,24 = 5.764`).

O navegador não pode buscar o Brascambio direto — é outro domínio e não há
CORS liberado. Quem busca é `scripts/atualizar-cotacoes.mjs`, rodado pelo
GitHub Actions a cada publicação (e três vezes por dia útil, pelo
agendamento em `.github/workflows/pages.yml`); o resultado vai para
`cotacoes.json`, que a página lê do mesmo endereço. Se a leitura falhar, a
publicação continua com o `cotacoes.json` que está no repositório e a página
mostra a data daquela leitura.

## Idiomas

A página abre em **espanhol** e tem botões para **português** e **inglês** no
cabeçalho. A escolha fica guardada no navegador. Os textos estão todos no
objeto `TEXTOS`, dentro do próprio `index.html`.

## Como publicar

É um arquivo estático, sem build e sem dependências: o GitHub Pages serve
`index.html` direto da branch `main`. Editar o arquivo e dar push atualiza
a página no ar.

## Origem

Versão avulsa da página `/admin/corretagem` do app Imóveis Assunção, para
consulta rápida fora do sistema. A conta acontece toda no navegador: o
valor do negócio digitado não é enviado nem guardado em servidor nenhum.
