/* =====================================================================
   QUESTÕES
   Ficam em data/questoes.js (window.BBQ_QUESTOES), carregado antes deste arquivo.
   Questões importadas pelo botão "Importar JSON" ficam no navegador
   (bbq.bank) e são somadas às do arquivo.
   ===================================================================== */
const FILE_QUESTIONS = Array.isArray(window.BBQ_QUESTOES) ? window.BBQ_QUESTOES : [];
if (!FILE_QUESTIONS.length) console.warn('BB Quest: data/questoes.js não carregou ou está vazio.');

/* =====================================================================
   ESTADO E PERSISTÊNCIA
   ===================================================================== */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

// Banco = questões salvas no navegador (importadas) + as do data/questoes.js.
// Para o mesmo id, vale a versão do arquivo, então editar data/questoes.js sempre tem efeito.
function montarBanco() {
  const map = new Map((store.get('bbq.bank', null) || []).map((q) => [q.id, q]));
  FILE_QUESTIONS.forEach((q) => map.set(q.id, q));
  return [...map.values()];
}
let BANK = montarBanco();
let STATS = store.get('bbq.stats', {});   // id -> { t: tentativas, a: acertos, last: bool }

const S = { queue: [], i: 0, selected: null, answered: false, results: [], t0: 0, timerId: null, elapsed: 0 };
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const DIF_LABEL = { facil: 'Fácil', media: 'Média', dificil: 'Difícil' };

const $ = (id) => document.getElementById(id);

/* =====================================================================
   PESOS DO EDITAL E PLACAR
   Pontuação ponderada = soma dos pesos das questões acertadas.
   ===================================================================== */
// alvo = tempo-alvo padrão (s) quando a questão não traz tempoAlvoSeg.
// alvoCodigo = alvo para questões com código (bloco ``` no enunciado/alternativas ou "tipo": "codigo").
const PESOS_EDITAL = [
  { nome: 'Língua Portuguesa',                 peso: 1.5, alvo: 180, chaves: ['portugues'] },
  { nome: 'Matemática',                        peso: 1.5, alvo: 210, chaves: ['matematica'] },
  { nome: 'Probabilidade e Estatística',       peso: 1.5, alvo: 240, chaves: ['probabilidade', 'estatistica', '=p&e', '=pe'] },
  { nome: 'Conhecimentos Bancários',           peso: 1.5, alvo: 90,  chaves: ['bancari'] },
  { nome: 'Tecnologia da Informação',          peso: 1.5, alvo: 120, alvoCodigo: 180, chaves: ['tecnologia', 'informatica', '=ti'] },
  { nome: 'Língua Inglesa',                    peso: 1.0, alvo: 150, chaves: ['ingles'] },
  { nome: 'Atualidades do Mercado Financeiro', peso: 1.0, alvo: 90,  chaves: ['atualidades'] }
];
const PESO_PADRAO = 1.0;
const ALVO_PADRAO = 150;      // disciplina não reconhecida
const LIMITE_AMARELO = 1.3;   // semáforo: verde ≤ alvo < amarelo ≤ 1,3× alvo < vermelho

function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
// Chaves com "=" exigem nome exato (ex.: "TI"); as demais casam por trecho do nome.
function regraDe(disciplina) {
  const n = norm(disciplina);
  return PESOS_EDITAL.find((p) => p.chaves.some((k) => (k[0] === '=' ? n === k.slice(1) : n.includes(k)))) || null;
}
function pesoDe(disciplina) {
  const r = regraDe(disciplina);
  return r ? r.peso : PESO_PADRAO;
}

/* ---------- Tempo-alvo e semáforo ---------- */
function temCodigo(q) {
  if (norm(q.tipo) === 'codigo') return true;
  return /```/.test(q.enunciado || '') || Object.values(q.alternativas || {}).some((t) => /```/.test(String(t)));
}
// tempoAlvoSeg da questão tem prioridade; senão, padrão da disciplina (TI: conceitual × código)
function alvoDe(q) {
  if (+q.tempoAlvoSeg > 0) return +q.tempoAlvoSeg;
  const r = regraDe(q.disciplina);
  if (!r) return ALVO_PADRAO;
  return r.alvoCodigo && temCodigo(q) ? r.alvoCodigo : r.alvo;
}
// Alvo de uma resposta já registrada (sessões antigas não guardavam o alvo)
function alvoDaResposta(r) {
  if (r.alvo) return r.alvo;
  const q = BANK.find((x) => x.id === r.qid);
  return q ? alvoDe(q) : alvoDe({ disciplina: r.disciplina });
}
function semaforo(tempo, alvo) {
  if (!alvo) return 'verde';
  const k = tempo / alvo;
  return k <= 1 ? 'verde' : k <= LIMITE_AMARELO ? 'amarelo' : 'vermelho';
}
const SEM_LABEL = { verde: 'dentro do alvo', amarelo: 'até 30% acima do alvo', vermelho: 'mais de 30% acima do alvo' };
function semDot(cor, title) { return `<span class="sem-dot ${cor}" title="${esc(title || SEM_LABEL[cor])}"></span>`; }
function fmtPts(n) { return (+n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
function pctOf(a, t) { return t ? Math.round((a / t) * 100) : 0; }

// respostas: [{ ok, peso, tempo }] → resumo
function summarize(respostas) {
  const s = { total: 0, acertos: 0, erros: 0, pontos: 0, pontosMax: 0, tempo: 0 };
  respostas.forEach((r) => {
    s.total++; s.pontosMax += r.peso; s.tempo += r.tempo || 0;
    if (r.ok) { s.acertos++; s.pontos += r.peso; } else s.erros++;
  });
  return s;
}
function scoreboardHTML(s) {
  const pct = pctOf(s.acertos, s.total);
  return `
    <div class="sb"><b class="ok">${s.acertos}</b><span>Acertos</span></div>
    <div class="sb"><b class="err">${s.erros}</b><span>Erros</span></div>
    <div class="sb"><b class="${s.total && pct < 60 ? 'low' : ''}">${s.total ? pct + '%' : '–'}</b><span>% de acertos</span></div>
    <div class="sb" title="Soma dos pesos do edital das questões acertadas"><b class="pts">${fmtPts(s.pontos)}<small> / ${fmtPts(s.pontosMax)}</small></b><span>Pontos ponderados</span></div>`;
}

/* =====================================================================
   HISTÓRICO DE SESSÕES (localStorage: bbq.sessions)
   Cada sessão: { id, inicio, fim, completa, planejadas, respostas: [...] }
   A sessão é salva a cada resposta, então nada se perde se a aba fechar.
   ===================================================================== */
const MAX_SESSOES = 300;
let SESSIONS = store.get('bbq.sessions', []);
if (!Array.isArray(SESSIONS)) SESSIONS = [];

/* =====================================================================
   CADERNO DE ERROS (localStorage: bbq.erros)
   qid → { qid, q (cópia da questão), marcada, erros, acertosDepois,
           primeiraVez, ultimaVez, dominada, dominadaEm }
   Guarda uma cópia da questão para que ela continue legível mesmo se
   sair do banco; ao refazer, usa a versão atual do banco quando existir.
   ===================================================================== */
let CADERNO = store.get('bbq.erros', null);

function snapshotQ(q) {
  const { id, disciplina, assunto, dificuldade, fonte, tempoAlvoSeg, enunciado, alternativas,
          correta, explicacaoCorreta, explicacaoAlternativas, tags,
          textoApoio, aviso, incompleta, ano, numero, paginasPdf } = q;
  return { id, disciplina, assunto, dificuldade, fonte, tempoAlvoSeg, enunciado, alternativas,
           correta, explicacaoCorreta, explicacaoAlternativas, tags,
           textoApoio, aviso, incompleta, ano, numero, paginasPdf };
}

// Questão de prova oficial (tag "oficial")
const ehOficial = (q) => Array.isArray(q.tags) && q.tags.includes('oficial');
function explicacaoDe(q) {
  if (q.explicacaoCorreta) return q.explicacaoCorreta;
  return ehOficial(q)
    ? `Gabarito oficial: **${String(q.correta || '').toUpperCase()}**. A explicação desta questão da prova ainda não foi cadastrada.`
    : 'Sem explicação cadastrada.';
}

// Blocos que antecedem o enunciado: aviso (digitalização/figura ausente) e texto de apoio
function apoioHTML(q, { aberto = true } = {}) {
  let h = '';
  if (q.aviso) h += `<div class="q-aviso${q.incompleta ? ' grave' : ''}">${q.incompleta ? '⚠️' : 'ℹ️'} ${rich(q.aviso)}</div>`;
  if (q.textoApoio) {
    h += `<details class="texto-apoio"${aberto ? ' open' : ''}><summary>Texto de apoio</summary><div class="ta-corpo">${rich(q.textoApoio)}</div></details>`;
  }
  return h;
}
function saveCaderno() { store.set('bbq.erros', CADERNO); }
function registrarErro(q, marcada, quando = new Date().toISOString()) {
  const e = CADERNO[q.id] || { qid: q.id, erros: 0, primeiraVez: quando };
  Object.assign(e, {
    q: snapshotQ(q), marcada, erros: e.erros + 1, ultimaVez: quando,
    acertosDepois: 0, dominada: false, dominadaEm: null
  });
  CADERNO[q.id] = e;
}
function questaoDoCaderno(e) { return BANK.find((q) => q.id === e.qid) || e.q; }
function pendentesCaderno() { return Object.values(CADERNO).filter((e) => !e.dominada); }
function setDominada(qid, valor) {
  const e = CADERNO[qid]; if (!e) return;
  e.dominada = valor; e.dominadaEm = valor ? new Date().toISOString() : null;
  saveCaderno(); updateErrosBadge();
  if (valor && typeof gameRechecar === 'function') gameRechecar(); // conquista "Caderno limpo"
}

function saveSession(sess) {
  const i = SESSIONS.findIndex((s) => s.id === sess.id);
  if (i >= 0) SESSIONS[i] = sess; else SESSIONS.push(sess);
  if (SESSIONS.length > MAX_SESSOES) SESSIONS = SESSIONS.slice(-MAX_SESSOES);
  store.set('bbq.sessions', SESSIONS);
}

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
            .replace(/(^|[\s(])_([^_<>\n]+)_(?=[\s.,;:)!?]|$)/g, '$1<em>$2</em>')
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
  // Saindo da prova do simulado: pausa o cronômetro geral (definido em simulado.js)
  if (id !== 'sim' && typeof simPausar === 'function') simPausar();
  document.querySelectorAll('main > .screen').forEach((s) => { s.hidden = s.id !== id; });
  $('actionbar').hidden = id !== 'quiz';
  if ($('simbar')) $('simbar').hidden = id !== 'sim';
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
  const d = $('fDisc').value, a = $('fAssunto').value, dif = $('fDif').value, modo = $('fModo').value, orig = $('fOrigem').value;
  return BANK.filter((q) => {
    if (d && q.disciplina !== d) return false;
    if (a && q.assunto !== a) return false;
    if (dif && q.dificuldade !== dif) return false;
    if (orig === 'oficial' && !ehOficial(q)) return false;
    if (orig === 'inedita' && ehOficial(q)) return false;
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

  // Resumo do histórico de sessões
  const last = SESSIONS[SESSIONS.length - 1];
  if (!last) {
    $('homePerfTxt').textContent = 'Nenhuma sessão ainda. Faça um treino para começar seu histórico.';
  } else {
    const s = summarize(last.respostas);
    const fracos = assuntosFracos().length;
    $('homePerfTxt').textContent = `${SESSIONS.length} sessão(ões) · última: ${s.acertos}/${s.total} (${pctOf(s.acertos, s.total)}%), ${fmtPts(s.pontos)} pts`
      + (fracos ? ` · ${fracos} assunto(s) abaixo de 60%` : '');
  }

  const pend = pendentesCaderno().length;
  const dom = Object.keys(CADERNO).length - pend;
  $('homeErrosTxt').textContent = pend
    ? `${pend} questão(ões) para revisar` + (dom ? ` · ${dom} dominada(s)` : '')
    : (dom ? `Tudo revisado! ${dom} questão(ões) dominada(s). 🎉` : 'Vazio por enquanto. As questões que você errar aparecem aqui.');
  updateErrosBadge();
  if (typeof renderSimHomeCard === 'function') renderSimHomeCard();
  if (typeof renderSrsCard === 'function') renderSrsCard();
  if (typeof renderGamePill === 'function') renderGamePill();
}
function updateErrosBadge() {
  const n = pendentesCaderno().length;
  $('errosBadge').hidden = !n;
  $('errosBadge').textContent = n > 99 ? '99+' : n;
}
$('fDisc').addEventListener('change', () => { refreshAssuntos(); updateCount(); });
['fAssunto', 'fDif', 'fModo', 'fOrigem'].forEach((id) => $(id).addEventListener('change', updateCount));
// Treino em andamento pede confirmação; o simulado é salvo e pausado automaticamente.
function canLeave() { return $('quiz').hidden || confirmQuit(); }
$('brand').addEventListener('click', () => { if (canLeave()) goHome(); });

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
  S.session = {
    id: 'sess-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    inicio: new Date().toISOString(), fim: null, completa: false,
    planejadas: list.length, respostas: []
  };
  show('quiz');
  renderQuestion();
}
function startTimer(target) {
  clearInterval(S.timerId);
  S.t0 = Date.now(); S.elapsed = 0;
  const tick = () => {
    S.elapsed = (Date.now() - S.t0) / 1000;
    $('timerTxt').textContent = fmtTime(S.elapsed) + (target ? ' / ' + fmtTime(target) : '');
    const cor = semaforo(S.elapsed, target);
    if ($('timer').dataset.sem !== cor) {
      $('timer').dataset.sem = cor;
      $('timer').className = 'timer t-' + cor;
      $('timer').title = `Tempo nesta questão / alvo ${fmtTime(target)} · ${SEM_LABEL[cor]}`;
    }
  };
  tick(); S.timerId = setInterval(tick, 500);
}
function stopTimer() { clearInterval(S.timerId); S.elapsed = (Date.now() - S.t0) / 1000; }

function renderQuestion() {
  const q = S.queue[S.i];
  S.selected = null; S.answered = false;

  $('qPos').textContent = `Questão ${S.i + 1} de ${S.queue.length}`;
  $('qBoard').innerHTML = scoreboardHTML(summarize(S.session.respostas));
  $('qBar').style.width = (S.i / S.queue.length) * 100 + '%';

  const st = STATS[q.id];
  $('qMeta').innerHTML = [
    q.assunto && `<span class="chip">${esc(q.assunto)}</span>`,
    `<span class="chip" title="Peso da disciplina no edital">peso ${fmtPts(pesoDe(q.disciplina))}</span>`,
    q.dificuldade && `<span class="chip ${esc(q.dificuldade)}">${esc(DIF_LABEL[q.dificuldade] || q.dificuldade)}</span>`,
    q.fonte && `<span class="chip" style="background:var(--surface-2);color:var(--muted)">${esc(q.fonte)}</span>`,
    st && `<span class="chip" style="background:var(--surface-2);color:var(--muted)">já respondida ${st.t}× · ${st.a} acerto${st.a === 1 ? '' : 's'}</span>`,
    typeof srsChip === 'function' && srsChip(q.id)
  ].filter(Boolean).join('');

  $('qEnunciado').innerHTML = apoioHTML(q) + rich(q.enunciado);
  $('qAlts').innerHTML = LETTERS.filter((L) => q.alternativas && q.alternativas[L] != null).map((L) =>
    `<button class="alt" data-l="${L}" aria-label="Alternativa ${L}">
       <span class="letter">${L}</span><span class="txt">${rich(q.alternativas[L])}</span>
     </button>`).join('');
  $('qFeedback').innerHTML = '';

  setAction('Confirmar resposta', true);
  $('hint').textContent = 'Atalhos: teclas A–E para escolher · Enter para confirmar';
  $('timer').dataset.sem = '';
  startTimer(alvoDe(q));
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
  const target = alvoDe(q);
  const cor = semaforo(S.elapsed, target);
  S.results.push({ q, chosen: S.selected, ok, time: S.elapsed, alvo: target, sem: cor });

  // Histórico da sessão (salvo a cada resposta, com tempo gasto e alvo)
  S.session.respostas.push({
    qid: q.id, disciplina: q.disciplina || 'Sem disciplina', assunto: q.assunto || 'Sem assunto',
    peso: pesoDe(q.disciplina), ok, marcada: S.selected, correta: correct,
    tempo: Math.round(S.elapsed), alvo: target, em: new Date().toISOString()
  });
  S.session.fim = new Date().toISOString();
  saveSession(S.session);

  // Caderno de Erros: errou → entra (ou volta) para a lista; acertou → conta como revisão
  const noCaderno = CADERNO[q.id];
  if (!ok) registrarErro(q, S.selected);
  else if (noCaderno && !noCaderno.dominada) noCaderno.acertosDepois = (noCaderno.acertosDepois || 0) + 1;
  saveCaderno(); updateErrosBadge();
  const sugerirDominei = ok && noCaderno && !noCaderno.dominada;

  // Revisão espaçada (revisao.js): errou → 1 dia; acertou revisão vencida → sobe de nível
  const srsInfo = typeof srsResponder === 'function' ? srsResponder(q, ok) : null;

  // Gamificação (gamificacao.js): XP, streak e conquistas
  const gameInfo = typeof gameResponder === 'function' ? gameResponder({ q, ok, tempo: S.elapsed, alvo: target }) : null;

  // Feedback
  const exp = q.explicacaoAlternativas || {};
  const others = LETTERS.filter((L) => L !== correct && exp[L]);
  $('qFeedback').innerHTML = `
    <div class="feedback ${ok ? 'ok' : 'err'}">
      <div class="fb-head">
        ${ok ? '✅ Você acertou!' : `❌ Você errou. Resposta correta: ${esc(correct)}`}
        ${gameInfo && gameInfo.xp ? `<span class="xp-gain" title="${gameInfo.bonus ? 'Inclui bônus de tempo' : 'XP por acerto'}">+${gameInfo.xp} XP${gameInfo.bonus ? ' ⚡' : ''}</span>` : ''}
        <span class="t" title="${esc(SEM_LABEL[cor])}">${semDot(cor)} ${fmtTime(S.elapsed)} de ${fmtTime(target)}</span>
      </div>
      <div class="fb-body">
        ${!ok ? `<div class="block muted" style="font-size:13.5px">📕 Questão adicionada ao Caderno de Erros.</div>` : ''}
        ${srsInfo ? `<div class="block srs-fb srs-${srsInfo.tipo}">${esc(srsInfo.msg)}</div>` : ''}
        ${sugerirDominei ? `<div class="block fb-dominei">
            <span>📕 Esta questão está no seu Caderno de Erros${noCaderno.acertosDepois > 1 ? ` (acertou ${noCaderno.acertosDepois}× na revisão)` : ''}.</span>
            <button class="btn btn-ok btn-sm" data-dominei="${esc(q.id)}">✓ Dominei, tirar do caderno</button>
          </div>` : ''}
        <div class="block">
          <h4>Por que a ${esc(correct)} está correta</h4>
          <p>${rich(explicacaoDe(q))}</p>
        </div>
        ${!ok && exp[S.selected] ? `<div class="block"><h4>Sobre a sua resposta (${esc(S.selected)})</h4><p>${rich(exp[S.selected])}</p></div>` : ''}
        ${others.length ? `<div class="block"><details class="all-exp"><summary>Ver comentário de todas as alternativas</summary><ul>
          ${others.map((L) => `<li><b>${L})</b> ${rich(exp[L])}</li>`).join('')}
        </ul></details></div>` : ''}
        ${Array.isArray(q.tags) && q.tags.length ? `<div class="block" style="display:flex;gap:6px;flex-wrap:wrap">${q.tags.map((t) => `<span class="chip" style="background:var(--surface-2);color:var(--muted)">#${esc(t)}</span>`).join('')}</div>` : ''}
      </div>
    </div>`;

  $('qBoard').innerHTML = scoreboardHTML(summarize(S.session.respostas));
  $('qBar').style.width = ((S.i + 1) / S.queue.length) * 100 + '%';
  const last = S.i === S.queue.length - 1;
  setAction(last ? 'Ver resultado' : 'Próxima questão →', false);
  $('hint').textContent = 'Enter para ' + (last ? 'ver o resultado' : 'avançar');
  setTimeout(() => $('qFeedback').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 60);
  if (gameInfo) gameCelebrar(gameInfo);
}
$('qFeedback').addEventListener('click', (e) => {
  const b = e.target.closest('[data-dominei]'); if (!b) return;
  setDominada(b.dataset.dominei, true);
  b.parentElement.innerHTML = '<span style="color:var(--ok);font-weight:700">✓ Marcada como dominada e retirada do caderno.</span>';
});
function next() {
  if (S.i < S.queue.length - 1) { S.i++; renderQuestion(); }
  else finish();
}
$('actionBtn').addEventListener('click', () => (S.answered ? next() : answer()));

function confirmQuit() {
  return S.results.length === S.queue.length || confirm('Sair do treino? As respostas já dadas ficam salvas no seu histórico como sessão incompleta.');
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
  S.session.completa = true;
  if (typeof gameFimSessao === 'function') setTimeout(() => gameCelebrar(gameFimSessao(S.session)), 300);
  S.session.fim = new Date().toISOString();
  saveSession(S.session);

  const total = S.results.length, hits = S.results.filter((r) => r.ok).length;
  const pct = total ? Math.round((hits / total) * 100) : 0;
  const time = S.results.reduce((acc, r) => acc + r.time, 0);
  $('rBoard').innerHTML = scoreboardHTML(summarize(S.session.respostas));

  $('rPct').textContent = pct + '%';
  $('rFrac').textContent = `${hits} de ${total}`;
  $('rTitle').textContent = pct >= 80 ? 'Mandou muito bem! 🏆' : pct >= 60 ? 'Bom resultado! 💪' : pct >= 40 ? 'Está no caminho 📚' : 'Hora de revisar 🔁';
  const noAlvo = S.results.filter((r) => r.sem === 'verde').length;
  $('rSub').textContent = `Tempo total ${fmtTime(time)} · média ${fmtTime(total ? time / total : 0)} por questão · ${noAlvo} de ${total} dentro do tempo-alvo`;
  const ring = $('ring');
  ring.style.stroke = pct >= 60 ? 'var(--yellow)' : 'var(--err)';
  ring.style.strokeDashoffset = 326.7;
  requestAnimationFrame(() => requestAnimationFrame(() => { ring.style.strokeDashoffset = 326.7 * (1 - pct / 100); }));

  $('rList').innerHTML = S.results.map((r) => `
    <li class="res-item">
      <span class="ic ${r.ok ? 'ok' : 'err'}">${r.ok ? '✓' : '✕'}</span>
      <div class="info">
        <div>${esc(r.q.assunto || r.q.id)}</div>
        <div>Sua: ${esc(r.chosen)} · Correta: ${esc(r.q.correta)} · ${semDot(r.sem)} ${fmtTime(r.time)}/${fmtTime(r.alvo)} · ${r.ok ? '+' + fmtPts(pesoDe(r.q.disciplina)) + ' pts' : '0 pts'}</div>
      </div>
    </li>`).join('');
  const wrong = S.results.filter((r) => !r.ok).length;
  $('retryWrongBtn').hidden = wrong === 0;
  $('retryWrongBtn').textContent = `Refazer as erradas (${wrong})`;
  show('result');
}
$('retryWrongBtn').addEventListener('click', () => startQuiz(S.results.filter((r) => !r.ok).map((r) => r.q)));
$('newBtn').addEventListener('click', goHome);
$('resultPerfBtn').addEventListener('click', openPerf);

/* =====================================================================
   MEU DESEMPENHO
   ===================================================================== */
const LIMITE_FRACO = 60; // % abaixo do qual o assunto é destacado em vermelho

function sessoesNoPeriodo() {
  const dias = +($('perfPeriodo') ? $('perfPeriodo').value : 0);
  if (!dias) return SESSIONS;
  const desde = Date.now() - dias * 86400000;
  return SESSIONS.filter((s) => new Date(s.fim || s.inicio).getTime() >= desde);
}
function respostasNoPeriodo() {
  return sessoesNoPeriodo().flatMap((s) => s.respostas || []);
}
// Agrupa respostas: { chave → { acertos, total, pontos, pontosMax, ... } }
function agrupar(respostas, keyFn) {
  const out = {};
  respostas.forEach((r) => {
    const k = keyFn(r);
    const g = out[k] || (out[k] = { respostas: [] });
    g.respostas.push(r);
  });
  Object.values(out).forEach((g) => Object.assign(g, summarize(g.respostas)));
  return out;
}
function assuntosFracos(respostas = SESSIONS.flatMap((s) => s.respostas || [])) {
  const g = agrupar(respostas, (r) => r.disciplina + '\u0000' + r.assunto);
  return Object.values(g).filter((v) => pctOf(v.acertos, v.total) < LIMITE_FRACO);
}

function topicRow({ nome, chipHTML = '', v, trainBtn = '' }) {
  const pct = pctOf(v.acertos, v.total);
  const low = pct < LIMITE_FRACO;
  return `<div class="topic${low ? ' low' : ''}">
    <span class="name">${esc(nome)}${chipHTML}</span>
    <span class="right"><strong>${pct}%</strong> ${v.acertos}/${v.total} · ${fmtPts(v.pontos)}/${fmtPts(v.pontosMax)} pts ${trainBtn}</span>
    <div class="bar"><i style="width:${pct}%"></i></div>
  </div>`;
}

// Tempo médio por disciplina × alvo médio, com distribuição do semáforo
const ESCALA_TEMPO = 1.6; // a barra vai de 0 a 1,6× o alvo
function tempoStats(respostas) {
  const n = respostas.length || 1;
  const media = respostas.reduce((a, r) => a + (r.tempo || 0), 0) / n;
  const alvo = respostas.reduce((a, r) => a + alvoDaResposta(r), 0) / n;
  const dist = { verde: 0, amarelo: 0, vermelho: 0 };
  respostas.forEach((r) => dist[semaforo(r.tempo || 0, alvoDaResposta(r))]++);
  return { media, alvo, dist, cor: semaforo(media, alvo), ratio: alvo ? media / alvo : 0 };
}
function tempoRowHTML(nome, t) {
  const diff = Math.round(Math.abs(t.ratio - 1) * 100);
  const txtDiff = diff === 0 ? 'no alvo' : `${diff}% ${t.ratio < 1 ? 'abaixo' : 'acima'} do alvo`;
  const pos = (k) => Math.min(100, (k / ESCALA_TEMPO) * 100);
  return `<div class="tempo-row">
    <div class="tempo-head">
      <span class="name">${semDot(t.cor)} ${esc(nome)}</span>
      <span class="right"><strong>${fmtTime(t.media)}</strong> média · alvo ${fmtTime(t.alvo)} · <b class="c-${t.cor}">${txtDiff}</b></span>
    </div>
    <div class="tempo-track" title="Marcas: alvo e 1,3× o alvo">
      <i class="fill ${t.cor}" style="width:${pos(t.ratio)}%"></i>
      <span class="mark" style="left:${pos(1)}%"></span>
      <span class="mark mark-y" style="left:${pos(LIMITE_AMARELO)}%"></span>
    </div>
    <div class="tempo-dist">
      ${semDot('verde')} ${t.dist.verde} no alvo · ${semDot('amarelo')} ${t.dist.amarelo} até +30% · ${semDot('vermelho')} ${t.dist.vermelho} acima de +30%
    </div>
  </div>`;
}

function renderPerf() {
  const sess = sessoesNoPeriodo();
  const resp = sess.flatMap((s) => s.respostas || []);
  const tot = summarize(resp);

  const byDiscT = agrupar(resp, (r) => r.disciplina);
  const discsT = Object.keys(byDiscT).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  $('perfTempo').innerHTML = discsT.length
    ? discsT.map((d) => tempoRowHTML(d, tempoStats(byDiscT[d].respostas))).join('')
    : '<p class="empty">Nada por aqui ainda.</p>';
  const tGeral = tempoStats(resp);

  $('perfBoard').innerHTML = scoreboardHTML(tot);
  $('perfInfo').innerHTML = resp.length
    ? `${sess.length} sessão(ões) · ${tot.total} questões · tempo total ${fmtTime(tot.tempo)} · `
      + `média ${fmtTime(tGeral.media)} por questão (alvo médio ${fmtTime(tGeral.alvo)}). `
      + `Pontos = acertos × peso do edital (Português, Matemática, P&amp;E, Bancários e TI = 1,5; Inglês e Atualidades = 1,0).`
    : 'Sem respostas neste período. Faça um treino para gerar seu histórico.';

  // Por disciplina
  const byDisc = agrupar(resp, (r) => r.disciplina);
  const discs = Object.keys(byDisc).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  $('perfDisc').innerHTML = discs.length
    ? discs.map((d) => topicRow({
        nome: d, v: byDisc[d],
        chipHTML: `<span class="chip chip-peso">peso ${fmtPts(pesoDe(d))}</span>`
      })).join('')
    : '<p class="empty">Nada por aqui ainda.</p>';

  // Por assunto, agrupado por disciplina (piores primeiro)
  const bancoAssuntos = new Set(BANK.map((q) => q.disciplina + '\u0000' + q.assunto));
  $('perfAssunto').innerHTML = discs.length ? discs.map((d) => {
    const byAss = agrupar(byDisc[d].respostas, (r) => r.assunto);
    const lista = Object.keys(byAss).sort((a, b) =>
      pctOf(byAss[a].acertos, byAss[a].total) - pctOf(byAss[b].acertos, byAss[b].total) || a.localeCompare(b, 'pt-BR'));
    const fracos = lista.filter((a) => pctOf(byAss[a].acertos, byAss[a].total) < LIMITE_FRACO).length;
    return `<div class="group">
      <h3><span>${esc(d)}</span>${fracos ? `<span style="color:var(--err)">${fracos} abaixo de ${LIMITE_FRACO}%</span>` : ''}</h3>
      <div class="topic-list">${lista.map((a) => {
        const podeTreinar = bancoAssuntos.has(d + '\u0000' + a);
        const btn = podeTreinar
          ? `<button class="btn btn-ghost btn-train" data-disc="${esc(d)}" data-assunto="${esc(a)}">Treinar</button>` : '';
        return topicRow({ nome: a, v: byAss[a], trainBtn: btn });
      }).join('')}</div>
    </div>`;
  }).join('') : '<p class="empty">Nada por aqui ainda.</p>';

  // Histórico de sessões (mais recentes primeiro)
  const recentes = sess.slice().reverse().slice(0, 30);
  $('perfSessions').innerHTML = recentes.length ? recentes.map((s) => {
    const r = summarize(s.respostas || []);
    const pct = pctOf(r.acertos, r.total);
    const data = new Date(s.inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const discs = uniq((s.respostas || []).map((x) => x.disciplina));
    return `<li class="res-item">
      <span class="ic ${pct >= LIMITE_FRACO ? 'ok' : 'err'}" style="font-size:11px;width:40px;height:40px">${pct}%</span>
      <div class="info">
        <div>${esc(data)}${s.tipo === 'simulado' ? '<span class="chip chip-sim">simulado</span>' : ''}${s.tipo === 'revisao' ? '<span class="chip chip-sim">revisão</span>' : ''}${s.completa ? '' : '<span class="chip chip-inc">incompleta</span>'}</div>
        <div>${r.total} questão(ões) · ${r.acertos} ✓ ${r.erros} ✕ · ${fmtPts(r.pontos)}/${fmtPts(r.pontosMax)} pts · ${esc(discs.join(', '))}</div>
      </div>
    </li>`;
  }).join('') : '<li class="empty">Nenhuma sessão registrada.</li>';
  $('clearHistBtn').hidden = !SESSIONS.length;
}
function openPerf() { clearInterval(S.timerId); renderPerf(); show('perf'); }

$('perfBtn').addEventListener('click', () => { if (canLeave()) openPerf(); });
$('homePerfBtn').addEventListener('click', openPerf);
$('perfBackBtn').addEventListener('click', goHome);
$('perfPeriodo').addEventListener('change', renderPerf);
$('perfAssunto').addEventListener('click', (e) => {
  const b = e.target.closest('.btn-train'); if (!b) return;
  $('fDisc').value = b.dataset.disc; refreshAssuntos();
  $('fAssunto').value = b.dataset.assunto;
  $('fDif').value = ''; $('fModo').value = 'todas';
  updateCount();
  let list = filtered();
  if ($('fShuffle').checked) list = shuffle(list);
  const qtd = +$('fQtd').value;
  startQuiz(qtd > 0 ? list.slice(0, qtd) : list);
});
$('clearHistBtn').addEventListener('click', () => {
  if (!confirm('Apagar o histórico de todas as sessões? Esta ação não pode ser desfeita.')) return;
  SESSIONS = []; store.del('bbq.sessions'); renderPerf(); toast('Histórico apagado.');
});

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
  if (!confirm(`Remover as questões importadas e manter só as ${FILE_QUESTIONS.length} do arquivo data/questoes.js?`)) return;
  store.del('bbq.bank'); BANK = montarBanco(); renderHome(); toast('Banco restaurado.');
});
/* =====================================================================
   TELA: CADERNO DE ERROS
   ===================================================================== */
function excerpt(s, n = 150) {
  const t = String(s || '').replace(/```[\s\S]*?```/g, ' [código] ').replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).trimEnd() + '…' : t;
}
function fmtData(iso) {
  return iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';
}
function errosFiltrados() {
  const status = $('eStatus').value, d = $('eDisc').value;
  return Object.values(CADERNO)
    .filter((e) => (status === 'dominadas' ? e.dominada : !e.dominada))
    .filter((e) => !d || (questaoDoCaderno(e).disciplina || 'Sem disciplina') === d)
    .sort((a, b) => String(status === 'dominadas' ? b.dominadaEm : b.ultimaVez)
      .localeCompare(String(status === 'dominadas' ? a.dominadaEm : a.ultimaVez)));
}
function erroCardHTML(e) {
  const q = questaoDoCaderno(e);
  const alts = q.alternativas || {}, exps = q.explicacaoAlternativas || {};
  const correta = String(q.correta || '').toUpperCase();
  const m = e.marcada;
  const acoes = e.dominada
    ? `<button class="btn btn-ghost btn-sm" data-act="voltar">↩ Voltar para o caderno</button>`
    : `<button class="btn btn-ghost btn-sm" data-act="refazer">Refazer esta</button>
       <button class="btn btn-ok btn-sm" data-act="dominei">✓ Dominei</button>`;
  return `<article class="erro-card" data-id="${esc(e.qid)}">
    <div class="erro-top">
      <div class="meta">
        <span class="chip">${esc(q.disciplina || 'Sem disciplina')}</span>
        ${q.assunto ? `<span class="chip" style="background:var(--surface-2);color:var(--muted)">${esc(q.assunto)}</span>` : ''}
        <span class="chip chip-err">errou ${e.erros}×</span>
        ${typeof srsChip === 'function' ? srsChip(e.qid) : ''}
        ${e.acertosDepois ? `<span class="chip chip-ok">acertou ${e.acertosDepois}× depois</span>` : ''}
      </div>
      <span class="erro-date">${e.dominada ? 'dominada em ' + esc(fmtData(e.dominadaEm)) : 'último erro ' + esc(fmtData(e.ultimaVez))}</span>
    </div>
    <details class="enun">
      <summary><span class="lbl">Enunciado</span> <span class="excerpt muted">· ${esc(excerpt(q.enunciado))}</span></summary>
      <div class="enunciado">${apoioHTML(q, { aberto: false })}${rich(q.enunciado)}</div>
    </details>
    <div class="ans ans-wrong">
      <div class="ans-label">Você marcou</div>
      <div class="ans-alt"><span class="letter-badge">${esc(m)}</span><span>${rich(alts[m] ?? '')}</span></div>
      <p><b>Por que está errada:</b> ${rich(exps[m] || 'Sem explicação cadastrada para esta alternativa.')}</p>
    </div>
    <div class="ans ans-ok">
      <div class="ans-label">Resposta correta</div>
      <div class="ans-alt"><span class="letter-badge">${esc(correta)}</span><span>${rich(alts[correta] ?? '')}</span></div>
      <p><b>Por que está certa:</b> ${rich(explicacaoDe(q))}</p>
    </div>
    <div class="erro-actions">${acoes}</div>
  </article>`;
}
function renderErros() {
  const status = $('eStatus').value;
  const doStatus = Object.values(CADERNO).filter((e) => (status === 'dominadas' ? e.dominada : !e.dominada));
  fillSelect($('eDisc'), uniq(doStatus.map((e) => questaoDoCaderno(e).disciplina || 'Sem disciplina')), 'Todas', $('eDisc').value);

  const lista = errosFiltrados();
  const pend = pendentesCaderno().length, dom = Object.keys(CADERNO).length - pend;
  $('eCount').innerHTML = `<b>${lista.length}</b> <span class="muted">${status === 'dominadas' ? 'dominada(s)' : 'para revisar'}`
    + ` · total: ${pend} pendente(s), ${dom} dominada(s)</span>`;
  $('eRedoBtn').hidden = status === 'dominadas' || !lista.length;
  $('eRedoBtn').textContent = `Refazer ${lista.length} questão(ões) →`;

  $('eList').innerHTML = lista.length ? lista.map(erroCardHTML).join('') : `<div class="card"><p class="empty">${
    status === 'dominadas' ? 'Nenhuma questão dominada ainda.'
      : Object.keys(CADERNO).length ? 'Nenhum erro pendente com esse filtro. 🎉'
      : 'Seu caderno está vazio. As questões que você errar aparecem aqui automaticamente.'}</p></div>`;
}
function openErros() { clearInterval(S.timerId); renderErros(); show('erros'); }

$('errosBtn').addEventListener('click', () => { if (canLeave()) openErros(); });
$('homeErrosBtn').addEventListener('click', openErros);
$('errosBackBtn').addEventListener('click', goHome);
$('eDisc').addEventListener('change', renderErros);
$('eStatus').addEventListener('change', () => { $('eDisc').value = ''; renderErros(); });
$('eRedoBtn').addEventListener('click', () => {
  let list = errosFiltrados().map(questaoDoCaderno);
  if ($('fShuffle').checked) list = shuffle(list);
  startQuiz(list);
});
$('eList').addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-act]'); if (!b) return;
  const id = b.closest('.erro-card').dataset.id;
  if (b.dataset.act === 'refazer') return startQuiz([questaoDoCaderno(CADERNO[id])]);
  setDominada(id, b.dataset.act === 'dominei');
  toast(b.dataset.act === 'dominei' ? 'Marcada como dominada ✓' : 'Questão voltou para o caderno.');
  renderErros();
});

$('resetStatsBtn').addEventListener('click', () => {
  if (!confirm('Apagar todas as estatísticas e o histórico de sessões?')) return;
  STATS = {}; store.del('bbq.stats');
  SESSIONS = []; store.del('bbq.sessions');
  renderHome(); toast('Estatísticas e histórico zerados.');
});

/* ===================================================================== */
// Primeira execução do caderno: importa os erros já registrados no histórico de sessões
if (!CADERNO || typeof CADERNO !== 'object') {
  CADERNO = {};
  const porId = new Map(BANK.map((q) => [q.id, q]));
  SESSIONS.forEach((s) => (s.respostas || []).forEach((r) => {
    const q = porId.get(r.qid); if (!q) return;
    if (!r.ok) registrarErro(q, r.marcada, r.em);
    else if (CADERNO[q.id]) CADERNO[q.id].acertosDepois++;
  }));
  saveCaderno();
}
renderThemeBtn();
renderHome();
