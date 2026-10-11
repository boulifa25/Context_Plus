import { Routes } from '@angular/router';
import { catalogueIndexResolver } from './data/catalogue.service';
import { Home } from './pages/home';
import { productResolver } from './pages/product.resolver';

// L'accueil est dans le bundle initial ; les autres pages sont chargées à la demande
// (puis préchargées en tâche de fond, cf. withPreloading dans app.config.ts).
const index = { index: catalogueIndexResolver };

export const routes: Routes = [
  { path: '', component: Home, resolve: index, title: 'Context Plus | Fire Detection & Suppression Systems, Made in the UK' },
  { path: 'products', loadComponent: () => import('./pages/catalogue').then((m) => m.CataloguePage), resolve: index },
  {
    path: 'products/:slug',
    loadComponent: () => import('./pages/product').then((m) => m.ProductPage),
    resolve: { ...index, product: productResolver },
  },
  { path: 'catalogue/:categorySlug', loadComponent: () => import('./pages/catalogue').then((m) => m.CataloguePage), resolve: index },
  { path: 'catalogue/:categorySlug/:subSlug', loadComponent: () => import('./pages/catalogue').then((m) => m.CataloguePage), resolve: index },
  { path: 'about', loadComponent: () => import('./pages/about').then((m) => m.About), title: 'About Us | Context Plus' },
  { path: 'contact', loadComponent: () => import('./pages/contact').then((m) => m.Contact), title: 'Contact Us | Context Plus' },
  { path: 'downloads', loadComponent: () => import('./pages/downloads').then((m) => m.Downloads), title: 'Downloads | Context Plus' },
  { path: 'not-found', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound), title: 'Page Not Found | Context Plus' },
  { path: '**', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound), title: 'Page Not Found | Context Plus' },
];
