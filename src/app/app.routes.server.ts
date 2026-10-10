import { RenderMode, ServerRoute } from '@angular/ssr';
import categories from './data/generated/categories.json';
import index from './data/generated/index.json';

// Toutes les pages connues sont pré-rendues en HTML statique au build (SEO + vitesse).
export const serverRoutes: ServerRoute[] = [
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => index.products.map((p) => ({ slug: p.slug })),
  },
  {
    path: 'catalogue/:categorySlug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => categories.map((c) => ({ categorySlug: c.slug })),
  },
  {
    path: 'catalogue/:categorySlug/:subSlug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () =>
      categories.flatMap((c) => c.subcategories.map((s) => ({ categorySlug: c.slug, subSlug: s.slug }))),
  },
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'products', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'downloads', renderMode: RenderMode.Prerender },
  { path: 'not-found', renderMode: RenderMode.Server, status: 404 },
  // URL inconnues : rendu serveur avec un vrai code 404
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
