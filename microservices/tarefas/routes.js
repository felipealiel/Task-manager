const express = require("express");
const router = express.Router();
const db = require("../../db");

// Valores permitidos pelo banco de dados
const prioridadesValidas = ["baixa", "media", "alta"];
const statusValidos = ["pendente", "andamento", "concluida"];

// LISTAR TAREFAS
// GET /api/tarefas
router.get("/", async (req, res) => {
    try {
        const { q = "", prioridade = "" } = req.query;

        const busca = `%${q}%`;

        const resultado = await db.query(
            `SELECT * FROM tarefas
             WHERE (
                titulo ILIKE $1
                OR COALESCE(descricao, '') ILIKE $1
             )
             AND ($2 = '' OR prioridade = $2)
             ORDER BY id DESC`,
            [busca, prioridade]
        );

        res.json(resultado.rows);

    } catch (erro) {
        console.error("Erro ao listar tarefas:", erro.message);
        res.status(500).json({
            erro: "Não foi possível listar as tarefas."
        });
    }
});

// CADASTRAR TAREFA
// POST /api/tarefas
router.post("/", async (req, res) => {
    try {
        const {
            titulo,
            descricao,
            prioridade,
            status,
            dataPrazo
        } = req.body;

        if (!titulo || !titulo.trim()) {
            return res.status(400).json({
                erro: "O título da tarefa é obrigatório."
            });
        }

        const prioridadeFinal = prioridade || "media";
        const statusFinal = status || "pendente";

        if (!prioridadesValidas.includes(prioridadeFinal)) {
            return res.status(400).json({
                erro: "Prioridade inválida."
            });
        }

        if (!statusValidos.includes(statusFinal)) {
            return res.status(400).json({
                erro: "Status inválido."
            });
        }

        const resultado = await db.query(
            `INSERT INTO tarefas
                (titulo, descricao, prioridade, status, data_prazo)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                titulo.trim(),
                descricao || "",
                prioridadeFinal,
                statusFinal,
                dataPrazo || null
            ]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (erro) {
        console.error("Erro ao cadastrar tarefa:", erro.message);
        res.status(500).json({
            erro: "Não foi possível cadastrar a tarefa."
        });
    }
});

// EDITAR TAREFA
// PUT /api/tarefas/:id
router.put("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID da tarefa inválido."
            });
        }

        const {
            titulo,
            descricao,
            prioridade,
            status,
            dataPrazo
        } = req.body;

        if (!titulo || !titulo.trim()) {
            return res.status(400).json({
                erro: "O título da tarefa é obrigatório."
            });
        }

        if (!prioridadesValidas.includes(prioridade)) {
            return res.status(400).json({
                erro: "Prioridade inválida."
            });
        }

        if (!statusValidos.includes(status)) {
            return res.status(400).json({
                erro: "Status inválido."
            });
        }

        const resultado = await db.query(
            `UPDATE tarefas
             SET titulo = $1,
                 descricao = $2,
                 prioridade = $3,
                 status = $4,
                 data_prazo = $5
             WHERE id = $6
             RETURNING *`,
            [
                titulo.trim(),
                descricao || "",
                prioridade,
                status,
                dataPrazo || null,
                id
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Tarefa não encontrada."
            });
        }

        res.json(resultado.rows[0]);

    } catch (erro) {
        console.error("Erro ao editar tarefa:", erro.message);
        res.status(500).json({
            erro: "Não foi possível editar a tarefa."
        });
    }
});

// EXCLUIR TAREFA
// DELETE /api/tarefas/:id
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID da tarefa inválido."
            });
        }

        const resultado = await db.query(
            "DELETE FROM tarefas WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Tarefa não encontrada."
            });
        }

        res.json({
            mensagem: "Tarefa excluída com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao excluir tarefa:", erro.message);
        res.status(500).json({
            erro: "Não foi possível excluir a tarefa."
        });
    }
});

module.exports = router;
