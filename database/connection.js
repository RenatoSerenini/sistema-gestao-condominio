const mysql = require("mysql2");
<<<<<<< HEAD

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "sistema_condominio"
});
=======
>>>>>>> b587842 (corrigindo estrutura pt2)

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "sistema_condominio"
});

conexao.connect(function(erro) {

    if (erro) {
        console.log("Erro ao conectar no banco de dados.");
        console.log(erro);
    } else {
        console.log("Banco de dados conectado!");
    }

});

<<<<<<< HEAD
module.exports = conexao;
=======
module.exports = conexao;
>>>>>>> b587842 (corrigindo estrutura pt2)
