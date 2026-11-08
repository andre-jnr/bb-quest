/* =====================================================================
   BB Quest — REVISÃO ESPAÇADA
   Carregado depois de app.js. Reaproveita BANK, CADERNO, store, startQuiz…

   Regras:
   - Toda questão errada (treino, revisão ou simulado) entra na fila no nível 1,
     com revisão marcada para daqui a 1 dia.
   - Acertou quando a revisão estava vencida (data ≤ hoje) → sobe um nível:
     1 dia → 7 dias → 30 dias → 90 dias → concluída.
   - Errou → volta para o nível 1 (1 dia).
   - Acertar antes da data marcada não muda o nível.

   localStorage: bbq.srs → qid → { qid, nivel (0–3), proxima 'AAAA-MM-DD' | null,
                                   concluida, entrou, ultima, revisoes }
   ===================================================================== */
const SRS_INTERVALOS = [1, 7, 30, 90]; // dias; o índice é o nível (0 = "1 dia")

let SRS = store.get('bbq.srs', null);

/* ---------- Datas (dias do calendário local) ---------- */
const pad2 = (n) => String(n).padStart(2, '0');
function diaStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function hojeStr() { return diaStr(new Date(Date.now())); }
function addDias(str, n) { const [y, m, d] = str.split('-').map(Number); return diaStr(new Date(y, m - 1, d + n)); }
function fmtDia(str) { if (!str) return ''; const [, m, d] = str.split('-'); return `${d}/${m}`; }
function diasAte(str) {
  const [y, m, d] = str.split('-').map(Number), [Y, M, D] = hojeStr().split('-').map(Number);
  return Math.round((new Date(y, m - 1, d) - new Date(Y, M - 1, D)) / 86400000);
}
function quandoTxt(str) {
  const n = diasAte(str);
  return n <= 0 ? 'hoje' : n === 1 ? 'amanhã' : `em ${n} dias (${fmtDia(str)})`;
}
const intervaloTxt = (dias) => (dias === 1 ? '1 dia' : `${dias} dias`);

/* ---------- Fila ---------- */
function saveSrs() { store.set('bbq.srs', SRS); }
function srsVencida(e) { return e && !e.concluida && e.proxima && e.proxima <= hojeStr(); }
function srsQuestao(qid) {
  return BANK.find((q) => q.id === qid) || (CADERNO[qid] && CADERNO[qid].q) || null;
}
function srsPendentesHoje() {
  return Object.values(SRS).filter(srsVencida)
    .sort((a, b) => a.proxima.localeCompare(b.proxima) || a.nivel - b.nivel)
    .filter((e) => srsQuestao(e.qid));
}

// Chamado a cada resposta (treino, revisão e simulado). Devolve a mensagem para o feedback.
function srsResponder(q, ok) {
  const agora = new Date(Date.now()).toISOString();
  const hoje = hojeStr();
  let e = SRS[q.id];

  if (!ok) {
    const voltou = e && !e.concluida && e.nivel > 0;
    const novo = !e || e.concluida;
    e = e || { qid: q.id, entrou: agora, revisoes: 0 };
    if (srsVencida(e)) e.revisoes = (e.revisoes || 0) + 1;
    Object.assign(e, { nivel: 0, proxima: addDias(hoje, SRS_INTERVALOS[0]), concluida: false, ultima: agora });
    SRS[q.id] = e; saveSrs();
    return {
      tipo: 'erro',
      msg: novo ? `🔁 Entrou na revisão espaçada: revise ${quandoTxt(e.proxima)}.`
        : voltou ? `🔁 Voltou para o nível 1 da revisão espaçada: revise ${quandoTxt(e.proxima)}.`
        : `🔁 Continua no nível 1 da revisão espaçada: revise ${quandoTxt(e.proxima)}.`
    };
  }

  if (!e || e.concluida) return null;
  if (!srsVencida(e)) {
    return { tipo: 'cedo', msg: `🔁 Na revisão espaçada (nível ${e.nivel + 1}/${SRS_INTERVALOS.length}), com próxima revisão ${quandoTxt(e.proxima)}. Acertos antes da data não mudam o nível.` };
  }
  e.revisoes = (e.revisoes || 0) + 1;
  e.ultima = agora;
  e.nivel++;
  if (e.nivel >= SRS_INTERVALOS.length) {
    e.concluida = true; e.proxima = null; e.nivel = SRS_INTERVALOS.length - 1;
    saveSrs();
    return { tipo: 'concluida', msg: '🎉 Revisão espaçada concluída! Você acertou nas revisões de 1, 7, 30 e 90 dias.' };
  }
  e.proxima = addDias(hoje, SRS_INTERVALOS[e.nivel]);
  saveSrs();
  return { tipo: 'avancou', msg: `🔁 Avançou para o nível ${e.nivel + 1}/${SRS_INTERVALOS.length}: próxima revisão em ${intervaloTxt(SRS_INTERVALOS[e.nivel])} (${fmtDia(e.proxima)}).` };
}

// Chip de status (tela da questão e Caderno de Erros)
function srsChip(qid) {
  const e = SRS[qid]; if (!e) return '';
  if (e.concluida) return '<span class="chip chip-ok">🔁 revisão concluída</span>';
  if (srsVencida(e)) return '<span class="chip chip-srs-hoje">🔁 revisar hoje</span>';
  return `<span class="chip chip-srs">🔁 nível ${e.nivel + 1}/${SRS_INTERVALOS.length} · ${fmtDia(e.proxima)}</span>`;
}

/* ---------- Sessão de revisão ---------- */
function srsIniciar() {
  const lista = srsPendentesHoje().map((e) => srsQuestao(e.qid));
  if (!lista.length) { renderSrsCard(); return toast('Nada para revisar hoje. 🎉'); }
  startQuiz(lista);
  S.session.tipo = 'revisao';
}

/* ---------- Cartão da tela inicial ---------- */
function renderSrsCard() {
  const todas = Object.values(SRS);
  const ativas = todas.filter((e) => !e.concluida);
  const hoje = srsPendentesHoje().length;
  const concluidas = todas.length - ativas.length;

  $('srsCard').classList.toggle('due', hoje > 0);
  if (hoje) {
    $('srsTxt').innerHTML = `<b>${hoje}</b> ${hoje === 1 ? 'questão' : 'questões'} para revisar hoje`;
  } else if (ativas.length) {
    const prox = ativas.map((e) => e.proxima).sort()[0];
    const n = ativas.filter((e) => e.proxima === prox).length;
    $('srsTxt').innerHTML = `Nada para revisar hoje. 🎉 <span class="muted">Próxima: ${n} ${n === 1 ? 'questão' : 'questões'} ${quandoTxt(prox)}.</span>`;
  } else if (concluidas) {
    $('srsTxt').innerHTML = `Nenhuma questão na fila. 🎉 <span class="muted">${concluidas} ${concluidas === 1 ? 'questão concluiu' : 'questões concluíram'} as 4 revisões.</span>`;
  } else {
    $('srsTxt').innerHTML = '<span class="muted">Fila vazia. As questões que você errar entram aqui e voltam em 1, 7, 30 e 90 dias.</span>';
  }

  const porNivel = SRS_INTERVALOS.map((_, i) => ativas.filter((e) => e.nivel === i).length);
  $('srsLevels').innerHTML = todas.length
    ? SRS_INTERVALOS.map((d, i) => `<span class="srs-level" title="Questões aguardando a revisão de ${intervaloTxt(d)}"><b>${porNivel[i]}</b> ${intervaloTxt(d)}</span>`).join('<span class="srs-arrow">→</span>')
      + `<span class="srs-arrow">→</span><span class="srs-level done" title="Concluíram as 4 revisões"><b>${concluidas}</b> concluídas</span>`
    : '';
  $('srsStartBtn').hidden = !hoje;
  $('srsStartBtn').textContent = `Começar revisão (${hoje}) →`;
}
$('srsStartBtn').addEventListener('click', srsIniciar);

/* ---------- Primeira execução: traz para a fila os erros pendentes do Caderno ---------- */
if (!SRS || typeof SRS !== 'object') {
  SRS = {};
  Object.values(CADERNO).filter((e) => !e.dominada).forEach((e) => {
    const base = e.ultimaVez ? diaStr(new Date(e.ultimaVez)) : hojeStr();
    SRS[e.qid] = { qid: e.qid, nivel: 0, proxima: addDias(base, SRS_INTERVALOS[0]), concluida: false,
                   entrou: e.ultimaVez || new Date(Date.now()).toISOString(), ultima: e.ultimaVez || null, revisoes: 0 };
  });
  saveSrs();
}
renderSrsCard();
