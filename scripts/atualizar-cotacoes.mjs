// Lê as cotações publicadas pelo Brascambio e grava cotacoes.json.
//
// A página é estática (GitHub Pages) e o navegador não consegue buscar
// brascambio.com.py direto — outro domínio, sem CORS liberado. Então quem
// busca é este script, rodado pelo GitHub Actions, que comita o resultado
// no próprio repositório; a página lê esse arquivo, que é do mesmo domínio.
//
// O site publica, por filial (só existe a Matriz):
//   Gs por 1 Real   -> Transferência / Retirada & delivery
//   Reais por 1 Dólar
// Daí saem as duas taxas que a calculadora usa: reais por dólar (direto) e
// guaranis por dólar (Gs por real × reais por dólar).

const FONTE = "https://brascambio.com.py";
const DESTINO = new URL("../cotacoes.json", import.meta.url);

// "1.100" são mil e cem; "5,24" são cinco e vinte e quatro centavos.
function lerNumero(texto) {
  const limpo = texto.trim();
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo.replace(/\./g, "");
  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero <= 0) {
    throw new Error(`não consegui ler o número "${texto}"`);
  }
  return numero;
}

function semTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

// Depois de um rótulo, o primeiro texto que parece um número é o valor dele.
function valorApos(linhas, rotulo) {
  const inicio = linhas.findIndex((l) => l === rotulo);
  if (inicio === -1) throw new Error(`não achei o rótulo "${rotulo}" na página`);
  for (const linha of linhas.slice(inicio + 1, inicio + 6)) {
    if (/^[\d.,]+$/.test(linha)) return lerNumero(linha);
  }
  throw new Error(`achei "${rotulo}" mas nenhum número logo depois`);
}

export function extrairCotacoes(html) {
  const linhas = semTags(html)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const inicio = linhas.findIndex((l) => /^Cota[çc][õo]es do dia$/.test(l));
  if (inicio === -1) throw new Error('não achei o bloco "Cotações do dia"');
  const bloco = linhas.slice(inicio, inicio + 40);

  const gsPorRealTransferencia = valorApos(bloco, "Transferência");
  const gsPorRealRetirada = valorApos(bloco, "Retirada & delivery");
  const reaisPorDolar = valorApos(bloco, "Reais por 1 Dólar");

  const carimbo = bloco.find((l) => /Cota[çc][õo]es da filial/.test(l)) ?? "";
  const publicadoEm = carimbo.split("·").pop()?.trim() ?? null;

  const cotacoes = {
    fonte: FONTE,
    filial: "Matriz",
    publicadoEm, // como o Brascambio mostra: "15/09 09:27"
    lidoEm: new Date().toISOString(),
    gsPorReal: {
      transferencia: gsPorRealTransferencia,
      retiradaEDelivery: gsPorRealRetirada,
    },
    reaisPorDolar,
    // O que a calculadora consome. O guarani por dólar não é publicado: sai
    // da composição das duas taxas acima, pela cotação de transferência.
    usdToBrl: reaisPorDolar,
    usdToPyg: Number(
      (gsPorRealTransferencia * reaisPorDolar).toFixed(2),
    ),
  };

  // Faixas largas de sanidade: só para não publicar lixo se a página mudar
  // de formato e algum número for lido de outro lugar.
  const dentroDaFaixa = (valor, min, max) => valor >= min && valor <= max;
  if (!dentroDaFaixa(cotacoes.reaisPorDolar, 1, 50)) {
    throw new Error(`reais por dólar fora da faixa: ${cotacoes.reaisPorDolar}`);
  }
  if (!dentroDaFaixa(cotacoes.gsPorReal.transferencia, 100, 10000)) {
    throw new Error(
      `guaranis por real fora da faixa: ${cotacoes.gsPorReal.transferencia}`,
    );
  }

  return cotacoes;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const resposta = await fetch(FONTE, {
    headers: { "user-agent": "corretagem-pages/1.0 (+github actions)" },
  });
  if (!resposta.ok) {
    throw new Error(`${FONTE} respondeu ${resposta.status}`);
  }
  const cotacoes = extrairCotacoes(await resposta.text());
  const { writeFile } = await import("node:fs/promises");
  await writeFile(DESTINO, JSON.stringify(cotacoes, null, 2) + "\n");
  console.log(JSON.stringify(cotacoes, null, 2));
}
