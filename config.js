
require("dotenv").config();

const config = {
    port: 3000,

    database: {
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "123456",
        database: "taskmanager"
    }
};

module.exports = config;

