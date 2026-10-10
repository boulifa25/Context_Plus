import { Routes } from '@angular/router';
import { About } from './pages/about';
import { CataloguePage } from './pages/catalogue';
import { Contact } from './pages/contact';
import { Downloads } from './pages/downloads';
import { Home } from './pages/home';
import { NotFound } from './pages/not-found';
import { ProductPage, productResolver } from './pages/product';

export const routes: Routes = [
  { path: '', component: Home, title: 'Context Plus | Fire Detection & Suppression Systems, Made in the UK' },
  { path: 'products', component: CataloguePage },
  { path: 'products/:slug', component: ProductPage, resolve: { product: productResolver } },
  { path: 'catalogue/:categorySlug', component: CataloguePage },
  { path: 'catalogue/:categorySlug/:subSlug', component: CataloguePage },
  { path: 'about', component: About, title: 'About Us | Context Plus' },
  { path: 'contact', component: Contact, title: 'Contact Us | Context Plus' },
  { path: 'downloads', component: Downloads, title: 'Downloads | Context Plus' },
  { path: 'not-found', component: NotFound, title: 'Page Not Found | Context Plus' },
  { path: '**', component: NotFound, title: 'Page Not Found | Context Plus' },
];
