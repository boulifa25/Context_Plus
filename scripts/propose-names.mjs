// Propose des noms courts + badges de certification pour chaque produit.
//
//   npm run names
//
// Écrit content/product-names.csv (à relire dans Excel). Les lignes déjà présentes
// sont conservées telles quelles : seules les nouvelles clés sont ajoutées, sauf avec
// --reset qui régénère toutes les propositions.
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCsv, writeCsv } from './csv.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const ROOT = path.resolve(process.env.CATALOGUE_ROOT ?? path.join(PROJECT, '..', 'ContextPlus'));
export const NAMES_CSV = path.join(PROJECT, 'content', 'product-names.csv');
export const COLUMNS = ['categorie', 'codes', 'nom_actuel', 'nom_propose', 'sous_titre', 'badges', 'remarque', 'cle'];

// Mentions de certification : retirées du nom et transformées en badges.
const NAME_BADGES = [
  [/\(?\s*\bLPCB\s+approved\b\s*\)?/gi, 'LPCB'],
  [/\(?\s*\bUL\s+listed\b\s*\)?/gi, 'UL'],
  [/\bFM\s+approved\b/gi, 'FM'],
  [/\bVDS\s+approved(?:\s+to\s+EN54-4\/A2)?/gi, 'VdS'],
  [/\(?\s*\bINTERTEK\s+approved\b\s*\)?/gi, 'Intertek'],
  [/\bBSI\s+kitemarked\b/gi, 'BSI Kitemark'],
  [/\bto\s+BS\/EN12094-1\b/gi, 'EN12094-1'],
];
// Mentions repérées dans les textes (sans modifier le nom).
const TEXT_BADGES = [
  [/\bLPCB\b/i, 'LPCB'],
  [/\bUL\s+(?:listed|approved|certified)\b/i, 'UL'],
  [/\bFM\s+approved\b/i, 'FM'],
  [/\bVdS\b/i, 'VdS'],
  [/\bBSI\b|kitemark/i, 'BSI Kitemark'],
  [/\bINTERTEK\b/i, 'Intertek'],
];
const BADGE_ORDER = ['LPCB', 'UL', 'FM', 'VdS', 'BSI Kitemark', 'Intertek', 'EN12094-1'];

const TYPOS = [
  [/\bHazardeous\b/g, 'Hazardous'],
  [/\bMutisensor\b/g, 'Multisensor'],
  [/\bAncilliary\b/g, 'Ancillary'],
  [/^win switch monitor/i, 'Twin switch monitor'],
  [/\bConverntional\b/g, 'Conventional'],
  [/\bDiscoveryProtocol\b/g, 'Discovery Protocol'],
  [/^l Fire Panel 2 Zone$/, 'FP Range Conventional Fire Panel 2 Zone'], // début tronqué dans la source
];
// Sigles à garder en majuscules même s'ils font 4 lettres ou plus.
const KEEP_UPPER = new Set(['AVAC', 'CAST', 'HINET', 'XPERT', 'LEDS', 'EVAC', 'ABUS']);
const SMALL_WORDS = { OFF: 'Off', BOX: 'Box', SET: 'set', PCS: 'pcs', FOR: 'for', AND: 'and', THE: 'the' };
const CABLE_RANGES = { FPS: 'HP High Performance', FPX: 'XP Premium', FSX: 'XPS Special' };

function titleCaseShouting(text) {
  // Mots en capitales, sauf références (« ECU-8 », « PGS-27 ») et sigles sans voyelle (« SPDT »)
  return text.replace(/\b[A-Z]{3,}(?:-[A-Z]{2,})*\b(?![-/]?\d)/g, (w) => {
    if (w in SMALL_WORDS) return SMALL_WORDS[w];
    if (w.length < 4 || !/[AEIOUY]/.test(w)) return w;
    if (KEEP_UPPER.has(w)) return w === 'LEDS' ? 'LEDs' : w === 'XPERT' ? 'Xpert' : w;
    return w
      .toLowerCase()
      .replace(/(^|-)([a-z])/g, (_, s, c) => s + c.toUpperCase());
  });
}

function tidy(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\(\s*\)/g, '')
    .replace(/\s+([,.;)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/(\w)-\s+(?=[A-Za-z(])/g, '$1 – ') // « Gas- UL » -> « Gas – UL »
    .replace(/\s*[–-]\s*[–-]\s*/g, ' – ')
    .replace(/^[\s,;:&–-]+|[\s,;:.&–-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');

/**
 * Retire un code produit répété en fin ou entre séparateurs (« … (Ei603CRF-CON) », « – 55000-852 – »),
 * mais garde un code en tête, qui fait partie du nom (« Ei650 Optical Smoke Alarm »).
 */
function removeRepeatedCodes(name, codes) {
  for (const code of [...codes].sort((a, b) => b.length - a.length)) {
    for (const variant of [code, code.replace(/(IMC|IMU|\/CON|-CON)$/i, '')]) {
      if (variant.length < 4) continue;
      const v = escapeRe(variant);
      name = name
        .replace(new RegExp(`\\s*\\(\\s*${v}\\s*\\)`, 'gi'), ' ')
        .replace(new RegExp(`(?<=\\S.*)\\s*[–-]\\s*${v}(?=\\s*(?:[–-]|$))`, 'gi'), ' ')
        .replace(new RegExp(`(?<=\\S.*)\\s+(?:Model:\\s*)?${v}\\s*$`, 'gi'), ' ');
    }
  }
  return name;
}

/** Position du premier séparateur fort (« ; », « . », « c/w », « , » hors nombres) après 12 caractères. */
function firstSeparator(s) {
  const re = /;\s|\.\s|\s[cC]\/[wW]\s|,\s(?!\d)/g;
  for (const m of s.matchAll(re)) if (m.index > 12) return m.index;
  return -1;
}

function tidyDetail(s) {
  return tidy(s.replace(/^[\s(;.,]+/, '').replace(/\s*[-–]\s*\)/g, ')'));
}

/** Supprime les parenthèses fermantes sans ouvrante (et inversement). */
function balanceParens(s) {
  let depth = 0;
  let out = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') {
      if (!depth) continue;
      depth--;
    }
    out += ch;
  }
  for (; depth > 0; depth--) out += ')';
  return out;
}

function badgesFromText(text, badges) {
  for (const [re, b] of TEXT_BADGES) if (re.test(text)) badges.add(b);
  for (const m of text.matchAll(/\bEN\s?54-(\d+)/gi)) badges.add(`EN54-${m[1]}`);
}

/** Câbles : « 100 mtrs Reel ‘XP PREMIUM’ fire resistant cable 2 core, 1.5mm… » */
function cableName(p) {
  const m = p.name.match(/(\d+)\s*(?:mtrs|m)\b.*?(\d)\s*core,?\s*([\d.]+)\s*mm/i);
  const range = CABLE_RANGES[(p.product_codes[0] ?? '').slice(0, 3)];
  if (!m || !range) return null;
  const [, length, cores, size] = m;
  const extras = [`${length} m reel`];
  if (/red/i.test(p.name)) extras.push('red');
  if (/solid core/i.test(p.name)) extras.push('solid core');
  if (/BS5839/i.test(p.name)) extras.push('meets BS5839 Pt1 2002 26.2d');
  return { title: `${range} Fire Resistant Cable – ${cores} Core ${size} mm²`, subtitle: cap(extras.join(', ')) };
}

export function proposeName(p) {
  const badges = new Set();
  const notes = [];
  let name = p.name;
  for (const [re, fix] of TYPOS) {
    if (re.test(name)) {
      name = name.replace(re, fix);
      if (!notes.includes('faute corrigée')) notes.push('faute corrigée');
    }
  }
  name = name.replace(/\bPACK OF\b/g, 'Pack of');
  let title;
  let subtitle = '';

  const cable = /fire (resistant )?cable/i.test(name) && cableName({ ...p, name });
  if (cable) {
    ({ title, subtitle } = cable);
    badges.add('LPCB');
  } else {
    for (const [re, b] of NAME_BADGES) {
      if (re.test(name)) {
        badges.add(b);
        name = name.replace(re, ' ');
      }
    }
    for (const m of name.matchAll(/\bEN54-(\d+)(?:\s*compliant)?/gi)) badges.add(`EN54-${m[1]}`);
    name = name.replace(/-?\s*\bEN54-\d+(?:\s*compliant)?/gi, ' ');
    name = tidy(removeRepeatedCodes(tidy(name), p.product_codes));

    // Groupes entre parenthèses -> sous-titre (« Series 65E CR (84 to 100°C) Heat Detector »)
    const details = [];
    let head = name;
    const paren = head.match(/^(.{12,}?)\s*\(([^()]*)\)\s*(.*)$/);
    if (paren && !/^\d/.test(paren[2])) {
      // texte après la parenthèse : soit la fin du nom (« … detector HEAD ONLY »), soit des détails
      const [, before, inside, after] = paren;
      const afterIsName = after && !/^[,;.(–-]|^c\/w/i.test(after);
      head = afterIsName ? `${before} ${after.replace(/\s*[(,;].*$/, '')}` : before;
      details.push(inside);
      const rest = afterIsName ? after.slice(after.replace(/\s*[(,;].*$/, '').length) : after;
      if (rest.trim()) details.push(rest);
    } else if (paren) {
      head = paren[1];
      details.push(`${paren[2]}${paren[3] ? ' ' + paren[3] : ''}`);
    }

    // Puis coupure au premier séparateur fort après 12 caractères
    const cutAt = firstSeparator(head);
    if (cutAt > 0) {
      details.unshift(head.slice(cutAt));
      head = head.slice(0, cutAt);
    }
    // Encore trop long : « Switch monitor with Back Box & … » -> « Switch monitor » + détails
    if (head.length > 55) {
      const w = head.search(/\s(?:with|–|for use)\s/i);
      if (w > 12) {
        details.unshift(head.slice(w));
        head = head.slice(0, w);
      }
    }
    // Parenthèse ouverte jamais refermée dans la source : on coupe là
    const open = head.indexOf('(');
    if (open > 12 && !head.includes(')', open)) {
      details.unshift(head.slice(open + 1));
      head = head.slice(0, open);
    }
    title = cap(tidy(titleCaseShouting(head)));
    subtitle = cap(tidy(balanceParens(titleCaseShouting(details.map(tidyDetail).filter(Boolean).join('; ')))));
  }
  if (/^[a-z]/.test(p.name) || /\bIP\d\d \d+$/.test(title)) notes.push('nom source tronqué ?');

  badgesFromText([p.name, p.summary, ...p.features].join(' '), badges);
  if (title.length > 60) notes.push('nom encore long');
  if (!p.images.length) notes.push('pas de photo');
  return {
    title,
    subtitle,
    badges: BADGE_ORDER.filter((b) => badges.has(b))
      .concat([...badges].filter((b) => !BADGE_ORDER.includes(b)).sort())
      .join(', '),
    notes,
  };
}

async function main() {
  const reset = process.argv.includes('--reset');
  const catalogue = JSON.parse(await readFile(path.join(ROOT, 'catalogue', 'catalogue.json'), 'utf8'));
  const existing = !reset && existsSync(NAMES_CSV) ? await readCsv(NAMES_CSV) : [];
  const byKey = new Map(existing.map((r) => [r.cle, r]));

  // Doublons probables : même code produit sur plusieurs fiches
  const codeCount = new Map();
  for (const p of catalogue.products) for (const c of p.product_codes) codeCount.set(c, (codeCount.get(c) ?? 0) + 1);

  let added = 0;
  const rows = catalogue.products.map((p) => {
    const kept = byKey.get(p.source_folder);
    if (kept) return kept;
    added++;
    const { title, subtitle, badges, notes } = proposeName(p);
    if (p.product_codes.some((c) => codeCount.get(c) > 1)) notes.push('doublon possible (même code)');
    return {
      categorie: p.category,
      codes: p.product_codes.join(' | '),
      nom_actuel: p.name,
      nom_propose: title,
      sous_titre: subtitle,
      badges,
      remarque: notes.join(', '),
      cle: p.source_folder,
    };
  });
  await mkdir(path.dirname(NAMES_CSV), { recursive: true });
  await writeCsv(NAMES_CSV, COLUMNS, rows);
  console.log(`${rows.length} produits (${added} propositions nouvelles) -> ${path.relative(PROJECT, NAMES_CSV)}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
