import { initRouter } from './router.js';
import { initAuth } from './auth.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initRouter();
});
