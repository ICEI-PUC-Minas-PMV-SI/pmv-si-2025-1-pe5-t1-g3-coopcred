const API = window.API_URL || 'http://44.204.138.207:3000';

const loginForm = document.getElementById('login-form');
const msgDiv = document.getElementById('msg');

function showMessage(text, isError = false) {
  if (!msgDiv) return; 
  msgDiv.textContent = text;
  msgDiv.className = isError ? 'msg error' : 'msg success';

  // Remove a mensagem após 3 segundos
  setTimeout(() => {
    msgDiv.textContent = '';
    msgDiv.className = 'msg';
  }, 3000);
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm));

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok && result.token) {
      showMessage(result.message || 'Login realizado com sucesso!');
      localStorage.setItem('token', result.token);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      showMessage(result.error || 'Erro ao fazer login', true);
    }
  } catch (err) {
    showMessage('Erro ao tentar fazer login', true);
  }
});

// Logout 
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    showMessage('Logout realizado!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });
}
