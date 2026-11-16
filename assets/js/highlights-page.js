// highlights-page.js — every highlight saved in this browser, grouped by post.
import { initHeader } from './header.js';
import { el, download } from './data.js';
import { t } from './i18n.js';
import { loadAll, saveAll } from './highlight.js';

initHeader();

const list = document.getElementById('list');
const exportBtn = document.getElementById('export');

function render() {
  const all = loadAll();
  const slugs = Object.keys(all).filter((s) => all[s].items?.length);
  exportBtn.hidden = !slugs.length;
  if (!slugs.length) { list.replaceChildren(el('p', { class: 'empty' }, t('highlights_empty'))); return; }
  list.replaceChildren(...slugs.map((slug) => {
    const url = `post.html?p=${encodeURIComponent(slug)}`;
    return el('section', { class: 'hl-group' },
      el('h2', {}, el('a', { href: url }, all[slug].title)),
      all[slug].items.map((item) => el('div', { class: 'hl-item' },
        el('span', { class: 'hl-item__text' }, el('mark', { class: `hl hl--${item.color}` }, item.text)),
        el('a', { class: 'btn', href: `${url}#hl=${item.id}` }, t('go')),
        el('button', {
          type: 'button', class: 'btn',
          onclick: () => {
            const data = loadAll();
            data[slug].items = data[slug].items.filter((i) => i.id !== item.id);
            if (!data[slug].items.length) delete data[slug];
            saveAll(data);
            render();
          }
        }, t('hl_remove')),
        item.note ? el('span', { class: 'hl-item__note' }, `✎ ${item.note}`) : null)));
  }));
}

exportBtn.addEventListener('click', () => {
  const all = loadAll();
  const md = `# ${t('highlights_title')} ${t('highlights_accent')}\n\n` + Object.values(all).map((p) =>
    `## ${p.title}\n\n${p.items.map((i) => `- ==${i.text}==${i.note ? `\n  - ✎ ${i.note}` : ''}`).join('\n')}`).join('\n\n') + '\n';
  download('subrayados.md', md);
});

render();
