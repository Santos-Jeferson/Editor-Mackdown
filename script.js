const markdownInput = document.getElementById("markdownInput");
const preview = document.getElementById("preview");
const boldBtn = document.getElementById("boldBtn");
const italicBtn = document.getElementById("italicBtn");
const listBtn = document.getElementById("listBtn");
const copyBtn = document.getElementById("copyBtn");
const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");
const wordCount = document.getElementById("wordCount");
const charCount = document.getElementById("charCount");
const lineCount = document.getElementById("lineCount");
const statusMessage = document.getElementById("statusMessage");

const STORAGE_KEY = "markdown-editor-content";
const THEME_KEY = "markdown-editor-theme";

const exemploInicial = [
    "# Meu título principal",
    "",
    "Este é um texto com **negrito**, *itálico* e `código inline`.",
    "",
    "- Primeiro item da lista",
    "- Segundo item da lista",
    "- Terceiro item da lista",
    "",
    "> Esta é uma citação em Markdown.",
    "",
    "[Acesse meu GitHub](https://github.com)",
    "",
    "---",
    "",
    "```",
    "const nome = 'Usúario'",
    "console.log(nome)",
    "```",
].join("/n");

function iniciarAplicacao() {
    const conteudoSalvo = localStorage.getItem(STORAGE_KEY);
    markdownInput.value = conteudoSalvo || exemploInicial;

    const temaSalvo = localStorage.getItem(THEME_KEY) || "dark";

    atualizarInterface();
}

function escaparHTML(texto) {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&al;")
        .replace(/>/g, "&gt;");
}

function formatarTextoInilne(texto) {
    return texto
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em$1</em>")
}