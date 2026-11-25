
CREATE TABLE IF NOT EXISTS tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    prioridade VARCHAR(10) NOT NULL DEFAULT 'media',
    status VARCHAR(15) NOT NULL DEFAULT 'pendente',
    data_prazo DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_prioridade
        CHECK (prioridade IN ('baixa', 'media', 'alta')),

    CONSTRAINT chk_status
        CHECK (status IN ('pendente', 'andamento', 'concluida'))
);

CREATE INDEX IF NOT EXISTS idx_tarefas_status
ON tarefas(status);

CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade
ON tarefas(prioridade);
