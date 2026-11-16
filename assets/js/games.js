// games.js — Feynman games written inside a post with ``` blocks:
//   ```flashcards     question :: answer        (one per line)
//   ```quiz           ? question / + right / - wrong / > why   (blank line between questions)
//   ```pasos          lines in the right order (they get shuffled)
//   ```jerga          optional "concepto: X" + extra words to watch, one per line
//   ```hoja-feynman   optional "concepto: X" → 4-step sheet exportable as a .md post
import { el, store, norm, download } from './data.js';
import { t } from './i18n.js';
import { inline } from './markdown.js';

const lines = (src) => src.split('\n').map((l) => l.trim()).filter(Boolean);
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const box = (title, score) => el('div', { class: 'game no-hl' }, el('p', { class: 'game__title' }, title, score || null));

export function renderGame(lang, code, ctx) {
  const make = GAMES[lang];
  if (!make) return null;
  ctx.n = (ctx.n || 0) + 1;
  return make(code, `game:${ctx.slug}:${lang}:${ctx.n}`);
}

const GAMES = {
  flashcards(src) {
    const deck = lines(src).map((l) => l.split('::').map((s) => s.trim())).filter((p) => p[0] && p[1]);
    if (!deck.length) return null;
    let i = 0;
    const pos = el('span', { class: 'game__score' });
    const card = el('button', { type: 'button', class: 'flashcard', 'aria-pressed': 'false', 'aria-live': 'polite' });
    const show = () => {
      const flipped = card.getAttribute('aria-pressed') === 'true';
      card.replaceChildren(inline(deck[i][flipped ? 1 : 0]));
      pos.textContent = `${i + 1} / ${deck.length}`;
    };
    card.addEventListener('click', () => { card.setAttribute('aria-pressed', String(card.getAttribute('aria-pressed') !== 'true')); show(); });
    const go = (d) => { i = (i + d + deck.length) % deck.length; card.setAttribute('aria-pressed', 'false'); show(); };
    show();
    const wrapper = box(t('g_flashcards'), pos);
    wrapper.append(card, el('div', { class: 'game__row' },
      el('button', { type: 'button', class: 'btn', 'aria-label': 'anterior', onclick: () => go(-1) }, t('g_prev')),
      el('button', { type: 'button', class: 'btn', 'aria-label': 'siguiente', onclick: () => go(1) }, t('g_next')),
      el('span', { class: 'game__msg' }, t('g_flip'))));
    return wrapper;
  },

  quiz(src) {
    const qs = src.split(/\n\s*\n/).map((block) => {
      const q = { text: '', options: [], why: '' };
      for (const l of lines(block)) {
        if (l.startsWith('?')) q.text = l.slice(1).trim();
        else if (l.startsWith('+')) q.options.push({ text: l.slice(1).trim(), ok: true });
        else if (l.startsWith('-')) q.options.push({ text: l.slice(1).trim(), ok: false });
        else if (l.startsWith('>')) q.why += `${l.slice(1).trim()} `;
      }
      return q;
    }).filter((q) => q.text && q.options.length);
    if (!qs.length) return null;
    let right = 0;
    const score = el('span', { class: 'game__score' }, `0 / ${qs.length}`);
    const wrapper = box(t('g_quiz'), score);
    qs.forEach((q, n) => {
      const why = el('p', { class: 'quiz__why', hidden: true }, inline(q.why.trim()));
      const shuffled = shuffle(q.options);
      const buttons = shuffled.map((o) => {
        const b = el('button', { type: 'button', class: 'quiz__opt' }, inline(o.text));
        b.addEventListener('click', () => {
          buttons.forEach((x, k) => { x.disabled = true; if (shuffled[k].ok) x.classList.add('is-right'); });
          if (!o.ok) b.classList.add('is-wrong'); else right++;
          score.textContent = `${right} / ${qs.length}`;
          if (q.why.trim()) why.hidden = false;
        });
        return b;
      });
      wrapper.append(el('fieldset', { class: 'quiz' }, el('legend', {}, `${n + 1}. `, inline(q.text)), buttons, why));
    });
    return wrapper;
  },

  pasos(src) {
    let ls = lines(src), title = t('g_steps');
    if (ls[0]?.startsWith('#')) title = ls.shift().replace(/^#+\s*/, '');
    const correct = [...ls];
    if (correct.length < 2) return null;
    let cur = shuffle(correct);
    if (cur.join() === correct.join()) cur.reverse();
    const list = el('ol', { class: 'steps' });
    const msg = el('span', { class: 'game__msg', 'aria-live': 'polite' });
    const draw = (checked) => {
      list.replaceChildren(...cur.map((s, n) => el('li', { class: `step${checked ? (s === correct[n] ? ' is-right' : ' is-wrong') : ''}` },
        el('span', {}, inline(s)),
        el('button', { type: 'button', 'aria-label': t('g_up'), onclick: () => move(n, -1) }, '▲'),
        el('button', { type: 'button', 'aria-label': t('g_down'), onclick: () => move(n, 1) }, '▼'))));
    };
    const move = (n, d) => {
      const to = n + d;
      if (to < 0 || to >= cur.length) return;
      [cur[n], cur[to]] = [cur[to], cur[n]];
      msg.textContent = '';
      draw();
    };
    draw();
    const wrapper = box(title);
    wrapper.append(list, el('div', { class: 'game__row' },
      el('button', { type: 'button', class: 'btn btn--primary', onclick: () => { const ok = cur.every((s, n) => s === correct[n]); draw(true); msg.textContent = t(ok ? 'g_perfect' : 'g_almost'); } }, t('g_check')),
      el('button', { type: 'button', class: 'btn', onclick: () => { cur = shuffle(correct); msg.textContent = ''; draw(); } }, t('g_shuffle')),
      msg));
    return wrapper;
  },

  jerga(src, key) {
    const JARGON = ['paradigma', 'intrinseco', 'sinergia', 'heuristica', 'ontologia', 'epistemologia', 'implementar', 'optimizar', 'inherente',
      'subyacente', 'metodologia', 'abstraccion', 'dicotomia', 'holistico', 'iterativo', 'asintotico', 'polimorfismo', 'encapsulamiento',
      'instanciar', 'isomorfismo', 'estocastico', 'framework', 'pipeline', 'escalable', 'robusto', 'trivial', 'obviamente', 'evidentemente',
      'claramente', 'simplemente', 'basicamente', 'a priori', 'ergo', 'biyectiva'];
    let concept = '';
    const extra = [];
    for (const l of lines(src)) {
      const m = /^concepto\s*:\s*(.*)$/i.exec(l);
      if (m) concept = m[1]; else extra.push(norm(l));
    }
    const words = [...JARGON, ...extra];
    const area = el('textarea', { rows: '6', placeholder: t('g_placeholder'), 'aria-label': t('g_placeholder') });
    area.value = store.get(key, '');
    area.addEventListener('input', () => store.set(key, area.value));
    const bar = el('div', { class: 'meter__bar' });
    const label = el('p', { class: 'game__msg', 'aria-live': 'polite' });
    const stats = el('ul', { class: 'jerga-stats' });
    const preview = el('div', { class: 'jerga-preview', hidden: true });

    const analyze = () => {
      const text = area.value.trim();
      if (!text) { label.textContent = t('g_write_first'); return; }
      const sentences = text.split(/[.!?¡¿]+/).map((s) => s.trim()).filter(Boolean);
      const tokens = text.split(/\s+/).filter(Boolean);
      const avg = tokens.length / Math.max(1, sentences.length);
      const longWords = tokens.map((w) => w.replace(/[^\p{L}]/gu, '')).filter((w) => w.length >= 12);
      const n = norm(text);
      const found = words.filter((w) => w && new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(n));
      const analogies = (n.match(/\b(como si|es como|imagina|igual que|por ejemplo|like a|imagine)\b/g) || []).length;
      const score = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, avg - 14) * 3 - longWords.length * 4 - found.length * 9 + Math.min(analogies, 3) * 5)));
      bar.style.width = `${score}%`;
      label.textContent = `${t('g_score')}: ${score}/100 ${score >= 85 ? '🌸' : score >= 60 ? '🌱' : '🧪'}`;
      stats.replaceChildren(
        el('li', {}, `${sentences.length} ${t('g_sentences')} · ${avg.toFixed(1)} ${t('g_words_per')}`),
        el('li', {}, `${longWords.length} ${t('g_long')}${longWords.length ? `: ${longWords.slice(0, 6).join(', ')}` : ' ✓'}`),
        el('li', {}, `${found.length} ${t('g_jargon_found')}${found.length ? `: ${found.join(', ')}` : ' ✓'}`),
        el('li', {}, `${analogies} ${t('g_analogies')}${analogies ? ' ✓' : ''}`));
      // preview with jargon (pink) and long words (lilac) highlighted
      const ranges = [];
      const add = (term, color) => { let i = 0; while (term && (i = n.indexOf(term, i)) >= 0) { ranges.push([i, i + term.length, color]); i += term.length; } };
      found.forEach((w) => add(w, 'pink'));
      longWords.forEach((w) => add(norm(w), 'lilac'));
      ranges.sort((a, b) => a[0] - b[0]);
      preview.replaceChildren();
      let pos = 0;
      for (const [a, b, color] of ranges) {
        if (a < pos) continue;
        preview.append(text.slice(pos, a), el('mark', { class: `hl hl--${color}` }, text.slice(a, b)));
        pos = b;
      }
      preview.append(text.slice(pos));
      preview.hidden = false;
    };

    const wrapper = box(t('g_jargon'));
    if (concept) wrapper.append(el('p', {}, el('strong', {}, concept)));
    wrapper.append(area, el('div', { class: 'game__row' }, el('button', { type: 'button', class: 'btn btn--primary', onclick: analyze }, t('g_analyze')), label),
      el('div', { class: 'meter' }, bar), stats, preview);
    return wrapper;
  },

  'hoja-feynman'(src, key) {
    const m = /concepto\s*:\s*(.+)/i.exec(src || '');
    const data = store.get(key, { concept: m ? m[1].trim() : '', simple: '', gaps: '', analogy: '' });
    const bar = el('div', { class: 'meter__bar' });
    const fields = [['concept', 'g_concept', 1], ['simple', 'g_simple', 5], ['gaps', 'g_gaps', 3], ['analogy', 'g_analogy', 3]].map(([k, label, rows]) => {
      const input = rows === 1 ? el('input', { class: 'input', type: 'text' }) : el('textarea', { rows: String(rows) });
      input.value = data[k] || '';
      input.addEventListener('input', () => { data[k] = input.value; store.set(key, data); progress(); });
      return [k, el('label', {}, t(label), input), input];
    });
    const progress = () => { bar.style.width = `${(fields.filter(([, , i]) => i.value.trim().length > 2).length / 4) * 100}%`; };
    progress();
    const exportMd = () => {
      const today = new Date().toISOString().slice(0, 10);
      const title = data.concept || 'Mi concepto';
      const quoteLines = (s) => (s || '').split('\n').map((l) => `> ${l}`).join('\n');
      download(`${(norm(title).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'feynman')}.md`,
        `---\ntitle: ${title}\ndate: ${today}\nsection: blog\ntags: [feynman]\nsummary: Mi explicación de ${title} con el método Feynman.\nemoji: ⚛\n---\n\n## Explicado como a un niño\n\n${data.simple}\n\n## Mis lagunas\n\n> [!NOTE]\n${quoteLines(data.gaps)}\n\n## La analogía\n\n> [!FEYNMAN]\n${quoteLines(data.analogy)}\n`);
    };
    const wrapper = box(t('g_sheet'));
    wrapper.append(el('div', { class: 'sheet' }, fields.map(([, label]) => label)), el('div', { class: 'meter' }, bar),
      el('div', { class: 'game__row' },
        el('button', { type: 'button', class: 'btn btn--primary', onclick: exportMd }, t('g_export')),
        el('button', { type: 'button', class: 'btn', onclick: () => { fields.forEach(([k, , i]) => { i.value = ''; data[k] = ''; }); store.set(key, data); progress(); } }, t('g_clear'))));
    return wrapper;
  }
};
