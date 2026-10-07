const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "sistema_condominio"
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'sistema_condominio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
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