/* =====================================================================
   BB Quest — GAMIFICAÇÃO
   Carregado depois de app.js e revisao.js (usa hojeStr/addDias/diaStr,
   SRS, CADERNO, store, alvoDaResposta…) e antes de simulado.js.

   XP:    acerto = 10 XP · +5 se dentro do tempo-alvo · simulado entregue = +25 XP
          conquistas dão XP extra.
   Níveis: Candidato → Escriturário → Agente de TI → Analista → Gerente de TI
   Streak: dias seguidos com pelo menos uma questão respondida.

   localStorage: bbq.game → { xp, c (contadores), streak, dias, conquistas }
   Os contadores são incrementais (não dependem do histórico de sessões, que
   tem limite de tamanho). Na primeira execução, o histórico existente é
   reprocessado para creditar o XP e as conquistas retroativamente.
   ===================================================================== */
const XP_ACERTO = 10;
const XP_BONUS_TEMPO = 5;
const XP_SIMULADO = 25;

const NIVEIS = [
  { nome: 'Candidato',      xp: 0,     ic: '📝' },
  { nome: 'Escriturário',   xp: 500,   ic: '🗂️' },
  { nome: 'Agente de TI',   xp: 1500,  ic: '💻' },
  { nome: 'Analista',       xp: 4000,  ic: '📊' },
  { nome: 'Gerente de TI',  xp: 10000, ic: '🏆' }
];

// meta(ctx) → [atual, alvo]; desbloqueia quando atual ≥ alvo
const CONQUISTAS = [
  { id: 'primeiro-acerto', ic: '🎯', nome: 'Primeiro passo',        desc: 'Acerte sua primeira questão.',                          xp: 20,  meta: (x) => [x.c.acertos, 1] },
  { id: 'acertos-100',     ic: '💯', nome: 'Centena',               desc: 'Acerte 100 questões.',                                   xp: 100, meta: (x) => [x.c.acertos, 100] },
  { id: 'acertos-500',     ic: '🏃', nome: 'Maratonista',           desc: 'Acerte 500 questões.',                                   xp: 250, meta: (x) => [x.c.acertos, 500] },
  { id: 'respostas-1000',  ic: '📚', nome: 'Mil questões',          desc: 'Responda 1.000 questões.',                               xp: 300, meta: (x) => [x.c.respostas, 1000] },
  { id: 'sql-100',         ic: '🗄️', nome: 'Mestre do SQL',         desc: 'Acerte 100 questões de SQL.',                            xp: 200, meta: (x) => [x.c.temas.sql || 0, 100] },
  { id: 'python-100',      ic: '🐍', nome: 'Pythonista',            desc: 'Acerte 100 questões de Python/Pandas.',                  xp: 200, meta: (x) => [x.c.temas.python || 0, 100] },
  { id: 'seq-10',          ic: '🔥', nome: 'Em chamas',             desc: 'Acerte 10 questões seguidas.',                           xp: 50,  meta: (x) => [x.c.seqMax, 10] },
  { id: 'seq-25',          ic: '☄️', nome: 'Imparável',             desc: 'Acerte 25 questões seguidas.',                           xp: 150, meta: (x) => [x.c.seqMax, 25] },
  { id: 'alvo-10',         ic: '⚡', nome: 'Relâmpago',             desc: 'Acerte 10 seguidas dentro do tempo-alvo.',               xp: 100, meta: (x) => [x.c.seqAlvoMax, 10] },
  { id: 'streak-3',        ic: '📅', nome: 'Constância',            desc: 'Estude 3 dias seguidos.',                                xp: 30,  meta: (x) => [x.streak.melhor, 3] },
  { id: 'streak-7',        ic: '🗓️', nome: 'Semana de foco',        desc: 'Estude 7 dias seguidos.',                                xp: 100, meta: (x) => [x.streak.melhor, 7] },
  { id: 'streak-30',       ic: '🏅', nome: 'Disciplina de concurseiro', desc: 'Estude 30 dias seguidos.',                          xp: 400, meta: (x) => [x.streak.melhor, 30] },
  { id: 'sim-1',           ic: '📝', nome: 'Primeiro simulado',     desc: 'Entregue um simulado.',                                  xp: 50,  meta: (x) => [x.c.simulados, 1] },
  { id: 'sim-80',          ic: '🚀', nome: 'Simulado acima de 80%', desc: 'Tire 80 ou mais em um simulado (mínimo de 10 questões).', xp: 250, meta: (x) => [Math.floor(x.c.melhorNota), 80] },
  { id: 'sim-aprovado',    ic: '✅', nome: 'Aprovado!',             desc: 'Seja aprovado em um simulado completo de 70 questões.',  xp: 300, meta: (x) => [x.c.simAprovados, 1] },
  { id: 'gabarito',        ic: '🌟', nome: 'Gabaritou',             desc: 'Acerte 100% de um treino com 10 ou mais questões.',      xp: 150, meta: (x) => [x.c.gabaritos, 1] },
  { id: 'srs-1',           ic: '🧠', nome: 'Memória de longo prazo', desc: 'Conclua as 4 revisões espaçadas de uma questão.',       xp: 100, meta: (x) => [x.srsConcluidas, 1] },
  { id: 'srs-10',          ic: '🔒', nome: 'Fixou de vez',          desc: 'Conclua as revisões espaçadas de 10 questões.',          xp: 250, meta: (x) => [x.srsConcluidas, 10] },
  { id: 'dominei-10',      ic: '📕', nome: 'Caderno limpo',         desc: 'Marque 10 questões como dominadas no Caderno de Erros.', xp: 100, meta: (x) => [x.dominadas, 10] }
];

function novoGame() {
  return {
    xp: 0, conquistas: {}, dias: [],
    streak: { atual: 0, melhor: 0, ultimo: null },
    c: { respostas: 0, acertos: 0, noAlvo: 0, temas: {}, seq: 0, seqMax: 0, seqAlvo: 0, seqAlvoMax: 0,
         simulados: 0, melhorNota: 0, simAprovados: 0, gabaritos: 0 }
  };
}
let GAME = store.get('bbq.game', null);
const saveGame = () => store.set('bbq.game', GAME);

/* ---------- Níveis ---------- */
function nivelIdx(xp) { let i = 0; NIVEIS.forEach((n, k) => { if (xp >= n.xp) i = k; }); return i; }
function nivelInfo(xp = GAME.xp) {
  const i = nivelIdx(xp), n = NIVEIS[i], prox = NIVEIS[i + 1];
  const pct = prox ? ((xp - n.xp) / (prox.xp - n.xp)) * 100 : 100;
  return { i, n, prox, pct, falta: prox ? prox.xp - xp : 0 };
}
const fmtXP = (n) => Math.round(n).toLocaleString('pt-BR');

/* ---------- Streak ---------- */
function registrarDia(dia) {
  const s = GAME.streak;
  if (s.ultimo === dia) return;
  if (s.ultimo && dia < s.ultimo) return; // fora de ordem (não acontece no uso normal)
  s.atual = s.ultimo === addDias(dia, -1) ? s.atual + 1 : 1;
  s.ultimo = dia;
  s.melhor = Math.max(s.melhor, s.atual);
  if (!GAME.dias.includes(dia)) { GAME.dias.push(dia); if (GAME.dias.length > 120) GAME.dias = GAME.dias.slice(-120); }
}
// Streak "vivo": vale se a última atividade foi hoje ou ontem
function streakAtual() {
  const s = GAME.streak, hoje = hojeStr();
  return s.ultimo === hoje || s.ultimo === addDias(hoje, -1) ? s.atual : 0;
}

/* ---------- Conquistas ---------- */
function gameCtx() {
  return {
    c: GAME.c, streak: GAME.streak,
    srsConcluidas: typeof SRS === 'object' && SRS ? Object.values(SRS).filter((e) => e.concluida).length : 0,
    dominadas: Object.values(CADERNO || {}).filter((e) => e.dominada).length
  };
}
function checarConquistas(quando) {
  const ctx = gameCtx(), novas = [];
  CONQUISTAS.forEach((a) => {
    if (GAME.conquistas[a.id]) return;
    const [at, alvo] = a.meta(ctx);
    if (at >= alvo) { GAME.conquistas[a.id] = quando || new Date(Date.now()).toISOString(); GAME.xp += a.xp; novas.push(a); }
  });
  return novas;
}

/* ---------- Eventos ---------- */
function temaDe(q) {
  const t = norm((q.assunto || '') + ' ' + (q.tags || []).join(' '));
  if (/\bsql\b/.test(t)) return 'sql';
  if (t.includes('python') || t.includes('pandas')) return 'python';
  return null;
}
// Uma resposta (treino, revisão ou simulado)
function gameResponder({ q, ok, tempo, alvo, dia, quando }) {
  const c = GAME.c, antes = GAME.xp;
  registrarDia(dia || hojeStr());
  c.respostas++;
  let xp = 0, bonus = 0;
  if (ok) {
    xp = XP_ACERTO; c.acertos++;
    c.seq++; c.seqMax = Math.max(c.seqMax, c.seq);
    if (alvo && tempo <= alvo) {
      bonus = XP_BONUS_TEMPO; c.noAlvo++;
      c.seqAlvo++; c.seqAlvoMax = Math.max(c.seqAlvoMax, c.seqAlvo);
    } else c.seqAlvo = 0;
    const tema = temaDe(q); if (tema) c.temas[tema] = (c.temas[tema] || 0) + 1;
  } else { c.seq = 0; c.seqAlvo = 0; }
  GAME.xp += xp + bonus;
  const novas = checarConquistas(quando);
  saveGame();
  return { xp: xp + bonus, bonus, antes, depois: GAME.xp, novas };
}
// Fim de um treino/revisão (conquista "Gabaritou")
function gameFimSessao(sess, quando) {
  const antes = GAME.xp, r = sess.respostas || [];
  if (sess.tipo !== 'simulado' && r.length >= 10 && r.every((x) => x.ok)) GAME.c.gabaritos++;
  const novas = checarConquistas(quando);
  saveGame();
  return { xp: 0, bonus: 0, antes, depois: GAME.xp, novas };
}
// Simulado entregue
function gameSimulado(rec, quando) {
  const antes = GAME.xp, c = GAME.c;
  c.simulados++;
  if (rec.aplicadas >= 10) c.melhorNota = Math.max(c.melhorNota, rec.nota);
  if (rec.aprovado && !rec.parcial) c.simAprovados++;
  GAME.xp += XP_SIMULADO;
  const novas = checarConquistas(quando);
  saveGame();
  return { xp: XP_SIMULADO, bonus: 0, antes, depois: GAME.xp, novas };
}
// Conquistas que dependem de outras telas (ex.: "Dominei" no Caderno)
function gameRechecar() {
  const antes = GAME.xp, novas = checarConquistas();
  if (novas.length) { saveGame(); gameCelebrar({ xp: 0, antes, depois: GAME.xp, novas }); }
}
function gameMerge(list) {
  list = list.filter(Boolean);
  if (!list.length) return null;
  return {
    xp: list.reduce((a, i) => a + i.xp, 0), bonus: list.reduce((a, i) => a + (i.bonus || 0), 0),
    antes: list[0].antes, depois: list[list.length - 1].depois, novas: list.flatMap((i) => i.novas)
  };
}

/* ---------- Celebração (animações leves) ---------- */
function floatXP(txt) {
  const el = document.createElement('span');
  el.className = 'xp-float'; el.textContent = txt;
  $('xpLayer').appendChild(el);
  setTimeout(() => el.remove(), 1600);
}
function toastConquista(a, delay) {
  setTimeout(() => {
    const el = document.createElement('div');
    el.className = 'ach-toast';
    el.innerHTML = `<span class="ach-ic">${a.ic}</span><div><small>Conquista desbloqueada</small><b>${esc(a.nome)}</b><span>${esc(a.desc)} · +${a.xp} XP</span></div>`;
    $('achStack').appendChild(el);
    setTimeout(() => el.classList.add('out'), 4200);
    setTimeout(() => el.remove(), 4700);
  }, delay);
}
function mostrarLevelUp(idx) {
  const n = NIVEIS[idx];
  $('luIc').textContent = n.ic;
  $('luTitle').textContent = n.nome;
  $('luSub').textContent = idx === NIVEIS.length - 1
    ? 'Você chegou ao topo da carreira no BB Quest!'
    : `Próximo: ${NIVEIS[idx + 1].nome}, com ${fmtXP(NIVEIS[idx + 1].xp)} XP.`;
  const cores = ['#ffd60a', '#2f6bff', '#3fd18a', '#ff6f6f', '#ffffff'];
  $('luConfetti').innerHTML = Array.from({ length: 28 }, (_, k) => {
    const ang = (k / 28) * 360 + Math.random() * 12, dist = 110 + Math.random() * 90;
    return `<i style="--x:${Math.cos(ang * Math.PI / 180) * dist}px;--y:${Math.sin(ang * Math.PI / 180) * dist}px;--r:${Math.random() * 540}deg;background:${cores[k % cores.length]};animation-delay:${Math.random() * 120}ms"></i>`;
  }).join('');
  $('levelUp').hidden = false;
  $('luOk').focus();
}
function fecharLevelUp() { $('levelUp').hidden = true; }
$('luOk').addEventListener('click', fecharLevelUp);
$('levelUp').addEventListener('click', (e) => { if (e.target === $('levelUp')) fecharLevelUp(); });
// Com o modal aberto, Enter/Esc fecham e não chegam às telas de questão
window.addEventListener('keydown', (e) => {
  if ($('levelUp').hidden) return;
  if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); fecharLevelUp(); }
  e.stopImmediatePropagation();
}, true);

function gameCelebrar(info) {
  if (!info) return;
  if (info.xp > 0) floatXP(`+${info.xp} XP${info.bonus ? ' ⚡' : ''}`);
  (info.novas || []).forEach((a, k) => toastConquista(a, 300 + k * 700));
  const de = nivelIdx(info.antes), para = nivelIdx(info.depois);
  renderGamePill(true);
  if (para > de) setTimeout(() => mostrarLevelUp(para), 450);
}

/* ---------- Interface ---------- */
function renderGamePill(bump) {
  const ni = nivelInfo(), st = streakAtual();
  $('gpIc').textContent = ni.n.ic;
  $('gpNome').textContent = ni.n.nome;
  $('gpXp').textContent = fmtXP(GAME.xp) + ' XP';
  $('gpStreak').textContent = '🔥 ' + st;
  $('gpStreak').classList.toggle('off', !st);
  $('gameBtn').title = `${ni.n.nome} · ${fmtXP(GAME.xp)} XP · sequência de ${st} dia(s)`;
  if (bump) { $('gameBtn').classList.remove('bump'); void $('gameBtn').offsetWidth; $('gameBtn').classList.add('bump'); }
  renderGameHome();
}
function renderGameHome() {
  if (!$('plNome')) return;
  const ni = nivelInfo(), st = streakAtual(), hoje = GAME.streak.ultimo === hojeStr();
  $('plIc').textContent = ni.n.ic;
  $('plNome').textContent = ni.n.nome;
  $('plXp').textContent = fmtXP(GAME.xp) + ' XP';
  $('plBar').style.width = ni.pct + '%';
  $('plNext').textContent = ni.prox ? `faltam ${fmtXP(ni.falta)} XP para ${ni.prox.nome}` : 'nível máximo alcançado';
  $('plStreak').innerHTML = `<b>🔥 ${st}</b><small>${st === 1 ? 'dia' : 'dias'}${st && !hoje ? ' · estude hoje!' : ''}</small>`;
}
function renderGameScreen() {
  const ni = nivelInfo(), st = streakAtual();
  $('glIc').textContent = ni.n.ic;
  $('glNome').textContent = ni.n.nome;
  $('glXp').textContent = `${fmtXP(GAME.xp)} XP no total`;
  $('glBar').style.width = ni.pct + '%';
  $('glNext').textContent = ni.prox ? `Faltam ${fmtXP(ni.falta)} XP para ${ni.prox.nome}.` : 'Você chegou ao nível máximo. 🏆';
  $('glLadder').innerHTML = NIVEIS.map((n, k) => `<li class="${k < ni.i ? 'done' : k === ni.i ? 'atual' : ''}">
      <span class="ld-ic">${n.ic}</span><span class="ld-nome">${esc(n.nome)}</span><span class="ld-xp">${fmtXP(n.xp)} XP</span></li>`).join('');

  $('gsAtual').textContent = st;
  $('gsMelhor').textContent = GAME.streak.melhor;
  $('gsHoje').textContent = GAME.streak.ultimo === hojeStr() ? '✓ Você já estudou hoje.' : st ? 'Responda uma questão hoje para manter a sequência.' : 'Responda uma questão para começar uma sequência.';
  const dias = new Set(GAME.dias), hoje = hojeStr();
  $('gDays').innerHTML = Array.from({ length: 28 }, (_, k) => {
    const d = addDias(hoje, k - 27);
    return `<span class="day ${dias.has(d) ? 'on' : ''} ${d === hoje ? 'today' : ''}" title="${fmtDia(d)}${dias.has(d) ? ' · estudou' : ''}"></span>`;
  }).join('');

  const ctx = gameCtx();
  const feitas = CONQUISTAS.filter((a) => GAME.conquistas[a.id]).length;
  $('achCount').textContent = `${feitas} de ${CONQUISTAS.length}`;
  const ordem = [...CONQUISTAS].sort((a, b) => (!!GAME.conquistas[b.id] - !!GAME.conquistas[a.id]));
  $('achGrid').innerHTML = ordem.map((a) => {
    const quando = GAME.conquistas[a.id];
    const [at, alvo] = a.meta(ctx), pct = Math.min(100, (at / alvo) * 100);
    return `<div class="ach ${quando ? 'on' : ''}">
      <span class="ach-ic">${a.ic}</span>
      <div class="ach-body">
        <b>${esc(a.nome)}</b><span>${esc(a.desc)}</span>
        ${quando ? `<small class="ach-when">✓ ${new Date(quando).toLocaleDateString('pt-BR')} · +${a.xp} XP</small>`
          : `<div class="ach-prog"><i style="width:${pct}%"></i></div><small>${fmtXP(Math.min(at, alvo))}/${fmtXP(alvo)} · +${a.xp} XP</small>`}
      </div>
    </div>`;
  }).join('');
}
function openGame() { renderGameScreen(); show('game'); }
$('gameBtn').addEventListener('click', () => { if (canLeave()) openGame(); });
$('playerCard').addEventListener('click', openGame);
$('gameBack').addEventListener('click', goHome);

/* ---------- Primeira execução: XP retroativo pelo histórico ---------- */
if (!GAME || typeof GAME !== 'object' || !GAME.c) {
  GAME = novoGame();
  const sessoes = (store.get('bbq.sessions', []) || []).slice()
    .sort((a, b) => String(a.inicio).localeCompare(String(b.inicio)));
  sessoes.forEach((s) => {
    (s.respostas || []).forEach((r) => {
      const quando = r.em || s.fim || s.inicio;
      gameResponder({ q: { assunto: r.assunto }, ok: r.ok, tempo: r.tempo || 0, alvo: alvoDaResposta(r),
                      dia: diaStr(new Date(quando)), quando });
    });
    gameFimSessao(s, s.fim || s.inicio);
  });
  (store.get('bbq.simulados', []) || []).forEach((rec) => gameSimulado(rec, rec.fim));
  checarConquistas();
  saveGame();
  if (GAME.xp > 0) {
    const n = Object.keys(GAME.conquistas).length;
    setTimeout(() => toast(`🎮 Gamificação ativada: ${fmtXP(GAME.xp)} XP${n ? ` e ${n} conquista(s)` : ''} pelo seu histórico!`), 400);
  }
}
renderGamePill();
