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