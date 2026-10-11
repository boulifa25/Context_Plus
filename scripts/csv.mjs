// Lecture/écriture CSV compatibles Excel (séparateur « ; », BOM UTF-8).
import { readFile, writeFile } from 'node:fs/promises';

export async function readCsv(file) {
  const buf = await readFile(file);
  // Excel enregistre en UTF-8 (avec BOM) ou en ANSI (Windows-1252) selon l'option choisie
  let text = buf.toString('utf8');
  if (text.includes('�')) text = new TextDecoder('windows-1252').decode(buf);
  text = text.replace(/^﻿/, '');
  const sep = (text.split('\n')[0].match(/;/g) ?? []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) row.push(cell), (cell = '');
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell), rows.push(row), (row = []), (cell = '');
    } else cell += ch;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  const [header, ...data] = rows.filter((r) => r.some((c) => c.trim()));
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

export async function writeCsv(file, columns, records) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.join(';'), ...records.map((r) => columns.map((c) => esc(r[c])).join(';'))];
  await writeFile(file, '﻿' + lines.join('\r\n') + '\r\n', 'utf8');
}
