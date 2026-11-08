// Utilitários compartilhados pelos arquivos de correção de cada prova (tools/provas/<ano>.js).

/* ---------- Nomes de disciplina padronizados (iguais aos de PESOS_EDITAL em js/app.js) ---------- */
const DISC = {
  'língua portuguesa': 'Língua Portuguesa', 'língua inglesa': 'Língua Inglesa', 'matemática': 'Matemática',
  'atualidades do mercado financeiro': 'Atualidades do Mercado Financeiro',
  'probabilidade e estatística': 'Probabilidade e Estatística',
  'conhecimentos bancários': 'Conhecimentos Bancários', 'tecnologia da informação': 'Tecnologia da Informação'
};

const umaLinha = (s) => String(s).replace(/\s+/g, ' ').trim();
const bloco = (code, lang = '') => '```' + lang + '\n' + code.trim() + '\n```';
const inline = (code) => '`' + code + '`';
// Aspas tipográficas (“ ” ‘ ’) quebram código; troca pelas aspas retas
const aspasRetas = (s) => String(s).replace(/[“”„]/g, '"').replace(/[‘’]/g, "'");

// Indentação de Java/TS/Kotlin a partir das chaves (o PDF perdeu a indentação)
function indentar(src) {
  const out = []; let depth = 0, extra = 0; const ifs = [];
  src.split('\n').map((l) => l.trim()).forEach((l) => {
    if (!l) { out.push(''); return; }
    if (l.startsWith('}')) depth--;
    const lvl = /^else\b/.test(l) && ifs.length ? ifs.pop() : depth + extra;
    out.push('  '.repeat(Math.max(0, lvl)) + l);
    const abre = (l.match(/{/g) || []).length, fecha = (l.match(/}/g) || []).length - (l.startsWith('}') ? 1 : 0);
    depth += abre - fecha;
    const controle = /^(if|for|while|else)\b/.test(l) && !/[{;]\s*$/.test(l);
    if (controle) { if (/^if\b/.test(l)) ifs.push(lvl); extra = lvl - depth + 1; }
    else if (/[;{}]\s*$/.test(l)) extra = 0;
  });
  return out.join('\n');
}

// Texto de apoio: título, parágrafos numerados, subtítulos (•) e fonte em linhas separadas
function formatarTexto(t, { autor, fonte, subtitulos = false }) {
  t = umaLinha(t);
  const i1 = t.search(/\s1\s/);
  let titulo = t.slice(0, i1).trim(), corpo = t.slice(i1 + 1);
  let credito = '';
  const iF = corpo.indexOf(fonte);
  if (iF > 0) { credito = corpo.slice(iF).trim(); corpo = corpo.slice(0, iF).trim(); }
  let sub = '';
  if (autor && titulo.includes(autor)) { sub = titulo.slice(titulo.indexOf(autor)).trim(); titulo = titulo.slice(0, titulo.indexOf(autor)).trim(); }
  const pars = []; let pos = 0;
  for (let n = 2; ; n++) {
    const re = new RegExp('\\s' + n + '\\s(?=[A-ZÀ-Ý“"‘])', 'g'); re.lastIndex = pos + 1;
    const m = re.exec(corpo); if (!m) break;
    pars.push(corpo.slice(pos, m.index).trim()); pos = m.index + 1;
  }
  pars.push(corpo.slice(pos).trim());
  // Subtítulos no formato "• Título" ficam no fim do parágrafo anterior: separa em linha própria
  const blocos = [];
  pars.forEach((p) => {
    const partes = subtitulos ? p.split(/\s•\s/) : [p];
    blocos.push(partes[0].replace(/^(\d+)\s/, '**$1** '));
    partes.slice(1).forEach((s) => blocos.push(`**• ${s.trim()}**`));
  });
  return [`**${titulo}**` + (sub ? `\n_${sub}_` : ''), ...blocos, credito && `_${credito}_`].filter(Boolean).join('\n\n');
}

// Destaca (negrito) a n-ésima ocorrência; falha se não encontrar, para a correção não sumir em silêncio
function negrito(texto, alvo, n = 1) {
  let i = -1; for (let k = 0; k < n; k++) { i = texto.indexOf(alvo, i + 1); if (i < 0) throw new Error('não achei: ' + alvo); }
  return texto.slice(0, i) + '**' + alvo + '**' + texto.slice(i + alvo.length);
}
// Substituição que falha se o trecho não existir
function trocar(texto, de, para) {
  if (!texto.includes(de)) throw new Error('trecho não encontrado: ' + de.slice(0, 60));
  return texto.replace(de, para);
}

// Garante que uma reformatação manual de código só mudou espaços e quebras de linha
// (as aspas tipográficas são normalizadas antes da comparação). Devolve o código novo.
function mesmoCodigo(original, novo) {
  const n = (s) => aspasRetas(s).replace(/\s+/g, '');
  if (n(original) !== n(novo)) throw new Error('a reformatação alterou o código:\n  antes: ' + n(original) + '\n  depois: ' + n(novo));
  return novo;
}
// Trecho entre dois marcadores (inclui o inicial, exclui o final); falha se não achar
function cortar(texto, ini, fim) {
  const i = texto.indexOf(ini); if (i < 0) throw new Error('marcador não encontrado: ' + ini);
  const j = fim ? texto.indexOf(fim, i + ini.length) : texto.length; if (j < 0) throw new Error('marcador não encontrado: ' + fim);
  return texto.slice(i, j);
}

/* ---------- Avisos exibidos acima do enunciado ---------- */
const AV_DESTAQUE = 'Os destaques em negrito foram reconstruídos a partir das alternativas (na prova, as palavras aparecem em destaque gráfico).';
const AV_FIGURA = (p) => `Esta questão depende de uma figura da prova original (PDF, pág. ${p}) que não pôde ser extraída. Consulte a prova para resolvê-la.`;
const AV_ALTS_IMAGEM = (oque, p) => `As alternativas desta questão são ${oque} e não puderam ser extraídas (PDF, pág. ${p}).`;
const altImagem = (p) => `_(alternativa em imagem — ver PDF, pág. ${p})_`;
const pags = (q) => q.paginas_pdf.join('–');

module.exports = {
  DISC, umaLinha, bloco, inline, aspasRetas, indentar, formatarTexto, negrito, trocar, mesmoCodigo, cortar,
  AV_DESTAQUE, AV_FIGURA, AV_ALTS_IMAGEM, altImagem, pags
};
