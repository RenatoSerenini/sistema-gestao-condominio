-- Banco de dados do Sistema de Gestão de Condomínio
-- Estrutura baseada diretamente no app.js do projeto.
-- Os nomes e dados abaixo correspondem aos objetos utilizados pelo JavaScript.
-- Compatível com MySQL/MariaDB.

CREATE DATABASE IF NOT EXISTS sistema_condominio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_condominio;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS pagamentos;
DROP TABLE IF EXISTS manutencoes;
DROP TABLE IF EXISTS tipos_manutencao;
DROP TABLE IF EXISTS moradores;
DROP TABLE IF EXISTS referencias;
DROP TABLE IF EXISTS apartamentos;
DROP TABLE IF EXISTS blocos;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE blocos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codBloco INT NOT NULL,
    descricaoBloco VARCHAR(150) NOT NULL,
    quantidadeApts INT NOT NULL
);

CREATE TABLE apartamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numeroApto VARCHAR(20) NOT NULL,
    blocoId INT NOT NULL,
    vagasGaragem TEXT NULL,
    CONSTRAINT fk_apartamento_bloco
        FOREIGN KEY (blocoId) REFERENCES blocos(id) ON DELETE CASCADE
);

CREATE TABLE moradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(30) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    apartamentoId INT NOT NULL,
    responsavel BOOLEAN NOT NULL DEFAULT FALSE,
    proprietario BOOLEAN NOT NULL DEFAULT FALSE,
    possuiVeiculo BOOLEAN NOT NULL DEFAULT FALSE,
    quantidadeVagas INT NOT NULL DEFAULT 0,
    numeroVaga VARCHAR(30) NULL,
    placa VARCHAR(20) NULL,
    marca VARCHAR(80) NULL,
    modelo VARCHAR(80) NULL,
    CONSTRAINT fk_morador_apartamento
        FOREIGN KEY (apartamentoId) REFERENCES apartamentos(id) ON DELETE CASCADE
);

CREATE TABLE referencias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mesReferencia VARCHAR(30) NOT NULL,
    anoReferencia INT NOT NULL,
    valorCondominio DECIMAL(10,2) NOT NULL,
    vencimento DATE NOT NULL
);

CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numeroApto VARCHAR(20) NOT NULL,
    mesReferencia VARCHAR(30) NOT NULL,
    anoReferencia INT NOT NULL,
    dataPagamento DATE NOT NULL,
    dataVencimento DATE NOT NULL,
    valorCondominio DECIMAL(10,2) NOT NULL,
    moradorId INT NOT NULL,
    CONSTRAINT fk_pagamento_morador
        FOREIGN KEY (moradorId) REFERENCES moradores(id) ON DELETE CASCADE
);

CREATE TABLE tipos_manutencao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL
);

CREATE TABLE manutencoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(150) NOT NULL,
    data DATE NOT NULL,
    local VARCHAR(150) NOT NULL
);

-- =========================================================
-- DADOS INICIAIS
-- Correspondem ao objeto "seed" do app.js.
-- =========================================================

INSERT INTO blocos (id, codBloco, descricaoBloco, quantidadeApts) VALUES
(1, 1, 'Bloco A', 4),
(2, 2, 'Bloco B', 4);

INSERT INTO apartamentos (id, numeroApto, blocoId, vagasGaragem) VALUES
(1, '101', 1, NULL),
(2, '201', 2, NULL);

-- O projeto inicia moradores vazio.
-- INSERT INTO moradores (...) não é necessário neste momento.

INSERT INTO referencias
    (id, mesReferencia, anoReferencia, valorCondominio, vencimento)
VALUES
(1, 'Março', 2024, 350.00, '2024-03-10'),
(2, 'Abril', 2024, 350.00, '2024-04-10'),
(3, 'Maio', 2024, 375.00, '2024-05-10');

-- O projeto inicia pagamentos vazio.

INSERT INTO tipos_manutencao (id, descricao) VALUES
(1, 'Elétrica'),
(2, 'Hidráulica'),
(3, 'Pintura');

-- O projeto inicia manutenções vazias.
