const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  msg.className = 'message';
  msg.textContent = '';

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();

    if (data.success) {
      msg.className = 'message success';
      msg.textContent = data.message + ' Redirecting to login...';
      setTimeout(() => window.location.href = 'login.html', 1200);
    } else {
      msg.className = 'message error';
      msg.textContent = data.message;
    }
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = 'Something went wrong. Try again.';
  }
});
