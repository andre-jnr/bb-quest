// Converte uma prova oficial extraída do PDF para o formato do BB Quest.
//
// Uso (na pasta App):  node tools/converter-prova.js <ano>
//   lê     data/fontes/prova_<ano>.json         (extração do PDF)
//          data/fontes/explicacoes-<ano>.json   (opcional; explicações por número da questão)
//          tools/provas/<ano>.js                (correções específicas daquela prova)
//   gera   data/prova-<ano>.js
//
// O arquivo de correções exporta ({ prova }) => ({ ASSUNTO, APOIO, FIX, depois? }):
//   ASSUNTO  número → assunto            APOIO  número → texto de apoio (markdown)
//   FIX      número → (q) => {…}         depois (q) => {…}, aplicado a todas as questões no fim
const fs = require('fs');
const path = require('path');
const { DISC, umaLinha } = require('./lib/prova-utils');

const ano = process.argv[2];
if (!/^\d{4}$/.test(ano || '')) { console.error('Uso: node tools/converter-prova.js <ano>'); process.exit(1); }
const raiz = path.join(__dirname, '..');
const entrada = path.join(raiz, 'data', 'fontes', `prova_${ano}.json`);
const arqExp = path.join(raiz, 'data', 'fontes', `explicacoes-${ano}.json`);
const saida = path.join(raiz, 'data', `prova-${ano}.js`);

const prova = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const EXPLICACOES = fs.existsSync(arqExp) ? JSON.parse(fs.readFileSync(arqExp, 'utf8')) : {};
const { ASSUNTO, APOIO = {}, FIX = {}, depois } = require(`./provas/${ano}.js`)({ prova });

const questoes = prova.map((p) => {
  const n = p.numero;
  const q = {
    id: `bb${ano}-q${String(n).padStart(2, '0')}`,
    disciplina: DISC[p.disciplina.toLowerCase()] || p.disciplina,
    assunto: ASSUNTO[n],
    fonte: `Prova BB ${ano} · Cesgranrio · Questão ${n}`,
    ano: +ano, numero: n, paginas_pdf: p.paginas_pdf,
    enunciado: p.enunciado.includes('\n') ? p.enunciado : umaLinha(p.enunciado),
    alternativas: { ...p.alternativas },
    correta: String(p.gabarito).toUpperCase(),
    tags: [`prova-${ano}`, 'cesgranrio', 'oficial']
  };
  if (FIX[n]) FIX[n](q);
  const ex = EXPLICACOES[n];
  if (ex) {
    const erradas = 'ABCDE'.split('').filter((L) => L !== q.correta);
    const faltam = erradas.filter((L) => !ex.alternativas || !ex.alternativas[L]);
    if (!ex.correta || faltam.length || (ex.alternativas && ex.alternativas[q.correta])) {
      throw new Error(`explicações da questão ${n} inconsistentes com o gabarito ${q.correta}`);
    }
    q.explicacaoCorreta = ex.correta;
    q.explicacaoAlternativas = ex.alternativas;
  }
  if (depois) depois(q);
  if (APOIO[n]) q.textoApoio = APOIO[n];
  delete q.paginas_pdf; q.paginasPdf = p.paginas_pdf;
  return q;
});

// Checagens
const ids = new Set(questoes.map((q) => q.id));
if (ids.size !== questoes.length) throw new Error('ids duplicados');
questoes.forEach((q) => {
  if (!/^[A-E]$/.test(q.correta)) throw new Error(q.id + ' gabarito inválido');
  if (Object.keys(q.alternativas).join('') !== 'ABCDE') throw new Error(q.id + ' alternativas');
  if (!q.assunto) throw new Error(q.id + ' sem assunto');
});
const nExp = questoes.filter((q) => q.explicacaoCorreta).length;

const cab = `/* Prova oficial do Banco do Brasil ${ano} — Agente de Tecnologia (Cesgranrio).
   ${questoes.length} questões com gabarito, convertidas de data/fontes/prova_${ano}.json (extraído do PDF).
   Gerado por tools/converter-prova.js — não edite à mão.
   Explicações (${nExp} questões) vêm de data/fontes/explicacoes-${ano}.json.
   O conteúdo entre os colchetes é JSON puro. */
`;
// "<\/" no lugar de "</" mantém o mesmo texto e evita que um "</script>" dentro de uma questão
// (ex.: código HTML) feche a tag caso o arquivo seja embutido numa página.
const json = JSON.stringify(questoes, null, 2).replace(/<\//g, '<\\/');
fs.writeFileSync(saida, cab + 'window.BBQ_QUESTOES = (window.BBQ_QUESTOES || []).concat(' + json + ');\n');
console.log(`ok ${questoes.length} questões (${nExp} com explicação) → data/prova-${ano}.js`);
