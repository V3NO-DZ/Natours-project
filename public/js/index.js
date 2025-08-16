// Handle auth actions

import { showAlert } from './alerts.js';
import './updateSettings.js';
import './stripe.js';

async function login(email, password) {
  try {
    const response = await fetch('/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'same-origin',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = (data && data.message) || 'Login failed';
      throw new Error(message);
    }

    if (data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.location.assign('/');
      return;
    }

    console.log(data);
  } catch (err) {
    const message = (err && err.message) || 'Login failed';
    console.error(message);
    showAlert('error', message);
  }
}

async function logout() {
  try {
    const res = await fetch('/api/v1/users/logout', {
      method: 'GET',
      credentials: 'same-origin',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = (data && data.message) || 'Logout failed';
      throw new Error(message);
    }

    if (data.status === 'success') {
      location.reload();
    }
  } catch (err) {
    const message = (err && err.message) || 'Logout failed';
    console.error(message);
    showAlert('error', 'Error logging out! Try again.');
  }
}

async function signup(name, email, password, passwordConfirm) {
  try {
    const res = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ name, email, password, passwordConfirm }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = (data && data.message) || 'Signup failed';
      throw new Error(message);
    }

    if (data.status === 'success') {
      showAlert('success', 'Account created!');
      window.location.assign('/');
    }
  } catch (err) {
    const message = (err && err.message) || 'Signup failed';
    console.error(message);
    showAlert('error', message);
  }
}

// Wire up listeners once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.form--login');
  const signupForm = document.querySelector('.form--signup');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const passwordConfirmInput = document.getElementById('passwordConfirm');
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';
      const passwordConfirm = passwordConfirmInput
        ? passwordConfirmInput.value.trim()
        : '';
      signup(name, email, password, passwordConfirm);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';
      login(email, password);
    });
  }

  const logoutBtn = document.querySelector('.nav__el--logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
