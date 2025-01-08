import { login } from '../auth.js';
    import { navigateTo } from '../router.js';

    export function renderLogin() {
      const template = `
        <div class="auth-container">
          <div class="auth-card">
            <h2>Login to Meal Card System</h2>
            <form id="loginForm">
              <div class="form-group">
                <label for="role">Role</label>
                <select id="role" required>
                  <option value="student">Student</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" required>
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" required>
              </div>
              <button type="submit" class="btn btn--primary">Login</button>
            </form>
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = template;

      // Handle form submission
      document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const credentials = {
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
          role: document.getElementById('role').value
        };

        try {
          await login(credentials);
          if (credentials.role === 'staff') {
            navigateTo('/verify');
          } else {
            navigateTo('/dashboard');
          }
        } catch (error) {
          alert(error.message);
        }
      });
    }
