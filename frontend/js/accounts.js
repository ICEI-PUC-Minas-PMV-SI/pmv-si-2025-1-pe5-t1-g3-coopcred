// Navegação das seções do dashboard (parte contas)
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section-panel');

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const target = btn.dataset.target;
    sections.forEach(section => {
      section.id === target ? section.classList.add('active') : section.classList.remove('active');
    });
  });
});

// Geração automática do número da conta
const contaNumeroInput = document.getElementById('conta-numero');
function gerarNumeroConta() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
if(contaNumeroInput) contaNumeroInput.value = gerarNumeroConta();

// Máscara CPF
const cpfInput = document.getElementById('conta-cpf');
cpfInput?.addEventListener('input', function () {
  let cpf = this.value.replace(/\D/g, '');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  this.value = cpf;
});

// Máscara telefone
const telefoneInput = document.getElementById('conta-telefone');
telefoneInput?.addEventListener('input', function () {
  let tel = this.value.replace(/\D/g, '');
  tel = tel.replace(/^(\d{2})(\d)/g, '($1) $2');
  tel = tel.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  this.value = tel;
});

// Armazenamento local temporário das contas
const contas = [];

// Formulário de cadastro de conta
const formConta = document.getElementById('conta-cadastro-form');
formConta?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = formConta['conta-nome'].value.trim();
  const cpf = formConta['conta-cpf'].value.trim();
  const telefone = formConta['conta-telefone'].value.trim();
  const email = formConta['conta-email'].value.trim();
  const endereco = formConta['conta-endereco'].value.trim();
  const tipo = formConta['conta-tipo'].value;
  const numeroConta = formConta['conta-numero'].value;

  // Criar conta
  const conta = { nome, cpf, telefone, email, endereco, tipo, numero: numeroConta };
  contas.push(conta);

  alert('Conta cadastrada com sucesso!');

  formConta.reset();
  if(contaNumeroInput) contaNumeroInput.value = gerarNumeroConta();

  preencherTabelaContas(contas);
});

// Preencher tabela com contas
const tabelaContasBody = document.querySelector('#tabela-contas tbody');

function preencherTabelaContas(lista) {
  if(!tabelaContasBody) return;
  tabelaContasBody.innerHTML = '';

  if (lista.length === 0) {
    tabelaContasBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nenhuma conta cadastrada.</td></tr>';
    return;
  }

  lista.forEach((conta) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${conta.nome}</td>
      <td>${conta.cpf}</td>
      <td>${conta.telefone}</td>
      <td>${conta.email}</td>
      <td>${conta.endereco}</td>
      <td>${conta.tipo}</td>
      <td>${conta.numero}</td>
    `;
    tabelaContasBody.appendChild(tr);
  });
}

// Filtro de busca
const buscaInput = document.getElementById('busca-conta');
buscaInput?.addEventListener('input', () => {
  const termo = buscaInput.value.toLowerCase();

  const contasFiltradas = contas.filter((conta) => {
    return (
      conta.nome.toLowerCase().includes(termo) ||
      conta.email.toLowerCase().includes(termo) ||
      conta.numero.includes(termo)
    );
  });

  preencherTabelaContas(contasFiltradas);
});
