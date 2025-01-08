import { getUserRole, getCurrentUser, logout } from '../auth.js';
    import Chart from 'chart.js/auto';

    // Mock data
    const mockData = {
      dailyMeals: [
        { "date": "2025-01-01", "breakfast": 120, "lunch": 150, "dinner": 100 },
        { "date": "2025-01-02", "breakfast": 130, "lunch": 160, "dinner": 110 },
        { "date": "2025-01-03", "breakfast": 125, "lunch": 155, "dinner": 105 }
      ],
      mealDistribution: {
        "breakfast": 360,
        "lunch": 450,
        "dinner": 315
      },
      flaggedTransactions: [
        { "transaction_id": "TX001", "student_id": "ST123", "issue": "Duplicate Scan", "time": "12:30 PM" },
        { "transaction_id": "TX002", "student_id": "ST124", "issue": "Invalid QR Code", "time": "12:45 PM" }
      ],
      mealsByUserType: {
        "students": { "breakfast": 300, "lunch": 350, "dinner": 250 },
        "staff": { "breakfast": 60, "lunch": 100, "dinner": 65 }
      }
    };

    // Mock student data
    const mockStudent = {
      "name": "John Doe",
      "student_id": "ST001",
      "program": "Computer Science",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "qr_code": "img/qr-placeholder.png"
    };

    export function renderDashboard() {
      const role = getUserRole();
      if (role === 'admin') {
        return renderAdminDashboard();
      } else {
        return renderStudentDashboard();
      }
    }

    function renderAdminDashboard() {
      const template = `
        <div class="container admin-dashboard">
          <header class="dashboard-header">
            <h1>Administrator Dashboard</h1>
            <div class="user-controls">
              <span class="user-name">Admin</span>
              <button class="btn btn--secondary" data-route="/" onclick="logout()">Logout</button>
            </div>
          </header>

          <div class="tab-container">
            <div class="tab-header">
              <button class="tab-btn active" data-tab="overview">Overview</button>
              <button class="tab-btn" data-tab="users">Manage Users</button>
              <button class="tab-btn" data-tab="reports">Reports</button>
              <button class="tab-btn" data-tab="cards">Meal Cards</button>
            </div>

            <div class="tab-content">
              <div class="tab-pane active" id="overview">
                <div class="dashboard-metrics">
                  <div class="stat-card">
                    <i class="fas fa-users"></i>
                    <h3>Active Users</h3>
                    <div class="stat-value">1,234</div>
                  </div>
                  <div class="stat-card">
                    <i class="fas fa-utensils"></i>
                    <h3>Today's Meals</h3>
                    <div class="stat-value">456</div>
                  </div>
                  <div class="stat-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Flagged Entries</h3>
                    <div class="stat-value">7</div>
                  </div>
                </div>
              </div>

              <div class="tab-pane" id="users">
                <div class="section-header">
                  <h2>User Management</h2>
                  <button class="btn btn--primary" onclick="addNewUser()">Add New User</button>
                </div>
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>USR001</td>
                        <td>John Doe</td>
                        <td>Student</td>
                        <td>Active</td>
                        <td>
                          <button class="btn btn--small" onclick="editUser('USR001')">Edit</button>
                          <button class="btn btn--small btn--danger" onclick="deleteUser('USR001')">Delete</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="tab-pane" id="reports">
                <div class="section-header">
                  <h2>Reports</h2>
                  <div class="report-filters">
                    <select id="reportType">
                      <option value="daily">Daily Meals</option>
                      <option value="distribution">Meal Distribution</option>
                      <option value="userType">By User Type</option>
                    </select>
                    <input type="date" id="startDate">
                    <input type="date" id="endDate">
                    <button class="btn btn--primary" onclick="generateReport()">Generate</button>
                  </div>
                </div>
                <div class="charts-container">
                  <div class="chart-wrapper">
                    <canvas id="mealsChart"></canvas>
                  </div>
                  <div class="chart-wrapper">
                    <canvas id="distributionChart"></canvas>
                  </div>
                </div>
              </div>

              <div class="tab-pane" id="cards">
                <div class="section-header">
                  <h2>Meal Card Management</h2>
                  <button class="btn btn--primary" onclick="generateQRCode()">Generate New QR Code</button>
                </div>
                <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Student ID</th>
                        <th>QR Code</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>ST001</td>
                        <td><img src="qr-placeholder.png" alt="QR Code" class="qr-preview"></td>
                        <td>Active</td>
                        <td>
                          <button class="btn btn--small btn--danger" onclick="deactivateCard('ST001')">Deactivate</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = template;
      initializeAdminDashboard();
    }

    function initializeAdminDashboard() {
      // Tab switching
      document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const tabId = e.target.dataset.tab;
          switchTab(tabId);
        });
      });

      // Initialize charts
      initializeCharts();

      // Add event listeners for various actions
      setupEventListeners();
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
      });

      document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }

    function initializeCharts() {
      // Daily meals chart
      const mealsCtx = document.getElementById('mealsChart');
      if (mealsCtx) {
        new Chart(mealsCtx, {
          type: 'bar',
          data: {
            labels: mockData.dailyMeals.map(d => d.date),
            datasets: [
              {
                label: 'Breakfast',
                data: mockData.dailyMeals.map(d => d.breakfast),
                backgroundColor: '#3498db'
              },
              {
                label: 'Lunch',
                data: mockData.dailyMeals.map(d => d.lunch),
                backgroundColor: '#2ecc71'
              },
              {
                label: 'Dinner',
                data: mockData.dailyMeals.map(d => d.dinner),
                backgroundColor: '#e74c3c'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Daily Meals Served'
              }
            }
          }
        });
      }

      // Meal distribution chart
      const distributionCtx = document.getElementById('distributionChart');
      if (distributionCtx) {
        new Chart(distributionCtx, {
          type: 'pie',
          data: {
            labels: Object.keys(mockData.mealDistribution),
            datasets: [{
              data: Object.values(mockData.mealDistribution),
              backgroundColor: ['#3498db', '#2ecc71', '#e74c3c']
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: 'Meal Type Distribution'
              }
            }
          }
        });
      }
    }

    function setupEventListeners() {
      // Add event listeners for various actions
      window.addNewUser = () => {
        alert('Add new user functionality to be implemented');
      };

      window.editUser = (userId) => {
        alert(`Edit user ${userId}`);
      };

      window.deleteUser = (userId) => {
        alert(`Delete user ${userId}`);
      };

      window.generateReport = () => {
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        alert(`Generate report: ${reportType} from ${startDate} to ${endDate}`);
      };

      window.generateQRCode = () => {
        alert('Generate new QR code');
      };

      window.deactivateCard = (studentId) => {
        alert(`Deactivate card for student ${studentId}`);
      };
      window.logout = logout;
    }

    function renderStudentDashboard() {
      const user = getCurrentUser();
      const template = `
        <div class="container student-dashboard">
          <div class="dashboard-header">
            <h1>Welcome, ${user.name}!</h1>
            <div class="user-controls">
              <button class="btn btn--secondary" data-route="/" onclick="logout()">Logout</button>
            </div>
          </div>
          <div class="dashboard-content">
            <div class="personal-info-section">
              <h2>Personal Information</h2>
              <div class="form-group">
                <label>Name</label>
                <input type="text" value="${mockStudent.name}" readonly>
              </div>
              <div class="form-group">
                <label>Student ID</label>
                <input type="text" value="${mockStudent.student_id}" readonly>
              </div>
              <div class="form-group">
                <label>Program/Department</label>
                <input type="text" value="${mockStudent.program}" readonly>
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" value="${mockStudent.email}" readonly>
              </div>
              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" value="${mockStudent.phone}" readonly>
              </div>
              <div class="form-actions">
                <button class="btn btn--primary" id="editInfoBtn">Edit</button>
              </div>
              <div id="editStatus" style="margin-top: 10px;"></div>
            </div>
            <div class="qr-code-section">
              <h2>Your QR Code</h2>
              <img src="${mockStudent.qr_code}" alt="Student QR Code" style="max-width: 200px;">
              <button class="btn btn--secondary" onclick="downloadQRCode()">Download QR Code</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = template;
      setupStudentDashboard();
    }

    function setupStudentDashboard() {
      const editInfoBtn = document.getElementById('editInfoBtn');
      const emailInput = document.getElementById('email');
      const phoneInput = document.getElementById('phone');
      const formActions = document.querySelector('.form-actions');
      const editStatus = document.getElementById('editStatus');

      let isEditing = false;

      editInfoBtn.addEventListener('click', () => {
        if (!isEditing) {
          emailInput.readOnly = false;
          phoneInput.readOnly = false;
          emailInput.focus();
          editInfoBtn.style.display = 'none';

          const saveBtn = document.createElement('button');
          saveBtn.textContent = 'Save';
          saveBtn.classList.add('btn', 'btn--primary');
          saveBtn.addEventListener('click', saveInfo);

          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = 'Cancel';
          cancelBtn.classList.add('btn', 'btn--secondary');
          cancelBtn.addEventListener('click', cancelEdit);

          formActions.appendChild(saveBtn);
          formActions.appendChild(cancelBtn);

          isEditing = true;
        }
      });

      function saveInfo() {
        const email = emailInput.value;
        const phone = phoneInput.value;

        if (!isValidEmail(email)) {
          editStatus.textContent = 'Invalid email format';
          return;
        }

        if (!isValidPhone(phone)) {
          editStatus.textContent = 'Invalid phone number format';
          return;
        }

        mockStudent.email = email;
        mockStudent.phone = phone;
        editStatus.textContent = 'Changes saved successfully!';
        disableEditMode();
      }

      function cancelEdit() {
        emailInput.value = mockStudent.email;
        phoneInput.value = mockStudent.phone;
        disableEditMode();
      }

      function disableEditMode() {
        emailInput.readOnly = true;
        phoneInput.readOnly = true;
        editStatus.textContent = '';
        formActions.innerHTML = '';
        formActions.appendChild(editInfoBtn);
        editInfoBtn.style.display = 'inline-block';
        isEditing = false;
      }

      function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      }

      function isValidPhone(phone) {
        const phoneRegex = /^[0-9-]{10,14}$/;
        return phoneRegex.test(phone);
      }

      window.downloadQRCode = () => {
        alert('QR code downloaded');
      };
      window.logout = logout;
    }
