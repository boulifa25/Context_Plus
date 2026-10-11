import { inject } from '@angular/core';
import { RedirectCommand, ResolveFn, Router } from '@angular/router';
import { CatalogueService } from '../data/catalogue.service';
import type { Product } from '../data/models';

/** Fiche produit (fichier séparé pour ne pas embarquer la page produit dans le bundle initial). */
export const productResolver: ResolveFn<Product> = async (route) => {
  const router = inject(Router);
  const product = await inject(CatalogueService).product(route.paramMap.get('slug') ?? '');
  return product ?? new RedirectCommand(router.parseUrl('/not-found'), { skipLocationChange: true });
};
