// Prépare la relecture des photos détourées.
//
//   npm run images:review
//
// - content/image-review.csv : une ligne par photo, colonne « mode » à choisir :
//     cutout   = photo détourée (par défaut)
//     original = photo d'origine (tableau, schéma, détourage raté…)
//     masquer  = ne pas afficher cette photo
//   Les choix déjà faits sont conservés ; seules les nouvelles photos sont ajoutées.
// - <CATALOGUE_ROOT>/review/images.html : planche avant/après à ouvrir dans le navigateur.
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCsv, writeCsv } from './csv.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const ROOT = path.resolve(process.env.CATALOGUE_ROOT ?? path.join(PROJECT, '..', 'ContextPlus'));
const IMAGES_CSV = path.join(PROJECT, 'content', 'image-review.csv');
const NAMES_CSV = path.join(PROJECT, 'content', 'product-names.csv');
const COLUMNS = ['produit', 'image', 'mode', 'remarque', 'source', 'cle'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const fileUrl = (abs) => 'file:///' + abs.split(path.sep).join('/').split('/').map(encodeURIComponent).join('/').replace(/^file:\/\/\/([A-Za-z])%3A/, 'file:///$1:');

/** Réglage par défaut d'après les mesures du détourage. */
function autoMode(m) {
  if (!m) return { mode: 'original', note: 'pas de détourage' };
  if (m.opaque < 0.06) return { mode: 'original', note: 'détourage presque vide' };
  if (m.partial > 0.2) return { mode: 'original', note: 'contours flous' };
  return { mode: 'cutout', note: '' };
}

async function main() {
  const catalogue = JSON.parse(await readFile(path.join(ROOT, 'catalogue', 'catalogue.json'), 'utf8'));
  const report = JSON.parse(await readFile(path.join(ROOT, '_cutouts', 'report.json'), 'utf8'));
  const names = new Map(existsSync(NAMES_CSV) ? (await readCsv(NAMES_CSV)).map((r) => [r.cle, r.nom_propose]) : []);
  const previous = new Map(existsSync(IMAGES_CSV) ? (await readCsv(IMAGES_CSV)).map((r) => [`${r.cle}#${r.image}`, r]) : []);

  const rows = [];
  const cards = [];
  for (const p of catalogue.products) {
    for (const [i, rel] of p.images.entries()) {
      const hash = createHash('md5').update(await readFile(path.join(ROOT, rel))).digest('hex');
      const key = `${p.source_folder}#${i + 1}`;
      const auto = autoMode(report[hash]);
      const row = previous.get(key) ?? {
        produit: names.get(p.source_folder) || p.name,
        image: String(i + 1),
        mode: auto.mode,
        remarque: auto.note,
        source: path.basename(rel),
        cle: p.source_folder,
      };
      rows.push(row);
      cards.push({ row, src: fileUrl(path.join(ROOT, rel)), cut: fileUrl(path.join(ROOT, '_cutouts', `${hash}.png`)) });
    }
  }
  await writeCsv(IMAGES_CSV, COLUMNS, rows);

  const html = `<!doctype html><meta charset="utf-8"><title>Relecture des photos – Context Plus</title>
<style>
  body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#fbfaf7;color:#0b0b0b}
  h1{font-size:22px} p{color:#5c5753;max-width:760px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}
  .card{background:#fff;border:1px solid #e7e0d5;border-radius:6px;padding:10px}
  .card.original{border-color:#d08a00}.card.masquer{opacity:.45}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .pair div{aspect-ratio:1;display:grid;place-items:center;border-radius:4px;overflow:hidden}
  .pair img{max-width:100%;max-height:100%}
  .checker{background:repeating-conic-gradient(#eee 0 25%,#fff 0 50%) 0 0/16px 16px}
  b{display:block;margin-top:8px} small{color:#6f6961}
  .mode{display:inline-block;margin-top:6px;padding:2px 8px;border-radius:99px;background:#efeef8;color:#32297a;font-weight:700;font-size:12px}
  .original .mode{background:#fff3dc;color:#8a5a00}
</style>
<h1>Relecture des photos détourées (${rows.length})</h1>
<p>À gauche la photo d'origine, à droite le détourage. Pour changer un choix, modifiez la colonne
<code>mode</code> de <code>content/image-review.csv</code> (cutout / original / masquer), puis relancez <code>npm run catalogue</code>.</p>
<div class="grid">${cards
    .map(
      ({ row, src, cut }) => `<div class="card ${row.mode}"><div class="pair"><div><img src="${src}" loading="lazy"></div><div class="checker"><img src="${cut}" loading="lazy"></div></div>
<b>${esc(row.produit)}${row.image !== '1' ? ` – photo ${row.image}` : ''}</b><span class="mode">${esc(row.mode)}</span> <small>${esc(row.remarque)}</small></div>`,
    )
    .join('\n')}</div>`;
  await mkdir(path.join(ROOT, 'review'), { recursive: true });
  await writeFile(path.join(ROOT, 'review', 'images.html'), html);
  const byMode = rows.reduce((acc, r) => ((acc[r.mode] = (acc[r.mode] ?? 0) + 1), acc), {});
  console.log(`${rows.length} photos`, byMode, `\nPlanche : ${path.join(ROOT, 'review', 'images.html')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
