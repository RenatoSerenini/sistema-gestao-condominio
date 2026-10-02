/* =========================================================
   SISTEMA DE GESTÃO DE CONDOMÍNIO
   Frontend: HTML/CSS/JavaScript
   Backend: Node.js + Express + body-parser + mysql2
   ========================================================= */

const app = document.getElementById('app');
const nav = document.getElementById('nav');

const db = {
    blocos: [],
    apartamentos: [],
    moradores: [],
    referencias: [],
    pagamentos: [],
    tiposManutencao: [],
    manutencoes: []
};

/* =========================================================
   API
   ========================================================= */

async function api(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro na comunicação com o servidor.');
    }

    return data;
}

async function carregarDados() {
    const [blocos, apartamentos, moradores, referencias, pagamentos, tipos, manutencoes] = await Promise.all([
        api('/api/blocos'),
        api('/api/apartamentos'),
        api('/api/moradores'),
        api('/api/referencias'),
        api('/api/pagamentos'),
        api('/api/tipos-manutencao'),
        api('/api/manutencoes')
    ]);

    db.blocos = blocos;
    db.apartamentos = apartamentos;
    db.moradores = moradores;
    db.referencias = referencias;
    db.pagamentos = pagamentos;
    db.tiposManutencaoDetalhados = tipos;
    db.tiposManutencao = tipos.map(item => item.descricao);
    db.manutencoes = manutencoes;
}

/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

function esc(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function toast(message) {
    const element = document.getElementById('toast');
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => element.classList.remove('show'), 2300);
}

function confirmBox(message, callback) {
    if (confirm(message)) callback();
}

function blocoName(id) {
    return db.blocos.find(item => item.id == id)?.descricaoBloco || '—';
}

function aptByNumber(number) {
    return db.apartamentos.find(item => String(item.numeroApto) === String(number));
}

function showError(error) {
    console.error(error);
    toast(error.message || 'Erro inesperado.');
}

/* =========================================================
   NAVEGAÇÃO E ESTRUTURA
   ========================================================= */

function renderNav() {
    nav.innerHTML = [
        'Início',
        'Blocos',
        'Apartamentos',
        'Moradores',
        'Pagamento',
        'Manutenção'
    ].map(page => `<button onclick="route('${page}')">${page}</button>`).join('');
}

function route(page) {
    renderNav();

    if (page === 'Início') home();
    if (page === 'Blocos') blocos();
    if (page === 'Apartamentos') apartamentos();
    if (page === 'Moradores') moradores();
    if (page === 'Pagamento') pagamento();
    if (page === 'Manutenção') manutencaoMenu();
}

function shell(title, body) {
    app.innerHTML = `<section class="card"><h1>${title}</h1>${body}</section>`;
}

/* =========================================================
   INÍCIO
   ========================================================= */

function home() {
    const tiles = [
        ['Blocos', db.blocos.length, 'Pesquisar e manter blocos'],
        ['Apartamentos', db.apartamentos.length, 'Pesquisar e manter apartamentos'],
        ['Moradores', db.moradores.length, 'Pesquisar e manter moradores'],
        ['Pagamento', db.pagamentos.length, 'Registrar pagamentos'],
        ['Manutenção', db.manutencoes.length, 'Tipos e registros de manutenção']
    ];

    shell(
        'Sistema de Gestão de Condomínio',
        `<div class="dashboard">${tiles.map(tile => `
            <div class="tile" onclick="route('${tile[0]}')">
                <h3>${tile[0]}</h3>
                <div class="stat">${tile[1]}</div>
                <p>${tile[2]}</p>
            </div>
        `).join('')}</div>
        <p class="hint" style="margin-top:22px">Dados persistidos no banco MySQL através da API Node.js.</p>`
    );
}

/* =========================================================
   BLOCOS
   ========================================================= */

function blocos(filter = '') {
    const rows = db.blocos.filter(item => `${item.codBloco} ${item.descricaoBloco}`
        .toLowerCase()
        .includes(filter.toLowerCase()));

    shell(
        'Pesquisar Bloco',
        `<div class="toolbar">
            <input class="search" id="q" placeholder="Pesquisa" value="${esc(filter)}" oninput="blocos(this.value)">
            <button class="btn primary" onclick="blocoForm('novo')">Novo bloco</button>
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>
        <table>
            <thead>
                <tr><th>Código</th><th>Descrição</th><th>Quantidade de apartamentos</th><th>Ações</th></tr>
            </thead>
            <tbody>
                ${rows.map(item => `
                    <tr>
                        <td>${item.codBloco}</td>
                        <td onclick="blocoForm('consultar', ${item.id})" style="cursor:pointer">${esc(item.descricaoBloco)}</td>
                        <td>${item.quantidadeApts}</td>
                        <td>
                            <button class="action" onclick="blocoForm('alterar', ${item.id})">Alterar</button>
                            <button class="action" onclick="delBloco(${item.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="4" class="empty">Nenhum bloco encontrado.</td></tr>'}
            </tbody>
        </table>`
    );
}

function blocoForm(mode, id) {
    const bloco = db.blocos.find(item => item.id == id) || {
        codBloco: '',
        descricaoBloco: '',
        quantidadeApts: ''
    };
    const readOnly = mode === 'consultar';
    const title = mode === 'novo' ? 'Manter Bloco' : mode === 'alterar' ? 'Alterar Bloco' : 'Consultar Bloco';

    shell(
        title,
        `<div class="form-grid">
            <label>Descrição:</label>
            <input id="descricao" value="${esc(bloco.descricaoBloco)}" ${readOnly ? 'disabled' : ''}>

            <label>Quantidade aptos:</label>
            <input id="qtd" type="number" min="1" value="${esc(bloco.quantidadeApts)}" ${readOnly ? 'disabled' : ''}>

            <div class="full form-actions">
                ${!readOnly ? `<button class="btn primary" onclick="saveBloco(${id || 0})">${mode === 'novo' ? 'Cadastrar' : 'Salvar'}</button>` : ''}
                <button class="btn" onclick="blocos()">Voltar</button>
            </div>
        </div>`
    );
}

async function saveBloco(id) {
    const descricao = document.getElementById('descricao').value.trim();
    const quantidadeApts = document.getElementById('qtd').value;

    if (!descricao || !quantidadeApts) {
        toast('Não pode ficar em branco');
        return;
    }

    try {
        await api(id ? `/api/blocos/${id}` : '/api/blocos', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ descricaoBloco: descricao, quantidadeApts: Number(quantidadeApts) })
        });
        await carregarDados();
        toast('Dados salvos com sucesso');
        blocos();
    } catch (error) {
        showError(error);
    }
}

async function delBloco(id) {
    confirmBox('Deseja excluir este bloco?', async () => {
        try {
            await api(`/api/blocos/${id}`, { method: 'DELETE' });
            await carregarDados();
            blocos();
        } catch (error) {
            showError(error);
        }
    });
}

/* =========================================================
   APARTAMENTOS
   ========================================================= */

function apartamentos(filter = '') {
    const rows = db.apartamentos.filter(item => `${blocoName(item.blocoId)} ${item.numeroApto}`
        .toLowerCase()
        .includes(filter.toLowerCase()));

    shell(
        'Pesquisar Apartamento',
        `<div class="toolbar">
            <input class="search" placeholder="Pesquisa" value="${esc(filter)}" oninput="apartamentos(this.value)">
            <button class="btn primary" onclick="aptForm('novo')">Novo Apartamento</button>
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>
        <table>
            <thead><tr><th>Bloco</th><th>Número do Apartamento</th><th>Ações</th></tr></thead>
            <tbody>
                ${rows.map(item => `
                    <tr>
                        <td>${esc(blocoName(item.blocoId))}</td>
                        <td onclick="aptForm('consultar', ${item.id})" style="cursor:pointer">${esc(item.numeroApto)}</td>
                        <td>
                            <button class="action" onclick="aptForm('alterar', ${item.id})">Alterar</button>
                            <button class="action" onclick="delApt(${item.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="3" class="empty">Nenhum apartamento encontrado.</td></tr>'}
            </tbody>
        </table>`
    );
}

function aptForm(mode, id) {
    const apartamento = db.apartamentos.find(item => item.id == id) || {
        blocoId: '',
        numeroApto: ''
    };
    const readOnly = mode === 'consultar';
    const title = mode === 'novo' ? 'Cadastrar Apartamento' : mode === 'alterar' ? 'Alterar Apartamento' : 'Consultar Apartamento';

    shell(
        title,
        `<div class="form-grid">
            <label>Bloco:</label>
            <select id="bloco" ${readOnly ? 'disabled' : ''}>
                ${db.blocos.map(bloco => `<option value="${bloco.id}" ${bloco.id == apartamento.blocoId ? 'selected' : ''}>${esc(bloco.descricaoBloco)}</option>`).join('')}
            </select>

            <label>Número do Apartamento:</label>
            <input id="numero" value="${esc(apartamento.numeroApto)}" ${readOnly ? 'disabled' : ''}>

            <div class="full form-actions">
                ${!readOnly ? `<button class="btn primary" onclick="saveApt(${id || 0})">${mode === 'novo' ? 'Cadastrar' : 'Salvar'}</button>` : ''}
                <button class="btn" onclick="apartamentos()">Voltar</button>
            </div>
        </div>`
    );
}

async function saveApt(id) {
    const blocoId = Number(document.getElementById('bloco').value);
    const numeroApto = document.getElementById('numero').value.trim();

    if (!numeroApto) {
        toast('Número do apartamento é obrigatório');
        return;
    }

    try {
        await api(id ? `/api/apartamentos/${id}` : '/api/apartamentos', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ blocoId, numeroApto })
        });
        await carregarDados();
        toast('Dados salvos com sucesso');
        apartamentos();
    } catch (error) {
        showError(error);
    }
}

async function delApt(id) {
    confirmBox('Deseja excluir este apartamento?', async () => {
        try {
            await api(`/api/apartamentos/${id}`, { method: 'DELETE' });
            await carregarDados();
            apartamentos();
        } catch (error) {
            showError(error);
        }
    });
}

/* =========================================================
   MORADORES
   ========================================================= */

function moradores(filter = '') {
    const rows = db.moradores.filter(item => `${item.cpf} ${item.nome} ${item.telefone} ${item.apartamentoId}`
        .toLowerCase()
        .includes(filter.toLowerCase()));

    shell(
        'Pesquisar Morador',
        `<div class="toolbar">
            <input class="search" placeholder="Pesquisa" value="${esc(filter)}" oninput="moradores(this.value)">
            <button class="btn primary" onclick="moradorForm('novo')">Novo morador</button>
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>
        <table>
            <thead><tr><th>CPF</th><th>Nome</th><th>Telefone</th><th>Apartamento</th><th>Ações</th></tr></thead>
            <tbody>
                ${rows.map(item => `
                    <tr>
                        <td>${esc(item.cpf)}</td>
                        <td onclick="moradorForm('consultar', ${item.id})" style="cursor:pointer">${esc(item.nome)}</td>
                        <td>${esc(item.telefone)}</td>
                        <td>${esc(db.apartamentos.find(a => a.id == item.apartamentoId)?.numeroApto || '—')}</td>
                        <td>
                            <button class="action" onclick="moradorForm('alterar', ${item.id})">Alterar</button>
                            <button class="action" onclick="delMorador(${item.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="5" class="empty">Nenhum morador encontrado.</td></tr>'}
            </tbody>
        </table>`
    );
}

function moradorForm(mode, id) {
    const morador = db.moradores.find(item => item.id == id) || {
        cpf: '',
        nome: '',
        telefone: '',
        apartamentoId: '',
        responsavel: false,
        proprietario: false,
        possuiVeiculo: false,
        quantidadeVagas: 0,
        numeroVaga: '',
        placa: '',
        marca: '',
        modelo: ''
    };
    const readOnly = mode === 'consultar';
    const title = mode === 'novo' ? 'Cadastrar Morador' : mode === 'alterar' ? 'Alterar Morador' : 'Consultar Morador';

    shell(
        title,
        `<div class="form-grid">
            <label>CPF:</label><input id="cpf" value="${esc(morador.cpf)}" ${readOnly ? 'disabled' : ''}>
            <label>Nome:</label><input id="nome" value="${esc(morador.nome)}" ${readOnly ? 'disabled' : ''}>
            <label>Telefone:</label><input id="telefone" value="${esc(morador.telefone)}" ${readOnly ? 'disabled' : ''}>

            <label>Apartamento:</label>
            <select id="apartamento" ${readOnly ? 'disabled' : ''}>
                ${db.apartamentos.map(item => `<option value="${item.id}" ${item.id == morador.apartamentoId ? 'selected' : ''}>${esc(item.numeroApto)} - ${esc(blocoName(item.blocoId))}</option>`).join('')}
            </select>

            <label>Responsável pelo apartamento?</label>
            <div class="radio-group">${radio('responsavel', 'Sim', true, morador.responsavel, readOnly)}${radio('responsavel', 'Não', false, !morador.responsavel, readOnly)}</div>

            <label>Proprietário do apartamento?</label>
            <div class="radio-group">${radio('proprietario', 'Sim', true, morador.proprietario, readOnly)}${radio('proprietario', 'Não', false, !morador.proprietario, readOnly)}</div>

            <label>Possui veículo?</label>
            <div class="radio-group">${radio('possuiVeiculo', 'Sim', true, morador.possuiVeiculo, readOnly)}${radio('possuiVeiculo', 'Não', false, !morador.possuiVeiculo, readOnly)}</div>

            <label>Quantidade de vagas de garagem:</label><input id="qvagas" type="number" min="0" value="${esc(morador.quantidadeVagas)}" ${readOnly ? 'disabled' : ''}>
            <label>Número da vaga:</label><input id="vaga" value="${esc(morador.numeroVaga)}" ${readOnly ? 'disabled' : ''}>

            <div class="full"><h2>Cadastrar Veículo</h2></div>
            <label>Placa:</label><input id="placa" value="${esc(morador.placa)}" ${readOnly ? 'disabled' : ''}>
            <label>Marca:</label><input id="marca" value="${esc(morador.marca)}" ${readOnly ? 'disabled' : ''}>
            <label>Modelo:</label><input id="modelo" value="${esc(morador.modelo)}" ${readOnly ? 'disabled' : ''}>

            <div class="full form-actions">
                ${!readOnly ? `<button class="btn primary" onclick="saveMorador(${id || 0})">${mode === 'novo' ? 'Cadastrar' : 'Salvar'}</button>` : ''}
                <button class="btn" onclick="moradores()">Voltar</button>
            </div>
        </div>`
    );
}

function radio(name, label, value, checked, disabled) {
    return `<label style="font-weight:400"><input type="radio" name="${name}" value="${value}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}> ${label}</label>`;
}

async function saveMorador(id) {
    const morador = {
        cpf: document.getElementById('cpf').value.trim(),
        nome: document.getElementById('nome').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        apartamentoId: Number(document.getElementById('apartamento').value),
        responsavel: document.querySelector('input[name=responsavel]:checked')?.value === 'true',
        proprietario: document.querySelector('input[name=proprietario]:checked')?.value === 'true',
        possuiVeiculo: document.querySelector('input[name=possuiVeiculo]:checked')?.value === 'true',
        quantidadeVagas: Number(document.getElementById('qvagas').value || 0),
        numeroVaga: document.getElementById('vaga').value.trim(),
        placa: document.getElementById('placa').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim()
    };

    if (!morador.cpf || !morador.nome || !morador.telefone || !morador.apartamentoId) {
        toast('Dados obrigatórios não informados');
        return;
    }

    try {
        await api(id ? `/api/moradores/${id}` : '/api/moradores', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(morador)
        });
        await carregarDados();
        toast('Dados salvos com sucesso');
        moradores();
    } catch (error) {
        showError(error);
    }
}

async function delMorador(id) {
    confirmBox('Deseja excluir este morador?', async () => {
        try {
            await api(`/api/moradores/${id}`, { method: 'DELETE' });
            await carregarDados();
            moradores();
        } catch (error) {
            showError(error);
        }
    });
}

/* =========================================================
   PAGAMENTOS
   ========================================================= */

function pagamento() {
    shell(
        'Registrar Pagamento',
        `<div class="form-grid">
            <label>Apartamento:</label><input id="pApt" onblur="carregarAptPagamento()" placeholder="Ex.: 101">
            <label>CPF:</label><input id="pCpf" disabled>
            <label>Morador:</label><input id="pNome" disabled>
            <label>Telefone:</label><input id="pTel" disabled>
            <label>Mês/Ano Referência:</label>
            <select id="ref" onchange="carregarReferencia()">
                ${db.referencias.map(item => `<option value="${item.id}">${esc(item.mesReferencia)}/${item.anoReferencia}</option>`).join('')}
            </select>
            <label>Valor:</label><input id="pValor" disabled>
            <label>Vencimento:</label><input id="pVenc" disabled>
            <div class="full form-actions">
                <button class="btn primary" onclick="pagar()">Pagar</button>
                <button class="btn" onclick="route('Início')">Voltar</button>
            </div>
        </div>`
    );

    carregarReferencia();
}

function carregarAptPagamento() {
    const apartamento = aptByNumber(document.getElementById('pApt').value.trim());

    if (!apartamento) {
        document.getElementById('pCpf').value = '';
        document.getElementById('pNome').value = '';
        document.getElementById('pTel').value = '';
        toast('Apartamento não cadastrado');
        return;
    }

    const morador = db.moradores.find(item => item.apartamentoId === apartamento.id);

    if (!morador) {
        document.getElementById('pCpf').value = '';
        document.getElementById('pNome').value = '';
        document.getElementById('pTel').value = '';
        return;
    }

    document.getElementById('pCpf').value = morador.cpf;
    document.getElementById('pNome').value = morador.nome;
    document.getElementById('pTel').value = morador.telefone;
}

function carregarReferencia() {
    const referencia = db.referencias.find(item => item.id == Number(document.getElementById('ref').value));

    if (!referencia) return;

    document.getElementById('pValor').value = Number(referencia.valorCondominio).toFixed(2).replace('.', ',');
    document.getElementById('pVenc').value = String(referencia.vencimento).slice(0, 10);
}

async function pagar() {
    const numeroApto = document.getElementById('pApt').value.trim();
    const referenciaId = Number(document.getElementById('ref').value);

    if (!aptByNumber(numeroApto)) {
        toast('Apartamento não cadastrado');
        return;
    }

    try {
        await api('/api/pagamentos', {
            method: 'POST',
            body: JSON.stringify({ numeroApto, referenciaId })
        });
        await carregarDados();
        toast('Pagamento registrado com sucesso');
        route('Início');
    } catch (error) {
        showError(error);
    }
}

/* =========================================================
   MANUTENÇÃO
   ========================================================= */

function manutencaoMenu() {
    shell(
        'Manutenção',
        `<div class="dashboard">
            <div class="tile" onclick="tiposManutencao()">
                <h3>Tipos de Manutenção</h3>
                <p>Cadastrar e consultar tipos.</p>
            </div>
            <div class="tile" onclick="registrarManutencao()">
                <h3>Registrar Manutenção</h3>
                <p>Registrar uma manutenção realizada.</p>
            </div>
        </div>
        <div class="form-actions"><button class="btn" onclick="route('Início')">Voltar</button></div>`
    );
}

function tiposManutencao(mode = 'lista', id = 0) {
    if (mode === 'form') {
        const item = db.tiposManutencaoDetalhados.find(tipo => tipo.id == id) || { descricao: '' };
        shell(
            id ? 'Alterar Tipo de Manutenção' : 'Cadastrar Tipo de Manutenção',
            `<div class="form-grid">
                <label>Descrição:</label>
                <input id="tipo" value="${esc(item.descricao)}" placeholder="Descrição da manutenção">
                <div class="full form-actions">
                    <button class="btn" onclick="saveTipo(${id || 0})">${id ? 'Salvar' : 'Adicionar'}</button>
                    <button class="btn danger" onclick="tiposManutencao()">Voltar</button>
                </div>
            </div>`
        );
        return;
    }

    shell(
        'Tipos de Manutenção',
        `<div class="toolbar">
            <button class="btn" onclick="tiposManutencao('form')">Adicionar</button>
            <button class="btn danger" onclick="manutencaoMenu()">Voltar</button>
        </div>
        <table>
            <thead><tr><th>Descrição</th><th>Ações</th></tr></thead>
            <tbody>
                ${db.tiposManutencaoDetalhados.map(item => `
                    <tr>
                        <td>${esc(item.descricao)}</td>
                        <td>
                            <button class="action" onclick="tiposManutencao('form', ${item.id})">Editar</button>
                            <button class="action" onclick="delTipo(${item.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="2" class="empty">Nenhum tipo cadastrado.</td></tr>'}
            </tbody>
        </table>`
    );
}

async function saveTipo(id) {
    const descricao = document.getElementById('tipo').value.trim();

    if (!descricao) {
        toast('Preencha todos os campos!');
        return;
    }

    try {
        await api(id ? `/api/tipos-manutencao/${id}` : '/api/tipos-manutencao', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ descricao })
        });
        await carregarDados();
        toast(id ? 'Tipo alterado com sucesso' : 'Tipo cadastrado com sucesso');
        tiposManutencao();
    } catch (error) {
        showError(error);
    }
}

async function delTipo(id) {
    confirmBox('Deseja excluir este tipo de manutenção?', async () => {
        try {
            await api(`/api/tipos-manutencao/${id}`, { method: 'DELETE' });
            await carregarDados();
            tiposManutencao();
        } catch (error) {
            showError(error);
        }
    });
}

function registrarManutencao(mode = 'lista', id = 0) {
    if (mode === 'form') {
        const item = db.manutencoes.find(m => m.id == id) || { tipo: '', data: '', local: '' };
        shell(
            id ? 'Alterar Manutenção' : 'Registrar Manutenção',
            `<div class="form-grid">
                <label>Tipo de manutenção:</label>
                <select id="mTipo">
                    ${db.tiposManutencaoDetalhados.map(tipo => `<option value="${esc(tipo.descricao)}" ${tipo.descricao === item.tipo ? 'selected' : ''}>${esc(tipo.descricao)}</option>`).join('')}
                </select>
                <label>Data:</label><input id="mData" type="date" value="${esc(String(item.data || '').slice(0, 10))}">
                <label>Local:</label><input id="mLocal" value="${esc(item.local)}" placeholder="Local da manutenção">
                <div class="full form-actions">
                    <button class="btn" onclick="saveManutencao(${id || 0})">${id ? 'Salvar' : 'Adicionar'}</button>
                    <button class="btn danger" onclick="registrarManutencao()">Voltar</button>
                </div>
            </div>`
        );
        return;
    }

    shell(
        'Manutenções Registradas',
        `<div class="toolbar">
            <button class="btn" onclick="registrarManutencao('form')">Adicionar</button>
            <button class="btn danger" onclick="manutencaoMenu()">Voltar</button>
        </div>
        <table>
            <thead><tr><th>Tipo</th><th>Data</th><th>Local</th><th>Ações</th></tr></thead>
            <tbody>
                ${db.manutencoes.map(item => `
                    <tr>
                        <td>${esc(item.tipo)}</td>
                        <td>${esc(String(item.data).slice(0, 10))}</td>
                        <td>${esc(item.local)}</td>
                        <td>
                            <button class="action" onclick="registrarManutencao('form', ${item.id})">Editar</button>
                            <button class="action" onclick="delManutencao(${item.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="4" class="empty">Nenhuma manutenção registrada.</td></tr>'}
            </tbody>
        </table>`
    );
}

async function saveManutencao(id = 0) {
    const tipo = document.getElementById('mTipo').value;
    const data = document.getElementById('mData').value;
    const local = document.getElementById('mLocal').value.trim();

    if (!tipo || !data || !local) {
        toast('Preencha todos os campos!');
        return;
    }

    try {
        await api(id ? `/api/manutencoes/${id}` : '/api/manutencoes', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify({ tipo, data, local })
        });
        await carregarDados();
        toast(id ? 'Manutenção alterada com sucesso' : 'Manutenção cadastrada com sucesso');
        registrarManutencao();
    } catch (error) {
        showError(error);
    }
}

async function delManutencao(id) {
    confirmBox('Deseja excluir esta manutenção?', async () => {
        try {
            await api(`/api/manutencoes/${id}`, { method: 'DELETE' });
            await carregarDados();
            registrarManutencao();
        } catch (error) {
            showError(error);
        }
    });
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function iniciarSistema() {
    try {
        await carregarDados();
        renderNav();
        route('Início');
    } catch (error) {
        console.error(error);
        shell(
            'Erro ao iniciar o sistema',
            `<p>Não foi possível carregar os dados do servidor.</p>
             <p>Verifique se o Node.js está executando e se o MySQL está disponível.</p>
             <button class="btn primary" onclick="location.reload()">Tentar novamente</button>`
        );
    }
}

iniciarSistema();
