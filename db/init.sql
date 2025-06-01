CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE contaBancaria (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(11) NOT NULL,
  numeroConta VARCHAR(20) UNIQUE NOT NULL,
  saldo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tipoConta VARCHAR(20) NOT NULL DEFAULT 'Corrente',
  agencia VARCHAR(20) NOT NULL
);

CREATE TABLE transacoes (
  id SERIAL PRIMARY KEY,
  tipoTransacao VARCHAR(20) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  data TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (username, email, password)
VALUES (
  'adminNovo',
  'admin@coopcred.com',
  '$2b$10$X8Gg5K5jkZNR5XurbiHpD.MiNByy5HFdhXDYbTxIqtB3KmkMs7Mly'
);
