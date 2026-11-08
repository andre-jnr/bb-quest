// Converte data/fontes/prova_2023.json (extração do PDF) para data/prova-2023.js no formato do BB Quest.
// Uso (na pasta App): node tools/converter-prova-2023.js data/fontes/prova_2023.json data/prova-2023.js
const fs = require('fs');
const [entrada, saida] = process.argv.slice(2);
const prova = JSON.parse(fs.readFileSync(entrada, 'utf8'));

/* ---------- Nomes de disciplina padronizados (iguais aos de PESOS_EDITAL) ---------- */
const DISC = {
  'língua portuguesa': 'Língua Portuguesa', 'língua inglesa': 'Língua Inglesa', 'matemática': 'Matemática',
  'atualidades do mercado financeiro': 'Atualidades do Mercado Financeiro',
  'probabilidade e estatística': 'Probabilidade e Estatística',
  'conhecimentos bancários': 'Conhecimentos Bancários', 'tecnologia da informação': 'Tecnologia da Informação'
};

/* ---------- Assunto de cada questão (classificação manual pelo enunciado) ---------- */
const CD = 'Ciência de Dados e Aprendizado de Máquina', MOB = 'Desenvolvimento Mobile', ED = 'Estruturas de Dados e Algoritmos';
const ASSUNTO = {
  1: 'Interpretação de texto', 2: 'Interpretação de texto', 3: 'Vocabulário e sinonímia', 4: 'Conectivos e sentido',
  5: 'Vocabulário e sinonímia', 6: 'Concordância nominal', 7: 'Coesão referencial', 8: 'Crase', 9: 'Pontuação',
  10: 'Colocação pronominal',
  11: 'Compreensão de texto', 12: 'Referência pronominal', 13: 'Compreensão de texto', 14: 'Conectivos', 15: 'Compreensão de texto',
  16: 'Raciocínio lógico', 17: 'Função quadrática', 18: 'Progressão aritmética', 19: 'Sistemas lineares', 20: 'Razão e proporção',
  21: 'Bancos digitais', 22: 'Shadow banking', 23: 'Crises financeiras e liquidez', 24: 'Economia digital e plataformas', 25: 'Blockchain',
  26: 'Distribuição normal', 27: 'Distribuição amostral', 28: 'Probabilidade', 29: 'Medidas de posição', 30: 'Probabilidade condicional',
  31: 'Taxa de juros real', 32: 'Mercado de câmbio', 33: 'Paridade de juros', 34: 'Finanças públicas', 35: 'Sigilo bancário (LC 105/2001)',
  36: CD, 37: MOB, 38: 'Java', 39: CD, 40: 'TypeScript', 41: CD, 42: CD, 43: 'Big Data', 44: CD, 45: 'Python – Pandas',
  46: MOB, 47: MOB, 48: MOB, 49: 'DevOps – Ansible', 50: MOB, 51: 'Python – NumPy', 52: 'Banco de Dados – NoSQL',
  53: 'Banco de Dados – SQL', 54: 'Banco de Dados – Conceitos', 55: 'Banco de Dados – SQL', 56: 'Banco de Dados – SQL',
  57: 'Banco de Dados – Conceitos', 58: 'Banco de Dados – SQL', 59: 'Banco de Dados – NoSQL', 60: 'TypeScript',
  61: 'Python – NumPy', 62: CD, 63: ED, 64: 'Java', 65: 'Java', 66: ED, 67: ED,
  68: 'Banco de Dados – Modelagem E-R', 69: 'Banco de Dados – Modelagem E-R', 70: 'Java'
};

/* ---------- Utilitários ---------- */
const umaLinha = (s) => String(s).replace(/\s+/g, ' ').trim();
const bloco = (code, lang = '') => '```' + lang + '\n' + code.trim() + '\n```';
// Indentação de Java/TS a partir das chaves (o PDF perdeu a indentação)
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
// Texto de apoio: título, parágrafos numerados e fonte em linhas separadas
function formatarTexto(t, { autor, fonte }) {
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
  return [`**${titulo}**` + (sub ? `\n_${sub}_` : ''), ...pars.map((p) => p.replace(/^(\d+)\s/, '**$1** ')), credito && `_${credito}_`]
    .filter(Boolean).join('\n\n');
}
function negrito(texto, alvo, n = 1) { // destaca a n-ésima ocorrência
  let i = -1; for (let k = 0; k < n; k++) { i = texto.indexOf(alvo, i + 1); if (i < 0) throw new Error('não achei: ' + alvo); }
  return texto.slice(0, i) + '**' + alvo + '**' + texto.slice(i + alvo.length);
}
const pareceCodigo = (t) => /^(SELECT|CREATE TABLE|class |public |model =|ff =|let |S=\{)/.test(t.trim());

/* ---------- Textos de apoio ---------- */
const TEXTO_PT = formatarTexto(prova[0].texto_de_apoio, { fonte: 'MENDES, T.' });
const TEXTO_EN = formatarTexto(prova[10].texto_de_apoio, { autor: 'By Rich Beattie', fonte: 'Available at:' });
const QUADRO_NORMAL = '**Dado** — considere que:\n\n• a variável aleatória Z tem distribuição normal padrão (Z ~ N(0;1));\n• Prob (Z > 1,64) = 5%; e\n• Prob (Z > 1,96) = 2,5%.';
const APOIO = { 1: TEXTO_PT, 2: TEXTO_PT, 3: TEXTO_PT, 4: TEXTO_PT, 5: TEXTO_PT, 7: TEXTO_PT,
  11: TEXTO_EN, 12: TEXTO_EN, 13: TEXTO_EN, 14: TEXTO_EN, 15: TEXTO_EN, 26: QUADRO_NORMAL }; // o quadro "Dado" é da Q26 (a extração o colou na Q27)

/* ---------- Avisos exibidos na questão ---------- */
const AV_DESTAQUE = 'Os destaques em negrito foram reconstruídos a partir das alternativas (na prova, as palavras aparecem em destaque gráfico).';
const AV_FIGURA = (p) => `Esta questão depende de uma figura da prova original (PDF, pág. ${p}) que não pôde ser extraída. Consulte a prova para resolvê-la.`;
const AV_VAZIA = 'Nota de digitalização: no texto extraído aparecia `" "` (com espaço); foi ajustado para `""` (string vazia), que é o que torna o gabarito oficial consistente.';

/* ---------- Enunciados/alternativas reconstruídos (o PDF perdeu quebras de linha) ---------- */
const FIX = {
  3: (q) => { q.enunciado = negrito(q.enunciado, 'alavancar'); q.aviso = AV_DESTAQUE; },
  4: (q) => { q.enunciado = negrito(q.enunciado, 'Ainda que'); q.aviso = AV_DESTAQUE; },
  5: (q) => { q.enunciado = negrito(q.enunciado, 'concepção'); q.aviso = AV_DESTAQUE; },
  6: (q) => { const p = { A: 'envolvidos', B: 'necessárias', C: 'comemoradas', D: 'desejadas', E: 'implementados' };
    for (const L in p) q.alternativas[L] = negrito(q.alternativas[L], p[L]); q.aviso = AV_DESTAQUE; },
  7: (q) => { q.enunciado = negrito(q.enunciado, 'seu'); q.aviso = AV_DESTAQUE; },
  8: (q) => { const p = { B: 'a vaga', C: 'a todo custo', D: 'a gestores', E: 'a uma nova' };
    for (const L in p) q.alternativas[L] = q.alternativas[L].replace(p[L], '**a**' + p[L].slice(1));
    q.aviso = AV_DESTAQUE + ' Na alternativa A, o "a" destacado não pôde ser identificado com certeza (nenhum dos candidatos leva crase).'; },
  10: (q) => { const p = { A: 'encontra-se', B: 'destina-se', C: 'preocupam-se', D: 'tornar-se', E: 'sentem-se' };
    for (const L in p) q.alternativas[L] = q.alternativas[L].replace(p[L], p[L].replace('-se', '-**se**')); q.aviso = AV_DESTAQUE; },
  12: (q) => { q.enunciado = negrito(negrito(q.enunciado, 'who'), 'which'); q.aviso = AV_DESTAQUE; },
  14: (q) => { q.enunciado = negrito(q.enunciado, 'though'); q.aviso = AV_DESTAQUE; },
  16: (q) => { q.enunciado = umaLinha(q.enunciado).replace(/\s(I{1,3}V?|IV)\)\s/g, '\n\n$1) ').replace(' Nessas circunstâncias', '\n\nNessas circunstâncias'); },
  35: (q) => { q.enunciado = q.enunciado.replace('Complementar no 105', 'Complementar nº 105'); },
  36: (q) => { q.enunciado = 'Analise o código a seguir, feito em Python com o Scikit-learn.\n\n' + bloco(
    "import numpy as np\nimport sklearn.linear_model as skl\n\nbase = np.array([1, 2, 3, 4, 5, 6])\nx = base.reshape((-1, 1))\ny = base*2+3\n# a fazer\nprint('a', model.coef_[0])\nprint('b', model.intercept_)", 'python')
    + '\n\nA partir desse código, um programador quer obter os parâmetros a e b da equação y = ax + b, por meio de uma regressão linear, usando, para isso, os dados nos vetores x e y definidos no programa. Qual linha de código deve substituir o comentário `# a fazer` de modo a realizar essa regressão linear?'; },
  37: (q) => { q.enunciado = 'Em um programa em Swift, o programador deseja incluir o resultado de uma operação dentro de uma string. Nesse contexto, considere o seguinte código:\n\n'
    + bloco('let quantidade = 4\nlet valor = 10', 'swift') + '\n\nDado o código acima, o programador deseja uma string `saida` cujo valor seja "valor total = 40". Para isso, o programador deve utilizar o seguinte fragmento de código Swift:'; },
  40: (q) => { q.enunciado = 'Analise com atenção o código a seguir, escrito em TypeScript 4.0.\n\n'
    + bloco('function segredo(a: number[]) {\n  return a.map(x=>x*2);\n}\nconsole.log(segredo([1,2,3]));', 'typescript') + '\n\nO que será exibido no console quando o código acima for executado?'; },
  45: (q) => { q.enunciado = 'Ao programar em Python com Pandas, é possível usar máscaras para selecionar linhas específicas, de acordo com um padrão. Nesse cenário, analise o seguinte código:\n\n'
    + bloco("import pandas as pd\n\ndata = {'x':[1,2,3], 'y':[3, 7, 11], 'z': [False, True, False]}\ndf = pd.DataFrame(data)\nm = df['z'] == False\nef = df[m]\n# a fazer\nprint(ff)", 'python')
    + '\n\nAo executar esse código, deseja-se obter a seguinte saída:\n\n' + bloco('   x   y\n0  1   3\n2  3  11')
    + '\n\nO fragmento de código que deve substituir o comentário `# a fazer` para obter a saída desejada é'; },
  51: (q) => { q.enunciado = 'A seguir, é apresentado um fragmento de código em Python.\n\n'
    + bloco('import numpy as np\n\nb = np.array([[1,2,3,5]])\nc = b.transpose()\nprint(b.dot(c),sum(b),sum(c))', 'python') + '\n\nO fragmento de código acima provoca a seguinte saída:'; },
  53: (q) => { q.enunciado = 'Uma empresa de investimentos financeiros busca identificar novas oportunidades de negócio para pessoas jurídicas, em especial dentre aquelas que têm como característica a adoção de governança ambiental, social e corporativa (conhecida como ESG, uma sigla em inglês). Considere que existe um banco de dados nessa empresa com as seguintes tabelas (todas as chaves primárias são numéricas):\n\n'
    + bloco('Empresa (CNPJ, razaoSocial, endereco)\nCaracteristica (cod, sigla, nome)\nTem (CNPJ, cod)') + '\n\nQue comando SELECT do SQL retorna apenas o CNPJ e a razão social das empresas que não têm "ESG" como característica?'; },
  55: (q) => { q.enunciado = 'O banco de dados de uma empresa que comercializa seguros pessoais possui as seguintes tabelas:\n\n'
    + bloco('Pessoa (email, nome, unidadeFederativaNascimento, faixaEtaria)\nUF (sigla, nome)\nFaixa (nome, menorIdade, maiorIdade)')
    + '\n\nA coluna `unidadeFederativaNascimento` da tabela Pessoa é uma chave estrangeira que referencia a coluna `sigla` da tabela UF; a coluna `faixaEtaria` da tabela Pessoa é uma chave estrangeira que aponta para a coluna `nome` da tabela Faixa. A tabela Faixa possui os seguintes dados:\n\n'
    + bloco('nome     | menorIdade      | maiorIdade\n---------+-----------------+----------------\nJovens   | (não informada) | 19\nAdultos  | 20              | 59\nIdosos   | 60              | (não informada)')
    + '\n\nConsidere o seguinte comando:\n\n' + bloco("SELECT COUNT(*)\nFROM Pessoa P, Faixa F\nWHERE P.faixaEtaria = F.nome\n  AND P.unidadeFederativaNascimento = 'RJ'\n  AND F.maiorIdade <= 19", 'sql') + '\n\nEsse comando SQL'; },
  56: (q) => { q.enunciado = 'O banco de dados de uma empresa de investimentos financeiros possui as seguintes tabelas:\n\n'
    + bloco('Empresa (CNPJ, razaoSocial, endereco)\nUF (sigla, nome)') + '\n\nO que o comando SQL `SELECT CNPJ, sigla FROM Empresa, UF` recupera desse banco de dados?'; },
  58: (q) => { q.enunciado = q.enunciado.replace(/ com as seguintes tabelas: Empresa \(CNPJ, razaoSocial, endereco, atividade\) CNAE \(codigo, descricao\) /,
      ' com as seguintes tabelas:\n\n' + bloco('Empresa (CNPJ, razaoSocial, endereco, atividade)\nCNAE (codigo, descricao)') + '\n\n'); },
  60: (q) => { q.enunciado = 'O código abaixo está em linguagem TypeScrip, cuja tipagem é estática.\n\n' + bloco("let fraseLegal = 'Bom dia!';\nfraseLegal = 9.5;", 'typescript')
    + '\n\nAnalisando o código apresentado, tem-se que a TypeScrip'; },
  61: (q) => { q.enunciado = q.enunciado.replace(" escreveu-se o comando abaixo: dataset['sentimento'] = np.where(dataset['stars'] >= 4, 'bom', 'ruim') ",
      ' escreveu-se o comando abaixo:\n\n' + bloco("dataset['sentimento'] = np.where(dataset['stars'] >= 4, 'bom', 'ruim')", 'python') + '\n\n'); },
  63: (q) => { const t = umaLinha(q.enunciado); q.enunciado = t.slice(0, t.indexOf('public class Main')).trim() + '\n\n'
    + bloco('public class Main {\n  public static void main(String[] args) {\n    int lista[]={5,18,27,33,44,49,54,67,69,72,79,86,87,92};\n    // o array lista possui 14 elementos\n    busca(78, lista);\n  }\n  public static int busca(int val,int lista[]) {\n    // código relativo ao algoritmo de busca binária\n  }\n}', 'java')
    + '\n\nO que será exibido no console quando o método main for executado?'; },
  64: (q) => { const t = q.enunciado; const ini = t.indexOf('public class'), fim = t.lastIndexOf('O que será exibido');
    q.enunciado = t.slice(0, ini).trim() + '\n\n' + bloco(indentar(t.slice(ini, fim)).replace(/\n(public class)/g, '\n\n$1'), 'java') + '\n\n' + t.slice(fim).trim(); },
  65: (q) => { const t = q.enunciado.replace('new Qb("a"," ","c")', 'new Qb("a","","c")').replace(/“\*\*\*Erro\*\*\*“/, '"***Erro***"');
    const ini = t.indexOf('public class'), fim = t.lastIndexOf('O que será exibido');
    q.enunciado = t.slice(0, ini).trim() + '\n\n' + bloco(indentar(t.slice(ini, fim)).replace(/\n(public class)/g, '\n\n$1'), 'java') + '\n\n' + t.slice(fim).trim();
    q.aviso = AV_VAZIA; },
  66: (q) => { q.enunciado = q.enunciado.replace(/\n(?!\d\.)/g, ' ').replace(/ (\d\. )/g, '\n$1').replace(/\s+O que será exibido/, '\n\nO que será exibido').replace(/ +/g, ' ');
    q.aviso = AV_FIGURA(q.paginas_pdf.join('–')); q.incompleta = true; },
  67: (q) => { q.enunciado = umaLinha(q.enunciado).replace(' console: 80 84 55 76 72 ', ' console:\n\n' + bloco('80 84 55 76 72') + '\n\n');
    for (const L in q.alternativas) q.alternativas[L] = `_(alternativa em imagem — ver PDF, pág. ${q.paginas_pdf.join('–')})_`;
    q.aviso = `As alternativas desta questão são desenhos de árvores binárias e não puderam ser extraídas (PDF, pág. ${q.paginas_pdf.join('–')}).`; q.incompleta = true; },
  68: (q) => { q.enunciado = q.enunciado.replace(/\n(?!ET1=|XT2=)/g, ' ').replace(/ ?(ET1=\{[^}]*\})\s*(XT2=\{[^}]*\})\s*/, '\n\n' + bloco('$1\n$2') + '\n\n');
    q.aviso = AV_FIGURA(q.paginas_pdf.join('–')); q.incompleta = true; },
  69: (q) => { const t = q.enunciado; const ini = t.indexOf('CREATE TABLE'), fim = t.lastIndexOf('Qual transformação');
    q.enunciado = umaLinha(t.slice(0, ini)) + '\n\n' + bloco(t.slice(ini, fim).trim().replace(/\n(CREATE TABLE)/g, '\n\n$1'), 'sql') + '\n\n' + umaLinha(t.slice(fim));
    q.aviso = AV_FIGURA(q.paginas_pdf.join('–')) + ' O texto extraído do CREATE TABLE também tem linhas incompletas.'; q.incompleta = true; },
  70: (q) => { q.enunciado = q.enunciado.replace(/\n(?!Exemplo|String)/g, ' ').replace(/\n/g, '\n\n').replace(/ +/g, ' ').replace(/\s*Qual método/, '\n\nQual método');
    for (const L in q.alternativas) q.alternativas[L] = q.alternativas[L].replace('String r=" ";', 'String r="";');
    q.aviso = AV_VAZIA; }
};

/* ---------- Conversão ---------- */
const saidaQs = prova.map((p) => {
  const n = p.numero;
  const q = {
    id: `bb2023-q${String(n).padStart(2, '0')}`,
    disciplina: DISC[p.disciplina.toLowerCase()] || p.disciplina,
    assunto: ASSUNTO[n],
    fonte: `Prova BB 2023 · Cesgranrio · Questão ${n}`,
    ano: 2023, numero: n, paginas_pdf: p.paginas_pdf,
    enunciado: p.enunciado.includes('\n') ? p.enunciado : umaLinha(p.enunciado),
    alternativas: { ...p.alternativas },
    correta: String(p.gabarito).toUpperCase(),
    tags: ['prova-2023', 'cesgranrio', 'oficial']
  };
  if (FIX[n]) FIX[n](q);
  // alternativas de código: fonte monoespaçada (várias linhas → bloco; uma linha → inline)
  for (const L in q.alternativas) {
    const a = q.alternativas[L];
    if (q.disciplina === 'Tecnologia da Informação' && pareceCodigo(a)) {
      q.alternativas[L] = a.includes('\n') ? bloco(/^public|^class/.test(a.trim()) ? indentar(a) : a, /^CREATE|^SELECT/.test(a.trim()) ? 'sql' : 'java') : '`' + a + '`';
    }
  }
  if (APOIO[n]) q.textoApoio = APOIO[n];
  delete q.paginas_pdf; q.paginasPdf = p.paginas_pdf;
  return q;
});

// Checagens
const ids = new Set(saidaQs.map((q) => q.id));
if (ids.size !== 70) throw new Error('ids duplicados');
saidaQs.forEach((q) => {
  if (!/^[A-E]$/.test(q.correta)) throw new Error(q.id + ' gabarito inválido');
  if (Object.keys(q.alternativas).join('') !== 'ABCDE') throw new Error(q.id + ' alternativas');
  if (!q.assunto) throw new Error(q.id + ' sem assunto');
});

const cab = `/* Prova oficial do Banco do Brasil 2023 — Agente de Tecnologia (Cesgranrio).
   70 questões com gabarito, convertidas de prova_2023.json (extraído do PDF).
   As questões ainda não têm explicações (explicacaoCorreta/explicacaoAlternativas).
   O conteúdo entre os colchetes é JSON puro. */
`;
fs.writeFileSync(saida, cab + 'window.BBQ_QUESTOES = (window.BBQ_QUESTOES || []).concat(' + JSON.stringify(saidaQs, null, 2) + ');\n');
console.log('ok', saidaQs.length, 'questões →', saida);
