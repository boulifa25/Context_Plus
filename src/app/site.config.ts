/** Coordonnées et textes de marque (repris du site contextplus.co.uk). */
export const SITE = {
  name: 'Context Plus',
  legalName: 'Context Plus Ltd',
  tagline: 'Leading the way in fire alarms',
  url: 'https://contextplus.co.uk',
  email: 'sales@contextplus.co.uk',
  phone: '+44 161 257 2541',
  phoneHref: '+441612572541',
  hours: 'Mon – Fri, 09:00 – 17:00',
  address: ['Progress House, Newby Industrial Estate', 'Newby Road, Hazel Grove, Stockport', 'SK7 5DA, United Kingdom'],
  founded: 1984,
  countries: '70+',
  /** Point d'envoi du formulaire de contact (Formspree, API maison…). Vide = ouverture du client mail. */
  contactEndpoint: '',
  /** Réseaux sociaux affichés en pied de page (à compléter avec les vraies URL du client). */
  social: [] as { label: string; href: string; icon: 'linkedin' | 'facebook' }[],
};
