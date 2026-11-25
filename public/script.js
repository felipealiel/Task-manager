
// ========================================
// CONFIGURAÇÕES INICIAIS
// ========================================

// Endereço da API de tarefas
const API_URL = "/api/tarefas";

let tarefas = [];
let tarefaEditando = null;

// Elementos principais
const btnNovaTarefa = document.getElementById("btnNovaTarefa");
const pesquisaTarefa = document.getElementById("pesquisaTarefa");
const filtroPrioridade = document.getElementById("filtroPrioridade");

// ========================================
// CRIAÇÃO DO FORMULÁRIO
// ========================================

const modal = document.createElement("div");

modal.className = "modal-overlay";
modal.id = "modalTarefa";

modal.innerHTML = `
    <div class="modal">
        <div class="modal-header">
            <h2 id="tituloModal">Nova tarefa</h2>
            <button type="button" class="btn-fechar" id="fecharModal">
                &times;
            </button>
        </div>

        <form id="formTarefa">

            <label for="titulo">Título *</label>
            <input
                type="text"
                id="titulo"
                placeholder="Ex: Estudar JavaScript"
                maxlength="100"
                required
            >

            <label for="descricao">Descrição</label>
            <textarea
                id="descricao"
                placeholder="Descreva sua tarefa..."
                rows="3"
                maxlength="500"
            ></textarea>

            <label for="prioridade">Prioridade</label>
            <select id="prioridade">
                <option value="baixa">Baixa</option>
                <option value="media" selected>Média</option>
                <option value="alta">Alta</option>
            </select>

            <label for="dataPrazo">Data de prazo</label>
            <input type="date" id="dataPrazo">

            <div class="modal-actions">
                <button
                    type="button"
                    class="btn-cancelar"
                    id="cancelarModal"
                >
                    Cancelar
                </button>

                <button type="submit" class="btn-primary">
                    Salvar tarefa
                </button>
            </div>

        </form>
    </div>
`;

document.body.appendChild(modal);

// Elementos do formulário
const formTarefa = document.getElementById("formTarefa");
const tituloInput = document.getElementById("titulo");
const descricaoInput = document.getElementById("descricao");
const prioridadeInput = document.getElementById("prioridade");
const dataPrazoInput = document.getElementById("dataPrazo");

// ========================================
// COMUNICAÇÃO COM A API
// ========================================

async function requisicaoAPI(url, metodo = "GET", dados = null) {

    const opcoes = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (dados !== null) {
        opcoes.body = JSON.stringify(dados);
    }

    const resposta = await fetch(url, opcoes);

    const resultado = await resposta.json().catch(() => ({}));

    if (!resposta.ok) {
        throw new Error(
            resultado.erro ||
            resultado.mensagem ||
            "Erro ao executar operação no servidor."
        );
    }

    return resultado;
}

// ========================================
// CARREGAR TAREFAS DO BANCO DE DADOS
// ========================================

async function carregarTarefas() {

    try {

        const resultado = await requisicaoAPI(API_URL);

        tarefas = resultado.map(tarefa => ({

            id: tarefa.id,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao || "",
            prioridade: tarefa.prioridade,
            status: tarefa.status,

            dataPrazo: tarefa.data_prazo
                ? String(tarefa.data_prazo).substring(0, 10)
                : "",

            criadaEm: tarefa.criado_em

        }));

        renderizarTarefas();

    } catch (erro) {

        console.error("Erro ao carregar tarefas:", erro);

        alert(
            "Não foi possível carregar as tarefas do banco de dados. " +
            "Verifique se o servidor está funcionando."
        );

    }
}

// ========================================
// CONTROLE DO MODAL
// ========================================

function abrirModal() {

    modal.classList.add("ativo");

    tituloInput.focus();

}

function fecharModal() {

    modal.classList.remove("ativo");

    formTarefa.reset();

    tarefaEditando = null;

    document.getElementById("tituloModal").textContent =
        "Nova tarefa";

}

btnNovaTarefa.addEventListener("click", () => {

    tarefaEditando = null;

    formTarefa.reset();

    document.getElementById("tituloModal").textContent =
        "Nova tarefa";

    abrirModal();

});

document.getElementById("fecharModal").addEventListener(
    "click",
    fecharModal
);

document.getElementById("cancelarModal").addEventListener(
    "click",
    fecharModal
);

modal.addEventListener("click", (evento) => {

    if (evento.target === modal) {
        fecharModal();
    }

});

// ========================================
// CADASTRAR E EDITAR TAREFAS
// ========================================

formTarefa.addEventListener("submit", async (evento) => {

    evento.preventDefault();

    const titulo = tituloInput.value.trim();
    const descricao = descricaoInput.value.trim();
    const prioridade = prioridadeInput.value;
    const dataPrazo = dataPrazoInput.value;

    if (!titulo) {

        alert("Informe o título da tarefa.");

        tituloInput.focus();

        return;

    }

    const dados = {

        titulo,
        descricao,
        prioridade,
        status: "pendente",
        dataPrazo: dataPrazo || null

    };

    try {

        if (tarefaEditando !== null) {

            const tarefaAtual = tarefas.find(
                tarefa => String(tarefa.id) === String(tarefaEditando)
            );

            if (!tarefaAtual) {

                alert("Não foi possível encontrar essa tarefa.");

                return;

            }

            // Preserva o status atual durante a edição
            dados.status = tarefaAtual.status;

            await requisicaoAPI(
                `${API_URL}/${tarefaEditando}`,
                "PUT",
                dados
            );

        } else {

            await requisicaoAPI(
                API_URL,
                "POST",
                dados
            );

        }

        fecharModal();

        await carregarTarefas();

    } catch (erro) {

        console.error("Erro ao salvar tarefa:", erro);

        alert(erro.message);

    }

});

// ========================================
// EDITAR TAREFA
// ========================================

function editarTarefa(id) {

    const tarefa = tarefas.find(
        tarefa => String(tarefa.id) === String(id)
    );

    if (!tarefa) return;

    tarefaEditando = tarefa.id;

    tituloInput.value = tarefa.titulo;

    descricaoInput.value = tarefa.descricao;

    prioridadeInput.value = tarefa.prioridade;

    dataPrazoInput.value = tarefa.dataPrazo || "";

    document.getElementById("tituloModal").textContent =
        "Editar tarefa";

    abrirModal();

}

// ========================================
// EXCLUIR TAREFA
// ========================================

async function excluirTarefa(id) {

    const confirmar = confirm(
        "Tem certeza que deseja excluir esta tarefa?"
    );

    if (!confirmar) return;

    try {

        await requisicaoAPI(
            `${API_URL}/${id}`,
            "DELETE"
        );

        await carregarTarefas();

    } catch (erro) {

        console.error("Erro ao excluir tarefa:", erro);

        alert(erro.message);

    }

}

// ========================================
// ALTERAR STATUS
// ========================================

async function alterarStatus(id, novoStatus) {

    const tarefa = tarefas.find(
        tarefa => String(tarefa.id) === String(id)
    );

    if (!tarefa) return;

    const dados = {

        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        prioridade: tarefa.prioridade,
        status: novoStatus,
        dataPrazo: tarefa.dataPrazo || null

    };

    try {

        await requisicaoAPI(
            `${API_URL}/${id}`,
            "PUT",
            dados
        );

        await carregarTarefas();

    } catch (erro) {

        console.error("Erro ao alterar status:", erro);

        alert(erro.message);

    }

}

// ========================================
// FORMATAR DATA
// ========================================

function formatarData(data) {

    if (!data) return "Sem prazo definido";

    const [ano, mes, dia] = data.split("-");

    return `${dia}/${mes}/${ano}`;

}

// ========================================
// CRIAR CARTÃO DE TAREFA
// ========================================

function criarCartao(tarefa) {

    const cartao = document.createElement("div");

    cartao.className = "task-card";

    const titulo = document.createElement("h4");

    titulo.textContent = tarefa.titulo;

    const descricao = document.createElement("p");

    descricao.textContent =
        tarefa.descricao || "Sem descrição.";

    const prioridade = document.createElement("span");

    prioridade.className =
        `priority priority-${tarefa.prioridade}`;

    const nomesPrioridade = {

        baixa: "Baixa",
        media: "Média",
        alta: "Alta"

    };

    prioridade.textContent =
        `Prioridade ${nomesPrioridade[tarefa.prioridade]}`;

    const rodape = document.createElement("div");

    rodape.className = "task-footer";

    const data = document.createElement("span");

    data.className = "task-date";

    data.textContent =
        `Prazo: ${formatarData(tarefa.dataPrazo)}`;

    const acoes = document.createElement("div");

    acoes.className = "task-actions";

    const botaoEditar = document.createElement("button");

    botaoEditar.type = "button";

    botaoEditar.textContent = "Editar";

    botaoEditar.addEventListener("click", () => {

        editarTarefa(tarefa.id);

    });

    const botaoExcluir = document.createElement("button");

    botaoExcluir.type = "button";

    botaoExcluir.textContent = "Excluir";

    botaoExcluir.addEventListener("click", () => {

        excluirTarefa(tarefa.id);

    });

    acoes.append(botaoEditar, botaoExcluir);

    rodape.append(data, acoes);

    const seletorStatus = document.createElement("select");

    seletorStatus.className = "status-select";

    const opcoesStatus = [

        { valor: "pendente", texto: "A Fazer" },
        { valor: "andamento", texto: "Em Andamento" },
        { valor: "concluida", texto: "Concluída" }

    ];

    opcoesStatus.forEach(opcao => {

        const elemento = document.createElement("option");

        elemento.value = opcao.valor;

        elemento.textContent = opcao.texto;

        if (tarefa.status === opcao.valor) {
            elemento.selected = true;
        }

        seletorStatus.appendChild(elemento);

    });

    seletorStatus.addEventListener("change", () => {

        alterarStatus(tarefa.id, seletorStatus.value);

    });

    cartao.append(
        titulo,
        descricao,
        prioridade,
        rodape,
        seletorStatus
    );

    return cartao;

}

// ========================================
// RENDERIZAR TAREFAS NO KANBAN
// ========================================

function renderizarTarefas() {

    const listaPendente = document.getElementById("listaPendente");

    const listaAndamento = document.getElementById("listaAndamento");

    const listaConcluidas = document.getElementById("listaConcluidas");

    // Limpar as colunas antes de renderizar
    listaPendente.innerHTML = "";

    listaAndamento.innerHTML = "";

    listaConcluidas.innerHTML = "";

    const pesquisa = pesquisaTarefa.value
        .trim()
        .toLowerCase();

    const prioridadeSelecionada = filtroPrioridade.value;

    const tarefasFiltradas = tarefas.filter(tarefa => {

        const correspondePesquisa =
            tarefa.titulo.toLowerCase().includes(pesquisa) ||
            tarefa.descricao.toLowerCase().includes(pesquisa);

        const correspondePrioridade =
            prioridadeSelecionada === "" ||
            tarefa.prioridade === prioridadeSelecionada;

        return correspondePesquisa && correspondePrioridade;

    });

    const colunas = {

        pendente: listaPendente,
        andamento: listaAndamento,
        concluida: listaConcluidas

    };

    tarefasFiltradas.forEach(tarefa => {

        const coluna = colunas[tarefa.status];

        if (coluna) {

            coluna.appendChild(criarCartao(tarefa));

        }

    });

    // Mensagens para colunas vazias
    Object.values(colunas).forEach(coluna => {

        if (coluna.children.length === 0) {

            const mensagem = document.createElement("p");

            mensagem.className = "empty-message";

            mensagem.textContent = "Nenhuma tarefa encontrada.";

            coluna.appendChild(mensagem);

        }

    });

    atualizarIndicadores();

}

// ========================================
// ATUALIZAR INDICADORES
// ========================================

function atualizarIndicadores() {

    const pendentes = tarefas.filter(
        tarefa => tarefa.status === "pendente"
    ).length;

    const andamento = tarefas.filter(
        tarefa => tarefa.status === "andamento"
    ).length;

    const concluidas = tarefas.filter(
        tarefa => tarefa.status === "concluida"
    ).length;

    document.getElementById("totalTarefas").textContent =
        tarefas.length;

    document.getElementById("tarefasPendentes").textContent =
        pendentes;

    document.getElementById("tarefasAndamento").textContent =
        andamento;

    document.getElementById("tarefasConcluidas").textContent =
        concluidas;

    document.getElementById("contadorPendente").textContent =
        pendentes;

    document.getElementById("contadorAndamento").textContent =
        andamento;

    document.getElementById("contadorConcluidas").textContent =
        concluidas;

}

// ========================================
// PESQUISA E FILTROS
// ========================================

pesquisaTarefa.addEventListener("input", renderizarTarefas);

filtroPrioridade.addEventListener("change", renderizarTarefas);

// ========================================
// INICIALIZAÇÃO
// ========================================

// Buscar as tarefas diretamente do PostgreSQL
carregarTarefas();
