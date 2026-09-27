import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsBo from '@angular/common/locales/es-BO';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

// Fechas y números en español de Bolivia ("26 de septiembre", no "September 26").
registerLocaleData(localeEsBo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'es-BO' },
    provideRouter(
      routes,
      // Fundido suave entre pantallas; en navegadores sin View Transitions API
      // Angular simplemente navega sin animación.
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      // Permite pasar `data` de la ruta a inputs del componente (ej. ocultar
      // el hero del catálogo cuando se reutiliza en la venta de mostrador).
      withComponentInputBinding(),
    ),
    provideClientHydration(),
  ],
};
