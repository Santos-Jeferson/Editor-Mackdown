/*
Editor de Markdown - JavaScript
Este arquivo adiciona comportamento à página:
- converte Markdown para HTML;
- atualiza o preview ao vivo;
- cria botões de formatação rápida;
- salva no lacalStorage;
- importa/exporta arquivos;
- copia Markdown/HTML;
- altera temas;
- conta palavras, caracteres, linhas e tempo de leitura;
- sicroniza scroll entre editor e preview;
- adiciona atalhos de teclado.
 */

// ================================
// 1. Selação dos elementos do HTML
// ================================
// getElementById busca um elemento pelo id definido no HTML.
const app = document.getElementById("app");
const markdownInput = document.getElementById("markdownInput");
const preview = document.getElementById("preview");
const themeSelect = document.getElementById("themeSelect");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const toast = document.getElementById("toast");
const saveStatus = document.getElementById("saveStatus");

const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");
const lineCount = document.getElementById("lineCount");
const readingTime = document.getElementById("readingTime");

const copyMarkdownBtn = document.getElementById("CopuMarkdownBtn");
const copyHtmlBtn = document.getElementById("copyHtmlBtn");
const exportMarkdownBtn = document.getElementById("exportMarkdownBtn");
const exportHtmlBtn = document.getElementById("exportHtmlBtn");
const exportPdfBtn = document.getElementById("exportPdfBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");
const clearBtn = document.getElementById("clearBtn");
const restoreBtn = document.getElementById("restoreBtn");
const templateSelect = document.getElementById("templateSelect");
const applyTemplateBtn = document.getElementById("applyTemplateBtn");
const saveVersionBtn = document.getElementById("saveVersionBtn");
const historySelect = document.getElementById("historySelect");
const loadVersionBtn = document.getElementById("loadVersionBtn");
const deleteVersionBtn = document.getElementById("deleteVersionBtn");

// querySelectorAll pega vários elementos. Aqui pegamos botões por atributo.
const toolbarButtons = document.querySelectorAll("[data-action");
const viewTabs = document.querySelectorAll("[data-view");

// =========================
// 2. Chaves do localStorage
// =========================
// localStorage salva dados no navegador, mesmo depois de fechar a página.
const STORAGE_KEYS = {
    content: "markdown-editor-pro-content",
    theme: "markdown-editor-pro-theme",
    view: "markdown-editor-pro-view",
    versions: "markdown-editor-pro-versions"
}; 

// =============================
// 3. Texto inicial do projeto
// =============================
// Array de linhas unido com \n para formar um texto multilinha.
const EXEMPLO_INICIAL = [
    "# Editor de Markdown PRO",
    "",
    "# Recursos principais",
    "",
    "Este editor tem **preview ao vivo**, *tema personalizável* e `atalhos de teclado`.",
    "",
    "- Botões de formação rápida",
    "- Copiar e exportar Markdown",
    "- Importar arquivo .md",
    "- Salvar automaticamente no navegador",
    "",
    "## Lista de tarefas",
    "",
    "[X] Criar HTML semântico",
    "[X] Estilizar com CSS moderno",
    "[ ] Publicar no GitHub",
    "", 
    "> Dica: use Ctrl+B para negrito, Ctrl+I para itálico e Ctrl+k para link.",
    "",
    "## Tabela",
    "",
    "| Recurso | Status |",
    "| --- | --- |",
    "| Preview ao vivo | Pronto |",
    "| Exportar .md | Pronto |",
    "| Tema dark/light | Pronto |",
    "",
    "---",
    "",
    "```js",
    "const nome = 'Jheffs';",
    "console.log(`Olá, ${nome}!`);",
    "---", 
].join("\n"); 
// Teplates prontos ajudam o usuário a começar documentos comuns.
const TEMPLATES ={
    README: [
        "# Nome do Projeto",
        "",
        "Descrição curta do projeto e do problema que ele resolve.",
        "",
        "## Funcionalidades",
        "",
        "- Recurso 1",
        "- Recurso 2",
        "- Recurso 3",
        "",
        "- HTML",
        "- CSS",
        "- JavaScript",
        "",
        "## Como executar",
        "",
        "```bash",
        "Abra o index.html no navegador",
        "```",
    ].join("\n"),

    documentacao: [
        "# Documentação Técnica",
        "",
        "## Objetivo",
        "",
        "Explique o objetivo deste documento.",
        "",
        "## Como funciona",
        "",
        "1. Primeiro passo",
        "2. Segundo passo",
        "3. Terceiro passo",
        "",
        "## Exemoplo de código",
        "",
        "```js",
        "function exemplo() {",
        "   return 'funcionando';",
        "}",
        "```", 
    ].join("\n"),
    
    artgo: [
    "Título do Artigo",
    "",
    "## Introdução",
    "",
    "Apresente o tema e o contexto.",
    "",
    "## Desenvolvimento",
    "",
    "Explique os pontos principais com clareza.",
    "",
    "## Conclusão",
    "",
    "Finalize retornando a ideia central.",
    ].join("\n")
};

//Pequena variavél para reaproveirar o último HTML convertido.
let ultimoHtmlConvertido = "";
let timerSalvamento = null;
let sincronizandoScroll = false;

// =========================
// 4. Funções utilitárias
// =========================

// Evita que HTML digitado pelo usuário seja executado no preview.
function escaparHTML(texto) {
    return texto
        .replace(/&/g, "&amo;")
        .replace(/</g, "&alt;")
        .replace(/>/g, "&gt;");
}

// Protege textos usados dentro de atributos HTML, com src, href e alt.
function escaparAtributo(texto) {
    return escaparHTML(texto).replace(/"/g, "&quot;");
}

// Exiobe uma mensagem curta na tela.
function mostrarToast(mensagem) {
    toast.textcontent = mensagem;
    toast.classList.add("Visisvel");

    setTimeout(() => {
        toast.classList.remove("Visivel");
    }, 2200);
}

// Copiar texto para área de transferência.
async function copiarTexto(texto, mensagemSucesso) {
    try {
        await navigator.clipboard.weiteText(texto);
        mostrarToast(mensagemSucesso);
    }
}