import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withPreloading,
  withViewTransitions,
} from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Pages chargées en tâche de fond après l'affichage : navigation instantanée ensuite
      withPreloading(PreloadAllModules),
      // Transition animée entre pages (View Transitions API ; ignorée par les navigateurs non compatibles)
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideClientHydration(withEventReplay()),
  ],
};
