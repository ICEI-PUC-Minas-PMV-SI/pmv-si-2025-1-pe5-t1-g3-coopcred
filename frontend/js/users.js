const usersTableBody = document.querySelector('#usersTable tbody');
const addUserForm = document.getElementById('addUserForm');
const buscaInputUsuario = document.getElementById('busca-usuario');

// BUSCAR USUÁRIOS
async function fetchUsers() {
  try {
    const res = await fetch(`${API}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar usuários');

    const users = await res.json();
    if(!usersTableBody) return;
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
    if(msgDiv){
      msgDiv.textContent = err.message;
      msgDiv.className = 'error';
    }
  }
}

// BUSCAR USUÁRIO
async function fetchUser(username) {
  try {
    const res = await fetch(`${API}/users`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!res.ok) throw new Error('Erro ao buscar usuários');

    const users = await res.json();
    if(!usersTableBody) return;
    usersTableBody.innerHTML = '';

    const user = users.find(u => u.username === username);

    if (user) {
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
      buscaInputUsuario.value = username;
    } else {
      usersTableBody.innerHTML = '<tr><td colspan="5">Usuário não encontrado</td></tr>';
    }

    addUserListeners();
  } catch (err) {
    if(msgDiv){
      msgDiv.textContent = err.message;
      msgDiv.className = 'error';
    }
  }
}

// ADICIONAR USUÁRIO
addUserForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(addUserForm));

  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.message || result.error || 'Resposta desconhecida');

    if (res.ok) {
      addUserForm.reset();
      //await fetchUsers();
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
        const res = await fetch(`${API}/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ username, email, setor })
        });

        const result = await res.json();
        alert(result.message || result.error);

        if (res.ok) await fetchUser(username);
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
        const res = await fetch(`${API}/users/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const result = await res.json();
        alert(result.message || result.error);

        if (res.ok){
          buscaInputUsuario.value = "";
          usersTableBody.innerHTML = '';
        }
      } catch (err) {
        alert('Erro ao excluir usuário');
      }
    };
  });
}

// Filtro de busca

buscaInputUsuario?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const searchUser = buscaInputUsuario.value;
    fetchUser(searchUser)
  }
});

// Carrega os usuários automaticamente se a tabela existir (dashboard.html)
/*if (usersTableBody) {
  fetchUsers();
}*/
