let currentUser = null;

export function initAuth() {
  // Check for existing session
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
}

export function login(credentials) {
  // Simulate authentication
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        currentUser = {
          id: 'user123',
          email: credentials.email,
          role: credentials.role,
          name: 'John Doe'
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
        resolve(currentUser);
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
}

export function logout() {
  currentUser = null;
  localStorage.removeItem('user');
  window.location.href = '/';
}

export function isAuthenticated() {
  return currentUser !== null;
}

export function getUserRole() {
  return currentUser?.role || null;
}

export function getCurrentUser() {
  return currentUser;
}
