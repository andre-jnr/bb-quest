/* =====================================================================
   BB Quest — MODO SIMULADO
   Carregado depois de app.js e reaproveita: BANK, STATS, CADERNO, store,
   regraDe/pesoDe/alvoDe, snapshotQ, registrarErro, saveSession, rich, esc…

   localStorage:
     bbq.simAtual   → simulado em andamento (retomável)
     bbq.simulados  → histórico de simulados entregues
   ===================================================================== */
const SIMULADO = {
  duracaoSeg: 4 * 60 * 60,   // 4 horas para as objetivas (a redação fica fora)
  minimoPct: 50,             // mínimo no total, em Básicos e em Específicos
  // Ordem e quantidade do edital. "nome" deve ser igual ao de PESOS_EDITAL (app.js).
  composicao: [
    { nome: 'Língua Portuguesa',                 qtd: 10, bloco: 'basicos' },
    { nome: 'Língua Inglesa',                    qtd: 5,  bloco: 'basicos' },
    { nome: 'Matemática',                        qtd: 5,  bloco: 'basicos' },
    { nome: 'Atualidades do Mercado Financeiro', qtd: 5,  bloco: 'basicos' },
    { nome: 'Probabilidade e Estatística',       qtd: 5,  bloco: 'especificos' },
    { nome: 'Conhecimentos Bancários',           qtd: 5,  bloco: 'especificos' },
    { nome: 'Tecnologia da Informação',          qtd: 35, bloco: 'especificos' }
  ]
};
const BLOCO_LABEL = { basicos: 'Conhecimentos Básicos', especificos: 'Conhecimentos Específicos' };
const MAX_SIMULADOS = 50;

let SIMULADOS = store.get('bbq.simulados', []);
if (!Array.isArray(SIMULADOS)) SIMULADOS = [];
let SIM = null;               // simulado aberto: modo 'prova' ou 'revisao'
let simTimerId = null, simLastTick = 0, simTicks = 0;

const up = (s) => String(s || '').toUpperCase();
const totalExigido = () => SIMULADO.composicao.reduce((a, c) => a + c.qtd, 0);
function fmtHMS(s) {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function pctTxt(v) { return v == null ? '—' : fmtPts(v) + '%'; }

/* ---------------------------------------------------------------------
   Montagem
   --------------------------------------------------------------------- */
function disponibilidade() {
  return SIMULADO.composicao.map((c) => {
    const pool = BANK.filter((q) => { const r = regraDe(q.disciplina); return r && r.nome === c.nome; });
    return { ...c, peso: pesoDe(c.nome), pool, disponiveis: pool.length };
  });
}
function simIniciar() {
  const atual = store.get('bbq.simAtual', null);
  if (atual && !confirm('Já existe um simulado em andamento. Descartá-lo e começar outro?')) return;
  const questoes = [], grupos = [];
  disponibilidade().forEach((c) => {
    const sel = shuffle(c.pool).slice(0, c.qtd);
    grupos.push({ nome: c.nome, bloco: c.bloco, peso: c.peso, exigidas: c.qtd, aplicadas: sel.length, inicio: questoes.length });
    sel.forEach((q) => questoes.push(snapshotQ(q)));
  });
  if (!questoes.length) return toast('Não há questões das disciplinas do edital no banco.');
  const n = questoes.length;
  SIM = {
    id: 'sim-' + Date.now(), inicio: new Date().toISOString(), modo: 'prova',
    gasto: 0, duracao: SIMULADO.duracaoSeg, parcial: n < totalExigido(),
    questoes, grupos, atual: 0,
    respostas: Array(n).fill(null), marcadas: Array(n).fill(false), tempos: Array(n).fill(0)
  };
  simSalvar();
  simAbrir();
}
function simContinuar() {
  const s = store.get('bbq.simAtual', null);
  if (!s) return renderSimHome();
  SIM = s; SIM.modo = 'prova';
  simAbrir();
}
function simDescartar() {
  if (!confirm('Descartar o simulado em andamento? As respostas dele serão perdidas.')) return;
  store.del('bbq.simAtual');
  if (SIM && SIM.modo === 'prova') SIM = null;
  renderSimHome(); toast('Simulado descartado.');
}

/* ---------------------------------------------------------------------
   Cronômetro geral (conta só com a tela do simulado aberta)
   --------------------------------------------------------------------- */
function simSalvar() { if (SIM && SIM.modo === 'prova') store.set('bbq.simAtual', SIM); }
function simContar() {
  const now = Date.now();
  // Ignora saltos enormes (ex.: computador suspenso)
  const dt = Math.min((now - simLastTick) / 1000, 300);
  simLastTick = now;
  if (dt > 0) { SIM.gasto += dt; SIM.tempos[SIM.atual] += dt; }
}
function simStartTimer() {
  clearInterval(simTimerId);
  simLastTick = Date.now();
  simTimerId = setInterval(simTick, 1000);
  simRenderClock();
}
function simTick() {
  if (!SIM || SIM.modo !== 'prova') return;
  simContar();
  if (++simTicks % 5 === 0) simSalvar();
  simRenderClock();
  if (SIM.gasto >= SIM.duracao) simEntregar(true);
}
function simParar() {
  if (!simTimerId) return;
  clearInterval(simTimerId); simTimerId = null;
  if (SIM && SIM.modo === 'prova') simContar();
}
// Chamado por show() (app.js) ao sair da tela da prova
function simPausar() {
  if (!simTimerId) return;
  simParar(); simSalvar();
  toast('Simulado pausado. Continue pelo Modo Simulado.');
}
function simRenderClock() {
  if (!SIM) return;
  const el = $('simClock');
  if (SIM.modo === 'revisao') {
    el.className = 'timer t-verde';
    $('simClockTxt').textContent = 'Revisão';
    el.title = 'Modo revisão';
    return;
  }
  const rest = SIM.duracao - SIM.gasto;
  const cor = rest > 30 * 60 ? 'verde' : rest > 10 * 60 ? 'amarelo' : 'vermelho';
  el.className = 'timer t-' + cor;
  $('simClockTxt').textContent = fmtHMS(rest);
  el.title = `Tempo restante · usado ${fmtHMS(SIM.gasto)}`;
}
window.addEventListener('pagehide', () => { if (simTimerId) { simContar(); simSalvar(); } });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && simTimerId) { simContar(); simSalvar(); }
});

/* ---------------------------------------------------------------------
   Tela da prova / revisão
   --------------------------------------------------------------------- */
function grupoDe(i) { return SIM.grupos.find((g) => i >= g.inicio && i < g.inicio + g.aplicadas); }
function simContagem() {
  const n = SIM.questoes.length;
  const resp = SIM.respostas.filter(Boolean).length;
  const marc = SIM.marcadas.filter(Boolean).length;
  return { n, resp, brancos: n - resp, marc };
}
function simAbrir() {
  show('sim');
  renderSimQuestao();
  if (SIM.modo === 'prova') simStartTimer(); else simRenderClock();
}
function simIr(i) {
  if (!SIM) return;
  i = Math.max(0, Math.min(SIM.questoes.length - 1, i));
  if (SIM.modo === 'prova' && simTimerId) simContar(); // fecha o tempo da questão atual
  SIM.atual = i;
  simSalvar();
  renderSimQuestao();
}
function renderSimQuestao(scroll = true) {
  const i = SIM.atual, q = SIM.questoes[i], g = grupoDe(i) || {};
  const rev = SIM.modo === 'revisao';
  const resp = SIM.respostas[i], correta = up(q.correta);
  const c = simContagem();

  $('simPos').textContent = `Questão ${i + 1} de ${c.n}`;
  $('simCount').textContent = rev ? '' : `${c.resp} respondida(s) · ${c.marc} marcada(s)`;
  $('simBar').style.width = (rev ? ((i + 1) / c.n) : (c.resp / c.n)) * 100 + '%';
  $('simCartaoCount').textContent = `${c.resp}/${c.n}`;
  $('simExitBtn').textContent = rev ? '←' : '⏸';
  $('simExitBtn').title = rev ? 'Voltar ao resultado' : 'Pausar e sair';
  $('simEntregarBtn').hidden = rev;

  let status = '';
  if (rev) status = !resp ? '<span class="chip" style="background:var(--surface-2);color:var(--muted)">em branco</span>'
    : resp === correta ? '<span class="chip chip-ok">acertou</span>' : '<span class="chip chip-err">errou</span>';
  $('simMeta').innerHTML = [
    `<span class="chip">${esc(g.nome || q.disciplina || '')}</span>`,
    g.bloco && `<span class="chip" style="background:var(--surface-2);color:var(--muted)">${esc(BLOCO_LABEL[g.bloco])}</span>`,
    `<span class="chip" style="background:var(--surface-2);color:var(--muted)">peso ${fmtPts(g.peso || pesoDe(q.disciplina))}</span>`,
    q.assunto && `<span class="chip" style="background:var(--surface-2);color:var(--muted)">${esc(q.assunto)}</span>`,
    SIM.marcadas[i] && '<span class="chip chip-inc" style="font-size:12.5px;padding:4px 10px">🚩 revisar</span>',
    status
  ].filter(Boolean).join('');

  $('simEnunciado').innerHTML = rich(q.enunciado);
  $('simAlts').innerHTML = LETTERS.filter((L) => q.alternativas && q.alternativas[L] != null).map((L) => {
    let cls = '';
    if (rev) cls = L === correta ? 'correct' : L === resp ? 'wrong' : 'dim';
    else if (L === resp) cls = 'selected';
    return `<button class="alt ${cls}" data-l="${L}" ${rev ? 'disabled' : ''} aria-label="Alternativa ${L}">
      <span class="letter">${L}</span><span class="txt">${rich(q.alternativas[L])}</span></button>`;
  }).join('');

  $('simTools').hidden = rev;
  $('simFlagBtn').textContent = SIM.marcadas[i] ? '🚩 Desmarcar revisão' : '🚩 Marcar para revisar';
  $('simFlagBtn').classList.toggle('on', !!SIM.marcadas[i]);
  $('simClearBtn').disabled = !resp;

  // Revisão: explicações
  if (rev) {
    const exp = q.explicacaoAlternativas || {};
    const tempo = SIM.tempos[i] || 0, alvo = alvoDe(q), cor = semaforo(tempo, alvo);
    $('simFeedback').innerHTML = `
      <div class="feedback ${resp === correta ? 'ok' : 'err'}">
        <div class="fb-head">
          ${!resp ? `⚪ Em branco. Resposta correta: ${esc(correta)}` : resp === correta ? '✅ Você acertou!' : `❌ Você marcou ${esc(resp)}. Resposta correta: ${esc(correta)}`}
          <span class="t">${semDot(cor)} ${fmtTime(tempo)} de ${fmtTime(alvo)}</span>
        </div>
        <div class="fb-body">
          <div class="block"><h4>Por que a ${esc(correta)} está correta</h4><p>${rich(q.explicacaoCorreta || 'Sem explicação cadastrada.')}</p></div>
          ${resp && resp !== correta && exp[resp] ? `<div class="block"><h4>Por que a ${esc(resp)} está errada</h4><p>${rich(exp[resp])}</p></div>` : ''}
        </div>
      </div>`;
  } else $('simFeedback').innerHTML = '';

  const last = i === c.n - 1;
  $('simPrevBtn').disabled = i === 0;
  $('simNextBtn').innerHTML = last
    ? (rev ? '<span class="lbl">Fim</span> ✓' : 'Entregar ✓')
    : '<span class="lbl">Próxima</span> ›';
  $('simNextBtn').disabled = rev && last;
  if (!$('cartao').hidden) renderCartao();
  if (scroll) window.scrollTo({ top: 0 });
}

$('simAlts').addEventListener('click', (e) => {
  const b = e.target.closest('.alt'); if (!b || !SIM || SIM.modo !== 'prova') return;
  SIM.respostas[SIM.atual] = b.dataset.l;
  simSalvar(); renderSimQuestao(false);
});
$('simFlagBtn').addEventListener('click', () => simToggleFlag());
$('simClearBtn').addEventListener('click', () => {
  SIM.respostas[SIM.atual] = null; simSalvar(); renderSimQuestao(false);
});
function simToggleFlag() {
  if (!SIM || SIM.modo !== 'prova') return;
  SIM.marcadas[SIM.atual] = !SIM.marcadas[SIM.atual];
  simSalvar(); renderSimQuestao(false);
}
$('simPrevBtn').addEventListener('click', () => simIr(SIM.atual - 1));
$('simNextBtn').addEventListener('click', () => {
  if (SIM.atual === SIM.questoes.length - 1) { if (SIM.modo === 'prova') simEntregar(false); }
  else simIr(SIM.atual + 1);
});
$('simEntregarBtn').addEventListener('click', () => simEntregar(false));
$('simExitBtn').addEventListener('click', () => {
  if (SIM.modo === 'revisao') { renderSimResultado(SIM.record); show('simResult'); }
  else { renderSimHome(); show('simHome'); }
});

/* ---------------------------------------------------------------------
   Cartão-resposta
   --------------------------------------------------------------------- */
function renderCartao() {
  const rev = SIM.modo === 'revisao';
  const c = simContagem();
  $('ctLegend').innerHTML = rev
    ? '<span><i class="ct-sw ok"></i>acerto</span><span><i class="ct-sw err"></i>erro</span><span><i class="ct-sw"></i>em branco</span><span>🚩 marcada</span>'
    : '<span><i class="ct-sw resp"></i>respondida</span><span><i class="ct-sw"></i>em branco</span><span>🚩 marcada</span><span><i class="ct-sw atual"></i>atual</span>';
  $('ctBody').innerHTML = SIM.grupos.filter((g) => g.aplicadas).map((g) => {
    const cells = [];
    for (let i = g.inicio; i < g.inicio + g.aplicadas; i++) {
      const r = SIM.respostas[i], cor = up(SIM.questoes[i].correta);
      const cls = [
        rev ? (r ? (r === cor ? 'ok' : 'err') : '') : (r ? 'resp' : ''),
        SIM.marcadas[i] ? 'flag' : '', i === SIM.atual ? 'atual' : ''
      ].join(' ');
      cells.push(`<button class="ct-cell ${cls}" data-i="${i}" title="Questão ${i + 1}${r ? ' · ' + r : ' · em branco'}">
        <span class="n">${i + 1}</span><span class="l">${r || '·'}</span></button>`);
    }
    return `<div class="ct-group">
      <h4><span>${esc(g.nome)}</span><span class="muted">${g.aplicadas}${g.aplicadas < g.exigidas ? ' de ' + g.exigidas : ''} · peso ${fmtPts(g.peso)}</span></h4>
      <div class="ct-grid">${cells.join('')}</div>
    </div>`;
  }).join('');
  if (rev) {
    const acertos = SIM.respostas.filter((r, i) => r && r === up(SIM.questoes[i].correta)).length;
    $('ctResumo').textContent = `${acertos} acerto(s) · ${c.resp - acertos} erro(s) · ${c.brancos} em branco`;
  } else {
    $('ctResumo').textContent = `${c.resp} respondida(s) · ${c.brancos} em branco · ${c.marc} marcada(s)`;
  }
  $('ctEntregar').hidden = rev;
}
function abrirCartao() {
  if (!SIM) return;
  renderCartao();
  $('cartao').hidden = false;
  document.body.style.overflow = 'hidden';
  const at = $('ctBody').querySelector('.atual'); if (at) at.scrollIntoView({ block: 'center' });
  $('cartaoClose').focus();
}
function fecharCartao() { $('cartao').hidden = true; document.body.style.overflow = ''; }
$('simCartaoBtn').addEventListener('click', abrirCartao);
$('cartaoClose').addEventListener('click', fecharCartao);
$('cartao').addEventListener('click', (e) => { if (e.target === $('cartao')) fecharCartao(); });
$('ctBody').addEventListener('click', (e) => {
  const b = e.target.closest('.ct-cell'); if (!b) return;
  fecharCartao(); simIr(+b.dataset.i);
});
$('ctEntregar').addEventListener('click', () => { fecharCartao(); simEntregar(false); });

document.addEventListener('keydown', (e) => {
  if ($('sim').hidden || !SIM || e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
  if (e.key === 'Escape') { if (!$('cartao').hidden) fecharCartao(); return; }
  if (!$('cartao').hidden) return;
  const k = e.key.toUpperCase();
  if (e.key === 'ArrowLeft') { simIr(SIM.atual - 1); e.preventDefault(); }
  else if (e.key === 'ArrowRight') { simIr(SIM.atual + 1); e.preventDefault(); }
  else if (k === 'C') { abrirCartao(); e.preventDefault(); }
  else if (SIM.modo !== 'prova') return;
  else if (k === 'M') { simToggleFlag(); e.preventDefault(); }
  else if (LETTERS.includes(k) && SIM.questoes[SIM.atual].alternativas[k] != null) {
    SIM.respostas[SIM.atual] = k; simSalvar(); renderSimQuestao(false); e.preventDefault();
  }
});

/* ---------------------------------------------------------------------
   Entrega e correção
   --------------------------------------------------------------------- */
function simCalcular(sim) {
  const disciplinas = sim.grupos.map((g) => {
    const d = { nome: g.nome, bloco: g.bloco, peso: g.peso, exigidas: g.exigidas, aplicadas: g.aplicadas, inicio: g.inicio,
                acertos: 0, erros: 0, brancos: 0, pontos: 0, max: g.aplicadas * g.peso };
    for (let i = g.inicio; i < g.inicio + g.aplicadas; i++) {
      const r = sim.respostas[i];
      if (!r) d.brancos++;
      else if (r === up(sim.questoes[i].correta)) { d.acertos++; d.pontos += g.peso; }
      else d.erros++;
    }
    return d;
  });
  const soma = (arr) => arr.reduce((a, d) => ({
    pontos: a.pontos + d.pontos, max: a.max + d.max, acertos: a.acertos + d.acertos, total: a.total + d.aplicadas
  }), { pontos: 0, max: 0, acertos: 0, total: 0 });
  const pct = (b) => (b.max ? (b.pontos / b.max) * 100 : null);
  const blocos = {
    basicos: soma(disciplinas.filter((d) => d.bloco === 'basicos')),
    especificos: soma(disciplinas.filter((d) => d.bloco === 'especificos'))
  };
  const tot = soma(disciplinas);
  const nota = pct(tot) || 0;   // escala 0–100 (com as 70 questões, nota = pontos)
  const min = SIMULADO.minimoPct;
  const zeradas = disciplinas.filter((d) => d.aplicadas && d.acertos === 0).map((d) => d.nome);
  const naoAvaliadas = disciplinas.filter((d) => !d.aplicadas).map((d) => d.nome);
  const pb = pct(blocos.basicos), pe = pct(blocos.especificos);
  const criterios = [
    { nome: `Nota total ≥ ${min}%`, valor: nota, ok: nota >= min },
    { nome: `Conhecimentos Básicos ≥ ${min}%`, valor: pb, ok: pb == null ? null : pb >= min },
    { nome: `Conhecimentos Específicos ≥ ${min}%`, valor: pe, ok: pe == null ? null : pe >= min },
    { nome: 'Nenhuma disciplina zerada', zeradas, ok: zeradas.length === 0 }
  ];
  return {
    id: sim.id, inicio: sim.inicio, fim: new Date().toISOString(),
    gasto: Math.round(sim.gasto), duracao: sim.duracao,
    esperado: totalExigido(), aplicadas: sim.questoes.length, parcial: !!sim.parcial,
    nota, pontos: tot.pontos, pontosMax: tot.max, acertos: tot.acertos,
    aprovado: criterios.every((c) => c.ok !== false),
    criterios, naoAvaliadas, blocos, disciplinas,
    questoes: sim.questoes.map((q, i) => ({
      qid: q.id, disciplina: q.disciplina, assunto: q.assunto, marcada: sim.respostas[i] || null,
      correta: up(q.correta), tempo: Math.round(sim.tempos[i] || 0), revisar: !!sim.marcadas[i]
    }))
  };
}
// Leva as respostas para estatísticas, histórico de sessões e Caderno de Erros
function simIntegrar(sim, rec) {
  const respostas = [];
  sim.questoes.forEach((q, i) => {
    const m = sim.respostas[i]; if (!m) return;
    const c = up(q.correta), ok = m === c;
    const st = STATS[q.id] || { t: 0, a: 0 };
    st.t++; if (ok) st.a++; st.last = ok; STATS[q.id] = st;
    respostas.push({
      qid: q.id, disciplina: q.disciplina || 'Sem disciplina', assunto: q.assunto || 'Sem assunto',
      peso: pesoDe(q.disciplina), ok, marcada: m, correta: c,
      tempo: Math.round(sim.tempos[i] || 0), alvo: alvoDe(q), em: rec.fim
    });
    const e = CADERNO[q.id];
    if (!ok) registrarErro(q, m, rec.fim);
    else if (e && !e.dominada) e.acertosDepois = (e.acertosDepois || 0) + 1;
    if (typeof srsResponder === 'function') srsResponder(q, ok);
  });
  store.set('bbq.stats', STATS);
  saveCaderno(); updateErrosBadge();
  if (respostas.length) {
    saveSession({ id: 'sess-' + rec.id, tipo: 'simulado', inicio: rec.inicio, fim: rec.fim,
                  completa: true, planejadas: sim.questoes.length, respostas });
  }
}
function simEntregar(auto) {
  if (!SIM || SIM.modo !== 'prova') return;
  if (!auto) {
    const c = simContagem();
    const msg = `Entregar o simulado?\n\n${c.resp} respondida(s) · ${c.brancos} em branco · ${c.marc} marcada(s) para revisar.`
      + (c.brancos ? '\nQuestões em branco contam como erro.' : '');
    if (!confirm(msg)) return;
  }
  simParar();
  fecharCartao();
  const rec = simCalcular(SIM);
  SIMULADOS.push(rec);
  if (SIMULADOS.length > MAX_SIMULADOS) SIMULADOS = SIMULADOS.slice(-MAX_SIMULADOS);
  store.set('bbq.simulados', SIMULADOS);
  simIntegrar(SIM, rec);
  store.del('bbq.simAtual');
  SIM.modo = 'revisao'; SIM.record = rec;
  renderSimResultado(rec);
  show('simResult');
  if (auto) toast('⏰ Tempo esgotado! Simulado entregue automaticamente.');
}

/* ---------------------------------------------------------------------
   Resultado
   --------------------------------------------------------------------- */
function renderSimResultado(rec) {
  $('srNota').textContent = fmtPts(rec.nota);
  $('srStatus').textContent = rec.aprovado ? '✓ APROVADO' : '✕ ELIMINADO';
  $('srStatus').className = 'sim-status ' + (rec.aprovado ? 'ok' : 'err');
  const data = new Date(rec.inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  $('srSub').textContent = `${data} · ${rec.acertos} acerto(s) em ${rec.aplicadas} questões · ${fmtPts(rec.pontos)} de ${fmtPts(rec.pontosMax)} pontos · tempo ${fmtHMS(rec.gasto)} de ${fmtHMS(rec.duracao)}`;
  $('srParcial').hidden = !rec.parcial;
  $('srParcial').textContent = rec.parcial
    ? `⚠ Simulado parcial: ${rec.aplicadas} de ${rec.esperado} questões (faltam questões no banco). A nota foi calculada proporcionalmente, em escala de 0 a 100.`
      + (rec.naoAvaliadas.length ? ` Sem questões: ${rec.naoAvaliadas.join(', ')}.` : '')
    : '';

  $('srCrit').innerHTML = rec.criterios.map((c) => {
    const ic = c.ok === null ? '—' : c.ok ? '✓' : '✕';
    const cls = c.ok === null ? 'na' : c.ok ? 'ok' : 'err';
    let det;
    if (c.zeradas) det = c.zeradas.length ? 'Zerada(s): ' + c.zeradas.join(', ') : 'Todas as disciplinas com pelo menos 1 acerto';
    else det = c.ok === null ? 'Não avaliado (sem questões deste bloco)' : `Obtido: ${pctTxt(c.valor)}`;
    return `<li class="crit ${cls}"><span class="crit-ic">${ic}</span><div><b>${esc(c.nome)}</b><span>${esc(det)}</span></div></li>`;
  }).join('');

  const linha = (d) => {
    const p = d.max ? (d.pontos / d.max) * 100 : null;
    const zer = d.aplicadas && d.acertos === 0;
    if (!d.aplicadas) {
      return `<tr class="na"><td>${esc(d.nome)}</td><td>${fmtPts(d.peso)}</td><td colspan="5">sem questões no banco (0 de ${d.exigidas})</td></tr>`;
    }
    return `<tr class="${zer ? 'zerada' : ''}">
      <td>${esc(d.nome)}${zer ? ' <span class="chip chip-err" style="font-size:11px;padding:1px 7px">zerada</span>' : ''}</td>
      <td>${fmtPts(d.peso)}</td>
      <td>${d.acertos}/${d.aplicadas}${d.aplicadas < d.exigidas ? `<small class="muted"> (de ${d.exigidas})</small>` : ''}</td>
      <td>${d.erros}</td><td>${d.brancos}</td>
      <td>${fmtPts(d.pontos)}/${fmtPts(d.max)}</td>
      <td class="${p != null && p < SIMULADO.minimoPct ? 'c-vermelho' : ''}"><b>${pctTxt(p)}</b></td>
    </tr>`;
  };
  const sub = (nome, b) => {
    const p = b.max ? (b.pontos / b.max) * 100 : null;
    return `<tr class="sub"><td colspan="2">${esc(nome)}</td><td>${b.acertos}/${b.total}</td><td colspan="2"></td>
      <td>${fmtPts(b.pontos)}/${fmtPts(b.max)}</td><td class="${p != null && p < SIMULADO.minimoPct ? 'c-vermelho' : ''}"><b>${pctTxt(p)}</b></td></tr>`;
  };
  $('srTable').innerHTML = `
    <thead><tr><th>Disciplina</th><th>Peso</th><th>Acertos</th><th>Erros</th><th>Branco</th><th>Pontos</th><th>%</th></tr></thead>
    <tbody>
      ${['basicos', 'especificos'].map((b) =>
        rec.disciplinas.filter((d) => d.bloco === b).map(linha).join('') + sub(BLOCO_LABEL[b], rec.blocos[b])).join('')}
    </tbody>
    <tfoot><tr><td colspan="2">Total</td><td>${rec.acertos}/${rec.aplicadas}</td><td colspan="2"></td>
      <td>${fmtPts(rec.pontos)}/${fmtPts(rec.pontosMax)}</td><td><b>${fmtPts(rec.nota)}</b></td></tr></tfoot>`;
  $('srRevisarBtn').dataset.id = rec.id;
}
// Reconstrói um simulado do histórico para revisão (usa o banco atual ou a cópia do Caderno)
function simDeRegistro(rec) {
  const porId = new Map(BANK.map((q) => [q.id, q]));
  const questoes = rec.questoes.map((x) => porId.get(x.qid) || (CADERNO[x.qid] && CADERNO[x.qid].q) || {
    id: x.qid, disciplina: x.disciplina, assunto: x.assunto, correta: x.correta, alternativas: {},
    enunciado: '*Esta questão não está mais no banco.*'
  });
  return {
    id: rec.id, modo: 'revisao', record: rec, questoes, atual: 0, gasto: rec.gasto, duracao: rec.duracao,
    grupos: rec.disciplinas.map((d) => ({ nome: d.nome, bloco: d.bloco, peso: d.peso, exigidas: d.exigidas, aplicadas: d.aplicadas, inicio: d.inicio })),
    respostas: rec.questoes.map((x) => x.marcada), marcadas: rec.questoes.map((x) => !!x.revisar),
    tempos: rec.questoes.map((x) => x.tempo)
  };
}
$('srRevisarBtn').addEventListener('click', () => {
  const rec = SIMULADOS.find((s) => s.id === $('srRevisarBtn').dataset.id); if (!rec) return;
  if (!SIM || SIM.id !== rec.id || SIM.modo !== 'revisao') SIM = simDeRegistro(rec);
  SIM.atual = 0;
  simAbrir();
});
$('srNovoBtn').addEventListener('click', openSimHome);
$('srHomeBtn').addEventListener('click', goHome);
$('srBack').addEventListener('click', openSimHome);

/* ---------------------------------------------------------------------
   Tela inicial do simulado + histórico
   --------------------------------------------------------------------- */
function renderSimHome() {
  const disp = disponibilidade();
  const total = totalExigido();
  const aplicaveis = disp.reduce((a, c) => a + Math.min(c.qtd, c.disponiveis), 0);
  const maxPts = disp.reduce((a, c) => a + c.qtd * c.peso, 0);

  const linhas = ['basicos', 'especificos'].map((b) => {
    const itens = disp.filter((c) => c.bloco === b);
    const q = itens.reduce((a, c) => a + c.qtd, 0), pts = itens.reduce((a, c) => a + c.qtd * c.peso, 0);
    return itens.map((c) => `<tr>
        <td>${esc(c.nome)}</td><td>${c.qtd}</td><td>${fmtPts(c.peso)}</td><td>${fmtPts(c.qtd * c.peso)}</td>
        <td class="${c.disponiveis < c.qtd ? 'c-vermelho' : 'c-verde'}"><b>${c.disponiveis}</b>${c.disponiveis < c.qtd ? ` <small>(faltam ${c.qtd - c.disponiveis})</small>` : ' ✓'}</td>
      </tr>`).join('')
      + `<tr class="sub"><td>${BLOCO_LABEL[b]}</td><td>${q}</td><td></td><td>${fmtPts(pts)}</td><td></td></tr>`;
  }).join('');
  $('simComp').innerHTML = `
    <thead><tr><th>Disciplina</th><th>Questões</th><th>Peso</th><th>Pontos</th><th>No banco</th></tr></thead>
    <tbody>${linhas}</tbody>
    <tfoot><tr><td>Total</td><td>${total}</td><td></td><td>${fmtPts(maxPts)}</td><td>${aplicaveis} de ${total}</td></tr></tfoot>`;

  const faltam = total - aplicaveis;
  $('simCompNote').innerHTML = faltam
    ? `<span class="c-vermelho"><b>Faltam ${faltam} questões no banco</b></span> para um simulado completo. Você pode fazer um simulado parcial com as ${aplicaveis} disponíveis (nota proporcional) ou importar mais questões.`
    : '<span class="c-verde"><b>Banco completo para o simulado.</b></span> Cada simulado sorteia novas questões em cada disciplina.';
  $('simStartBtn').disabled = !aplicaveis;
  $('simStartBtn').textContent = faltam && aplicaveis ? `Iniciar simulado parcial (${aplicaveis} questões) →` : 'Iniciar simulado →';

  const atual = store.get('bbq.simAtual', null);
  $('simAndamento').hidden = !atual;
  if (atual) {
    const resp = atual.respostas.filter(Boolean).length;
    $('simAndamentoTxt').textContent = `Iniciado em ${new Date(atual.inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })} · ${resp}/${atual.questoes.length} respondidas · restam ${fmtHMS(atual.duracao - atual.gasto)}`;
  }

  const hist = SIMULADOS.slice().reverse();
  $('simHist').innerHTML = hist.length ? hist.map((r) => `
    <li class="res-item clickable" data-sim="${esc(r.id)}" tabindex="0" role="button">
      <span class="ic ${r.aprovado ? 'ok' : 'err'}" style="width:48px;height:48px;font-size:13px">${fmtPts(r.nota)}</span>
      <div class="info">
        <div>${esc(new Date(r.inicio).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }))}
          <span class="chip ${r.aprovado ? 'chip-ok' : 'chip-err'}" style="font-size:11px;padding:1px 7px;margin-left:6px">${r.aprovado ? 'aprovado' : 'eliminado'}</span>
          ${r.parcial ? '<span class="chip chip-inc">parcial</span>' : ''}</div>
        <div>${r.acertos}/${r.aplicadas} acertos · ${fmtPts(r.pontos)}/${fmtPts(r.pontosMax)} pts · Básicos ${pctTxt(r.criterios[1].valor)} · Específicos ${pctTxt(r.criterios[2].valor)} · ${fmtHMS(r.gasto)}</div>
      </div>
      <span class="muted" aria-hidden="true">›</span>
    </li>`).join('') : '<li class="empty">Nenhum simulado entregue ainda.</li>';
}
function abrirRegistro(id) {
  const rec = SIMULADOS.find((s) => s.id === id); if (!rec) return;
  renderSimResultado(rec); show('simResult');
}
$('simHist').addEventListener('click', (e) => { const li = e.target.closest('[data-sim]'); if (li) abrirRegistro(li.dataset.sim); });
$('simHist').addEventListener('keydown', (e) => {
  const li = e.target.closest('[data-sim]'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirRegistro(li.dataset.sim); }
});
function openSimHome() { renderSimHome(); show('simHome'); }
function renderSimHomeCard() {
  const atual = store.get('bbq.simAtual', null);
  const ult = SIMULADOS[SIMULADOS.length - 1];
  let txt = '70 questões na proporção do edital · 4 horas · nota de 0 a 100';
  if (atual) txt = `⏸ Em andamento: ${atual.respostas.filter(Boolean).length}/${atual.questoes.length} respondidas · restam ${fmtHMS(atual.duracao - atual.gasto)}`;
  else if (ult) txt = `Último: ${fmtPts(ult.nota)} pontos · ${ult.aprovado ? 'aprovado ✓' : 'eliminado ✕'} · ${SIMULADOS.length} simulado(s) feito(s)`;
  $('homeSimTxt').textContent = txt;
  $('homeSimBtn').textContent = atual ? 'Continuar →' : 'Abrir simulado →';
}

$('homeSimBtn').addEventListener('click', () => (store.get('bbq.simAtual', null) ? simContinuar() : openSimHome()));
$('simHomeBack').addEventListener('click', goHome);
$('simStartBtn').addEventListener('click', simIniciar);
$('simContinuarBtn').addEventListener('click', simContinuar);
$('simDescartarBtn').addEventListener('click', simDescartar);

renderSimHomeCard();
