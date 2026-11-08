/* =====================================================================
   BB Quest — DASHBOARD DE EVOLUÇÃO + EXPORTAR PARA OBSIDIAN
   Carregado depois de app.js, revisao.js e gamificacao.js.
   Fonte dos dados: histórico de sessões (SESSIONS), que inclui treinos,
   revisões e simulados. Semanas começam na segunda-feira (horário local).

   Gráficos em SVG puro, com cores validadas para daltonismo nos dois temas:
     série 1 (azul) = valor principal · série 2 (laranja) = tempo-alvo
   Cada gráfico tem tooltip (mouse, toque e setas do teclado) e uma tabela
   equivalente em "Ver tabela".
   ===================================================================== */
const DASH_META = 60; // % de referência (mesmo limite de "assunto fraco")

/* ---------------------------------------------------------------------
   Dados
   --------------------------------------------------------------------- */
function dashRespostas() {
  return SESSIONS.flatMap((s) => (s.respostas || []).map((r) => ({ ...r, em: r.em || s.fim || s.inicio })));
}
function segundaDe(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
const semanaKey = (iso) => diaStr(segundaDe(new Date(iso)));
const semanaAtualKey = () => diaStr(segundaDe(new Date(Date.now())));
function semanasAte(n, fim = semanaAtualKey()) {
  return Array.from({ length: n }, (_, i) => addDias(fim, -7 * (n - 1 - i)));
}
function agregar(resps) {
  const a = { n: 0, ok: 0, tempo: 0, alvo: 0, noAlvo: 0 };
  resps.forEach((r) => {
    const al = alvoDaResposta(r), t = r.tempo || 0;
    a.n++; if (r.ok) a.ok++;
    a.tempo += t; a.alvo += al; if (t <= al) a.noAlvo++;
  });
  a.pct = a.n ? (a.ok / a.n) * 100 : null;
  a.tMed = a.n ? a.tempo / a.n : null;
  a.aMed = a.n ? a.alvo / a.n : null;
  return a;
}
function porSemana(resps, keys) {
  const m = new Map(keys.map((k) => [k, []]));
  resps.forEach((r) => { const k = semanaKey(r.em); if (m.has(k)) m.get(k).push(r); });
  return keys.map((k) => agregar(m.get(k)));
}
function daSemana(resps, key) { return resps.filter((r) => semanaKey(r.em) === key); }
const fmtPct = (v) => (v == null ? '—' : Math.round(v) + '%');
const fmtPctMd = (v) => (v == null ? '—' : v.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%');

/* ---------------------------------------------------------------------
   Gráficos (SVG)
   --------------------------------------------------------------------- */
const vizWidth = (el) => Math.max(260, Math.floor(el.clientWidth || 640));
function niceTempoTicks(max) {
  const steps = [15, 30, 60, 90, 120, 180, 300, 600];
  const step = steps.find((s) => max / s <= 4) || 600;
  const top = Math.max(step, Math.ceil(max / step) * step);
  const t = []; for (let v = 0; v <= top; v += step) t.push(v);
  return { ticks: t, max: top };
}
function barPath(x0, w, y, yb) {
  const h = yb - y; if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x0},${yb}V${y + r}Q${x0},${y} ${x0 + r},${y}H${x0 + w - r}Q${x0 + w},${y} ${x0 + w},${y + r}V${yb}Z`;
}

/* Quadro comum: eixos, grade, rótulos de semana e camada de interação */
function vizFrame(el, o) {
  const W = vizWidth(el), H = o.height || 220, mini = !!o.mini;
  const m = { t: 14, r: mini ? 38 : 56, b: 24, l: mini ? 34 : 46 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b, n = o.labels.length;
  const X = (i) => m.l + (iw * (i + 0.5)) / n;
  const Y = (v) => m.t + ih - (Math.max(0, Math.min(v, o.yMax)) / o.yMax) * ih;
  let s = '';
  o.ticks.forEach((t) => {
    s += `<line class="v-grid${t === 0 ? ' v-base' : ''}" x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/>`;
    s += `<text class="v-tick" x="${m.l - 6}" y="${Y(t)}" dy="0.32em" text-anchor="end">${esc(o.fmt(t))}</text>`;
  });
  if (o.ref) {
    s += `<line class="v-ref" x1="${m.l}" x2="${W - m.r}" y1="${Y(o.ref.v)}" y2="${Y(o.ref.v)}"/>`;
    s += `<text class="v-ref-t" x="${m.l + 4}" y="${Y(o.ref.v) - 5}">${esc(o.ref.label)}</text>`;
  }
  const step = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(iw / (mini ? 46 : 58)))));
  o.labels.forEach((l, i) => {
    if ((n - 1 - i) % step === 0) s += `<text class="v-tick" x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(l)}</text>`;
  });
  return { W, H, m, iw, ih, n, X, Y, s };
}
function vizMount(el, f, body, o, onIndex) {
  el.innerHTML = `<svg viewBox="0 0 ${f.W} ${f.H}" width="100%" height="${f.H}" role="img" aria-label="${esc(o.aria)}">`
    + f.s + body
    + `<line class="v-cross" x1="0" x2="0" y1="${f.m.t}" y2="${f.m.t + f.ih}" visibility="hidden"/>`
    + `<rect class="v-hit" x="${f.m.l}" y="0" width="${f.iw}" height="${f.H}" fill="transparent"/></svg>`;
  const svg = el.querySelector('svg'), cross = svg.querySelector('.v-cross');
  const tip = document.createElement('div');
  tip.className = 'v-tip'; tip.hidden = true;
  el.appendChild(tip);
  let atual = -1;

  const mostrar = (i) => {
    atual = i;
    if (o.crosshair !== false) {
      cross.setAttribute('x1', f.X(i)); cross.setAttribute('x2', f.X(i)); cross.setAttribute('visibility', 'visible');
    }
    svg.querySelectorAll('[data-i]').forEach((m) => m.classList.toggle('hl', +m.dataset.i === i));
    // Conteúdo com textContent (rótulos vêm dos dados)
    tip.replaceChildren();
    const h = document.createElement('div'); h.className = 'v-tip-h'; h.textContent = o.tipTitle(i); tip.appendChild(h);
    o.tipRows(i).forEach((r) => {
      const row = document.createElement('div'); row.className = 'v-tip-row';
      if (r.key) { const k = document.createElement('i'); k.className = 'v-key ' + r.key; row.appendChild(k); }
      const v = document.createElement('b'); v.textContent = r.value; row.appendChild(v);
      const l = document.createElement('span'); l.textContent = r.label; row.appendChild(l);
      tip.appendChild(row);
    });
    tip.hidden = false;
    const escala = (el.clientWidth || f.W) / f.W, px = f.X(i) * escala;
    const tw = tip.offsetWidth || 160, cw = el.clientWidth || f.W;
    tip.style.left = Math.max(0, Math.min(cw - tw, px + 12 > cw - tw ? px - tw - 12 : px + 12)) + 'px';
    if (onIndex) onIndex(i);
  };
  const esconder = () => {
    tip.hidden = true; cross.setAttribute('visibility', 'hidden');
    svg.querySelectorAll('.hl').forEach((m) => m.classList.remove('hl'));
  };
  const indice = (clientX) => {
    const r = svg.getBoundingClientRect();
    const x = ((clientX - r.left) * f.W) / (r.width || f.W);
    return Math.max(0, Math.min(f.n - 1, Math.floor(((x - f.m.l) / f.iw) * f.n)));
  };
  svg.addEventListener('pointermove', (e) => mostrar(indice(e.clientX)));
  svg.addEventListener('pointerdown', (e) => mostrar(indice(e.clientX)));
  svg.addEventListener('pointerleave', esconder);
  el.tabIndex = 0;
  el.setAttribute('aria-describedby', o.tableId || '');
  el.onfocus = () => mostrar(atual >= 0 ? atual : f.n - 1);
  el.onblur = esconder;
  el.onkeydown = (e) => {
    if (e.key === 'ArrowLeft') { mostrar(Math.max(0, (atual < 0 ? f.n : atual) - 1)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { mostrar(Math.min(f.n - 1, atual + 1)); e.preventDefault(); }
    if (e.key === 'Escape') esconder();
  };
}

/* Linhas: o.series = [{ label, values (null = sem dados), cls: 's1'|'s2' }] */
function lineChart(el, o) {
  const f = vizFrame(el, o);
  let body = '';
  o.series.forEach((se, k) => {
    // segmentos contínuos (semanas sem dados quebram a linha)
    let d = '', area = '', seg = [];
    const fecha = () => {
      if (!seg.length) return;
      d += seg.map((i, j) => `${j ? 'L' : 'M'}${f.X(i)},${f.Y(se.values[i])}`).join('');
      if (o.area && k === 0 && seg.length > 1) {
        area += `M${f.X(seg[0])},${f.Y(0)}` + seg.map((i) => `L${f.X(i)},${f.Y(se.values[i])}`).join('') + `L${f.X(seg[seg.length - 1])},${f.Y(0)}Z`;
      }
      seg = [];
    };
    se.values.forEach((v, i) => { if (v == null) fecha(); else seg.push(i); });
    fecha();
    if (area) body += `<path class="v-area ${se.cls}" d="${area}"/>`;
    if (d) body += `<path class="v-line ${se.cls}" d="${d}"/>`;
    se.values.forEach((v, i) => {
      if (v != null) body += `<circle class="v-dot ${se.cls}" data-i="${i}" cx="${f.X(i)}" cy="${f.Y(v)}" r="4"/>`;
    });
  });
  // Rótulo só no último ponto de cada série (sem sobreposição)
  const ends = o.series.map((se) => {
    const i = se.values.map((v, j) => (v == null ? -1 : j)).filter((j) => j >= 0).pop();
    return i == null ? null : { y: f.Y(se.values[i]), x: f.X(i), txt: o.fmt(se.values[i]) };
  }).filter(Boolean).sort((a, b) => a.y - b.y);
  let lastY = -99;
  ends.forEach((e) => {
    if (Math.abs(e.y - lastY) < 14) return;
    body += `<text class="v-end" x="${e.x + 8}" y="${e.y}" dy="0.32em">${esc(e.txt)}</text>`;
    lastY = e.y;
  });
  vizMount(el, f, body, o);
}

/* Colunas (série única) */
function barChart(el, o) {
  const f = vizFrame(el, o);
  const band = f.iw / f.n, w = Math.min(24, Math.max(4, band * 0.6));
  let body = '';
  o.values.forEach((v, i) => {
    if (!v) return;
    body += `<path class="v-bar s1" data-i="${i}" d="${barPath(f.X(i) - w / 2, w, f.Y(v), f.Y(0))}"/>`;
  });
  const last = o.values.length - 1;
  if (o.values[last]) body += `<text class="v-end" x="${f.X(last)}" y="${f.Y(o.values[last]) - 6}" text-anchor="middle">${esc(o.fmt(o.values[last]))}</text>`;
  vizMount(el, f, body, { ...o, crosshair: false });
}

function tabelaHTML(cab, linhas) {
  return `<div class="table-wrap"><table class="sim-table viz-tab"><thead><tr>${cab.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>`
    + `<tbody>${linhas.map((l) => `<tr>${l.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

/* ---------------------------------------------------------------------
   Tela
   --------------------------------------------------------------------- */
function statTile(label, valor, delta, sub) {
  // delta: { txt, bom: true|false|null }
  const cls = !delta || delta.bom == null ? 'neutro' : delta.bom ? 'bom' : 'ruim';
  const ic = !delta || delta.bom == null ? '' : delta.sobe ? '▲ ' : '▼ ';
  return `<div class="stat-tile"><span class="st-label">${esc(label)}</span><b class="st-val">${esc(valor)}</b>`
    + (delta ? `<span class="st-delta ${cls}">${ic}${esc(delta.txt)}</span>` : '')
    + (sub ? `<span class="st-sub">${esc(sub)}</span>` : '') + '</div>';
}
function deltaDe(atual, ant, { unidade = '', menorMelhor = false, fmt = (v) => String(Math.round(v)) } = {}) {
  if (atual == null || ant == null) return { txt: 'sem comparação', bom: null };
  const d = atual - ant;
  if (Math.round(d) === 0) return { txt: 'igual à semana passada', bom: null };
  return { txt: `${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}${unidade} vs semana passada`, bom: menorMelhor ? d < 0 : d > 0, sobe: d > 0 };
}

function renderDash() {
  const todas = dashRespostas();
  const nSem = +$('dashPeriodo').value;
  const keys = semanasAte(nSem);
  const labels = keys.map(fmtDia);
  const sem = porSemana(todas, keys);

  // Indicadores da semana atual × anterior
  const kAt = semanaAtualKey(), kAnt = addDias(kAt, -7);
  const at = agregar(daSemana(todas, kAt)), ant = agregar(daSemana(todas, kAnt));
  const diasAt = new Set(daSemana(todas, kAt).map((r) => diaStr(new Date(r.em)))).size;
  $('dashStats').innerHTML = [
    statTile('Questões nesta semana', String(at.n), deltaDe(at.n, ant.n)),
    statTile('Acertos nesta semana', fmtPct(at.pct), deltaDe(at.pct, ant.pct, { unidade: ' p.p.' }), at.n ? `${at.ok} de ${at.n}` : ''),
    statTile('Tempo médio por questão', at.tMed == null ? '—' : fmtTime(at.tMed),
      deltaDe(at.tMed, ant.tMed, { menorMelhor: true, fmt: fmtTime }), at.aMed ? `alvo médio ${fmtTime(at.aMed)}` : ''),
    statTile('Dias estudados', `${diasAt} de 7`, null, `semana de ${fmtDia(kAt)} a ${fmtDia(addDias(kAt, 6))}`)
  ].join('');

  const vazio = !todas.length;
  $('dashVazio').hidden = !vazio;
  document.querySelectorAll('#dash .viz-card').forEach((c) => { c.hidden = vazio; });
  if (vazio) return;

  const tipTitle = (i) => `Semana de ${labels[i]} a ${fmtDia(addDias(keys[i], 6))}`;

  // 1) % de acertos por semana
  lineChart($('vizAcertos'), {
    labels, yMax: 100, ticks: [0, 25, 50, 75, 100], fmt: (v) => Math.round(v) + '%', area: true,
    ref: { v: DASH_META, label: `meta ${DASH_META}%` }, aria: '% de acertos por semana', tableId: 'tabAcertos',
    series: [{ label: '% de acertos', values: sem.map((a) => a.pct), cls: 's1' }],
    tipTitle, tipRows: (i) => [
      { key: 's1', value: fmtPct(sem[i].pct), label: 'de acertos' },
      { value: String(sem[i].n), label: sem[i].n === 1 ? 'questão' : 'questões' }
    ]
  });
  $('tabAcertos').innerHTML = tabelaHTML(['Semana', 'Questões', 'Acertos', '% de acertos'],
    keys.map((k, i) => [labels[i], sem[i].n, sem[i].ok, fmtPct(sem[i].pct)]));

  // 2) Volume por semana
  const maxN = Math.max(1, ...sem.map((a) => a.n));
  const stepN = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500].find((s) => maxN / s <= 4) || 1000;
  const topN = Math.ceil(maxN / stepN) * stepN;
  barChart($('vizVolume'), {
    labels, yMax: topN, ticks: Array.from({ length: topN / stepN + 1 }, (_, k) => k * stepN), fmt: (v) => String(v),
    values: sem.map((a) => a.n), aria: 'Questões respondidas por semana', height: 180, tableId: 'tabVolume',
    tipTitle, tipRows: (i) => [{ key: 's1 bar', value: String(sem[i].n), label: sem[i].n === 1 ? 'questão respondida' : 'questões respondidas' }]
  });
  $('tabVolume').innerHTML = tabelaHTML(['Semana', 'Questões'], keys.map((k, i) => [labels[i], sem[i].n]));

  // 3) Tempo médio × alvo
  const maxT = Math.max(60, ...sem.flatMap((a) => [a.tMed || 0, a.aMed || 0]));
  const tt = niceTempoTicks(maxT * 1.1);
  lineChart($('vizTempo'), {
    labels, yMax: tt.max, ticks: tt.ticks, fmt: fmtTime, aria: 'Tempo médio por questão e tempo-alvo médio por semana', tableId: 'tabTempo',
    series: [
      { label: 'Tempo médio', values: sem.map((a) => a.tMed), cls: 's1' },
      { label: 'Tempo-alvo médio', values: sem.map((a) => a.aMed), cls: 's2' }
    ],
    tipTitle, tipRows: (i) => [
      { key: 's1', value: sem[i].tMed == null ? '—' : fmtTime(sem[i].tMed), label: 'tempo médio' },
      { key: 's2', value: sem[i].aMed == null ? '—' : fmtTime(sem[i].aMed), label: 'tempo-alvo médio' },
      { value: sem[i].n ? Math.round((sem[i].noAlvo / sem[i].n) * 100) + '%' : '—', label: 'dentro do alvo' }
    ]
  });
  $('tabTempo').innerHTML = tabelaHTML(['Semana', 'Tempo médio', 'Alvo médio', 'Dentro do alvo'],
    keys.map((k, i) => [labels[i], sem[i].tMed == null ? '—' : fmtTime(sem[i].tMed), sem[i].aMed == null ? '—' : fmtTime(sem[i].aMed),
      sem[i].n ? Math.round((sem[i].noAlvo / sem[i].n) * 100) + '%' : '—']));

  // 4) Por disciplina: pequenos múltiplos (mesma escala)
  const doPeriodo = todas.filter((r) => keys.includes(semanaKey(r.em)));
  const discs = uniq(doPeriodo.map((r) => r.disciplina));
  $('vizDisc').innerHTML = discs.length ? discs.map((d, k) => {
    const g = agregar(doPeriodo.filter((r) => r.disciplina === d));
    return `<div class="mult"><div class="mult-h"><b>${esc(d)}</b><span>${fmtPct(g.pct)} · ${g.n} ${g.n === 1 ? 'questão' : 'questões'}</span></div><div class="viz mini" id="vizDisc${k}"></div></div>`;
  }).join('') : '<p class="empty">Sem respostas no período.</p>';
  const matriz = discs.map((d) => porSemana(doPeriodo.filter((r) => r.disciplina === d), keys));
  discs.forEach((d, k) => {
    const s = matriz[k];
    lineChart($('vizDisc' + k), {
      labels, yMax: 100, ticks: [0, 50, 100], fmt: (v) => Math.round(v) + '%', mini: true, height: 150,
      ref: { v: DASH_META, label: '' }, aria: `% de acertos por semana em ${d}`, tableId: 'tabDisc',
      series: [{ label: d, values: s.map((a) => a.pct), cls: 's1' }],
      tipTitle, tipRows: (i) => [{ key: 's1', value: fmtPct(s[i].pct), label: `${s[i].ok}/${s[i].n} acertos` }]
    });
  });
  $('tabDisc').innerHTML = tabelaHTML(['Disciplina', ...labels],
    discs.map((d, k) => [d, ...matriz[k].map((a) => (a.n ? `${fmtPct(a.pct)} (${a.n})` : '—'))]));
}

// Mostra a tela antes de desenhar: com ela oculta, a largura medida seria 0
function openDash() { show('dash'); renderDash(); }
let dashResizeT;
window.addEventListener('resize', () => {
  clearTimeout(dashResizeT);
  dashResizeT = setTimeout(() => { if (!$('dash').hidden) renderDash(); }, 150);
});
$('dashPeriodo').addEventListener('change', renderDash);
$('dashBack').addEventListener('click', goHome);
$('homeDashBtn').addEventListener('click', openDash);
$('perfDashBtn').addEventListener('click', openDash);

/* ---------------------------------------------------------------------
   Exportar para Obsidian (.md)
   --------------------------------------------------------------------- */
const mdCell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const citar = (txt) => String(txt || '').split('\n').map((l) => (l.trim() ? '> ' + l : '>')).join('\n');
function fmtDataCompleta(str) { const [y, m, d] = str.split('-'); return `${d}/${m}/${y}`; }

function gerarMarkdown(offset = 0) {
  const todas = dashRespostas();
  const kSem = addDias(semanaAtualKey(), -7 * offset), kAnt = addDias(kSem, -7), kFim = addDias(kSem, 6);
  const resp = daSemana(todas, kSem), respAnt = daSemana(todas, kAnt);
  const at = agregar(resp), ant = agregar(respAnt);
  const dias = new Set(resp.map((r) => diaStr(new Date(r.em)))).size;
  const agora = new Date(Date.now());
  const L = [];

  L.push('---', 'tipo: relatorio-semanal', 'origem: BB Quest', `semana: ${kSem}`,
    `periodo: ${fmtDataCompleta(kSem)} a ${fmtDataCompleta(kFim)}`,
    `gerado: ${diaStr(agora)} ${pad2(agora.getHours())}:${pad2(agora.getMinutes())}`,
    `questoes: ${at.n}`, `acertos_pct: ${at.pct == null ? '' : Math.round(at.pct)}`,
    'tags: [concurso/bb, bbquest, relatorio-semanal]', '---', '');
  L.push(`# BB Quest · Semana de ${fmtDia(kSem)} a ${fmtDataCompleta(kFim)}`, '');

  // Resumo
  const pctTxt = (a) => (a.n ? `${a.ok} de ${a.n} (${fmtPctMd(a.pct)})` : '—');
  const tTxt = (a) => (a.n ? `${fmtTime(a.tMed)} (alvo ${fmtTime(a.aMed)})` : '—');
  const noAlvoTxt = (a) => (a.n ? fmtPctMd((a.noAlvo / a.n) * 100) : '—');
  L.push('## Resumo da semana', '',
    '| Indicador | Esta semana | Semana anterior |', '|---|---|---|',
    `| Questões respondidas | ${at.n} | ${ant.n} |`,
    `| Acertos | ${pctTxt(at)} | ${pctTxt(ant)} |`,
    `| Tempo médio por questão | ${tTxt(at)} | ${tTxt(ant)} |`,
    `| Dentro do tempo-alvo | ${noAlvoTxt(at)} | ${noAlvoTxt(ant)} |`,
    `| Dias estudados | ${dias} de 7 | ${new Set(respAnt.map((r) => diaStr(new Date(r.em)))).size} de 7 |`);
  const sims = (typeof SIMULADOS !== 'undefined' ? SIMULADOS : []).filter((s) => semanaKey(s.inicio) === kSem);
  if (sims.length) L.push(`| Simulados | ${sims.map((s) => `${fmtPts(s.nota)} (${s.aprovado ? 'aprovado' : 'eliminado'}${s.parcial ? ', parcial' : ''})`).join('; ')} | |`);
  L.push('');
  if (typeof GAME !== 'undefined' && GAME) {
    const ni = nivelInfo();
    L.push(`- **Nível:** ${ni.n.ic} ${ni.n.nome} · ${fmtXP(GAME.xp)} XP${ni.prox ? ` (faltam ${fmtXP(ni.falta)} para ${ni.prox.nome})` : ''} · 🔥 sequência de ${streakAtual()} dia(s)`);
  }
  if (typeof srsPendentesHoje === 'function') {
    const fila = Object.values(SRS).filter((e) => !e.concluida).length;
    L.push(`- **Revisão espaçada:** ${srsPendentesHoje().length} para revisar hoje · ${fila} na fila`);
  }
  L.push(`- **Caderno de Erros:** ${pendentesCaderno().length} questão(ões) pendente(s)`, '');

  // Por disciplina
  L.push('## Desempenho por disciplina', '');
  const discs = uniq(resp.map((r) => r.disciplina));
  if (discs.length) {
    L.push('| Disciplina | Questões | Acertos | % | Δ vs semana anterior | Tempo médio | Alvo médio |', '|---|---:|---:|---:|---:|---:|---:|');
    discs.forEach((d) => {
      const a = agregar(resp.filter((r) => r.disciplina === d)), b = agregar(respAnt.filter((r) => r.disciplina === d));
      const delta = b.pct == null ? '—' : `${a.pct - b.pct >= 0 ? '+' : '−'}${Math.abs(Math.round(a.pct - b.pct))} p.p.`;
      L.push(`| ${mdCell(d)} | ${a.n} | ${a.ok} | ${fmtPctMd(a.pct)} | ${delta} | ${fmtTime(a.tMed)} | ${fmtTime(a.aMed)} |`);
    });
  } else L.push('_Nenhuma questão respondida nesta semana._');
  L.push('');

  // Assuntos fracos
  const porAss = {};
  resp.forEach((r) => { const k = r.disciplina + ' › ' + r.assunto; (porAss[k] = porAss[k] || []).push(r); });
  const fracos = Object.entries(porAss).map(([k, rs]) => [k, agregar(rs)]).filter(([, a]) => a.pct < DASH_META).sort((x, y) => x[1].pct - y[1].pct);
  L.push(`## Assuntos para reforçar (abaixo de ${DASH_META}%)`, '');
  if (fracos.length) fracos.forEach(([k, a]) => L.push(`- **${k}**: ${fmtPctMd(a.pct)} (${a.ok}/${a.n})`));
  else L.push(resp.length ? '_Nenhum assunto abaixo da meta nesta semana. 🎉_' : '_Sem dados._');
  L.push('');

  // Erros da semana (uma entrada por questão, com a última alternativa marcada)
  const ultimos = new Map();
  resp.filter((r) => !r.ok).sort((a, b) => String(a.em).localeCompare(String(b.em))).forEach((r) => ultimos.set(r.qid, r));
  const erros = [...ultimos.values()].sort((a, b) => (a.disciplina + a.assunto).localeCompare(b.disciplina + b.assunto, 'pt-BR'));
  L.push(`## Erros da semana (${erros.length})`, '');
  if (!erros.length) L.push('_Nenhum erro nesta semana._', '');
  erros.forEach((r, k) => {
    const q = BANK.find((x) => x.id === r.qid) || (CADERNO[r.qid] && CADERNO[r.qid].q) || null;
    L.push(`### ${k + 1}. ${r.disciplina} › ${r.assunto} · \`${r.qid}\``, '');
    if (!q) { L.push(`Marcada: **${r.marcada}** · Correta: **${r.correta}** _(questão não está mais no banco)_`, ''); return; }
    const alts = q.alternativas || {}, exps = q.explicacaoAlternativas || {}, cor = String(q.correta || r.correta).toUpperCase();
    L.push('> [!question]- Enunciado', citar(q.enunciado), '');
    L.push(`> [!failure] Você marcou ${r.marcada}`, citar(alts[r.marcada] || ''), '>',
      citar(`**Por que está errada:** ${String(exps[r.marcada] || 'sem explicação cadastrada.').replace(/^errada\s*[:,.-]\s*/i, '')}`), '');
    L.push(`> [!success] Correta: ${cor}`, citar(alts[cor] || ''), '>',
      citar(`**Por que está certa:** ${q.explicacaoCorreta || 'sem explicação cadastrada.'}`), '');
  });

  if (erros.length) {
    L.push('## Checklist de revisão', '');
    erros.forEach((r) => L.push(`- [ ] Revisar \`${r.qid}\` (${r.assunto})`));
    L.push('');
  }
  L.push('---', `_Gerado pelo BB Quest em ${agora.toLocaleString('pt-BR')}._`, '');
  return { md: L.join('\n'), nome: `BB Quest - Semana ${kSem}.md` };
}

async function exportarObsidian() {
  const { md, nome } = gerarMarkdown(+$('dashSemanaExp').value);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  // Chrome/Edge: deixa escolher a pasta do cofre direto; nos demais, baixa o arquivo
  if (window.showSaveFilePicker) {
    try {
      const h = await window.showSaveFilePicker({ suggestedName: nome, types: [{ description: 'Markdown', accept: { 'text/markdown': ['.md'] } }] });
      const w = await h.createWritable(); await w.write(blob); await w.close();
      return toast(`✓ Salvo: ${h.name}`);
    } catch (e) {
      if (e && e.name === 'AbortError') return; // usuário cancelou
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(`⬇ ${nome} baixado. Mova para a pasta do concurso no Obsidian.`);
}
$('dashExportBtn').addEventListener('click', exportarObsidian);
