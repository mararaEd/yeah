import { getCurrentUser, logout } from '../auth.js';
    import { Html5Qrcode } from 'html5-qrcode';

    // Mock data for student verification
    const mockStudents = [
      { "student_id": "ST001", "name": "John Doe", "meal_logged": false },
      { "student_id": "ST002", "name": "Jane Smith", "meal_logged": true },
      { "student_id": "ST003", "name": "Bob Johnson", "meal_logged": false }
    ];

    let lastVerifiedTransactions = [];
    let html5QrCode;
    let isScannerActive = false;

    export function renderStaffVerification() {
      const user = getCurrentUser();
      const template = `
        <div class="container">
          <div class="dashboard-header">
            <h1>Meal Verification</h1>
            <div class="user-controls">
              <span class="user-name">${user.name}</span>
              <button class="btn btn--secondary" data-route="/" onclick="logout()">Logout</button>
            </div>
          </div>
          <div class="verification-container">
            <div class="verification-left">
              <div id="qr-reader" style="width: 100%;"></div>
            </div>
            <div class="verification-right">
              <div class="qr-upload">
                <input type="file" id="qrImageUpload" accept="image/*" style="display: none;">
                <button class="btn btn--secondary" id="browseFileBtn">Browse File</button>
                <div id="uploadStatus" style="margin-top: 10px;"></div>
              </div>
              <div class="manual-id-input">
                <div class="form-group">
                  <label for="studentId">Student ID</label>
                  <input type="text" id="studentId" placeholder="Enter student ID">
                </div>
                <button class="btn btn--primary" onclick="verifyMeal()">Verify Meal</button>
              </div>
            </div>
          </div>
          <div id="verificationResult" class="feedback-area"></div>
          <div class="transaction-log">
            <h2>Recent Transactions</h2>
            <ul id="transactionList">
              ${lastVerifiedTransactions.map(transaction => `<li>${transaction}</li>`).join('')}
            </ul>
          </div>
        </div>
      `;

      document.getElementById('app').innerHTML = template;
      setupEventListeners();
      startQrCodeScanner();
    }

    function setupEventListeners() {
      const browseFileBtn = document.getElementById('browseFileBtn');
      const qrImageUpload = document.getElementById('qrImageUpload');

      browseFileBtn.addEventListener('click', () => {
        qrImageUpload.click();
      });

      qrImageUpload.addEventListener('change', handleFileUpload);

      window.verifyMeal = verifyMeal;
      window.logout = logout;
    }

    function startQrCodeScanner() {
      if (isScannerActive) {
        return;
      }
      isScannerActive = true;

      const qrCodeSuccessCallback = (decodedText) => {
        if (html5QrCode) {
          html5QrCode.stop();
          isScannerActive = false;
        }
        const student = mockStudents.find(s => s.student_id === decodedText);
        if (student) {
          const result = verifyStudent(student);
          displayFeedback(result, document.getElementById('verificationResult'));
        } else {
          displayFeedback({ status: 'invalid', message: 'Invalid QR Code' }, document.getElementById('verificationResult'));
        }
      };

      const qrCodeErrorCallback = (errorMessage) => {
        console.error(`QR code scan error: ${errorMessage}`);
        displayFeedback({ status: 'invalid', message: 'Failed to scan QR Code' }, document.getElementById('verificationResult'));
        isScannerActive = false;
      };

      if (html5QrCode) {
        html5QrCode.stop();
      }
      html5QrCode = new Html5Qrcode("qr-reader", {
        fps: 10,
        qrbox: 250,
      });

      html5QrCode.start({ facingMode: "environment" }, {
        qrbox: 250,
        fps: 10,
      }, qrCodeSuccessCallback, qrCodeErrorCallback);
    }

    function handleFileUpload(event) {
      const file = event.target.files[0];
      const uploadStatus = document.getElementById('uploadStatus');
      const verificationResult = document.getElementById('verificationResult');

      if (file) {
        uploadStatus.textContent = 'Processing image...';
        const reader = new FileReader();
        reader.onload = (e) => {
          if (html5QrCode) {
            html5QrCode.scanFile(file)
              .then(decodedText => {
                uploadStatus.textContent = '';
                const student = mockStudents.find(s => s.student_id === decodedText);
                if (student) {
                  const result = verifyStudent(student);
                  displayFeedback(result, verificationResult);
                } else {
                  displayFeedback({ status: 'invalid', message: 'Invalid QR Code' }, verificationResult);
                }
              })
              .catch(err => {
                uploadStatus.textContent = '';
                displayFeedback({ status: 'invalid', message: 'Failed to decode QR Code from image.' }, verificationResult);
                console.error(`Error scanning file: ${err}`);
              });
          }
        };
        reader.readAsDataURL(file);
      }
    }

    function verifyMeal() {
      const studentIdInput = document.getElementById('studentId');
      const studentId = studentIdInput.value.trim();
      const verificationResult = document.getElementById('verificationResult');

      if (!studentId) {
        displayFeedback({ status: 'invalid', message: 'Please enter a valid student ID' }, verificationResult);
        return;
      }

      const student = mockStudents.find(s => s.student_id === studentId);
      if (student) {
        const result = verifyStudent(student);
        displayFeedback(result, verificationResult);
      } else {
        displayFeedback({ status: 'invalid', message: 'Invalid Student ID' }, verificationResult);
      }
      studentIdInput.value = '';
    }

    function verifyStudent(student) {
      if (student.meal_logged) {
        return { status: 'duplicate', message: 'This meal has already been logged.' };
      } else {
        student.meal_logged = true;
        updateTransactionLog(student.name, 'Lunch', new Date().toLocaleTimeString());
        return { status: 'success', message: 'Meal Verified Successfully!' };
      }
    }

    function displayFeedback(result, element) {
      let feedbackHTML = '';
      switch (result.status) {
        case 'success':
          feedbackHTML = `<div class="alert alert--success">${result.message}</div>`;
          break;
        case 'duplicate':
          feedbackHTML = `<div class="alert alert--warning">${result.message}</div>`;
          break;
        case 'invalid':
          feedbackHTML = `<div class="alert alert--error">${result.message}</div>`;
          break;
        default:
          feedbackHTML = `<div class="alert alert--error">An unexpected error occurred.</div>`;
      }
      element.innerHTML = feedbackHTML;
    }

    function updateTransactionLog(studentName, mealType, time) {
      const transaction = `${studentName} - ${mealType} - ${time}`;
      lastVerifiedTransactions.unshift(transaction);
      lastVerifiedTransactions = lastVerifiedTransactions.slice(0, 5);
      const transactionList = document.getElementById('transactionList');
      transactionList.innerHTML = lastVerifiedTransactions.map(transaction => `<li>${transaction}</li>`).join('');
    }
