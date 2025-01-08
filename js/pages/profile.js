import { getCurrentUser } from '../auth.js';

export function renderProfile() {
  const user = getCurrentUser();
  const template = `
    <div class="container">
      <h1>Profile</h1>
      <div class="profile-card">
        <div class="form-group">
          <label>Name</label>
          <input type="text" value="${user.name}" readonly>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" value="${user.email}" readonly>
        </div>
        <div class="form-group">
          <label>Role</label>
          <input type="text" value="${user.role}" readonly>
        </div>
      </div>
    </div>
  `;

  document.getElementById('app').innerHTML = template;
}
