const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function query(sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows;
}

app.get('/api/blocos', async (req, res) => {
    try {
        const rows = await query('SELECT id, codBloco, descricaoBloco, quantidadeApts FROM blocos ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar blocos.' });
    }
});

app.post('/api/blocos', async (req, res) => {
    try {
        const { descricaoBloco, quantidadeApts } = req.body;
        if (!descricaoBloco || !quantidadeApts) return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

        const [exists] = await db.execute('SELECT id FROM blocos WHERE LOWER(descricaoBloco) = LOWER(?) LIMIT 1', [descricaoBloco.trim()]);
        if (exists.length) return res.status(409).json({ error: 'O bloco já está cadastrado no sistema.' });

        const [last] = await db.execute('SELECT COALESCE(MAX(codBloco), 0) + 1 AS codBloco FROM blocos');
        const [result] = await db.execute(
            'INSERT INTO blocos (codBloco, descricaoBloco, quantidadeApts) VALUES (?, ?, ?)',
            [last[0].codBloco, descricaoBloco.trim(), Number(quantidadeApts)]
        );

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar bloco.' });
    }
});

app.put('/api/blocos/:id', async (req, res) => {
    try {
        const { descricaoBloco, quantidadeApts } = req.body;
        const id = Number(req.params.id);
        if (!descricaoBloco || !quantidadeApts) return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

        const [exists] = await db.execute(
            'SELECT id FROM blocos WHERE LOWER(descricaoBloco) = LOWER(?) AND id <> ? LIMIT 1',
            [descricaoBloco.trim(), id]
        );
        if (exists.length) return res.status(409).json({ error: 'O bloco já está cadastrado no sistema.' });

        await db.execute(
            'UPDATE blocos SET descricaoBloco = ?, quantidadeApts = ? WHERE id = ?',
            [descricaoBloco.trim(), Number(quantidadeApts), id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar bloco.' });
    }
});

app.delete('/api/blocos/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM blocos WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Não foi possível excluir o bloco. Verifique os apartamentos vinculados.' });
    }
});

app.get('/api/apartamentos', async (req, res) => {
    try {
        const rows = await query('SELECT id, numeroApto, blocoId FROM apartamentos ORDER BY blocoId, numeroApto');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar apartamentos.' });
    }
});

app.post('/api/apartamentos', async (req, res) => {
    try {
        const { blocoId, numeroApto } = req.body;
        if (!numeroApto || !blocoId) return res.status(400).json({ error: 'Número do apartamento é obrigatório.' });

        const [exists] = await db.execute(
            'SELECT id FROM apartamentos WHERE blocoId = ? AND numeroApto = ? LIMIT 1',
            [Number(blocoId), numeroApto.trim()]
        );
        if (exists.length) return res.status(409).json({ error: 'Apartamento já cadastrado.' });

        const [result] = await db.execute(
            'INSERT INTO apartamentos (numeroApto, blocoId) VALUES (?, ?)',
            [numeroApto.trim(), Number(blocoId)]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar apartamento.' });
    }
});

app.put('/api/apartamentos/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { blocoId, numeroApto } = req.body;
        if (!numeroApto || !blocoId) return res.status(400).json({ error: 'Número do apartamento é obrigatório.' });

        const [exists] = await db.execute(
            'SELECT id FROM apartamentos WHERE blocoId = ? AND numeroApto = ? AND id <> ? LIMIT 1',
            [Number(blocoId), numeroApto.trim(), id]
        );
        if (exists.length) return res.status(409).json({ error: 'Apartamento já cadastrado.' });

        await db.execute(
            'UPDATE apartamentos SET numeroApto = ?, blocoId = ? WHERE id = ?',
            [numeroApto.trim(), Number(blocoId), id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar apartamento.' });
    }
});

app.delete('/api/apartamentos/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM apartamentos WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir apartamento.' });
    }
});

app.get('/api/moradores', async (req, res) => {
    try {
        const rows = await query(`
            SELECT id, cpf, nome, telefone, apartamentoId, responsavel, proprietario,
                   possuiVeiculo, quantidadeVagas, numeroVaga, placa, marca, modelo
            FROM moradores ORDER BY id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar moradores.' });
    }
});

app.post('/api/moradores', async (req, res) => {
    try {
        const m = req.body;
        if (!m.cpf || !m.nome || !m.telefone || !m.apartamentoId) return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

        const [exists] = await db.execute('SELECT id FROM moradores WHERE cpf = ? LIMIT 1', [m.cpf.trim()]);
        if (exists.length) return res.status(409).json({ error: 'CPF já cadastrado.' });

        const [result] = await db.execute(`
            INSERT INTO moradores
            (cpf, nome, telefone, apartamentoId, responsavel, proprietario, possuiVeiculo, quantidadeVagas, numeroVaga, placa, marca, modelo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            m.cpf.trim(), m.nome.trim(), m.telefone.trim(), Number(m.apartamentoId), !!m.responsavel,
            !!m.proprietario, !!m.possuiVeiculo, Number(m.quantidadeVagas || 0), m.numeroVaga?.trim() || null,
            m.placa?.trim() || null, m.marca?.trim() || null, m.modelo?.trim() || null
        ]);

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar morador.' });
    }
});

app.put('/api/moradores/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const m = req.body;
        if (!m.cpf || !m.nome || !m.telefone || !m.apartamentoId) return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

        const [exists] = await db.execute('SELECT id FROM moradores WHERE cpf = ? AND id <> ? LIMIT 1', [m.cpf.trim(), id]);
        if (exists.length) return res.status(409).json({ error: 'CPF já cadastrado.' });

        await db.execute(`
            UPDATE moradores SET cpf=?, nome=?, telefone=?, apartamentoId=?, responsavel=?, proprietario=?,
            possuiVeiculo=?, quantidadeVagas=?, numeroVaga=?, placa=?, marca=?, modelo=? WHERE id=?
        `, [
            m.cpf.trim(), m.nome.trim(), m.telefone.trim(), Number(m.apartamentoId), !!m.responsavel,
            !!m.proprietario, !!m.possuiVeiculo, Number(m.quantidadeVagas || 0), m.numeroVaga?.trim() || null,
            m.placa?.trim() || null, m.marca?.trim() || null, m.modelo?.trim() || null, id
        ]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar morador.' });
    }
});

app.delete('/api/moradores/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM moradores WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir morador.' });
    }
});

app.get('/api/referencias', async (req, res) => {
    try {
        res.json(await query('SELECT id, mesReferencia, anoReferencia, valorCondominio, vencimento FROM referencias ORDER BY anoReferencia, id'));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar referências.' });
    }
});

app.get('/api/pagamentos', async (req, res) => {
    try {
        res.json(await query('SELECT id, numeroApto, mesReferencia, anoReferencia, dataPagamento, dataVencimento, valorCondominio, moradorId FROM pagamentos ORDER BY id DESC'));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar pagamentos.' });
    }
});

app.post('/api/pagamentos', async (req, res) => {
    try {
        const { numeroApto, referenciaId } = req.body;
        const [apartamentos] = await db.execute('SELECT * FROM apartamentos WHERE numeroApto = ? LIMIT 1', [String(numeroApto).trim()]);
        if (!apartamentos.length) return res.status(400).json({ error: 'Apartamento não cadastrado.' });

        const apartamento = apartamentos[0];
        const [moradores] = await db.execute('SELECT * FROM moradores WHERE apartamentoId = ? LIMIT 1', [apartamento.id]);
        if (!moradores.length) return res.status(400).json({ error: 'Morador não cadastrado para o apartamento.' });

        const [referencias] = await db.execute('SELECT * FROM referencias WHERE id = ? LIMIT 1', [Number(referenciaId)]);
        if (!referencias.length) return res.status(400).json({ error: 'Referência não encontrada.' });

        const r = referencias[0];
        const [result] = await db.execute(`
            INSERT INTO pagamentos
            (numeroApto, mesReferencia, anoReferencia, dataPagamento, dataVencimento, valorCondominio, moradorId)
            VALUES (?, ?, ?, CURDATE(), ?, ?, ?)
        `, [apartamento.numeroApto, r.mesReferencia, r.anoReferencia, r.vencimento, r.valorCondominio, moradores[0].id]);

        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar pagamento.' });
    }
});

app.get('/api/tipos-manutencao', async (req, res) => {
    try {
        res.json(await query('SELECT id, descricao FROM tipos_manutencao ORDER BY descricao'));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar tipos de manutenção.' });
    }
});

app.post('/api/tipos-manutencao', async (req, res) => {
    try {
        const descricao = String(req.body.descricao || '').trim();
        if (!descricao) return res.status(400).json({ error: 'Descrição obrigatória.' });

        const [exists] = await db.execute('SELECT id FROM tipos_manutencao WHERE LOWER(descricao) = LOWER(?) LIMIT 1', [descricao]);
        if (exists.length) return res.status(409).json({ error: 'Tipo de manutenção já cadastrada.' });

        const [result] = await db.execute('INSERT INTO tipos_manutencao (descricao) VALUES (?)', [descricao]);
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar tipo de manutenção.' });
    }
});

app.put('/api/tipos-manutencao/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const descricao = String(req.body.descricao || '').trim();
        if (!descricao) return res.status(400).json({ error: 'Descrição obrigatória.' });

        const [exists] = await db.execute(
            'SELECT id FROM tipos_manutencao WHERE LOWER(descricao) = LOWER(?) AND id <> ? LIMIT 1',
            [descricao, id]
        );
        if (exists.length) return res.status(409).json({ error: 'Tipo de manutenção já cadastrada.' });

        await db.execute('UPDATE tipos_manutencao SET descricao = ? WHERE id = ?', [descricao, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar tipo de manutenção.' });
    }
});

app.delete('/api/tipos-manutencao/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM tipos_manutencao WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir tipo de manutenção.' });
    }
});

app.get('/api/manutencoes', async (req, res) => {
    try {
        res.json(await query('SELECT id, tipo, data, local FROM manutencoes ORDER BY data DESC, id DESC'));
    } catch (error) {
        res.status(500).json({ error: 'Erro ao consultar manutenções.' });
    }
});

app.post('/api/manutencoes', async (req, res) => {
    try {
        const { tipo, data, local } = req.body;
        if (!tipo || !data || !String(local || '').trim()) return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

        const [result] = await db.execute(
            'INSERT INTO manutencoes (tipo, data, local) VALUES (?, ?, ?)',
            [tipo, data, String(local).trim()]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar manutenção.' });
    }
});

app.put('/api/manutencoes/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { tipo, data, local } = req.body;
        if (!tipo || !data || !String(local || '').trim()) return res.status(400).json({ error: 'Dados obrigatórios não informados.' });

        await db.execute(
            'UPDATE manutencoes SET tipo = ?, data = ?, local = ? WHERE id = ?',
            [String(tipo).trim(), data, String(local).trim(), id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar manutenção.' });
    }
});

app.delete('/api/manutencoes/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM manutencoes WHERE id = ?', [Number(req.params.id)]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao excluir manutenção.' });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ api: 'online', database: 'online' });
    } catch (error) {
        res.status(500).json({ api: 'online', database: 'offline' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Sistema de Gestão de Condomínio: http://localhost:${PORT}`);
});
