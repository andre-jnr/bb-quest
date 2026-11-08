/* =====================================================================
   QUESTÕES DE EXEMPLO
   Para adicionar mais, use o botão "Importar JSON" ou acrescente objetos aqui.
   Enunciados aceitam `código inline`, **negrito** e blocos ```código```.
   ===================================================================== */
const SAMPLE_QUESTIONS = [
  {
    "id": "ti-python-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Python – Pandas",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Considere o código Python a seguir, que utiliza a biblioteca pandas:\n\n```\nimport pandas as pd\n\ndf = pd.DataFrame({\n    'agencia': ['A', 'B', 'A', 'C', 'B'],\n    'saldo':   [100, 200, 300, 50, 150]\n})\n\nprint(df.groupby('agencia')['saldo'].sum())\n```\n\nQual é o resultado exibido para cada agência?",
    "alternativas": {
      "A": "A → 200; B → 175; C → 50",
      "B": "A → 2; B → 2; C → 1",
      "C": "A → 400; B → 350; C → 50",
      "D": "Um único valor: 800",
      "E": "A → 300; B → 200; C → 50"
    },
    "correta": "C",
    "explicacaoCorreta": "O `groupby('agencia')` separa as linhas por agência e o `.sum()` soma a coluna `saldo` de cada grupo: A = 100 + 300 = 400; B = 200 + 150 = 350; C = 50. O resultado é uma Series indexada por `agencia`.",
    "explicacaoAlternativas": {
      "A": "Errada: esses são os valores de `.mean()` (média por grupo), não de `.sum()`.",
      "B": "Errada: esses valores correspondem a `.count()` ou `.size()`, que contam linhas por grupo.",
      "D": "Errada: 800 seria `df['saldo'].sum()`, sem agrupamento.",
      "E": "Errada: esses são os valores de `.max()` por grupo."
    },
    "tags": ["pandas", "groupby", "agregação"]
  },
  {
    "id": "ti-sql-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Banco de Dados – SQL",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Um analista escreveu a consulta abaixo sobre a tabela `CONTA(numero, agencia, saldo)`:\n\n```\nSELECT agencia, COUNT(*) AS qtd\nFROM conta\nWHERE saldo > 0\nGROUP BY agencia\nHAVING COUNT(*) > 10;\n```\n\nSobre essa consulta, assinale a afirmativa correta.",
    "alternativas": {
      "A": "A cláusula WHERE é avaliada depois do GROUP BY, filtrando os grupos formados.",
      "B": "WHERE filtra as linhas antes do agrupamento, e HAVING filtra os grupos após a agregação.",
      "C": "A consulta é inválida, pois funções de agregação não podem ser usadas na cláusula HAVING.",
      "D": "A consulta retorna todas as agências, inclusive as que têm 10 contas ou menos, com qtd = 0.",
      "E": "HAVING e WHERE são intercambiáveis; trocar HAVING COUNT(*) > 10 por WHERE COUNT(*) > 10 produz o mesmo resultado."
    },
    "correta": "B",
    "explicacaoCorreta": "Na ordem lógica de processamento, o SGBD aplica FROM → WHERE → GROUP BY → HAVING → SELECT. Assim, WHERE descarta as contas com saldo ≤ 0 antes de agrupar, e HAVING mantém apenas as agências cujo grupo tem mais de 10 contas.",
    "explicacaoAlternativas": {
      "A": "Errada: WHERE é avaliado antes do GROUP BY e atua sobre linhas individuais.",
      "C": "Errada: HAVING existe justamente para filtrar com base em funções de agregação.",
      "D": "Errada: agências que não satisfazem o HAVING são removidas do resultado, não aparecem com 0.",
      "E": "Errada: funções de agregação não são permitidas em WHERE; a consulta geraria erro."
    },
    "tags": ["sql", "group by", "having", "where"]
  },
  {
    "id": "ti-redes-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Redes de Computadores",
    "dificuldade": "facil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 120,
    "enunciado": "No contexto da arquitetura TCP/IP, assinale a afirmativa correta a respeito dos protocolos e de suas funções.",
    "alternativas": {
      "A": "O UDP garante a entrega ordenada dos segmentos e retransmite os dados perdidos.",
      "B": "O IP é um protocolo da camada de transporte, responsável pelo controle de fluxo fim a fim.",
      "C": "O DNS utiliza exclusivamente o TCP, na porta 53, para resolver nomes.",
      "D": "O ARP é responsável por converter nomes de domínio em endereços IP.",
      "E": "O TCP é orientado a conexão e a estabelece por meio do three-way handshake (SYN, SYN-ACK, ACK)."
    },
    "correta": "E",
    "explicacaoCorreta": "O TCP é um protocolo de transporte orientado a conexão. Antes de trocar dados, cliente e servidor realizam o three-way handshake: o cliente envia SYN, o servidor responde SYN-ACK e o cliente confirma com ACK. Além disso, o TCP oferece entrega confiável, ordenação, controle de fluxo e de congestionamento.",
    "explicacaoAlternativas": {
      "A": "Errada: o UDP não é orientado a conexão e não oferece garantia de entrega, ordenação ou retransmissão.",
      "B": "Errada: o IP pertence à camada de rede (Internet) e não faz controle de fluxo fim a fim; isso é papel do TCP.",
      "C": "Errada: as consultas DNS usam predominantemente UDP/53; o TCP/53 é usado em transferências de zona e respostas grandes.",
      "D": "Errada: o ARP mapeia endereços IP em endereços MAC; quem traduz nomes em IPs é o DNS."
    },
    "tags": ["tcp", "udp", "dns", "arp", "handshake"]
  },
  {
    "id": "ti-seg-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Segurança da Informação",
    "dificuldade": "media",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 150,
    "enunciado": "Uma instituição financeira deseja garantir a **autenticidade** e a **integridade** dos documentos eletrônicos que envia aos clientes, utilizando assinatura digital baseada em criptografia assimétrica. Nesse cenário, o procedimento correto é:",
    "alternativas": {
      "A": "o remetente gera o hash do documento e o cifra com a sua chave privada; o destinatário verifica a assinatura com a chave pública do remetente.",
      "B": "o remetente cifra o documento com a chave pública do destinatário, o que garante, por si só, a autenticidade do remetente.",
      "C": "o remetente assina o documento com o algoritmo AES, que é assimétrico e usa um par de chaves pública e privada.",
      "D": "o destinatário recupera o documento original a partir do hash SHA-256 enviado, pois funções de hash são reversíveis com a chave pública.",
      "E": "o remetente assina com a chave pública do destinatário, e este verifica a assinatura com a sua própria chave privada."
    },
    "correta": "A",
    "explicacaoCorreta": "Na assinatura digital, calcula-se o hash do documento e cifra-se esse hash com a chave privada do remetente — só ele a possui, o que garante autenticidade (e não repúdio). O destinatário decifra a assinatura com a chave pública do remetente e compara com o hash que ele mesmo calcula: se forem iguais, a integridade está confirmada.",
    "explicacaoAlternativas": {
      "B": "Errada: cifrar com a chave pública do destinatário garante confidencialidade, não autenticidade — qualquer pessoa pode usar uma chave pública.",
      "C": "Errada: o AES é um algoritmo simétrico (mesma chave para cifrar e decifrar). Exemplos assimétricos são RSA e ECC.",
      "D": "Errada: funções de hash são unidirecionais; não é possível recuperar a mensagem a partir do hash.",
      "E": "Errada: inverte o uso das chaves. Assina-se com a chave privada do remetente e verifica-se com a pública dele."
    },
    "tags": ["criptografia", "assinatura digital", "hash", "rsa"]
  },
  {
    "id": "ti-ed-0001",
    "disciplina": "Tecnologia da Informação",
    "assunto": "Estruturas de Dados e Algoritmos",
    "dificuldade": "dificil",
    "fonte": "Inédita (estilo Cesgranrio)",
    "tempoAlvoSeg": 180,
    "enunciado": "Um sistema de consulta de clientes precisa escolher estruturas e algoritmos adequados ao volume de dados. Considerando a análise assintótica, assinale a afirmativa correta.",
    "alternativas": {
      "A": "O Quicksort tem complexidade O(n log n) no pior caso, independentemente da escolha do pivô.",
      "B": "Uma pilha segue a política FIFO: o primeiro elemento inserido é o primeiro a ser removido.",
      "C": "Inserir um elemento na primeira posição de um vetor (array) contíguo com n elementos custa O(1).",
      "D": "A busca binária em um vetor ordenado de n elementos tem complexidade O(log n) no pior caso.",
      "E": "Em uma tabela hash bem dimensionada, a busca por chave tem custo médio O(n)."
    },
    "correta": "D",
    "explicacaoCorreta": "A busca binária divide o intervalo de busca pela metade a cada comparação; logo, no pior caso, são necessárias cerca de log₂ n comparações, ou seja, O(log n). O pré-requisito é que o vetor esteja ordenado.",
    "explicacaoAlternativas": {
      "A": "Errada: o Quicksort é O(n log n) no caso médio, mas O(n²) no pior caso (ex.: pivô sempre o menor/maior elemento).",
      "B": "Errada: pilha é LIFO (último a entrar, primeiro a sair). FIFO é a política de fila.",
      "C": "Errada: é preciso deslocar todos os n elementos uma posição, o que custa O(n).",
      "E": "Errada: com boa função de hash e fator de carga controlado, a busca média é O(1); O(n) é o pior caso."
    },
    "tags": ["complexidade", "busca binária", "quicksort", "pilha", "hash"]
  }
];

/* =====================================================================
   ESTADO E PERSISTÊNCIA
   ===================================================================== */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

let BANK = store.get('bbq.bank', null) || SAMPLE_QUESTIONS;
let STATS = store.get('bbq.stats', {});   // id -> { t: tentativas, a: acertos, last: bool }

const S = { queue: [], i: 0, selected: null, answered: false, results: [], t0: 0, timerId: null, elapsed: 0 };
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const DIF_LABEL = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };

const $ = (id) => document.getElementById(id);

/* =====================================================================
   UTILITÁRIOS
   ===================================================================== */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Markdown mínimo: ```bloco```, `inline`, **negrito**, quebras de linha
function rich(s) {
  const parts = esc(s).split(/```[a-zA-Z]*\n?([\s\S]*?)```/);
  return parts.map((p, idx) => {
    if (idx % 2 === 1) return '<pre><code>' + p.replace(/\n$/, '') + '</code></pre>';
    return p.replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/^\n+|\n+$/g, '')
            .replace(/\n/g, '<br>');
  }).join('');
}
function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}
function fmtTime(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function uniq(arr) { return [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')); }
function toast(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2400);
}
function show(id) {
  ['home', 'quiz', 'result'].forEach((s) => { $(s).hidden = s !== id; });
  $('actionbar').hidden = id !== 'quiz';
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* =====================================================================
   TEMA
   ===================================================================== */
const ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const ICON_MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
// Sem escolha salva, o CSS segue o tema do sistema (prefers-color-scheme).
try { const saved = localStorage.getItem('bbq.theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); } catch (e) {}
function isDark() {
  const t = document.documentElement.getAttribute('data-theme');
  return t ? t === 'dark' : !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
}
function renderThemeBtn() {
  $('themeBtn').innerHTML = isDark() ? ICON_SUN : ICON_MOON;
}
$('themeBtn').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('bbq.theme', next); } catch (e) {}
  renderThemeBtn();
});

/* =====================================================================
   HOME
   ===================================================================== */
function fillSelect(sel, values, allLabel, keep) {
  sel.innerHTML = `<option value="">${allLabel}</option>` + values.map((v) => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
  if (keep && values.includes(keep)) sel.value = keep;
}
function refreshAssuntos() {
  const d = $('fDisc').value;
  const assuntos = uniq(BANK.filter((q) => !d || q.disciplina === d).map((q) => q.assunto));
  fillSelect($('fAssunto'), assuntos, 'Todos', $('fAssunto').value);
}
function filtered() {
  const d = $('fDisc').value, a = $('fAssunto').value, dif = $('fDif').value, modo = $('fModo').value;
  return BANK.filter((q) => {
    if (d && q.disciplina !== d) return false;
    if (a && q.assunto !== a) return false;
    if (dif && q.dificuldade !== dif) return false;
    const st = STATS[q.id];
    if (modo === 'ineditas' && st) return false;
    if (modo === 'erradas' && !(st && st.last === false)) return false;
    return true;
  });
}
function updateCount() {
  const n = filtered().length;
  $('countAvail').textContent = n;
  $('startBtn').disabled = n === 0;
}
function renderHome() {
  fillSelect($('fDisc'), uniq(BANK.map((q) => q.disciplina)), 'Todas', $('fDisc').value);
  refreshAssuntos();
  updateCount();

  // Estatísticas gerais
  const ids = new Set(BANK.map((q) => q.id));
  let t = 0, a = 0, done = 0;
  Object.entries(STATS).forEach(([id, s]) => { if (!ids.has(id)) return; done++; t += s.t; a += s.a; });
  $('stTotal').textContent = BANK.length;
  $('stDone').textContent = done;
  $('stRate').textContent = t ? Math.round((a / t) * 100) + '%' : '–';

  // Por assunto
  const by = {};
  BANK.forEach((q) => {
    const k = q.assunto || 'Sem assunto';
    by[k] = by[k] || { total: 0, t: 0, a: 0 };
    by[k].total++;
    const s = STATS[q.id]; if (s) { by[k].t += s.t; by[k].a += s.a; }
  });
  $('topicList').innerHTML = Object.keys(by).sort((x, y) => x.localeCompare(y, 'pt-BR')).map((k) => {
    const v = by[k], pct = v.t ? Math.round((v.a / v.t) * 100) : 0;
    return `<div class="topic">
      <span>${esc(k)} <span class="muted">· ${v.total} questão${v.total > 1 ? 'ões' : ''}</span></span>
      <span class="muted">${v.t ? pct + '% (' + v.a + '/' + v.t + ')' : 'sem respostas'}</span>
      <div class="bar"><i style="width:${pct}%"></i></div>
    </div>`;
  }).join('') || '<p class="muted" style="margin:0">Nenhuma questão no banco.</p>';
}
$('fDisc').addEventListener('change', () => { refreshAssuntos(); updateCount(); });
['fAssunto', 'fDif', 'fModo'].forEach((id) => $(id).addEventListener('change', updateCount));
$('brand').addEventListener('click', () => { if ($('quiz').hidden || confirmQuit()) goHome(); });

$('startBtn').addEventListener('click', () => {
  let list = filtered();
  if ($('fShuffle').checked) list = shuffle(list);
  const qtd = +$('fQtd').value;
  if (qtd > 0) list = list.slice(0, qtd);
  startQuiz(list);
});

/* =====================================================================
   QUIZ
   ===================================================================== */
function startQuiz(list) {
  if (!list.length) return toast('Nenhuma questão para os filtros escolhidos.');
  S.queue = list; S.i = 0; S.results = [];
  show('quiz');
  renderQuestion();
}
function startTimer(target) {
  clearInterval(S.timerId);
  S.t0 = Date.now(); S.elapsed = 0;
  const tick = () => {
    S.elapsed = (Date.now() - S.t0) / 1000;
    $('timerTxt').textContent = fmtTime(S.elapsed) + (target ? ' / ' + fmtTime(target) : '');
    $('timer').classList.toggle('over', !!target && S.elapsed > target);
  };
  tick(); S.timerId = setInterval(tick, 500);
}
function stopTimer() { clearInterval(S.timerId); S.elapsed = (Date.now() - S.t0) / 1000; }

function renderQuestion() {
  const q = S.queue[S.i];
  S.selected = null; S.answered = false;

  const hits = S.results.filter((r) => r.ok).length;
  $('qPos').textContent = `Questão ${S.i + 1} de ${S.queue.length}`;
  $('qScore').textContent = `${hits} acerto${hits === 1 ? '' : 's'}`;
  $('qBar').style.width = (S.i / S.queue.length) * 100 + '%';

  const st = STATS[q.id];
  $('qMeta').innerHTML = [
    q.assunto && `<span class="chip">${esc(q.assunto)}</span>`,
    q.dificuldade && `<span class="chip ${esc(q.dificuldade)}">${esc(DIF_LABEL[q.dificuldade] || q.dificuldade)}</span>`,
    q.fonte && `<span class="chip" style="background:var(--surface-2);color:var(--muted)">${esc(q.fonte)}</span>`,
    st && `<span class="chip" style="background:var(--surface-2);color:var(--muted)">já respondida ${st.t}× · ${st.a} acerto${st.a === 1 ? '' : 's'}</span>`
  ].filter(Boolean).join('');

  $('qEnunciado').innerHTML = rich(q.enunciado);
  $('qAlts').innerHTML = LETTERS.filter((L) => q.alternativas && q.alternativas[L] != null).map((L) =>
    `<button class="alt" data-l="${L}" aria-label="Alternativa ${L}">
       <span class="letter">${L}</span><span class="txt">${rich(q.alternativas[L])}</span>
     </button>`).join('');
  $('qFeedback').innerHTML = '';

  setAction('Confirmar resposta', true);
  $('hint').textContent = 'Atalhos: teclas A–E para escolher · Enter para confirmar';
  startTimer(+q.tempoAlvoSeg || 0);
  window.scrollTo({ top: 0 });
}
function setAction(label, disabled) { $('actionBtn').textContent = label; $('actionBtn').disabled = !!disabled; }

function select(L) {
  if (S.answered) return;
  const btn = $('qAlts').querySelector(`[data-l="${L}"]`);
  if (!btn) return;
  S.selected = L;
  $('qAlts').querySelectorAll('.alt').forEach((b) => b.classList.toggle('selected', b === btn));
  setAction('Confirmar resposta', false);
}
$('qAlts').addEventListener('click', (e) => {
  const b = e.target.closest('.alt'); if (b) select(b.dataset.l);
});

function answer() {
  if (S.answered || !S.selected) return;
  stopTimer();
  S.answered = true;
  const q = S.queue[S.i];
  const correct = String(q.correta || '').toUpperCase();
  const ok = S.selected === correct;

  // Destaque das alternativas
  $('qAlts').querySelectorAll('.alt').forEach((b) => {
    const L = b.dataset.l;
    b.disabled = true;
    b.classList.remove('selected');
    if (L === correct) b.classList.add('correct');
    else if (L === S.selected) b.classList.add('wrong');
    else b.classList.add('dim');
  });

  // Estatísticas
  const s = STATS[q.id] || { t: 0, a: 0 };
  s.t++; if (ok) s.a++; s.last = ok;
  STATS[q.id] = s; store.set('bbq.stats', STATS);
  S.results.push({ q, chosen: S.selected, ok, time: S.elapsed });

  // Feedback
  const exp = q.explicacaoAlternativas || {};
  const others = LETTERS.filter((L) => L !== correct && exp[L]);
  const target = +q.tempoAlvoSeg || 0;
  $('qFeedback').innerHTML = `
    <div class="feedback ${ok ? 'ok' : 'err'}">
      <div class="fb-head">
        ${ok ? '✅ Você acertou!' : `❌ Você errou. Resposta correta: ${esc(correct)}`}
        <span class="t">⏱ ${fmtTime(S.elapsed)}${target ? ' de ' + fmtTime(target) : ''}</span>
      </div>
      <div class="fb-body">
        <div class="block">
          <h4>Por que a ${esc(correct)} está correta</h4>
          <p>${rich(q.explicacaoCorreta || 'Sem explicação cadastrada.')}</p>
        </div>
        ${!ok && exp[S.selected] ? `<div class="block"><h4>Sobre a sua resposta (${esc(S.selected)})</h4><p>${rich(exp[S.selected])}</p></div>` : ''}
        ${others.length ? `<div class="block"><details class="all-exp"><summary>Ver comentário de todas as alternativas</summary><ul>
          ${others.map((L) => `<li><b>${L})</b> ${rich(exp[L])}</li>`).join('')}
        </ul></details></div>` : ''}
        ${Array.isArray(q.tags) && q.tags.length ? `<div class="block" style="display:flex;gap:6px;flex-wrap:wrap">${q.tags.map((t) => `<span class="chip" style="background:var(--surface-2);color:var(--muted)">#${esc(t)}</span>`).join('')}</div>` : ''}
      </div>
    </div>`;

  const hits = S.results.filter((r) => r.ok).length;
  $('qScore').textContent = `${hits} acerto${hits === 1 ? '' : 's'}`;
  $('qBar').style.width = ((S.i + 1) / S.queue.length) * 100 + '%';
  const last = S.i === S.queue.length - 1;
  setAction(last ? 'Ver resultado' : 'Próxima questão →', false);
  $('hint').textContent = 'Enter para ' + (last ? 'ver o resultado' : 'avançar');
  setTimeout(() => $('qFeedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
}
function next() {
  if (S.i < S.queue.length - 1) { S.i++; renderQuestion(); }
  else finish();
}
$('actionBtn').addEventListener('click', () => (S.answered ? next() : answer()));

function confirmQuit() {
  return S.results.length === S.queue.length || confirm('Sair do treino? As respostas já dadas ficam salvas nas estatísticas.');
}
function goHome() { clearInterval(S.timerId); renderHome(); show('home'); }
$('quitBtn').addEventListener('click', () => { if (confirmQuit()) goHome(); });

document.addEventListener('keydown', (e) => {
  if ($('quiz').hidden || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  const k = e.key.toUpperCase();
  if (LETTERS.includes(k)) { select(k); e.preventDefault(); }
  else if (/^[1-5]$/.test(k)) { select(LETTERS[+k - 1]); e.preventDefault(); }
  else if (e.key === 'Enter') {
    if (document.activeElement && document.activeElement.tagName === 'SUMMARY') return;
    e.preventDefault();
    if (S.answered) next(); else answer();
  }
});

/* =====================================================================
   RESULTADO
   ===================================================================== */
function finish() {
  clearInterval(S.timerId);
  const total = S.results.length, hits = S.results.filter((r) => r.ok).length;
  const pct = total ? Math.round((hits / total) * 100) : 0;
  const time = S.results.reduce((acc, r) => acc + r.time, 0);

  $('rPct').textContent = pct + '%';
  $('rFrac').textContent = `${hits} de ${total}`;
  $('rTitle').textContent = pct >= 80 ? 'Mandou muito bem! 🏆' : pct >= 60 ? 'Bom resultado! 💪' : pct >= 40 ? 'Está no caminho 📚' : 'Hora de revisar 🔁';
  $('rSub').textContent = `Tempo total ${fmtTime(time)} · média ${fmtTime(total ? time / total : 0)} por questão`;
  const ring = $('ring');
  ring.style.stroke = pct >= 60 ? 'var(--yellow)' : 'var(--err)';
  ring.style.strokeDashoffset = 326.7;
  requestAnimationFrame(() => requestAnimationFrame(() => { ring.style.strokeDashoffset = 326.7 * (1 - pct / 100); }));

  $('rList').innerHTML = S.results.map((r) => `
    <li class="res-item">
      <span class="ic ${r.ok ? 'ok' : 'err'}">${r.ok ? '✓' : '✕'}</span>
      <div class="info">
        <div>${esc(r.q.assunto || r.q.id)}</div>
        <div>Sua: ${esc(r.chosen)} · Correta: ${esc(r.q.correta)} · ${fmtTime(r.time)}</div>
      </div>
    </li>`).join('');
  const wrong = S.results.filter((r) => !r.ok).length;
  $('retryWrongBtn').hidden = wrong === 0;
  $('retryWrongBtn').textContent = `Refazer as erradas (${wrong})`;
  show('result');
}
$('retryWrongBtn').addEventListener('click', () => startQuiz(S.results.filter((r) => !r.ok).map((r) => r.q)));
$('newBtn').addEventListener('click', goHome);

/* =====================================================================
   BANCO: IMPORTAR / EXPORTAR / RESTAURAR
   ===================================================================== */
function validQuestion(q) {
  return q && typeof q === 'object' && q.id && q.enunciado && q.alternativas && typeof q.alternativas === 'object'
    && LETTERS.includes(String(q.correta || '').toUpperCase());
}
$('importBtn').addEventListener('click', () => $('fileInput').click());
$('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0]; e.target.value = '';
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const arr = Array.isArray(data) ? data : (data.questoes || data.questions || []);
    const ok = arr.filter(validQuestion).map((q) => ({ ...q, correta: String(q.correta).toUpperCase() }));
    if (!ok.length) return toast('Nenhuma questão válida encontrada no arquivo.');
    const map = new Map(BANK.map((q) => [q.id, q]));
    let added = 0, updated = 0;
    ok.forEach((q) => { map.has(q.id) ? updated++ : added++; map.set(q.id, q); });
    BANK = [...map.values()];
    store.set('bbq.bank', BANK);
    renderHome();
    const skipped = arr.length - ok.length;
    toast(`${added} adicionada(s), ${updated} atualizada(s)` + (skipped ? `, ${skipped} ignorada(s)` : ''));
  } catch (err) {
    toast('Arquivo inválido: não foi possível ler o JSON.');
  }
});
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(BANK, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = 'bbquest-questoes.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
$('resetBankBtn').addEventListener('click', () => {
  if (!confirm('Substituir o banco atual pelas 5 questões de exemplo?')) return;
  BANK = SAMPLE_QUESTIONS; store.del('bbq.bank'); renderHome(); toast('Banco restaurado.');
});
$('resetStatsBtn').addEventListener('click', () => {
  if (!confirm('Apagar todo o histórico de respostas?')) return;
  STATS = {}; store.del('bbq.stats'); renderHome(); toast('Estatísticas zeradas.');
});

/* ===================================================================== */
renderThemeBtn();
renderHome();
