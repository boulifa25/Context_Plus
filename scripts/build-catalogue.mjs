// Génère les données du site à partir du catalogue extrait (catalogue.json).
//
//   npm run catalogue
//
// Entrée : $CATALOGUE_ROOT/catalogue/catalogue.json (défaut : ../ContextPlus)
// Sorties :
//   src/app/data/generated/index.json          liste légère (catalogue, recherche, menus)
//   src/app/data/generated/categories.json     arborescence catégories
//   src/app/data/generated/downloads.json      manuels + brochures
//   src/app/data/generated/products/<slug>.json fiche complète (chargée à la demande)
//   src/app/data/generated/product-loaders.ts  imports dynamiques par slug
//   public/media/products/<slug>/<n>.webp      images optimisées
//   public/media/docs/<hash>/<fichier>.pdf     PDF dédoublonnés
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(HERE, '..');
const ROOT = path.resolve(process.env.CATALOGUE_ROOT ?? path.join(PROJECT, '..', 'ContextPlus'));
const DATA_OUT = path.join(PROJECT, 'src', 'app', 'data', 'generated');
const MEDIA_OUT = path.join(PROJECT, 'public', 'media');

// Ordre, libellés courts (menu) et textes des catégories racines.
const CATEGORY_META = {
  'Conventional Fire Systems': {
    short: 'Conventional',
    intro: 'Conventional fire detection panels, detectors, call points, sounders and linear heat detection.',
  },
  'Analogue Addressable Fire Systems': {
    short: 'Addressable',
    intro: 'Networkable analogue addressable panels, detectors, interfaces, voice alarms and refuge systems.',
  },
  'Clean Agent Fire Suppression Systems': {
    short: 'Suppression',
    intro: 'HFC227ea clean agent cylinders, valves, accessories and gas extinguishing control panels.',
  },
  'Fire Resistant Cables': {
    short: 'Cables',
    intro: 'LPCB approved, low smoke zero halogen fire resistant cables in HP, XP and XPS ranges.',
  },
  'Domestic Fire Alarms': {
    short: 'Domestic',
    intro: 'Battery and mains powered smoke, heat and carbon monoxide alarms with relays and accessories.',
  },
  'Wireless Fire Systems': {
    short: 'Wireless',
    intro: 'RadioLINK wireless smoke and heat alarms, call points, panel interfaces and I/O devices.',
  },
  'Other Products': { short: 'Other', intro: 'Network and communication accessories.', hidden: true },
};
// Libellés hérités de l'extraction (en français) -> anglais pour le site.
const RENAME = {
  'À classer': 'Other Products',
  'Accessoires réseau / communication': 'Network & Communication Accessories',
  Divers: 'Miscellaneous',
  'Fire Resistant Cables (gamme à confirmer)': 'Other Fire Resistant Cables',
};

const rename = (s) => (s ? (RENAME[s] ?? s) : s);

function slugify(text, max = 80) {
  const s = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/-[^-]*$/, '');
}

function excerpt(text, max = 180) {
  const t = (text ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

// "Operating voltage: 17–28V DC" -> { label, value } ; sinon puce simple.
function splitFeatures(lines) {
  const specs = [];
  const bullets = [];
  for (const line of lines) {
    const m = line.match(/^([^:]{2,40}):\s+(.{1,200})$/);
    if (m && !/https?$/i.test(m[1])) specs.push({ label: m[1].trim(), value: m[2].trim() });
    else bullets.push(line);
  }
  return { specs, bullets };
}

function docTitle(title) {
  return title
    .replace(/[_]+/g, ' ')
    .replace(/\s*-\s*/g, ' – ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function md5(file) {
  return createHash('md5').update(await readFile(file)).digest('hex');
}

const docCache = new Map(); // hash -> doc publié
async function publishDoc(doc) {
  const src = path.join(ROOT, doc.path);
  if (!existsSync(src)) return null;
  const hash = await md5(src);
  if (docCache.has(hash)) return { ...docCache.get(hash), title: docTitle(doc.title), type: doc.type };
  const file = slugify(path.basename(doc.path, '.pdf'), 90) + '.pdf';
  const rel = `media/docs/${hash.slice(0, 8)}/${file}`;
  const dest = path.join(PROJECT, 'public', rel);
  if (!existsSync(dest)) {
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(src, dest);
  }
  const published = { title: docTitle(doc.title), type: doc.type, url: '/' + rel, size: (await stat(src)).size, hash };
  docCache.set(hash, published);
  return published;
}

async function publishImage(srcRel, slug, index) {
  const src = path.join(ROOT, srcRel);
  const rel = `media/products/${slug}/${index}.webp`;
  const dest = path.join(PROJECT, 'public', rel);
  if (!existsSync(dest)) {
    await mkdir(path.dirname(dest), { recursive: true });
    // Buffer plutôt que chemin : libvips ne gère pas les chemins Windows > 260 caractères
    await sharp(await readFile(src)).rotate().resize(900, 900, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(dest);
  }
  const { width, height } = await sharp(dest).metadata();
  return { src: '/' + rel, width, height };
}

async function main() {
  const catalogue = JSON.parse(await readFile(path.join(ROOT, 'catalogue', 'catalogue.json'), 'utf8'));
  await rm(DATA_OUT, { recursive: true, force: true });
  await mkdir(path.join(DATA_OUT, 'products'), { recursive: true });

  // Slugs uniques et lisibles (nom du produit, + code si collision)
  const used = new Set();
  const withSlugs = catalogue.products.map((p) => {
    let slug = slugify(p.name, 70);
    if (used.has(slug) && p.product_codes[0]) slug = slugify(`${slug}-${p.product_codes[0]}`, 90);
    for (let i = 2; used.has(slug); i++) slug = `${slugify(p.name, 70)}-${i}`;
    used.add(slug);
    return { ...p, slug, category: rename(p.category), subcategory: rename(p.subcategory) };
  });

  // Catégories
  const categories = [];
  const catBySlug = new Map();
  for (const name of Object.keys(CATEGORY_META)) {
    if (!withSlugs.some((p) => p.category === name)) continue;
    const c = { slug: slugify(name), name, ...CATEGORY_META[name], hidden: !!CATEGORY_META[name].hidden, count: 0, subcategories: [] };
    categories.push(c);
    catBySlug.set(name, c);
  }
  for (const p of withSlugs) {
    const c = catBySlug.get(p.category);
    if (!c) throw new Error(`Catégorie inconnue : ${p.category} (ajoutez-la à CATEGORY_META)`);
    c.count++;
    if (p.subcategory) {
      let s = c.subcategories.find((x) => x.name === p.subcategory);
      if (!s) c.subcategories.push((s = { slug: slugify(p.subcategory), name: p.subcategory, count: 0 }));
      s.count++;
    }
  }

  // Produits
  const index = [];
  const full = [];
  let n = 0;
  for (const p of withSlugs) {
    const cat = catBySlug.get(p.category);
    const sub = cat.subcategories.find((s) => s.name === p.subcategory) ?? null;
    const images = [];
    for (const [i, img] of p.images.entries()) images.push(await publishImage(img, p.slug, i + 1));
    const documents = [];
    for (const d of p.documents) {
      const pub = await publishDoc(d);
      if (pub && !documents.some((x) => x.hash === pub.hash)) documents.push(pub);
    }
    const { specs, bullets } = splitFeatures(p.features);
    // Accroche = 1er paragraphe ; le reste du résumé rejoint la description.
    const textLines = [...p.summary.split('\n'), ...p.description.split('\n')].filter(Boolean);
    const summary = textLines[0] ?? '';
    full.push({
      slug: p.slug,
      name: p.name,
      codes: p.product_codes,
      category: { slug: cat.slug, name: cat.name, short: cat.short },
      subcategory: sub && { slug: sub.slug, name: sub.name },
      family: p.family,
      summary,
      description: [...new Set(textLines.slice(1))].filter((l) => !l.startsWith(summary.slice(0, 80)) && !p.features.includes(l)),
      specs,
      features: bullets.filter((l) => l !== summary),
      images,
      documents: documents.map(({ hash, ...d }) => d),
      related: [],
    });
    index.push({
      slug: p.slug,
      name: p.name,
      codes: p.product_codes,
      category: cat.slug,
      subcategory: sub?.slug ?? null,
      family: p.family,
      excerpt: excerpt(summary),
      image: images[0] ?? null,
      docs: documents.length,
    });
    if (++n % 25 === 0) console.log(`  ${n}/${withSlugs.length} produits…`);
  }

  // Produits liés : même sous-catégorie (ou famille), avec image en priorité
  for (const prod of full) {
    const peers = index.filter(
      (o) => o.slug !== prod.slug && o.category === prod.category.slug && o.subcategory === (prod.subcategory?.slug ?? null),
    );
    peers.sort((a, b) => (b.family === prod.family) - (a.family === prod.family) || !!b.image - !!a.image);
    prod.related = peers.slice(0, 4).map((o) => o.slug);
    await writeFile(path.join(DATA_OUT, 'products', `${prod.slug}.json`), JSON.stringify(prod));
  }

  // Téléchargements : manuels d'installation + brochures (dédoublonnés)
  const manuals = [];
  for (const m of catalogue.installation_manuals) {
    const pub = await publishDoc(m);
    if (pub) manuals.push(pub);
  }
  const brochures = [...docCache.values()].filter(
    (d) => d.type === 'brochure' && !manuals.some((m) => m.hash === d.hash),
  );
  const strip = ({ hash, ...d }) => d;
  const downloads = [
    { id: 'manuals', title: 'Installation Manuals', intro: 'CAST protocol panels, detectors and modules.', documents: manuals.map(strip) },
    { id: 'brochures', title: 'Brochures & Catalogues', intro: 'Product range brochures and sales literature.', documents: brochures.map(strip) },
  ];

  // Mise en avant (accueil) : un produit illustré et documenté par catégorie principale
  const featured = categories
    .filter((c) => !c.hidden)
    .map((c) =>
      index
        .filter((o) => o.category === c.slug && o.image)
        .sort((a, b) => b.docs - a.docs || b.excerpt.length - a.excerpt.length)[0],
    )
    .filter(Boolean)
    .map((o) => o.slug);

  await writeFile(path.join(DATA_OUT, 'index.json'), JSON.stringify({ products: index, featured }));
  await writeFile(path.join(DATA_OUT, 'categories.json'), JSON.stringify(categories, null, 2));
  await writeFile(path.join(DATA_OUT, 'downloads.json'), JSON.stringify(downloads, null, 2));
  const loaders = index
    .map((o) => `  ${JSON.stringify(o.slug)}: () => import('./products/${o.slug}.json').then((m) => m.default as unknown as Product),`)
    .join('\n');
  await writeFile(
    path.join(DATA_OUT, 'product-loaders.ts'),
    `// Fichier généré par scripts/build-catalogue.mjs — ne pas modifier.\nimport type { Product } from '../models';\n\nexport const PRODUCT_LOADERS: Record<string, () => Promise<Product>> = {\n${loaders}\n};\n`,
  );

  const docBytes = [...docCache.values()].reduce((s, d) => s + d.size, 0);
  console.log(
    `${index.length} produits, ${categories.length} catégories, ${docCache.size} PDF (${Math.round(docBytes / 1e6)} Mo), ` +
      `${index.filter((o) => o.image).length} produits illustrés, ${featured.length} mis en avant.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
