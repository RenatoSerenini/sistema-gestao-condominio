let app = document.getElementById("app");
let nav = document.getElementById("nav");

let db = {
    blocos: [],
    apartamentos: [],
    moradores: [],
    referencias: [],
    pagamentos: [],
    tiposManutencao: [],
    manutencoes: []
};

/* COMUNICACAO COM O SERVIDOR */

function api(url, metodo, dados, callback){

    let opcoes = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if(dados){
        opcoes.body = JSON.stringify(dados);
    }

    fetch(url, opcoes)
    .then(function(resposta){

        return resposta.json().then(function(resultado){

            if(!resposta.ok){
                callback(new Error(resultado.error || "Erro no servidor"));
            }else{
                callback(null, resultado);
            }

        });

    })
    .catch(function(erro){
        callback(erro);
    });

}

function carregarDados(callback){

    api("/api/blocos", "GET", null, function(erro, blocos){

        if(erro){
            callback(erro);
            return;
        }

        db.blocos = blocos;

        api("/api/apartamentos", "GET", null, function(erro, apartamentos){

            if(erro){
                callback(erro);
                return;
            }

            db.apartamentos = apartamentos;

            api("/api/moradores", "GET", null, function(erro, moradores){

                if(erro){
                    callback(erro);
                    return;
                }

                db.moradores = moradores;

                api("/api/referencias", "GET", null, function(erro, referencias){

                    if(erro){
                        callback(erro);
                        return;
                    }

                    db.referencias = referencias;

                    api("/api/pagamentos", "GET", null, function(erro, pagamentos){

                        if(erro){
                            callback(erro);
                            return;
                        }

                        db.pagamentos = pagamentos;

                        api("/api/tipos-manutencao", "GET", null, function(erro, tipos){

                            if(erro){
                                callback(erro);
                                return;
                            }

                            db.tiposManutencao = [];

                            for(let i = 0; i < tipos.length; i++){
                                db.tiposManutencao.push(tipos[i].descricao);
                            }

                            api("/api/manutencoes", "GET", null, function(erro, manutencoes){

                                if(erro){
                                    callback(erro);
                                    return;
                                }

                                db.manutencoes = manutencoes;
                                callback(null);

                            });

                        });

                    });

                });

            });

        });

    });

}

/* FUNCOES */

function esc(valor){

    if(valor === null || valor === undefined){
        return "";
    }

    let texto = String(valor);

    texto = texto.replace(/&/g, "&amp;");
    texto = texto.replace(/</g, "&lt;");
    texto = texto.replace(/>/g, "&gt;");
    texto = texto.replace(/"/g, "&quot;");
    texto = texto.replace(/'/g, "&#39;");

    return texto;
}

function toast(mensagem){

    let elemento = document.getElementById("toast");

    elemento.textContent = mensagem;
    elemento.classList.add("show");

    setTimeout(function(){
        elemento.classList.remove("show");
    }, 2300);

}

function mostrarErro(erro){

    console.log(erro);

    if(erro && erro.message){
        toast(erro.message);
    }else{
        toast("Erro inesperado.");
    }

}

function blocoName(id){

    for(let i = 0; i < db.blocos.length; i++){

        if(db.blocos[i].id == id){
            return db.blocos[i].descricaoBloco;
        }

    }

    return "—";
}

function aptByNumber(numero){

    for(let i = 0; i < db.apartamentos.length; i++){

        if(String(db.apartamentos[i].numeroApto) === String(numero)){
            return db.apartamentos[i];
        }

    }

    return null;
}

function pegarBloco(id){

    for(let i = 0; i < db.blocos.length; i++){

        if(db.blocos[i].id == id){
            return db.blocos[i];
        }

    }

    return null;
}

function pegarApartamento(id){

    for(let i = 0; i < db.apartamentos.length; i++){

        if(db.apartamentos[i].id == id){
            return db.apartamentos[i];
        }

    }

    return null;
}

function pegarMorador(id){

    for(let i = 0; i < db.moradores.length; i++){

        if(db.moradores[i].id == id){
            return db.moradores[i];
        }

    }

    return null;
}

/* MENU */

function renderNav(){

    nav.innerHTML = `
        <button onclick="route('Início')">Início</button>
        <button onclick="route('Blocos')">Blocos</button>
        <button onclick="route('Apartamentos')">Apartamentos</button>
        <button onclick="route('Moradores')">Moradores</button>
        <button onclick="route('Pagamento')">Pagamento</button>
        <button onclick="route('Manutenção')">Manutenção</button>
    `;

}

function route(pagina){

    renderNav();

    if(pagina === "Início"){
        home();
    }

    if(pagina === "Blocos"){
        blocos("");
    }

    if(pagina === "Apartamentos"){
        apartamentos("");
    }

    if(pagina === "Moradores"){
        moradores("");
    }

    if(pagina === "Pagamento"){
        pagamento();
    }

    if(pagina === "Manutenção"){
        manutencaoMenu();
    }

}

function shell(titulo, conteudo){

    app.innerHTML = `
        <section class="card">
            <h1>${titulo}</h1>
            ${conteudo}
        </section>
    `;

}

/* INICIO */

function home(){

    let conteudo = `
        <div class="dashboard">

            <div class="tile" onclick="route('Blocos')">
                <h3>Blocos</h3>
                <div class="stat">${db.blocos.length}</div>
                <p>Pesquisar e manter blocos</p>
            </div>

            <div class="tile" onclick="route('Apartamentos')">
                <h3>Apartamentos</h3>
                <div class="stat">${db.apartamentos.length}</div>
                <p>Pesquisar e manter apartamentos</p>
            </div>

            <div class="tile" onclick="route('Moradores')">
                <h3>Moradores</h3>
                <div class="stat">${db.moradores.length}</div>
                <p>Pesquisar e manter moradores</p>
            </div>

            <div class="tile" onclick="route('Pagamento')">
                <h3>Pagamento</h3>
                <div class="stat">${db.pagamentos.length}</div>
                <p>Registrar pagamentos</p>
            </div>

            <div class="tile" onclick="route('Manutenção')">
                <h3>Manutenção</h3>
                <div class="stat">${db.manutencoes.length}</div>
                <p>Tipos e registros de manutenção</p>
            </div>

        </div>

        <p class="hint" style="margin-top:22px">
            Dados persistidos no banco MySQL através da API Node.js.
        </p>
    `;

    shell("Sistema de Gestão de Condomínio", conteudo);

}

/* BLOCOS */

function blocos(filtro){

    let saida = "";

    for(let i = 0; i < db.blocos.length; i++){

        let bloco = db.blocos[i];

        let texto = bloco.codBloco + " " + bloco.descricaoBloco;

        if(texto.toLowerCase().includes(filtro.toLowerCase())){

            saida += `
                <tr>
                    <td>${bloco.codBloco}</td>

                    <td onclick="blocoForm('consultar', ${bloco.id})" style="cursor:pointer">
                        ${esc(bloco.descricaoBloco)}
                    </td>

                    <td>${bloco.quantidadeApts}</td>

                    <td>
                        <button class="action" onclick="blocoForm('alterar', ${bloco.id})">Alterar</button>
                        <button class="action" onclick="delBloco(${bloco.id})">Excluir</button>
                    </td>
                </tr>
            `;

        }

    }

    if(saida === ""){
        saida = `<tr><td colspan="4" class="empty">Nenhum bloco encontrado.</td></tr>`;
    }

    let conteudo = `
        <div class="toolbar">
            <input class="search" placeholder="Pesquisa" value="${esc(filtro)}" oninput="blocos(this.value)">
            <button class="btn primary" onclick="blocoForm('novo', 0)">Novo bloco</button>
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descrição</th>
                    <th>Quantidade de apartamentos</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                ${saida}
            </tbody>
        </table>
    `;

    shell("Pesquisar Bloco", conteudo);

}

function blocoForm(modo, id){

    let bloco = pegarBloco(id);

    if(!bloco){
        bloco = {
            codBloco: "",
            descricaoBloco: "",
            quantidadeApts: ""
        };
    }

    let desabilitado = "";

    if(modo === "consultar"){
        desabilitado = "disabled";
    }

    let titulo = "Manter Bloco";

    if(modo === "alterar"){
        titulo = "Alterar Bloco";
    }

    if(modo === "consultar"){
        titulo = "Consultar Bloco";
    }

    let botaoSalvar = "";

    if(modo !== "consultar"){

        let nomeBotao = "Salvar";

        if(modo === "novo"){
            nomeBotao = "Cadastrar";
        }

        botaoSalvar = `
            <button class="btn primary" onclick="saveBloco(${id})">
                ${nomeBotao}
            </button>
        `;

    }

    let conteudo = `
        <div class="form-grid">

            <label>Descrição:</label>
            <input id="descricao" value="${esc(bloco.descricaoBloco)}" ${desabilitado}>

            <label>Quantidade aptos:</label>
            <input id="qtd" type="number" min="1" value="${esc(bloco.quantidadeApts)}" ${desabilitado}>

            <div class="full form-actions">
                ${botaoSalvar}
                <button class="btn" onclick="blocos('')">Voltar</button>
            </div>

        </div>
    `;

    shell(titulo, conteudo);

}

function saveBloco(id){

    let descricao = document.getElementById("descricao").value.trim();
    let quantidade = document.getElementById("qtd").value;

    if(!descricao || !quantidade){
        toast("Não pode ficar em branco");
        return;
    }

    let metodo = "POST";
    let url = "/api/blocos";

    if(id){
        metodo = "PUT";
        url = "/api/blocos/" + id;
    }

    let dados = {
        descricaoBloco: descricao,
        quantidadeApts: Number(quantidade)
    };

    api(url, metodo, dados, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            toast("Dados salvos com sucesso");
            blocos("");

        });

    });

}

function delBloco(id){

    if(!confirm("Deseja excluir este bloco?")){
        return;
    }

    api("/api/blocos/" + id, "DELETE", null, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            blocos("");

        });

    });

}

/* APARTAMENTOS */

function apartamentos(filtro){

    let saida = "";

    for(let i = 0; i < db.apartamentos.length; i++){

        let apartamento = db.apartamentos[i];

        let texto = blocoName(apartamento.blocoId) + " " + apartamento.numeroApto;

        if(texto.toLowerCase().includes(filtro.toLowerCase())){

            saida += `
                <tr>

                    <td>${esc(blocoName(apartamento.blocoId))}</td>

                    <td onclick="aptForm('consultar', ${apartamento.id})" style="cursor:pointer">
                        ${esc(apartamento.numeroApto)}
                    </td>

                    <td>
                        <button class="action" onclick="aptForm('alterar', ${apartamento.id})">Alterar</button>
                        <button class="action" onclick="delApt(${apartamento.id})">Excluir</button>
                    </td>

                </tr>
            `;

        }

    }

    if(saida === ""){
        saida = `<tr><td colspan="3" class="empty">Nenhum apartamento encontrado.</td></tr>`;
    }

    let conteudo = `
        <div class="toolbar">
            <input class="search" placeholder="Pesquisa" value="${esc(filtro)}" oninput="apartamentos(this.value)">
            <button class="btn primary" onclick="aptForm('novo', 0)">Novo Apartamento</button>
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Bloco</th>
                    <th>Número do Apartamento</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                ${saida}
            </tbody>
        </table>
    `;

    shell("Pesquisar Apartamento", conteudo);

}

function aptForm(modo, id){

    let apartamento = pegarApartamento(id);

    if(!apartamento){
        apartamento = {
            blocoId: "",
            numeroApto: ""
        };
    }

    let desabilitado = "";

    if(modo === "consultar"){
        desabilitado = "disabled";
    }

    let titulo = "Cadastrar Apartamento";

    if(modo === "alterar"){
        titulo = "Alterar Apartamento";
    }

    if(modo === "consultar"){
        titulo = "Consultar Apartamento";
    }

    let opcoes = "";

    for(let i = 0; i < db.blocos.length; i++){

        let selecionado = "";

        if(db.blocos[i].id == apartamento.blocoId){
            selecionado = "selected";
        }

        opcoes += `
            <option value="${db.blocos[i].id}" ${selecionado}>
                ${esc(db.blocos[i].descricaoBloco)}
            </option>
        `;

    }

    let botaoSalvar = "";

    if(modo !== "consultar"){

        let textoBotao = "Salvar";

        if(modo === "novo"){
            textoBotao = "Cadastrar";
        }

        botaoSalvar = `
            <button class="btn primary" onclick="saveApt(${id})">
                ${textoBotao}
            </button>
        `;

    }

    let conteudo = `
        <div class="form-grid">

            <label>Bloco:</label>
            <select id="bloco" ${desabilitado}>
                ${opcoes}
            </select>

            <label>Número do Apartamento:</label>
            <input id="numero" value="${esc(apartamento.numeroApto)}" ${desabilitado}>

            <div class="full form-actions">
                ${botaoSalvar}
                <button class="btn" onclick="apartamentos('')">Voltar</button>
            </div>

        </div>
    `;

    shell(titulo, conteudo);

}

function saveApt(id){

    let blocoId = Number(document.getElementById("bloco").value);
    let numeroApto = document.getElementById("numero").value.trim();

    if(!numeroApto){
        toast("Número do apartamento é obrigatório");
        return;
    }

    let url = "/api/apartamentos";
    let metodo = "POST";

    if(id){
        url = "/api/apartamentos/" + id;
        metodo = "PUT";
    }

    let dados = {
        blocoId: blocoId,
        numeroApto: numeroApto
    };

    api(url, metodo, dados, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            toast("Dados salvos com sucesso");
            apartamentos("");

        });

    });

}

function delApt(id){

    if(!confirm("Deseja excluir este apartamento?")){
        return;
    }

    api("/api/apartamentos/" + id, "DELETE", null, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            apartamentos("");

        });

    });

}

/* MORADORES */

function moradores(filtro){

    let saida = "";

    for(let i = 0; i < db.moradores.length; i++){

        let morador = db.moradores[i];

        let texto = morador.cpf + " " + morador.nome + " " + morador.telefone + " " + morador.apartamentoId;

        if(texto.toLowerCase().includes(filtro.toLowerCase())){

            let numeroApartamento = "—";

            for(let j = 0; j < db.apartamentos.length; j++){

                if(db.apartamentos[j].id == morador.apartamentoId){
                    numeroApartamento = db.apartamentos[j].numeroApto;
                }

            }

            saida += `
                <tr>

                    <td>${esc(morador.cpf)}</td>

                    <td onclick="moradorForm('consultar', ${morador.id})" style="cursor:pointer">
                        ${esc(morador.nome)}
                    </td>

                    <td>${esc(morador.telefone)}</td>
                    <td>${esc(numeroApartamento)}</td>

                    <td>
                        <button class="action" onclick="moradorForm('alterar', ${morador.id})">Alterar</button>
                        <button class="action" onclick="delMorador(${morador.id})">Excluir</button>
                    </td>

                </tr>
            `;

        }

    }

    if(saida === ""){
        saida = `<tr><td colspan="5" class="empty">Nenhum morador encontrado.</td></tr>`;
    }

    let conteudo = `
        <div class="toolbar">
            <input class="search" placeholder="Pesquisa" value="${esc(filtro)}" oninput="moradores(this.value)">
            <button class="btn primary" onclick="moradorForm('novo', 0)">Novo morador</button>
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>

        <table>

            <thead>
                <tr>
                    <th>CPF</th>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Apartamento</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                ${saida}
            </tbody>

        </table>
    `;

    shell("Pesquisar Morador", conteudo);

}

function radio(nome, texto, valor, marcado, desabilitado){

    let checked = "";
    let disabled = "";

    if(marcado){
        checked = "checked";
    }

    if(desabilitado){
        disabled = "disabled";
    }

    return `
        <label style="font-weight:400">
            <input type="radio" name="${nome}" value="${valor}" ${checked} ${disabled}>
            ${texto}
        </label>
    `;

}

function moradorForm(modo, id){

    let morador = pegarMorador(id);

    if(!morador){

        morador = {
            cpf: "",
            nome: "",
            telefone: "",
            apartamentoId: "",
            responsavel: false,
            proprietario: false,
            possuiVeiculo: false,
            quantidadeVagas: 0,
            numeroVaga: "",
            placa: "",
            marca: "",
            modelo: ""
        };

    }

    let desabilitado = false;

    if(modo === "consultar"){
        desabilitado = true;
    }

    let disabledTexto = "";

    if(desabilitado){
        disabledTexto = "disabled";
    }

    let titulo = "Cadastrar Morador";

    if(modo === "alterar"){
        titulo = "Alterar Morador";
    }

    if(modo === "consultar"){
        titulo = "Consultar Morador";
    }

    let opcoes = "";

    for(let i = 0; i < db.apartamentos.length; i++){

        let apt = db.apartamentos[i];
        let selecionado = "";

        if(apt.id == morador.apartamentoId){
            selecionado = "selected";
        }

        opcoes += `
            <option value="${apt.id}" ${selecionado}>
                ${esc(apt.numeroApto)} - ${esc(blocoName(apt.blocoId))}
            </option>
        `;

    }

    let botaoSalvar = "";

    if(modo !== "consultar"){

        let textoBotao = "Salvar";

        if(modo === "novo"){
            textoBotao = "Cadastrar";
        }

        botaoSalvar = `
            <button class="btn primary" onclick="saveMorador(${id})">
                ${textoBotao}
            </button>
        `;

    }

    let conteudo = `
        <div class="form-grid">

            <label>CPF:</label>
            <input id="cpf" value="${esc(morador.cpf)}" ${disabledTexto}>

            <label>Nome:</label>
            <input id="nome" value="${esc(morador.nome)}" ${disabledTexto}>

            <label>Telefone:</label>
            <input id="telefone" value="${esc(morador.telefone)}" ${disabledTexto}>

            <label>Apartamento:</label>
            <select id="apartamento" ${disabledTexto}>
                ${opcoes}
            </select>

            <label>Responsável pelo apartamento?</label>
            <div class="radio-group">
                ${radio("responsavel", "Sim", true, Boolean(morador.responsavel), desabilitado)}
                ${radio("responsavel", "Não", false, !Boolean(morador.responsavel), desabilitado)}
            </div>

            <label>Proprietário do apartamento?</label>
            <div class="radio-group">
                ${radio("proprietario", "Sim", true, Boolean(morador.proprietario), desabilitado)}
                ${radio("proprietario", "Não", false, !Boolean(morador.proprietario), desabilitado)}
            </div>

            <label>Possui veículo?</label>
            <div class="radio-group">
                ${radio("possuiVeiculo", "Sim", true, Boolean(morador.possuiVeiculo), desabilitado)}
                ${radio("possuiVeiculo", "Não", false, !Boolean(morador.possuiVeiculo), desabilitado)}
            </div>

            <label>Quantidade de vagas de garagem:</label>
            <input id="qvagas" type="number" min="0" value="${esc(morador.quantidadeVagas)}" ${disabledTexto}>

            <label>Número da vaga:</label>
            <input id="vaga" value="${esc(morador.numeroVaga)}" ${disabledTexto}>

            <div class="full">
                <h2>Cadastrar Veículo</h2>
            </div>

            <label>Placa:</label>
            <input id="placa" value="${esc(morador.placa)}" ${disabledTexto}>

            <label>Marca:</label>
            <input id="marca" value="${esc(morador.marca)}" ${disabledTexto}>

            <label>Modelo:</label>
            <input id="modelo" value="${esc(morador.modelo)}" ${disabledTexto}>

            <div class="full form-actions">
                ${botaoSalvar}
                <button class="btn" onclick="moradores('')">Voltar</button>
            </div>

        </div>
    `;

    shell(titulo, conteudo);

}

function saveMorador(id){

    let responsavel = document.querySelector("input[name=responsavel]:checked");
    let proprietario = document.querySelector("input[name=proprietario]:checked");
    let possuiVeiculo = document.querySelector("input[name=possuiVeiculo]:checked");

    let morador = {
        cpf: document.getElementById("cpf").value.trim(),
        nome: document.getElementById("nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        apartamentoId: Number(document.getElementById("apartamento").value),
        responsavel: responsavel && responsavel.value === "true",
        proprietario: proprietario && proprietario.value === "true",
        possuiVeiculo: possuiVeiculo && possuiVeiculo.value === "true",
        quantidadeVagas: Number(document.getElementById("qvagas").value || 0),
        numeroVaga: document.getElementById("vaga").value.trim(),
        placa: document.getElementById("placa").value.trim(),
        marca: document.getElementById("marca").value.trim(),
        modelo: document.getElementById("modelo").value.trim()
    };

    if(!morador.cpf || !morador.nome || !morador.telefone || !morador.apartamentoId){
        toast("Dados obrigatórios não informados");
        return;
    }

    let url = "/api/moradores";
    let metodo = "POST";

    if(id){
        url = "/api/moradores/" + id;
        metodo = "PUT";
    }

    api(url, metodo, morador, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            toast("Dados salvos com sucesso");
            moradores("");

        });

    });

}

function delMorador(id){

    if(!confirm("Deseja excluir este morador?")){
        return;
    }

    api("/api/moradores/" + id, "DELETE", null, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            moradores("");

        });

    });

}

/* PAGAMENTO */

function pagamento(){

    let opcoes = "";

    for(let i = 0; i < db.referencias.length; i++){

        opcoes += `
            <option value="${db.referencias[i].id}">
                ${esc(db.referencias[i].mesReferencia)}/${db.referencias[i].anoReferencia}
            </option>
        `;

    }

    let conteudo = `
        <div class="form-grid">

            <label>Apartamento:</label>
            <input id="pApt" onblur="carregarAptPagamento()" placeholder="Ex.: 101">

            <label>CPF:</label>
            <input id="pCpf" disabled>

            <label>Morador:</label>
            <input id="pNome" disabled>

            <label>Telefone:</label>
            <input id="pTel" disabled>

            <label>Mês/Ano Referência:</label>
            <select id="ref" onchange="carregarReferencia()">
                ${opcoes}
            </select>

            <label>Valor:</label>
            <input id="pValor" disabled>

            <label>Vencimento:</label>
            <input id="pVenc" disabled>

            <div class="full form-actions">
                <button class="btn primary" onclick="pagar()">Pagar</button>
                <button class="btn" onclick="route('Início')">Voltar</button>
            </div>

        </div>
    `;

    shell("Registrar Pagamento", conteudo);

    carregarReferencia();

}

function carregarAptPagamento(){

    let numero = document.getElementById("pApt").value.trim();
    let apartamento = aptByNumber(numero);

    if(!apartamento){

        document.getElementById("pCpf").value = "";
        document.getElementById("pNome").value = "";
        document.getElementById("pTel").value = "";

        toast("Apartamento não cadastrado");

        return;
    }

    let morador = null;

    for(let i = 0; i < db.moradores.length; i++){

        if(db.moradores[i].apartamentoId == apartamento.id){
            morador = db.moradores[i];
            break;
        }

    }

    if(!morador){

        document.getElementById("pCpf").value = "";
        document.getElementById("pNome").value = "";
        document.getElementById("pTel").value = "";

        return;
    }

    document.getElementById("pCpf").value = morador.cpf;
    document.getElementById("pNome").value = morador.nome;
    document.getElementById("pTel").value = morador.telefone;

}

function carregarReferencia(){

    let select = document.getElementById("ref");

    if(!select){
        return;
    }

    let id = Number(select.value);
    let referencia = null;

    for(let i = 0; i < db.referencias.length; i++){

        if(db.referencias[i].id == id){
            referencia = db.referencias[i];
            break;
        }

    }

    if(!referencia){
        return;
    }

    document.getElementById("pValor").value =
        Number(referencia.valorCondominio).toFixed(2).replace(".", ",");

    document.getElementById("pVenc").value =
        String(referencia.vencimento).slice(0, 10);

}

function pagar(){

    let numeroApto = document.getElementById("pApt").value.trim();
    let referenciaId = Number(document.getElementById("ref").value);

    if(!aptByNumber(numeroApto)){
        toast("Apartamento não cadastrado");
        return;
    }

    let dados = {
        numeroApto: numeroApto,
        referenciaId: referenciaId
    };

    api("/api/pagamentos", "POST", dados, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            toast("Pagamento registrado com sucesso");
            route("Início");

        });

    });

}

/* MANUTENCAO */

function manutencaoMenu(){

    let conteudo = `
        <div class="dashboard">

            <div class="tile" onclick="tiposManutencao()">
                <h3>Tipos de Manutenção</h3>
                <p>Cadastrar e consultar tipos.</p>
            </div>

            <div class="tile" onclick="registrarManutencao()">
                <h3>Registrar Manutenção</h3>
                <p>Registrar uma manutenção realizada.</p>
            </div>

        </div>

        <div class="form-actions">
            <button class="btn" onclick="route('Início')">Voltar</button>
        </div>
    `;

    shell("Manutenção", conteudo);

}

function tiposManutencao(){

    let linhas = "";

    for(let i = 0; i < db.tiposManutencao.length; i++){

        linhas += `
            <tr>
                <td>${esc(db.tiposManutencao[i])}</td>
            </tr>
        `;

    }

    if(linhas === ""){
        linhas = `<tr><td class="empty">Nenhum tipo cadastrado.</td></tr>`;
    }

    let conteudo = `
        <div class="toolbar">

            <input id="tipo" placeholder="Descrição da manutenção">

            <button class="btn primary" onclick="addTipo()">
                Cadastrar
            </button>

            <button class="btn" onclick="manutencaoMenu()">
                Voltar
            </button>

        </div>

        <table>

            <thead>
                <tr>
                    <th>Tipos cadastrados</th>
                </tr>
            </thead>

            <tbody>
                ${linhas}
            </tbody>

        </table>
    `;

    shell("Cadastrar Tipo de Manutenção", conteudo);

}

function addTipo(){

    let descricao = document.getElementById("tipo").value.trim();

    if(!descricao){
        toast("Descrição obrigatória");
        return;
    }

    api(
        "/api/tipos-manutencao",
        "POST",
        { descricao: descricao },
        function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            carregarDados(function(erro){

                if(erro){
                    mostrarErro(erro);
                    return;
                }

                toast("Dados salvos com sucesso");
                tiposManutencao();

            });

        }
    );

}

function registrarManutencao(){

    let opcoes = "";

    for(let i = 0; i < db.tiposManutencao.length; i++){

        opcoes += `
            <option>${esc(db.tiposManutencao[i])}</option>
        `;

    }

    let linhas = "";

    for(let i = 0; i < db.manutencoes.length; i++){

        linhas += `
            <tr>
                <td>${esc(db.manutencoes[i].tipo)}</td>
                <td>${esc(String(db.manutencoes[i].data).slice(0, 10))}</td>
                <td>${esc(db.manutencoes[i].local)}</td>
            </tr>
        `;

    }

    if(linhas === ""){
        linhas = `
            <tr>
                <td colspan="3" class="empty">
                    Nenhuma manutenção registrada.
                </td>
            </tr>
        `;
    }

    let conteudo = `
        <div class="form-grid">

            <label>Tipo de manutenção:</label>
            <select id="mTipo">
                ${opcoes}
            </select>

            <label>Data:</label>
            <input id="mData" type="date">

            <label>Local:</label>
            <input id="mLocal" placeholder="Local da manutenção">

            <div class="full form-actions">
                <button class="btn primary" onclick="saveManutencao()">Cadastrar</button>
                <button class="btn" onclick="manutencaoMenu()">Voltar</button>
            </div>

        </div>

        <h2 style="margin-top:30px">Manutenções registradas</h2>

        <table>

            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Data</th>
                    <th>Local</th>
                </tr>
            </thead>

            <tbody>
                ${linhas}
            </tbody>

        </table>
    `;

    shell("Registrar Manutenção", conteudo);

}

function saveManutencao(){

    let tipo = document.getElementById("mTipo").value;
    let data = document.getElementById("mData").value;
    let local = document.getElementById("mLocal").value.trim();

    if(!tipo || !data || !local){
        toast("Dados obrigatórios não informados");
        return;
    }

    let dados = {
        tipo: tipo,
        data: data,
        local: local
    };

    api("/api/manutencoes", "POST", dados, function(erro){

        if(erro){
            mostrarErro(erro);
            return;
        }

        carregarDados(function(erro){

            if(erro){
                mostrarErro(erro);
                return;
            }

            toast("Dados salvos com sucesso");
            registrarManutencao();

        });

    });

}

/* INICIAR */

function iniciarSistema(){
    
    carregarDados(function(erro){

        if(erro){
            console.log(erro);

            shell(
                "Erro ao iniciar o sistema",
                `
                    <p>Não foi possível carregar os dados do servidor.</p>
                    <p>Verifique se o Node.js está executando e se o MySQL está disponível.</p>
                    <button class="btn primary" onclick="location.reload()">Tentar novamente</button>
                `
            );

            return;
        }

        renderNav();
        route("Início");
    });
}

iniciarSistema();