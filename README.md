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

## Build de production

```bash
npm run build                                   # pré-rend ~340 pages dans dist/
npm run serve:ssr:contextplus-website           # serveur Node (port 4000)
```

## À personnaliser

- `src/app/site.config.ts` : coordonnées, réseaux sociaux, point d'envoi du formulaire de contact
  (vide = ouverture du client mail).
- `src/styles.scss` : couleurs (accent marine Context Plus ; l'accent rouge d'origine est noté en tête du fichier).
- `public/brand/` : logo (à remplacer par une version vectorielle SVG si disponible).
