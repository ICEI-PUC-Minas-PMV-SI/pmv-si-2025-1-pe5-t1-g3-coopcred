const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Registro
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  try {
    // Verifica se usuário já existe
    const exists = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username]
    );
    if (exists.rowCount > 0) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insere usuário no banco
    await pool.query(
      "INSERT INTO usuarios (username, email, password ) VALUES ($1, $2, $3, $4)",
      [username, email, hashedPassword ]
    );

    res.status(201).json({ message: "Usuário registrado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Login
function generateSimpleToken() {
  return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = generateSimpleToken();


    res.json({ message: "Login bem-sucedido", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


// Listar usuários
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, email FROM usuarios ORDER BY id"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// Criar usuário
app.post("/users", async (req, res) => {
  const { username, email } = req.body;
  try {
    await pool.query(
      "INSERT INTO usuarios (username, email, password) VALUES ($1, $2, $3)",
      [username, email, ""]
    ); // Atenção: para senha pode deixar vazio ou ajustar para hash default
    res.status(201).json({ message: "Usuário criado" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Atualizar usuário
app.put("/users/:id", async (req, res) => {
  const id = req.params.id;
  const { username, email } = req.body;
  try {
    await pool.query("UPDATE usuarios SET username=$1, email=$2 WHERE id=$3", [
      username,
      email,
      id,
    ]);
    res.json({ message: "Usuário atualizado" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// Deletar usuário
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query("DELETE FROM usuarios WHERE id=$1", [id]);
    res.json({ message: "Usuário deletado" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

app.get("/contas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contaBancaria ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar contas bancárias" });
  }
});
// Buscar conta bancária por ID
app.get("/contas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM contaBancaria WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar conta bancária" });
  }
});
// Criar conta bancária
app.post("/contas", async (req, res) => {
  const { cpf, numeroConta, tipoConta, agencia } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO contaBancaria (cpf, numeroConta, tipoConta, agencia) VALUES ($1, $2, $3, $4) RETURNING ",
      [cpf, numeroConta, tipoConta, agencia]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar conta bancária" });
  }
});
// Atualizar conta bancária
app.put("/contas/:id", async (req, res) => {
  const { id } = req.params;
  const { cpf, numeroConta, tipoConta, agencia } = req.body;
  try {
    const result = await pool.query(
      "UPDATE contaBancaria SET cpf = $1, numeroConta = $2, tipoConta = $3, agencia = $4 WHERE id = $5 RETURNING ",
      [cpf, numeroConta, tipoConta, agencia, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar conta bancária" });
  }
});
// Deletar conta bancária
app.delete("/contas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM contaBancaria WHERE id = $1 RETURNING ",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Conta bancária não encontrada" });
    }
    res.json({ message: "Conta bancária deletada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar conta bancária" });
  }
});
// CRUD Transações
// Listar transações
app.get("/transacoes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transacoes ORDER BY data DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
});
// Buscar transação por ID
app.get("/transacoes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM transacoes WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transação não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar transação" });
  }
});
// Criar transação
app.post("/transacoes", async (req, res) => {
  const { tipoTransacao, valor, contaOrigemId, contaDestinoId } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Verificar saldo suficiente na conta de origem
    if (contaOrigemId) {
      const contaOrigem = await client.query(
        "SELECT saldo FROM contaBancaria WHERE id = $1 FOR UPDATE",
        [contaOrigemId]
      );
      if (contaOrigem.rows.length === 0) {
        throw new Error("Conta de origem não encontrada");
      }
      if (contaOrigem.rows[0].saldo < valor) {
        throw new Error("Saldo insuficiente");
      }
      // Debitar da conta de origem
      await client.query(
        "UPDATE contaBancaria SET saldo = saldo - $1 WHERE id = $2",
        [valor, contaOrigemId]
      );
    }
    // Creditar na conta de destino
    if (contaDestinoId) {
      const contaDestino = await client.query(
        "SELECT id FROM contaBancaria WHERE id = $1 FOR UPDATE",
        [contaDestinoId]
      );
      if (contaDestino.rows.length === 0) {
        throw new Error("Conta de destino não encontrada");
      }
      await client.query(
        "UPDATE contaBancaria SET saldo = saldo + $1 WHERE id = $2",
        [valor, contaDestinoId]
      );
    }
    // Registrar a transação
    const result = await client.query(
      "INSERT INTO transacoes (tipoTransacao, valor, contaOrigemId, contaDestinoId) VALUES ($1, $2, $3, $4) RETURNING ",
      [tipoTransacao, valor, contaOrigemId, contaDestinoId]
    );
    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: err.message || "Erro ao criar transação" });
  } finally {
    client.release();
  }
});
// Buscar transações por conta
app.get("/contas/:id/transacoes", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM transacoes WHERE contaOrigemId = $1 OR contaDestinoId = $1 ORDER BY data DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar transações da conta" });
  }
});

app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});
