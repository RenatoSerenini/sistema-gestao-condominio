const mysql = require("mysql2");

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

module.exports = conexao;
