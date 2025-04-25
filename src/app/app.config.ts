import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthService } from './services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          const authService = inject(AuthService);
          const token = authService.getToken();
          
          if (token) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          
          return next(req);
        }
      ])
    )
  ]
}; 