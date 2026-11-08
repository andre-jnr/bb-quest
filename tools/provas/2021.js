// Correções da prova BB 2021 (Agente de Tecnologia, Cesgranrio) sobre a extração do PDF.
// Usado por tools/converter-prova.js:  node tools/converter-prova.js 2021
const u = require('../lib/prova-utils');
const { umaLinha, bloco, inline, aspasRetas, indentar, formatarTexto, negrito, trocar, mesmoCodigo, cortar,
        AV_DESTAQUE, AV_FIGURA, AV_ALTS_IMAGEM, altImagem, pags } = u;

module.exports = ({ prova }) => {
  /* ---------- Assunto de cada questão (classificação manual pelo enunciado) ---------- */
  const CD = 'Ciência de Dados e Aprendizado de Máquina', MOB = 'Desenvolvimento Mobile', ED = 'Estruturas de Dados e Algoritmos';
  const DW = 'Data Warehouse e Modelagem Dimensional', NORM = 'Banco de Dados – Normalização';
  const ASSUNTO = {
    1: 'Interpretação de texto', 2: 'Interpretação de texto', 3: 'Conectivos e sentido', 4: 'Interpretação de texto',
    5: 'Concordância verbal', 6: 'Concordância nominal', 7: 'Colocação pronominal', 8: 'Crase', 9: 'Pontuação',
    10: 'Coesão referencial',
    11: 'Compreensão de texto', 12: 'Vocabulário e expressões', 13: 'Formação de palavras', 14: 'Referência pronominal', 15: 'Tempos verbais',
    16: 'Razão e proporção', 17: 'Porcentagem', 18: 'Função exponencial e logaritmo', 19: 'Raciocínio lógico', 20: 'Razão e proporção',
    21: 'Fintechs', 22: 'Sistemas do Banco Central', 23: 'Pix', 24: 'Open banking', 25: 'Funções da moeda',
    26: 'Estatística descritiva', 27: 'Distribuição binomial', 28: 'Variância e covariância', 29: 'Medidas de dispersão', 30: 'Probabilidade',
    31: 'Responsabilidade socioambiental', 32: 'Sigilo bancário (LC 105/2001)', 33: 'Política monetária', 34: 'Segmentação bancária',
    35: 'Prevenção à lavagem de dinheiro',
    36: CD, 37: NORM, 38: 'Banco de Dados – SQL', 39: 'Python – Pandas', 40: 'Banco de Dados – SQL', 41: 'TypeScript',
    42: 'Python – NumPy', 43: 'Python – NumPy', 44: CD, 45: 'Banco de Dados – SQL', 46: 'Banco de Dados – Conceitos',
    47: 'TypeScript', 48: 'TypeScript', 49: DW, 50: 'Java', 51: ED, 52: 'Banco de Dados – Modelagem E-R', 53: ED, 54: 'Java',
    55: ED, 56: NORM, 57: 'Big Data', 58: MOB, 59: MOB, 60: 'DevOps – Ansible', 61: MOB, 62: ED, 63: ED, 64: ED,
    65: 'Banco de Dados – NoSQL', 66: 'Banco de Dados – NoSQL', 67: DW, 68: ED, 69: ED, 70: ED
  };

  /* ---------- Textos de apoio ----------
     Só Q1 (português) e Q11 (inglês) têm texto de verdade; os demais "textos de apoio"
     da extração são cabeçalhos de página ("AGENTE DE TECNOLOGIA - Microrregião…") e são descartados. */
  const limparURL = (s) => s.replace(/ﬁ/g, 'fi').replace(/<([^>]+)>/g, (m, url) => '<' + url.replace(/\s+/g, '') + '>');
  const TEXTO_PT = formatarTexto(limparURL(prova[0].texto_de_apoio).replace('remoto-napandemia', 'remoto-na-pandemia'), { fonte: 'IDOETA, P.A.' });
  const TEXTO_EN = formatarTexto(limparURL(prova[10].texto_de_apoio), { fonte: 'Available at', subtitulos: true });
  const APOIO = { 1: TEXTO_PT, 2: TEXTO_PT, 3: TEXTO_PT, 4: TEXTO_PT, 10: TEXTO_PT,
    11: TEXTO_EN, 12: TEXTO_EN, 13: TEXTO_EN, 14: TEXTO_EN, 15: TEXTO_EN };

  /* ---------- Ajudantes desta prova ---------- */
  const destacarAlts = (q, mapa) => { for (const L in mapa) q.alternativas[L] = negrito(q.alternativas[L], mapa[L]); };
  const altsInline = (q) => { for (const L in q.alternativas) q.alternativas[L] = inline(aspasRetas(q.alternativas[L])); };
  // Esquemas relacionais numa linha só → uma tabela por linha
  const umaTabelaPorLinha = (s) => s.replace(/\s+(?=\w+ REF\b)/g, '\n  ').replace(/\)\s+(?=[A-Z]\w*\()/g, ')\n');
  const AV_SUBLINHADO = 'Na prova, as chaves primárias aparecem sublinhadas; o sublinhado se perdeu na extração do PDF.';

  const FIX = {
    /* --- Língua Portuguesa: destaques reconstruídos --- */
    3: (q) => { q.enunciado = negrito(q.enunciado, 'mesmo que'); q.aviso = AV_DESTAQUE; },
    4: (q) => { destacarAlts(q, { A: 'atualmente', B: 'regularmente', C: 'geralmente', D: 'felizmente', E: 'exatamente' }); q.aviso = AV_DESTAQUE; },
    5: (q) => { destacarAlts(q, { A: 'Aspiram-se', B: 'fazem', C: 'combatem-se', D: 'existe', E: 'precisam-se' }); q.aviso = AV_DESTAQUE; },
    6: (q) => { destacarAlts(q, { A: 'desenvolvidos', B: 'acolhidas', C: 'planejadas', D: 'implementadas', E: 'guardadas' }); q.aviso = AV_DESTAQUE; },
    7: (q) => {
      q.alternativas.A = trocar(q.alternativas.A, 'mantenham-se', 'mantenham-**se**');
      q.alternativas.B = trocar(q.alternativas.B, 'Se reclama', '**Se** reclama');
      q.alternativas.C = trocar(q.alternativas.C, 'cansam-se', 'cansam-**se**');
      q.alternativas.D = trocar(q.alternativas.D, 'dedicam-se', 'dedicam-**se**');
      q.alternativas.E = trocar(q.alternativas.E, 'se preocuparem', '**se** preocuparem');
      q.aviso = AV_DESTAQUE;
    },
    8: (q) => {
      q.alternativas.B = trocar(q.alternativas.B, 'para a redução', 'para **a** redução');
      q.alternativas.C = trocar(q.alternativas.C, 'a essa prática', '**a** essa prática');
      q.alternativas.E = trocar(q.alternativas.E, 'graças a dedicação', 'graças **a** dedicação');
      q.aviso = AV_DESTAQUE + ' Nas alternativas A e D há mais de um "a" candidato, e o destaque não pôde ser identificado com certeza (nenhum deles leva crase).';
    },
    10: (q) => { destacarAlts(q, { A: 'seus', B: 'Esse', C: 'demais', D: 'os', E: 'essa' }); q.aviso = AV_DESTAQUE; },

    /* --- Matemática --- */
    18: (q) => {
      q.enunciado = 'Um fungo está se alastrando na parede, e a área contaminada pelo fungo varia no tempo de acordo com a função A: [0,∞) → ℝ, dada por A(t) = A₀ · bᵗ, em que b é uma constante maior que 1; A₀ é a área da parede contaminada no instante inicial; e A(t) é a área contaminada após t dias. De acordo com esse modelo, depois de quantos dias a área contaminada estará triplicada?';
      q.alternativas.C = 'log_b 3'; q.alternativas.D = 'log₃ b';
      q.aviso = `A notação matemática (expoentes e índices) se perdeu na extração. O enunciado e as alternativas C (logaritmo de 3 na base b) e D (logaritmo de b na base 3) foram reconstruídos; as alternativas A, B e E estão como no texto extraído — confira no PDF (pág. ${pags(q)}).`;
    },
    20: (q) => { q.enunciado = trocar(trocar(q.enunciado, '50m2', '50 m²'), '1m2', '1 m²'); },

    /* --- Atualidades --- */
    25: (q) => {
      const t = umaLinha(q.enunciado);
      const citacao = cortar(t, 'As economias', ' Graeber, D.').trim();
      q.enunciado = 'O texto seguinte trata de uma das funções da moeda.\n\n“' + citacao + '”\n\nGraeber, D. Dívida: os Primeiros 5.000 Anos. São Paulo: Três Estrelas, 2016.\n\n'
        + cortar(t, 'No trecho citado', null);
    },

    /* --- Probabilidade e Estatística --- */
    26: (q) => {
      q.enunciado = trocar(umaLinha(q.enunciado), 'Modelo Modelo A Modelo B Modelo C Tempo de Serviço Curto Médio Longo 10% 20% 70% 20% 50% 30% 40% 20% 40% ',
        '\n\n' + bloco('Tempo de serviço   Curto   Médio   Longo\nModelo A            10%     20%     70%\nModelo B            20%     50%     30%\nModelo C            40%     20%     40%') + '\n\n');
    },
    28: (q) => {
      q.enunciado = trocar(trocar(umaLinha(q.enunciado), ' (i) Var(X)', '\n\n(i) Var(X)'), ' Qual é o valor', '\n\nQual é o valor').replace(/ \((ii|iii)\) /g, '\n($1) ');
      q.alternativas.B = '−2';
      q.aviso = 'Nota de digitalização: o sinal de menos da alternativa B se perdeu na extração. Cov(X,Y) = −2 é o único valor coerente com os dados e com o gabarito oficial (B).';
    },
    29: (q) => { q.aviso = `As fórmulas desta questão (média, desvio padrão e coeficiente de variação) e as alternativas se perderam na extração do PDF (pág. ${pags(q)}). Consulte a prova para resolvê-la.`; q.incompleta = true; },
    30: (q) => {
      const t = umaLinha(q.enunciado);
      // Dados do infográfico: mesmo texto e ordem do original, um item (“NN% …”) por linha
      const dados = cortar(t, 'Em relação a bancos digitais', ' Disponível em:').trim()
        .replace(/ (?=\d+% [A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g, '\n')
        .replace('Em relação a bancos digitais, você...', '**Em relação a bancos digitais, você...**')
        .replace(/ Entre aqueles (.*?) foram\.\.\./, '\n\n**Entre aqueles $1 foram...**');
      q.enunciado = cortar(t, 'A relação do cliente', 'Em relação a bancos digitais').trim() + '\n\n' + dados + '\n\n'
        + cortar(t, 'Disponível em:', ' Escolhendo-se').trim() + '\n\n' + cortar(t, 'Escolhendo-se ao acaso', null);
    },

    /* --- Conhecimentos Bancários --- */
    32: (q) => { q.enunciado = trocar(q.enunciado, 'Complementar no 105', 'Complementar nº 105'); },
    35: (q) => { q.enunciado = trocar(q.enunciado, 'Carta-Circular no 4001/2020', 'Carta-Circular nº 4.001/2020'); },

    /* --- Tecnologia da Informação --- */
    37: (q) => {
      const t = umaLinha(q.enunciado);
      const tabelas = mesmoCodigo(cortar(t, 'Terreno(', ' Ao revisar'),
        'Terreno(rua,numero,tipoTerreno,CNPJ,nomeEmpresa,codigoRisco,nomeRisco,probabilidadeRisco)\nEmpresa(CNPJ,nomeEmpresa,CPFs,nomePessoas)');
      q.enunciado = cortar(t, 'Ao construir', 'Terreno(').trim() + '\n\n' + bloco(tabelas) + '\n\n'
        + cortar(t, 'Ao revisar', ' 1. codigoRisco').trim() + '\n\n'
        + cortar(t, '1. codigoRisco', ' Esse segundo').trim().replace(/ (\d\. )/g, '\n$1') + '\n\n' + cortar(t, 'Esse segundo', null);
      for (const L in q.alternativas) q.alternativas[L] = bloco(umaTabelaPorLinha(q.alternativas[L]));
      q.aviso = AV_SUBLINHADO;
    },
    38: (q) => {
      q.enunciado = trocar(umaLinha(q.enunciado), ' como em SELECT * FROM T1 LEFT JOIN T2 USING (CHAVE); Essa consulta',
        ' como em\n\n' + bloco('SELECT * FROM T1 LEFT JOIN T2 USING (CHAVE);', 'sql') + '\n\nEssa consulta');
      q.aviso = 'Atenção: com o comando como aparece no texto extraído (`T1 LEFT JOIN T2`), as linhas a mais do LEFT JOIN seriam linhas de **T1** sem correspondência em T2 (alternativa C). O gabarito informado é D (linhas de T2 sem correspondência em T1), o que valeria para `T2 LEFT JOIN T1`. Confira o enunciado e o gabarito definitivo no PDF (pág. ' + pags(q) + ').';
    },
    39: (q) => { q.enunciado = q.enunciado.replace(/“([^“”]+)“/g, '“$1”'); altsInline(q); },
    40: (q) => { altsInline(q); },
    41: (q) => {
      const cod = mesmoCodigo(cortar(q.enunciado, 'const a', '\nCom relação'), 'const a = <T extends {b: string}>(obj: T) => {\n  <código removido>\n};');
      q.enunciado = 'Considere o fragmento de código TypeScript a seguir.\n\n' + bloco(cod, 'typescript')
        + '\n\nCom relação ao código apresentado acima, a(o)';
    },
    42: (q) => {
      const cod = cortar(q.enunciado, 'import numpy', '\nO que será');
      q.enunciado = 'Considere o código Python a seguir.\n\n' + bloco(cod, 'python') + '\n\nO que será exibido após esse código ser executado?';
      for (const L in q.alternativas) { const a = q.alternativas[L]; q.alternativas[L] = a.includes('\n') ? bloco(a) : inline(a); }
    },
    43: (q) => {
      const cod = cortar(q.enunciado, 'import numpy', '\nAo executar');
      q.enunciado = 'Considere o código Python a seguir.\n\n' + bloco(cod, 'python') + '\n\nAo executar o código acima, o valor final da variável resultado será';
      for (const L in q.alternativas) { const a = q.alternativas[L]; q.alternativas[L] = a.includes('\n') ? bloco(a) : inline(a); }
    },
    44: (q) => { q.enunciado = trocar(umaLinha(q.enunciado).replace(/ • /g, '\n• '), ' Decidiu, então', '\n\nDecidiu, então'); },
    45: (q) => { q.enunciado = trocar(umaLinha(q.enunciado).replace(/\s\.\s(?=o campo)/g, '\n• '), ' Nesse contexto', '\n\nNesse contexto'); altsInline(q); },
    47: (q) => {
      const t = aspasRetas(q.enunciado);
      const html = cortar(t, '<!doctype html>', '\nConsidere, também').trim();
      const ts = cortar(t, 'onload = (event)', '\nQue texto').trim();
      q.enunciado = 'Considere o código HTML a seguir.\n\n' + bloco(html, 'html')
        + '\n\nConsidere, também, o arquivo TypeScript `script.ts`, listado a seguir, que irá gerar o arquivo `script.js` no mesmo diretório do arquivo HTML apresentado acima.\n\n'
        + bloco(indentar(ts), 'typescript')
        + '\n\nQue texto o programador deverá utilizar no lugar de `???`, no código do arquivo TypeScript `script.ts`, para exibir o valor do campo HTML input na console?';
      altsInline(q);
    },
    48: (q) => {
      const cod = cortar(q.enunciado, '// definir x', '\nQue fragmento').trim();
      q.enunciado = 'Em TypeScript 4, é possível usar o seguinte fragmento de código:\n\n' + bloco(cod, 'typescript')
        + '\n\nQue fragmento de código apresenta uma versão compilável e executável da definição de x que poderia aparecer no lugar do comentário `// definir x`?';
      altsInline(q);
    },
    50: (q) => {
      const t = aspasRetas(q.enunciado);
      const cod = cortar(t, 'public class Va1', 'O que será exibido');
      q.enunciado = 'Sejam as seguintes classes Java:\n\n' + bloco(indentar(cod).replace(/\n(public class)/g, '\n\n$1'), 'java') + '\n\nO que será exibido no console quando o método main for executado?';
    },
    51: (q) => {
      q.enunciado = trocar(umaLinha(q.enunciado), ' resultado: 41 44 33 47 55 52 36 30 Que árvore', ' resultado:\n\n' + bloco('41 44 33 47 55 52 36 30') + '\n\nQue árvore');
      for (const L in q.alternativas) q.alternativas[L] = altImagem(pags(q));
      q.aviso = AV_ALTS_IMAGEM('desenhos de árvores binárias', pags(q)); q.incompleta = true;
    },
    52: (q) => {
      q.enunciado = trocar(umaLinha(q.enunciado).replace(/ • /g, '\n• '), 'REF:<lista_de_colunas> REF <nome_de_tabela>', 'REF: `<lista_de_colunas> REF <nome_de_tabela>`')
        .replace(' Nesse contexto', '\n\nNesse contexto');
      for (const L in q.alternativas) q.alternativas[L] = bloco(umaTabelaPorLinha(q.alternativas[L]));
      q.aviso = AV_FIGURA(pags(q)) + ' ' + AV_SUBLINHADO + ' Por isso, as alternativas C e D, que só diferem pela chave sublinhada, aparecem iguais.';
      q.incompleta = true;
    },
    53: (q) => { q.enunciado = trocar(umaLinha(q.enunciado).replace(/\s(I{1,3}) - /g, '\n\n$1 - '), ' Levando-se', '\n\nLevando-se'); },
    54: (q) => {
      const cod = cortar(q.enunciado, 'public class Tst', 'O que será exibido');
      q.enunciado = 'As classes Java a seguir são públicas e ocupam arquivos separados.\n\n' + bloco(indentar(cod).replace(/\n(public class)/g, '\n\n$1'), 'java')
        + '\n\nO que será exibido no console quando o método main for executado?';
    },
    55: (q) => {
      const t = umaLinha(q.enunciado);
      const linhas = 'Algoritmo 1\n  4 15 81 20  7 47 14 20  4\n  4  4 81 20  7 47 14 20 15\n  4  4  7 20 81 47 14 20 15\n\n'
        + 'Algoritmo 2\n 15 81  4 20  7 47 14 20  4\n  4 15 81 20  7 47 14 20  4\n  4 15 20 81  7 47 14 20  4\n\n'
        + 'Algoritmo 3\n 15  4 20  7 47 14 20  4 81\n  4 15  7 20 14 20  4 47 81\n  4  7 15 14 20  4 20 47 81';
      mesmoCodigo(cortar(t, 'Algoritmo 1', ' As configurações'), linhas);
      q.enunciado = cortar(t, 'Um professor', 'Algoritmo 1').trim() + '\n\n' + bloco(linhas) + '\n\n' + cortar(t, 'As configurações', null);
    },
    56: (q) => {
      for (const L in q.alternativas) q.alternativas[L] = altImagem(pags(q));
      q.aviso = AV_ALTS_IMAGEM('esquemas relacionais com dependências funcionais desenhados como imagem', pags(q)); q.incompleta = true;
    },
    58: (q) => {
      const t = umaLinha(q.enunciado);
      const cod = 'var i:Int\nvar texto:String\nvar num:Int=0\nvar frase:String=""\nfor i in 1...3 {\n  num = num+1+i*2\n  switch num{\n    case 2...6: texto = "a "\n    case 7...9: texto = "casa "\n'
        + '    case 10...13: texto = "carro "\n    case 14...16: texto = "eh "\n    case 17...20: texto = "o "\n    case 21...23: texto = "forte "\n    default: texto = "não eh "\n  }\n  frase = frase+texto\n}\nprint (frase)';
      mesmoCodigo(cortar(t, 'var i:Int', ' A execução'), cod);
      q.enunciado = cortar(t, 'Um programador', 'var i:Int').trim() + '\n\n' + bloco(cod, 'swift') + '\n\n' + cortar(t, 'A execução', null);
    },
    61: (q) => {
      const t = umaLinha(q.enunciado);
      const java = 'public class AlunoJava{\n  private String codigo;\n  private String nome;\n  private int numero=0;\n  private String texto= "EscolaX";\n  public AlunoJava (String codigo,String nome) {\n    this.codigo = codigo;\n    this.nome = nome;\n  }\n}';
      mesmoCodigo(cortar(t, 'public class AlunoJava', ' A classe em Kotlin'), java);
      q.enunciado = cortar(t, 'Foi solicitado', 'public class AlunoJava').trim() + '\n\n' + bloco(java, 'java') + '\n\n' + cortar(t, 'A classe em Kotlin', null);
      const kt = {
        A: 'public class AlunoKotlin (private String: nome , private String: codigo ) {\n  private: numero int = 0\n  texto String = "EscolaX"\n}',
        B: 'public class AlunoKotlin (private var nome; codigo: String) {\n  private var numero = 0\n  private var texto = "EscolaX"\n}',
        C: 'class AlunoKotlin (val nome: String, val codigo: String) {\n  private this.nome = nome\n  private this.codigo=codigo\n  private var int numero = 0\n  private var String texto = "EscolaX"\n}',
        D: 'class AlunoKotlin (var nome: String, var codigo: String) {\n  private var numero = 0\n  private var texto = "EscolaX"\n  private AlunoKotlin.nome, AlunoKotlin.codigo\n}',
        E: 'class AlunoKotlin (private val nome: String, private val codigo: String) {\n  private var numero = 0\n  private var texto = "EscolaX"\n}'
      };
      for (const L in kt) q.alternativas[L] = bloco(mesmoCodigo(q.alternativas[L], kt[L]), 'kotlin');
    },
    62: (q) => {
      q.alternativas.A = '⌊log₂ N⌋, em que a notação ⌊x⌋ significa maior inteiro menor ou igual a x';
      q.alternativas.B = '1 + ⌊log₂ N⌋, em que a notação ⌊x⌋ significa maior inteiro menor ou igual a x';
      q.alternativas.C = '1 + ⌈log₂ N⌉, em que a notação ⌈x⌉ significa menor inteiro maior ou igual a x';
      q.enunciado = q.enunciado.replace('vetor de solitações', 'vetor de solicitações');
      q.aviso = `As notações de piso (⌊ ⌋), teto (⌈ ⌉) e índices se perderam na extração; as alternativas A, B e C foram reconstruídas a partir das próprias definições. As alternativas D e E estão como no texto extraído — confira no PDF (pág. ${pags(q)}).`;
    },
    63: (q) => {
      q.enunciado = trocar(q.enunciado, ' ocorre em Regras de ordenação', ' ocorre em');
      for (const L in q.alternativas) {
        q.alternativas[L] = q.alternativas[L]
          .replace(/^Sequência (ordenada crescentemente|desordenada)(?: Sequência das senhas na fila de atendimento não preferencial)? /,
            (m, r) => `**${r[0].toUpperCase() + r.slice(1)}:** `);
      }
    },
    64: (q) => { q.alternativas.C = trocar(q.alternativas.C, 'n2', 'n²'); },
    65: (q) => {
      const t = umaLinha(q.enunciado);
      const dados = cortar(t, 'O:Usuario', ' O banco de dados NoSQL').trim().replace(/ (?=[OR]:)/g, '\n');
      q.enunciado = cortar(t, 'Um banco comercial', 'O:Usuario').trim() + '\n\n' + bloco(dados) + '\n\n' + cortar(t, 'O banco de dados NoSQL', null);
    },
    66: (q) => {
      const t = aspasRetas(umaLinha(q.enunciado));
      const cod = mesmoCodigo(cortar(t, 'db.fornecedores.insert', ' Posteriormente'),
        'db.fornecedores.insert( {\n  codigo: "thx1138",\n  nome: "Roupas Syfy ltda",\n  pais: "Arabia Saudita"\n} )');
      q.enunciado = cortar(t, 'Um administrador', 'db.fornecedores').trim() + '\n\n' + bloco(cod, 'javascript') + '\n\n' + cortar(t, 'Posteriormente', null);
      altsInline(q);
    },
    68: (q) => {
      let t = umaLinha(q.enunciado);
      t = trocar(t, ' JOGO DAS TROCAS - REGRAS ', '\n\n**JOGO DAS TROCAS – REGRAS**\n\n• ');
      for (const s of ['P2 está', 'Uma ficha desempilhada', 'A operação (P2,pop)', 'Para ganhar o jogo']) t = trocar(t, '. ' + s, '.\n• ' + s);
      t = trocar(t, '. No início do jogo', '.\n\nNo início do jogo');
      t = trocar(t, 'push(P1,Zeus); push(P1,Hades); push(P1,Cibele); push(P1, Apolo)', '`push(P1,Zeus); push(P1,Hades); push(P1,Cibele); push(P1, Apolo)`');
      q.enunciado = trocar(t, '. Considerando-se', '.\n\nConsiderando-se');
    },
    70: (q) => {
      const t = umaLinha(q.enunciado);
      q.enunciado = cortar(t, 'Uma das formas', 'ENFILEIRAR(8)').trim() + '\n\n' + bloco(cortar(t, 'ENFILEIRAR(8)', ' Após realizar').trim()) + '\n\n' + cortar(t, 'Após realizar', null);
    }
  };

  return { ASSUNTO, APOIO, FIX };
};
