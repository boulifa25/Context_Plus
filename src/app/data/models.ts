export interface ProductImage {
  src: string;
  width: number;
  height: number;
}

export type DocumentType = 'datasheet' | 'certificate' | 'brochure' | 'manual';

export interface ProductDocument {
  title: string;
  type: DocumentType;
  url: string;
  size: number;
}

export interface Spec {
  label: string;
  value: string;
}

/** Fiche complète, chargée à la demande sur la page produit. */
export interface Product {
  slug: string;
  name: string;
  codes: string[];
  category: { slug: string; name: string; short: string };
  subcategory: { slug: string; name: string } | null;
  family: string | null;
  summary: string;
  description: string[];
  specs: Spec[];
  features: string[];
  images: ProductImage[];
  documents: ProductDocument[];
  related: string[];
}

/** Entrée légère de l'index (catalogue, recherche, cartes). */
export interface ProductSummary {
  slug: string;
  name: string;
  codes: string[];
  category: string;
  subcategory: string | null;
  family: string | null;
  excerpt: string;
  image: ProductImage | null;
  docs: number;
}

export interface Subcategory {
  slug: string;
  name: string;
  count: number;
}

export interface Category {
  slug: string;
  name: string;
  short: string;
  intro: string;
  hidden: boolean;
  count: number;
  subcategories: Subcategory[];
}

export interface DownloadGroup {
  id: string;
  title: string;
  intro: string;
  documents: ProductDocument[];
}
