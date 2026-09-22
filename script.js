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

// Exibe uma mensagem curta na tela.
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
    } catch (erro) {
        // Fallback para navegadores antigos.
        const campoTemporario = document.createElement("textarea");
        campoTemporario.value = texto;
        document.body.appendChild(campoTemporario);
        campoTemporario.select();
        document.execCommand("copy");
        document.body.removeChild(campoTemporario);
        mostrarToast("Copiado para a área de transferência");
    }
}

// Criando um arquivo para download usando Blob.
function bauxarArquivo(nomeArquivo, conteudo, tipo = "text/plain;charset=utf-8") {
    const blob = new Blob([conteudo], { type: tipo });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = nomeArquivo;
    link.click();

    URL.revokeObjectURL(url);
}

// Atualiza mensagem de salvamento com pequena espera para não piscar demais.
function marcarComoSalvo() {
    saveStatus.textContent = "Salvando...";

    clearTimeout(timerSalvamento);
    timerSalvamento = setTimeout(() => {
        const agora = new Date();
        const horario = agora.toLocaleTiemString("pt-br", {
            hour: "2-digit",
            minute: "2-digit",
        });

        saveStatus.textContent = `Salvo às ${horario}`;
    }, 350);
}

// =================================
// 5. Formação inline do Markdown
// ================================
// Essa função transforma Markdown pequeno em HTML: negrito, itálico, código, links e  imagens.
function formarTextoInline(texto) {
    let html = escaparHTML(texto);

    // Imagem: ![Texto alternativo](https://imagem.com/foto.png)
    html = html.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_, alt, url) => {
        return `<img src="${escaparAtributo(url)}" alt="${escaparAtributo(alt)}">`;
    });

    // Link: [Texto](https://site.com)
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, textoLink, url) => {
        return `<a href="${escaparAtributo(url)}" target="_blank" rel="noopener noreferrer">${textoLink}</a>`;
    });

    // Código inline: `codigo`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Negrito: **texto**
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Itálico: *texto*
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    return html;
}

// ==============================
// 6. Syntax highlight simples
// ==============================
// Este destaque é caseiro, sem biblioteca externa, para funcionar offline.
// A função evita inserir spans dentro de spans: ela percorre o texto bruto e só depois escapa cada pedaço.
function destacarPorRegex(codigo, regex, classificarToken) {
    let resultado = "";
    let ultimoIndice = 0;
    let match;

    while ((match = regex.exec(codigo)) !== null) {
        const token = match[0];
        const indice = match.index;

        resultado += escaparHTML(codigo.slice(ultimoIndice, indice));
        resultado += `<span class="token ${classificarToken(token)}">${escaparHTML(token)}</span>`;

        ultimoIndice = indice + token.length;
    }

    resultado += escaparHTML(codigo.slice(ultimoIndice));
    return resultado;
}

function destacarCodigo(codigo, linguagem) {
    const lang = linguagem.toLowerCase();

    if (["js", "javascript"].includes(lang)) {
        const regexJS = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|if|else|for|while|class|new|try|catch|await|async|import|export)\b|\b\d+(?:\.\d+)?\b/g;

        return destacarPorRegex(codigo, regexJS, token => {
            if (token.startsWith("//") || token.startsWith("/*")) return "comment";
            if (["'", '"', "`"].includes(token[0])) return "string";
            if (/^\d/.test(token)) return "number";
            return "keyword";
        });
    }

    if (["html", "xml"].includes(lang)) {
        const regexHTML = /<\/?[a-zA-Z][^>]*>/g;
        return destacarPorRegex(codigo, regexHTML, () => "tag");
    }

    if (["css"].includes(lang)) {
        const regexCSS = /\/\*[\s\S]*?\*\/|#[0-9a-fA-F]{3,8}\b|\b\d+(?:px|rem|em|%|vh|vw)?\b|\b[a-zA-Z-]+(?=\s*:)/g;

        return destacarPorRegex(codigo, regexCSS, token => {
            if (token.startsWith("/*")) return "comment";
            if (token.startsWith("#") || /^\d/.test(token)) return "number";
            return "keyword";
        });
    }

    return escaparHTML(codigo);
}

// ==============================
// 7. Parser de Markdown
// ==============================
// Essa função lê linha por linha e monta HTML.
function converterMarkdown(markdown) {
    const linha = markdown.replace(/\r\n/g, "\n").split("\n");

    let html = "";
    let listaAberta = null;
    let dentroDoCodigo = false;
    let linguagemCodigo = "";
    let codigoTemporario = [];

    function fecharLista() {
        if (listaAberta === "ul" || listaAberta === "task") {
            html += "</ul>";
            listaAberta = null;
        }

        if (listaAberta === "ol") {
            html += "</ol>";
            listaAberta = null;
        }
    }

    function abrirLista(tipo) {
        if (listaAberta === tipo) return;
        fecharLista();

        if (tipo === "ul") html += "<ul>";
        if (tipo === "ol") html += "<ol>";
        if (tipo === "task") html += '<ul class="task-list">';

        listaAberta = tipo;
    }

    function ehLinhaTabela(linha) {
        return /^\s*\|.+\|\s*$/.test(linha);
    }

    function ehSeparadorTabela(linha) {
        return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(linha);
    }

    function quebrarCelulas(linha) {
        return linha
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map(celula => celula.trim());
    }

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        const linhaLimpa = linhas.trim();

        // Bloco de código com ```js, ```html, ```css etc.
        if (linhaLimpa.startsWith("```")) {
            fecharLista();
            dentroDoCodigo = true;
            linguagemCodigo = linhaLimpa.replace("```", "").trim();
            codigoTemporario = [];
        }else {
            dentroDoCodigo = false;
            const codigo = codigoTemporario.join("\n");
            html += `<pre><code class="linguage-${escaparAtributo(linguagemCodigo)}">${destacatCodigo(codigo, linguagemCodigo)}<\code><\pre>`;
        }

        continue;
    }
    
    if (dentroDoCodigo) {
            codigoTemporario.push(linha);
            continue;
        }

        // Linha vazia separa blocos.
        if (linhaLimpa === "") {
            fecharLista();
            continue;
        }

        // Tabela Markdown.
        if (ehLinhaTabela(linha) && linhas[i + 1] && ehSeparadorTabela(linhas[i + 1])) {
            fecharLista();

            const cabecalho = quebrarCelulas(linha);
            i += 2; // pula a linha atual e o separador |---|---|

            const linhasTabela = [];
            while (i < linhas.length && ehLinhaTabela(linhas[i])) {
                linhasTabela.push(quebrarCelulas(linhas[i]));
                i++;
            }
            i--; // compensa o incremento do for

            html += "<table><thead><tr>";
            cabecalho.forEach(celula => {
                html += `<th>${formatarTextoInline(celula)}</th>`;
            });
            html += "</tr></thead><tbody>";

            linhasTabela.forEach(linhaTabela => {
                html += "<tr>";
                linhaTabela.forEach(celula => {
                    html += `<td>${formatarTextoInline(celula)}</td>`;
                });
                html += "</tr>";
            });

            html += "</tbody></table>";
            continue;
        }

        // Linha horizontal: ---
        if (/^---+$/.test(linhaLimpa)) {
            fecharLista();
            html += "<hr>";
            continue;
        }

        // Títulos: #, ##, ### até ######.
        const titulo = linha.match(/^(#{1,6})\s+(.*)$/);
        if (titulo) {
            fecharLista();
            const nivel = titulo[1].length;
            html += `<h${nivel}>${formatarTextoInline(titulo[2])}</h${nivel}>`;
            continue;
        }

        // Citação: > texto
        if (linha.startsWith("> ")) {
            fecharLista();
            const conteudo = linha.replace(/^>\s+/, "");
            html += `<blockquote>${formatarTextoInline(conteudo)}</blockquote>`;
            continue;
        }

        // Task list: - [x] item ou - [ ] item
        const tarefa = linha.match(/^-\s+\[([ xX])\]\s+(.*)$/);
        if (tarefa) {
            abrirLista("task");
            const marcado = tarefa[1].toLowerCase() === "x";
            html += `<li><label><input type="checkbox" disabled ${marcado ? "checked" : ""}>${formatarTextoInline(tarefa[2])}</label></li>`;
            continue;
        }

        // Lista não ordenada: - item
        if (linha.startsWith("- ")) {
            abrirLista("ul");
            const conteudo = linha.replace(/^-\s+/, "");
            html += `<li>${formatarTextoInline(conteudo)}</li>`;
            continue;
        }

        // Lista ordenada: 1. item
        const listaOrdenada = linha.match(/^\d+\.\s+(.*)$/);
        if (listaOrdenada) {
            abrirLista("ol");
            html += `<li>${formatarTextoInline(listaOrdenada[1])}</li>`;
            continue;
        }

        // Texto comum vira parágrafo.
        fecharLista();
        html += `<p>${formatarTextoInline(linha)}</p>`;
    }

    fecharLista();

    // Se o usuário esquecer de fechar um bloco de código, ainda mostramos o conteúdo.
    if (dentroDoCodigo) {
        const codigo = codigoTemporario.join("\n");
        html += `<pre><code>${escaparHTML(codigo)}</code></pre>`;
    }

    return html;
}

}