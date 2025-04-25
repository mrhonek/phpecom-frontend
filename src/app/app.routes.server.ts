import { RenderMode, ServerRoute } from '@angular/ssr';

// Define all routes from the client app
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'products',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'products/:id',
    // Use 'renderMode: null' to disable prerendering for routes with parameters
    renderMode: null
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'register',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'cart',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'checkout',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'orders',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'orders/:id',
    // Use 'renderMode: null' to disable prerendering for routes with parameters
    renderMode: null
  },
  {
    path: '**',
    renderMode: null
  }
];
