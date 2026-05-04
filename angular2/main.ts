import { bootstrapApplication } from '@angular/platform-browser';

import { appConfig } from './app/app.config';
import { HttpClientModule } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    [provideRouter(routes)],
    importProvidersFrom(HttpClientModule),
    ...(appConfig.providers || []) 
  ]
}).catch(err => console.error(err));
