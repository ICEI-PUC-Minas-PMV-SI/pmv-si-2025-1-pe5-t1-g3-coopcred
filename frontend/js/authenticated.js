const loginForm = document.getElementById('login-form');
const msgDiv = document.getElementById('msg');
const usersTableBody = document.querySelector('#usersTable tbody');
const addUserForm = document.getElementById('addUserForm');

// LOGIN
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(loginForm));

  try {
    const res = await fetch(`${window.API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || result.error);

    if (res.ok && result.token) {
      localStorage.setItem('token', result.token);
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    alert('Erro ao tentar fazer login');
  }
});

// BUSCAR USUÁRIOS
async function fetchUsers() {
  try {
    const res = await fetch(`${window.API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar usuários');

    const users = await res.json();
    usersTableBody.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.id}</td>
        <td><input type="text" value="${user.username}" class="edit-username" data-id="${user.id}" /></td>
        <td><input type="email" value="${user.email}" class="edit-email" data-id="${user.id}" /></td>
        <td><input type="text" value="${user.setor || ''}" class="edit-setor" data-id="${user.id}" /></td>
        <td>
          <button class="btn-update" data-id="${user.id}">Salvar</button>
          <button class="btn-delete" data-id="${user.id}">Excluir</button>
        </td>
      `;
      usersTableBody.appendChild(row);
    });

    addUserListeners();
  } catch (err) {
    msgDiv.textContent = err.message;
    msgDiv.className = 'error';
  }
}

// ADICIONAR USUÁRIO
addUserForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(addUserForm));

  try {
    const res = await fetch(`${window.API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || result.error);

    if (res.ok) {
      addUserForm.reset();
      await fetchUsers();
    }
  } catch (err) {
    alert('Erro ao adicionar usuário');
  }
});

// FUNÇÕES DE EDITAR E EXCLUIR USUÁRIO
function addUserListeners() {
  // Atualizar
  document.querySelectorAll('.btn-update').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;
      const username = document.querySelector(`.edit-username[data-id="${id}"]`).value;
      const email = document.querySelector(`.edit-email[data-id="${id}"]`).value;
      const setor = document.querySelector(`.edit-setor[data-id="${id}"]`).value;

      try {
        const res = await fetch(`${window.API_URL}/users/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ username, email, setor })
        });

        const result = await res.json();
        alert(result.message || result.error);

        if (res.ok) await fetchUsers();
      } catch (err) {
        alert('Erro ao atualizar usuário');
      }
    };
  });

  // Excluir
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.id;

      if (!confirm('Deseja realmente excluir este usuário?')) return;

      try {
        const res = await fetch(`${window.API_URL}/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await res.json();
        alert(result.message || result.error);

        if (res.ok) await fetchUsers();
      } catch (err) {
        alert('Erro ao excluir usuário');
      }
    };
  });
}

// Executa fetchUsers se estiver na página de dashboard
if (usersTableBody) {
  fetchUsers();
}
