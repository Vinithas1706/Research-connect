const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  msg.className = 'message';
  msg.textContent = '';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (data.success) {
      msg.className = 'message success';
      msg.textContent = data.message;
      setTimeout(() => window.location.href = data.redirect, 600);
    } else {
      msg.className = 'message error';
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = 'Something went wrong. Try again.';
  }
});
