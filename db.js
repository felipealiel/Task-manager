
const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool(config.database);

pool.on("connect", () => {
    console.log("Conexão com PostgreSQL estabelecida!");
});

pool.on("error", (erro) => {
    console.error("Erro inesperado no PostgreSQL:", erro.message);
});

module.exports = pool;
