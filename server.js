const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const conexao = require("./database/connection");

const app = express();
const porta = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

/* BLOCOS */

app.get("/api/blocos", function(req, res) {

    let sql = "SELECT id, codBloco, descricaoBloco, quantidadeApts FROM blocos ORDER BY id";

    conexao.query(sql, function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao consultar blocos." });
        } else {
            res.json(resultados);
        }

    });

});

app.post("/api/blocos", function(req, res) {

    let descricao = req.body.descricaoBloco;
    let quantidade = req.body.quantidadeApts;

    if (!descricao || !quantidade) {
        res.status(400).json({ error: "Dados obrigatórios não informados." });
        return;
    }

    let verificar = "SELECT id FROM blocos WHERE LOWER(descricaoBloco) = LOWER(?) LIMIT 1";

    conexao.query(verificar, [descricao.trim()], function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao cadastrar bloco." });
            return;
        }

        if (resultados.length > 0) {
            res.status(409).json({ error: "O bloco já está cadastrado no sistema." });
            return;
        }

        conexao.query(
            "SELECT COALESCE(MAX(codBloco), 0) + 1 AS codBloco FROM blocos",
            function(erro, resultadoCodigo) {

                if (erro) {
                    console.log(erro);
                    res.status(500).json({ error: "Erro ao cadastrar bloco." });
                    return;
                }

                let codigo = resultadoCodigo[0].codBloco;

                let inserir = "INSERT INTO blocos (codBloco, descricaoBloco, quantidadeApts) VALUES (?, ?, ?)";

                conexao.query(
                    inserir,
                    [codigo, descricao.trim(), Number(quantidade)],
                    function(erro, resultado) {

                        if (erro) {
                            console.log(erro);
                            res.status(500).json({ error: "Erro ao cadastrar bloco." });
                        } else {
                            res.status(201).json({ id: resultado.insertId });
                        }

                    }
                );

            }
        );

    });

});

app.put("/api/blocos/:id", function(req, res) {

    let id = Number(req.params.id);
    let descricao = req.body.descricaoBloco;
    let quantidade = req.body.quantidadeApts;

    if (!descricao || !quantidade) {
        res.status(400).json({ error: "Dados obrigatórios não informados." });
        return;
    }

    let verificar = "SELECT id FROM blocos WHERE LOWER(descricaoBloco) = LOWER(?) AND id <> ? LIMIT 1";

    conexao.query(verificar, [descricao.trim(), id], function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao alterar bloco." });
            return;
        }

        if (resultados.length > 0) {
            res.status(409).json({ error: "O bloco já está cadastrado no sistema." });
            return;
        }

        let alterar = "UPDATE blocos SET descricaoBloco = ?, quantidadeApts = ? WHERE id = ?";

        conexao.query(alterar, [descricao.trim(), Number(quantidade), id], function(erro) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao alterar bloco." });
            } else {
                res.json({ success: true });
            }

        });

    });

});

app.delete("/api/blocos/:id", function(req, res) {

    let id = Number(req.params.id);

    conexao.query("DELETE FROM blocos WHERE id = ?", [id], function(erro) {

        if (erro) {
            console.log(erro);
            res.status(500).json({
                error: "Não foi possível excluir o bloco. Verifique os apartamentos vinculados."
            });
        } else {
            res.json({ success: true });
        }

    });

});

/* APARTAMENTOS */

app.get("/api/apartamentos", function(req, res) {

    let sql = "SELECT id, numeroApto, blocoId FROM apartamentos ORDER BY blocoId, numeroApto";

    conexao.query(sql, function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao consultar apartamentos." });
        } else {
            res.json(resultados);
        }

    });

});

app.post("/api/apartamentos", function(req, res) {

    let blocoId = Number(req.body.blocoId);
    let numeroApto = req.body.numeroApto;

    if (!numeroApto || !blocoId) {
        res.status(400).json({ error: "Número do apartamento é obrigatório." });
        return;
    }

    let verificar = "SELECT id FROM apartamentos WHERE blocoId = ? AND numeroApto = ? LIMIT 1";

    conexao.query(verificar, [blocoId, numeroApto.trim()], function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao cadastrar apartamento." });
            return;
        }

        if (resultados.length > 0) {
            res.status(409).json({ error: "Apartamento já cadastrado." });
            return;
        }

        let inserir = "INSERT INTO apartamentos (numeroApto, blocoId) VALUES (?, ?)";

        conexao.query(inserir, [numeroApto.trim(), blocoId], function(erro, resultado) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao cadastrar apartamento." });
            } else {
                res.status(201).json({ id: resultado.insertId });
            }

        });

    });

});

app.put("/api/apartamentos/:id", function(req, res) {

    let id = Number(req.params.id);
    let blocoId = Number(req.body.blocoId);
    let numeroApto = req.body.numeroApto;

    if (!numeroApto || !blocoId) {
        res.status(400).json({ error: "Número do apartamento é obrigatório." });
        return;
    }

    let verificar = "SELECT id FROM apartamentos WHERE blocoId = ? AND numeroApto = ? AND id <> ? LIMIT 1";

    conexao.query(verificar, [blocoId, numeroApto.trim(), id], function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao alterar apartamento." });
            return;
        }

        if (resultados.length > 0) {
            res.status(409).json({ error: "Apartamento já cadastrado." });
            return;
        }

        let alterar = "UPDATE apartamentos SET numeroApto = ?, blocoId = ? WHERE id = ?";

        conexao.query(alterar, [numeroApto.trim(), blocoId, id], function(erro) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao alterar apartamento." });
            } else {
                res.json({ success: true });
            }

        });

    });

});

app.delete("/api/apartamentos/:id", function(req, res) {

    let id = Number(req.params.id);

    conexao.query("DELETE FROM apartamentos WHERE id = ?", [id], function(erro) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao excluir apartamento." });
        } else {
            res.json({ success: true });
        }

    });

});

/* MORADORES */

app.get("/api/moradores", function(req, res) {

    let sql = `
        SELECT id, cpf, nome, telefone, apartamentoId, responsavel, proprietario,
        possuiVeiculo, quantidadeVagas, numeroVaga, placa, marca, modelo
        FROM moradores
        ORDER BY id
    `;

    conexao.query(sql, function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao consultar moradores." });
        } else {
            res.json(resultados);
        }

    });

});

app.post("/api/moradores", function(req, res) {

    let morador = req.body;

    if (!morador.cpf || !morador.nome || !morador.telefone || !morador.apartamentoId) {
        res.status(400).json({ error: "Dados obrigatórios não informados." });
        return;
    }

    conexao.query(
        "SELECT id FROM moradores WHERE cpf = ? LIMIT 1",
        [morador.cpf.trim()],
        function(erro, resultados) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao cadastrar morador." });
                return;
            }

            if (resultados.length > 0) {
                res.status(409).json({ error: "CPF já cadastrado." });
                return;
            }

            let inserir = `
                INSERT INTO moradores
                (cpf, nome, telefone, apartamentoId, responsavel, proprietario,
                possuiVeiculo, quantidadeVagas, numeroVaga, placa, marca, modelo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            let dados = [
                morador.cpf.trim(),
                morador.nome.trim(),
                morador.telefone.trim(),
                Number(morador.apartamentoId),
                morador.responsavel ? 1 : 0,
                morador.proprietario ? 1 : 0,
                morador.possuiVeiculo ? 1 : 0,
                Number(morador.quantidadeVagas || 0),
                morador.numeroVaga ? morador.numeroVaga.trim() : null,
                morador.placa ? morador.placa.trim() : null,
                morador.marca ? morador.marca.trim() : null,
                morador.modelo ? morador.modelo.trim() : null
            ];

            conexao.query(inserir, dados, function(erro, resultado) {

                if (erro) {
                    console.log(erro);
                    res.status(500).json({ error: "Erro ao cadastrar morador." });
                } else {
                    res.status(201).json({ id: resultado.insertId });
                }

            });

        }
    );

});

app.put("/api/moradores/:id", function(req, res) {

    let id = Number(req.params.id);
    let morador = req.body;

    if (!morador.cpf || !morador.nome || !morador.telefone || !morador.apartamentoId) {
        res.status(400).json({ error: "Dados obrigatórios não informados." });
        return;
    }

    conexao.query(
        "SELECT id FROM moradores WHERE cpf = ? AND id <> ? LIMIT 1",
        [morador.cpf.trim(), id],
        function(erro, resultados) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao alterar morador." });
                return;
            }

            if (resultados.length > 0) {
                res.status(409).json({ error: "CPF já cadastrado." });
                return;
            }

            let alterar = `
                UPDATE moradores SET
                cpf = ?, nome = ?, telefone = ?, apartamentoId = ?,
                responsavel = ?, proprietario = ?, possuiVeiculo = ?,
                quantidadeVagas = ?, numeroVaga = ?, placa = ?, marca = ?, modelo = ?
                WHERE id = ?
            `;

            let dados = [
                morador.cpf.trim(),
                morador.nome.trim(),
                morador.telefone.trim(),
                Number(morador.apartamentoId),
                morador.responsavel ? 1 : 0,
                morador.proprietario ? 1 : 0,
                morador.possuiVeiculo ? 1 : 0,
                Number(morador.quantidadeVagas || 0),
                morador.numeroVaga ? morador.numeroVaga.trim() : null,
                morador.placa ? morador.placa.trim() : null,
                morador.marca ? morador.marca.trim() : null,
                morador.modelo ? morador.modelo.trim() : null,
                id
            ];

            conexao.query(alterar, dados, function(erro) {

                if (erro) {
                    console.log(erro);
                    res.status(500).json({ error: "Erro ao alterar morador." });
                } else {
                    res.json({ success: true });
                }

            });

        }
    );

});

app.delete("/api/moradores/:id", function(req, res) {

    let id = Number(req.params.id);

    conexao.query("DELETE FROM moradores WHERE id = ?", [id], function(erro) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao excluir morador." });
        } else {
            res.json({ success: true });
        }

    });

});

/* REFERENCIAS */

app.get("/api/referencias", function(req, res) {

    let sql = "SELECT id, mesReferencia, anoReferencia, valorCondominio, vencimento FROM referencias ORDER BY anoReferencia, id";

    conexao.query(sql, function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao consultar referências." });
        } else {
            res.json(resultados);
        }

    });

});

/* PAGAMENTOS */

app.get("/api/pagamentos", function(req, res) {

    let sql = `
        SELECT id, numeroApto, mesReferencia, anoReferencia,
        dataPagamento, dataVencimento, valorCondominio, moradorId
        FROM pagamentos
        ORDER BY id DESC
    `;

    conexao.query(sql, function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao consultar pagamentos." });
        } else {
            res.json(resultados);
        }

    });

});

app.post("/api/pagamentos", function(req, res) {

    let numeroApto = String(req.body.numeroApto || "").trim();
    let referenciaId = Number(req.body.referenciaId);

    conexao.query(
        "SELECT * FROM apartamentos WHERE numeroApto = ? LIMIT 1",
        [numeroApto],
        function(erro, apartamentos) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao registrar pagamento." });
                return;
            }

            if (apartamentos.length === 0) {
                res.status(400).json({ error: "Apartamento não cadastrado." });
                return;
            }

            let apartamento = apartamentos[0];

            conexao.query(
                "SELECT * FROM moradores WHERE apartamentoId = ? LIMIT 1",
                [apartamento.id],
                function(erro, moradores) {

                    if (erro) {
                        console.log(erro);
                        res.status(500).json({ error: "Erro ao registrar pagamento." });
                        return;
                    }

                    if (moradores.length === 0) {
                        res.status(400).json({ error: "Morador não cadastrado para o apartamento." });
                        return;
                    }

                    conexao.query(
                        "SELECT * FROM referencias WHERE id = ? LIMIT 1",
                        [referenciaId],
                        function(erro, referencias) {

                            if (erro) {
                                console.log(erro);
                                res.status(500).json({ error: "Erro ao registrar pagamento." });
                                return;
                            }

                            if (referencias.length === 0) {
                                res.status(400).json({ error: "Referência não encontrada." });
                                return;
                            }

                            let referencia = referencias[0];

                            let inserir = `
                                INSERT INTO pagamentos
                                (numeroApto, mesReferencia, anoReferencia, dataPagamento,
                                dataVencimento, valorCondominio, moradorId)
                                VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
                            `;

                            let dados = [
                                apartamento.numeroApto,
                                referencia.mesReferencia,
                                referencia.anoReferencia,
                                referencia.vencimento,
                                referencia.valorCondominio,
                                moradores[0].id
                            ];

                            conexao.query(inserir, dados, function(erro, resultado) {

                                if (erro) {
                                    console.log(erro);
                                    res.status(500).json({ error: "Erro ao registrar pagamento." });
                                } else {
                                    res.status(201).json({ id: resultado.insertId });
                                }

                            });

                        }
                    );

                }
            );

        }
    );

});

/* TIPOS DE MANUTENCAO */

app.get("/api/tipos-manutencao", function(req, res) {

    conexao.query(
        "SELECT id, descricao FROM tipos_manutencao ORDER BY descricao",
        function(erro, resultados) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao consultar tipos de manutenção." });
            } else {
                res.json(resultados);
            }

        }
    );

});

app.post("/api/tipos-manutencao", function(req, res) {

    let descricao = String(req.body.descricao || "").trim();

    if (!descricao) {
        res.status(400).json({ error: "Descrição obrigatória." });
        return;
    }

    conexao.query(
        "SELECT id FROM tipos_manutencao WHERE LOWER(descricao) = LOWER(?) LIMIT 1",
        [descricao],
        function(erro, resultados) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao cadastrar tipo de manutenção." });
                return;
            }

            if (resultados.length > 0) {
                res.status(409).json({ error: "Tipo de manutenção já cadastrada." });
                return;
            }

            conexao.query(
                "INSERT INTO tipos_manutencao (descricao) VALUES (?)",
                [descricao],
                function(erro, resultado) {

                    if (erro) {
                        console.log(erro);
                        res.status(500).json({ error: "Erro ao cadastrar tipo de manutenção." });
                    } else {
                        res.status(201).json({ id: resultado.insertId });
                    }

                }
            );

        }
    );

});

app.put("/api/tipos-manutencao/:id", function(req, res) {

    let id = Number(req.params.id);
    let descricao = String(req.body.descricao || "").trim();

    if (!descricao) {
        res.status(400).json({ error: "Descrição obrigatória." });
        return;
    }

    conexao.query(
        "SELECT id FROM tipos_manutencao WHERE LOWER(descricao) = LOWER(?) AND id <> ? LIMIT 1",
        [descricao, id],
        function(erro, resultados) {

            if (erro) {
                console.log(erro);
                res.status(500).json({ error: "Erro ao alterar tipo de manutenção." });
                return;
            }

            if (resultados.length > 0) {
                res.status(409).json({ error: "Tipo de manutenção já cadastrada." });
                return;
            }

            conexao.query(
                "UPDATE tipos_manutencao SET descricao = ? WHERE id = ?",
                [descricao, id],
                function(erro) {

                    if (erro) {
                        console.log(erro);
                        res.status(500).json({ error: "Erro ao alterar tipo de manutenção." });
                    } else {
                        res.json({ success: true });
                    }

                }
            );

        }
    );

});

app.delete("/api/tipos-manutencao/:id", function(req, res) {

    let id = Number(req.params.id);

    conexao.query("DELETE FROM tipos_manutencao WHERE id = ?", [id], function(erro) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao excluir tipo de manutenção." });
        } else {
            res.json({ success: true });
        }

    });

});

/* MANUTENCOES */

app.get("/api/manutencoes", function(req, res) {

    let sql = "SELECT id, tipo, data, local FROM manutencoes ORDER BY data DESC, id DESC";

    conexao.query(sql, function(erro, resultados) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao consultar manutenções." });
        } else {
            res.json(resultados);
        }

    });

});

app.post("/api/manutencoes", function(req, res) {

    let tipo = req.body.tipo;
    let data = req.body.data;
    let local = String(req.body.local || "").trim();

    if (!tipo || !data || !local) {
        res.status(400).json({ error: "Dados obrigatórios não informados." });
        return;
    }

    let inserir = "INSERT INTO manutencoes (tipo, data, local) VALUES (?, ?, ?)";

    conexao.query(inserir, [tipo, data, local], function(erro, resultado) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao registrar manutenção." });
        } else {
            res.status(201).json({ id: resultado.insertId });
        }

    });

});

app.put("/api/manutencoes/:id", function(req, res) {

    let id = Number(req.params.id);
    let tipo = req.body.tipo;
    let data = req.body.data;
    let local = String(req.body.local || "").trim();

    if (!tipo || !data || !local) {
        res.status(400).json({ error: "Dados obrigatórios não informados." });
        return;
    }

    let alterar = "UPDATE manutencoes SET tipo = ?, data = ?, local = ? WHERE id = ?";

    conexao.query(alterar, [String(tipo).trim(), data, local, id], function(erro) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao alterar manutenção." });
        } else {
            res.json({ success: true });
        }

    });

});

app.delete("/api/manutencoes/:id", function(req, res) {

    let id = Number(req.params.id);

    conexao.query("DELETE FROM manutencoes WHERE id = ?", [id], function(erro) {

        if (erro) {
            console.log(erro);
            res.status(500).json({ error: "Erro ao excluir manutenção." });
        } else {
            res.json({ success: true });
        }

    });

});

/* TESTE */

app.get("/api/health", function(req, res) {

    conexao.query("SELECT 1", function(erro) {

        if (erro) {
            res.status(500).json({
                api: "online",
                database: "offline"
            });
        } else {
            res.json({
                api: "online",
                database: "online"
            });
        }

    });

});

app.get("*", function(req, res) {

    res.sendFile(path.join(__dirname, "public", "index.html"));

});

app.listen(porta, function() {

    console.log("Sistema de Gestão de Condomínio: http://localhost:" + porta);

});