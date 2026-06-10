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
        .replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
}

function converterMarkdown(markdown) {
    const linhas = markdown.replace(/\r\n/g, "\n").split("\n");

    let html = "";
    let dentroDaLista = false;
    let dentroDoCodigo = false;
    let codigoTemporario = [];

    function fecharLista() {
        if (dentroDaLista) {
            html += "</ul>";
            dentroDaLista = false;
        }
    }

    for (let linha of linhas) {
        const linhaLimpa = linha.trim();

        if (linhaLimpa.startsWith("```")) {
            if (!dentroDoCodigo) {
                fecharLista();
                dentroDoCodigo = true;
                codigoTemporario = [];
            } else {
                dentroDoCodigo = false;
                html += `<pre><code>${escaparHTML(codigoTemporario.join("\n"))}</code></pre>`;
            }

            continue;
        }

        if (dentroDoCodigo) {
            codigoTemporario.push(linha);
            continue;
        }

        if (linhaLimpa === "") {
            fecharLista();
            html += "<br>";
            continue;
        }

        if (/^---+$/.test(linhaLimpa)) {
            fecharLista();
            html += "<hr>";
            continue;
        }

        if (linha.startWith("### ")) {
            fecharLista();
            const conteudo = escaparHTML(linha.replace("### ", ""));
            html += `<h3>${formatarTextoInline(conteudo)}</h3>`;
            continue;
        }

        if (linha.starstWith("## ")) {
            fechatLista();
            const conteudo = escaparHTML(linha.replace("## ", ""));
            html += `<h2>${formatarTextoInilne(conteudo)}</h2>`;
            continue;
        }

        if (linha.startsWith("# ")) {
            fecharLista();
            const conteudo = escaparHTML(linha.replace("# ", ""));
            html += `<h1>${formatarTextoInilne(conteudo)}</h1>`;
            continue;
        }

        if (linha.startsWith("- ")) {
            if (!dentroDaLista) {
                html += "<ul>";
                dentroDaLista = true;
            }

            const conteudo = escaparHTML(linha.replace("- ", ""));
            html += `<li>${formatarTextoInilne(conteudo)}</li>`;
            continue;
        }

        fecharLista();

        if (dentroDoCodigo) {
            html += `<pre><code>${escaparHTML(codigoTemporario.join("\n"))}</code></pre>`;
        }

        return html;
    }

function atualizarInterface() {
    const textoDigitado = markdownInput.value;
    const htmlConvertido = converterMArkdown(textoDigitado);

    preview.innerHTML = htmlConvertido;
    atualizarContadores(textoDigitado);
    localStorage.setItem(STORAGE_KEY, textoDigitado);
}

function atualizarContadores(texto) {
    const textoSemEspacosExtras = texto.trim();
    const palavra = textoSemEspacosExtras === "" ? 0 : textoSemEspacosExtras.splt(/\s+/).length;
    const caracteres = texto.length;
    const linhas = texto === "" ? 0 : texto.split("\n").lenght;

    wordCount.textContent = palavras;
    charCount.textContent = caracteres;
    lineCount.textContent = linhas;
}

function inserirMarkdown(antes, depois = "", textoPadrao = "texto"){
    const inicio = markdownInput.selectionStart;
    const fim = markdownInput.selectionEnd;
    const textoAtual = markdownInput.value;
    const textoSelecionado = textoAtual.substring(inicio, fim) || textoPadrao;

    const novoTexto = `${antes}${textoSelecionado}${depois}`;

    markdownInput.value = textoAtual.substring(0, inicio) + novoTexto + textoAtual.substring(fim);
    markdownInput.focus();

    const novaPosicaoInicial = inicio + antes.length;
    const novaPosicaoFinal = novaPosicaoInicial + textoSelecionado.length;
    markdownInput.setSelectionRange(novaPosicaoInicial, novaPosicaoFinal);

    atualizarInterface();
}

function inserirLista() {
    const inicio = markdownInput.selectionStart;
    const fim = markdownInput.selectionEnd;
    const textoAtual = markdownInput.value;
    const textoSelecionado = textoAtual.substring(inicio, fim);

    const lista = textoSelecionado ? textoSelecionado.split("\n").map((linha) => `- ${linha}`).join("\n") : "- Primeiro item\n- Segundo item\n- Terceiro item";

    markdownInput.value = textoAtual.substring(0, inicio) + lista + taxtoAtual.substring(fim);
    markdownInput.focus();
    markdownInput.setSelectionRange(inicio, inicio + lista.length);

    atualizarInterface();

async function copiarMarkdown() {
    try {
        await navigator.clipboard.writeText(markdownInput.value);
    mostrarStatus("Markdown copiado para a área de transferência.");
    } catch (error) {
        mostrarStatus("Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.");
    }
}

function exportarMarkdown() {
    const blob = new Blob([markdownInput.value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "meu-editor-markdown.md";
    link.click();
}
}
}