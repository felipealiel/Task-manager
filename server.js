
const express = require("express");
const path = require("path");

const config = require("./config");
const db = require("./db");
const tarefasRoutes = require("./microservices/tarefas/routes");

const app = express();

// Permite receber e interpretar dados JSON
app.use(express.json());

// Disponibiliza os arquivos do frontend
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API de tarefas
app.use("/api/tarefas", tarefasRoutes);

// Rota para verificar se o servidor e o banco estão funcionando
app.get("/api/status", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            servidor: "online",
            banco: "conectado"
        });

    } catch (erro) {
        console.error("Erro ao verificar banco:", erro.message);

        res.status(500).json({
            servidor: "online",
            banco: "desconectado"
        });
    }
});

// Iniciar servidor
app.listen(config.port, () => {
    console.log("--------------------------------");
    console.log("TaskManager iniciado!");
    console.log(`Servidor: http://localhost:${config.port}`);
    console.log("--------------------------------");
});
