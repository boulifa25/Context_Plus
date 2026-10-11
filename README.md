# Context Plus — site web

Refonte du site [contextplus.co.uk](https://contextplus.co.uk) avec le design de SelectFire Plus.
Angular 21 (SSR + pré-rendu de toutes les pages), GSAP pour les animations.

## Démarrer

```bash
npm install
npm run catalogue   # génère données + médias depuis ../ContextPlus (voir ci-dessous)
npm start           # http://localhost:4200
```

## Données du catalogue

`npm run catalogue` lit `../ContextPlus/catalogue/catalogue.json` (produit par
`extract_catalogue.py`) et génère :

- `src/app/data/generated/` : index, catégories, téléchargements et une fiche JSON par produit (versionné) ;
- `public/media/` : images WebP optimisées et PDF dédoublonnés (~130 Mo, **non versionné**).

Autre emplacement du catalogue : `CATALOGUE_ROOT=/chemin/vers/ContextPlus npm run catalogue`.

## Noms, badges et photos (relecture)

| Commande | Rôle |
|---|---|
| `npm run names` | Propose noms courts + sous-titres + badges dans `content/product-names.csv` (garde les lignes déjà relues ; `-- --reset` pour tout régénérer) |
| `npm run images:cutout` | Détoure les photos avec rembg (venv `../ContextPlus/.venv-rembg`, cache `../ContextPlus/_cutouts`) |
| `npm run images:review` | Met à jour `content/image-review.csv` et la planche `../ContextPlus/review/images.html` |
| `npm run catalogue` | Applique noms, badges et choix d'images, puis régénère données + médias |

Les deux CSV de `content/` sont la référence : on les modifie dans Excel
(**Enregistrer sous → CSV UTF-8**, séparateur `;`), puis on relance `npm run catalogue`.
Colonne `mode` des images : `cutout` (détourée), `original` (tableau/schéma), `masquer`.

## Build de production

```bash
npm run build                                   # pré-rend ~340 pages dans dist/
npm run serve:ssr:contextplus-website           # serveur Node (port 4000)
```

### Mise en ligne : domaines autorisés

Angular 21 ne fait le rendu serveur que pour les domaines déclarés (sinon il renvoie une page vide
rendue côté navigateur : mauvais pour le SEO). Déjà autorisés dans `angular.json` : `localhost`,
`contextplus.co.uk` et ses sous-domaines. Pour un autre domaine (préproduction…), soit l'ajouter à
`security.allowedHosts`, soit lancer le serveur avec `NG_ALLOWED_HOSTS=preprod.exemple.com`.

## À personnaliser

- `src/app/site.config.ts` : coordonnées, réseaux sociaux, point d'envoi du formulaire de contact
  (vide = ouverture du client mail).
- `src/styles.scss` : couleurs (accent marine Context Plus ; l'accent rouge d'origine est noté en tête du fichier).
- `src/app/shared/approvals.ts` : bandeau des certifications. Seul le logo LPCB officiel est fourni
  (`public/brand/approvals/lpcb.png`, tiré du dossier client) ; pour UL, FM, VdS, BSI, Intertek, déposer les
  fichiers officiels (SVG ou PNG transparent) dans `public/brand/approvals/` et renseigner `logo`.
  Ne pas redessiner ces marques.
- `public/brand/` : logo (à remplacer par une version vectorielle SVG si disponible).
