import { renderLogin } from './pages/login.js';
    import { renderDashboard } from './pages/dashboard.js';
    import { renderProfile } from './pages/profile.js';
    import { renderStaffVerification } from './pages/staff.js';
    import { isAuthenticated, getUserRole } from './auth.js';

    const routes = {
      '/': 'login',
      '/dashboard': 'dashboard',
      '/profile': 'profile',
      '/verify': 'verify'
    };

    export function initRouter() {
      // Handle navigation
      window.addEventListener('popstate', handleRoute);
      document.addEventListener('click', e => {
        if (e.target.matches('[data-route]')) {
          e.preventDefault();
          navigateTo(e.target.getAttribute('data-route'));
        }
      });

      // Initial route
      handleRoute();
    }

    export function navigateTo(path) {
      window.history.pushState({}, '', path);
      handleRoute();
    }

    function handleRoute() {
      const path = window.location.pathname;
      const route = routes[path] || 'login';

      if (!isAuthenticated() && route !== 'login') {
        navigateTo('/');
        return;
      }

      const app = document.getElementById('app');
      app.innerHTML = '';

      switch (route) {
        case 'login':
          renderLogin();
          break;
        case 'dashboard':
          renderDashboard();
          break;
        case 'profile':
          renderProfile();
          break;
        case 'verify':
          if (getUserRole() === 'staff') {
            renderStaffVerification();
          } else {
             navigateTo('/dashboard');
          }
          break;
      }
    }
