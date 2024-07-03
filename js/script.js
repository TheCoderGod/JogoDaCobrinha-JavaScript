const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");
const audio = new Audio('../assets/audio.mp3');

const score = document.querySelector(".valor--score");
const scoreFinal = document.querySelector(".score--final > span"); // Seleciona o span dentro de .score--final
const menu = document.querySelector(".tela--menu");
const botaoJogar = document.querySelector(".btn--jogar");

const tamanho = 30;

let cobra = [
    {x: 270, y: 240},
    {x: 300, y: 240},
    {x: 330, y: 240}
];

let pontuacao = 0;
let direcao;
let loopId;
let jogoAtivo = true; // Flag para indicar se o jogo está ativo

const incrementaScore = () => {
    pontuacao += 10;
    score.innerText = pontuacao;
}

const atualizaScoreFinal = () => {
    scoreFinal.innerText = pontuacao;
}

const numeroRandomico = (min, max) => {
    return Math.round(Math.random() * (min - max) + max);
}

const posicaoRandomica = (min, max) => {
    const numero = numeroRandomico(0, canvas.width - tamanho);
    return Math.round(numero / 30) * 30;
}

const corRandomica = () => {
    const red = numeroRandomico(0, 255);
    const green = numeroRandomico(0, 255);
    const blue = numeroRandomico(0, 255);
    return `rgb(${red}, ${green}, ${blue})`;
}

let comida = {
    x: posicaoRandomica(0, 570),
    y: posicaoRandomica(0, 570),
    color: corRandomica()
}

const desenhaComida = () => {
    const { x, y, color } = comida;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = comida.color;
    ctx.fillRect(x, y, tamanho, tamanho);
    ctx.shadowBlur = 0;
}

const desenhaCobra = () => {
    ctx.fillStyle = "#ddd";
    cobra.forEach((posicao, index) => {
        if (index === cobra.length - 1) {
            ctx.fillStyle = "#FF00FF";
        }
        ctx.fillRect(posicao.x, posicao.y, tamanho, tamanho);
    });
}

const cobraMexe = () => {
    if (!direcao) return;

    const cabeca = cobra[cobra.length - 1];
    let novaCabeca;

    if (direcao === "direita") {
        novaCabeca = { x: cabeca.x + tamanho, y: cabeca.y };
    } else if (direcao === "esquerda") {
        novaCabeca = { x: cabeca.x - tamanho, y: cabeca.y };
    } else if (direcao === "cima") {
        novaCabeca = { x: cabeca.x, y: cabeca.y - tamanho };
    } else if (direcao === "baixo") {
        novaCabeca = { x: cabeca.x, y: cabeca.y + tamanho };
    }

    cobra.push(novaCabeca);
    if (!checaComida()) {
        cobra.shift();
    }
}

const desenhaGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "purple";

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 600);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(600, i);
        ctx.stroke();
    }
}

const checaComida = () => {
    const cabecaCobra = cobra[cobra.length - 1];

    if (cabecaCobra.x === comida.x && cabecaCobra.y === comida.y) {
        incrementaScore();
        audio.play().catch(error => {
            console.error("Erro ao reproduzir áudio: ", error);
        });

        let novaPosicaoValida = false;
        while (!novaPosicaoValida) {
            const novaX = posicaoRandomica(0, 570);
            const novaY = posicaoRandomica(0, 570);
            if (!cobra.find((posicao) => posicao.x === novaX && posicao.y === novaY)) {
                comida = {
                    x: novaX,
                    y: novaY,
                    color: corRandomica()
                };
                novaPosicaoValida = true;
            }
        }
        return true;
    }
    return false;
}

const checaColisao = () => {
    const cabecaCobra = cobra[cobra.length - 1];
    const limiteCanvas = canvas.width - tamanho;

    const colisaoParede = cabecaCobra.x < 0 || cabecaCobra.x > limiteCanvas || cabecaCobra.y < 0 || cabecaCobra.y > limiteCanvas;

    const colisaoPropria = cobra.slice(0, -1).find(posicao => {
        return posicao.x === cabecaCobra.x && posicao.y === cabecaCobra.y;
    });

    if (colisaoParede || colisaoPropria) {
        jogoAtivo = false; // Indica que o jogo não está mais ativo
        menu.style.display = "block";
        atualizaScoreFinal();
        clearTimeout(loopId);
    }
}

const gameLoop = () => {
    if (!jogoAtivo) return; // Se o jogo não estiver ativo, não continua o loop

    ctx.clearRect(0, 0, 600, 600);

    desenhaGrid();
    desenhaComida();
    cobraMexe();
    desenhaCobra();
    checaColisao();

    loopId = setTimeout(() => {
        gameLoop();
    }, 300);
}

gameLoop();

document.addEventListener("keydown", ({ key }) => {
    if (!jogoAtivo) return; // Não processa eventos de teclado se o jogo não estiver ativo

    if (key === "ArrowRight" && direcao !== "esquerda") {
        direcao = "direita";
    } else if (key === "ArrowLeft" && direcao !== "direita") {
        direcao = "esquerda";
    } else if (key === "ArrowUp" && direcao !== "baixo") {
        direcao = "cima";
    } else if (key === "ArrowDown" && direcao !== "cima") {
        direcao = "baixo";
    }
});

botaoJogar.addEventListener("click", reiniciarJogo);

function reiniciarJogo() {
    // Limpa a cobra e reseta variáveis
    cobra = [
        {x: 270, y: 240},
        {x: 300, y: 240},
        {x: 330, y: 240}
    ];
    pontuacao = 0;
    score.innerText = pontuacao;
    direcao = undefined;
    jogoAtivo = true;
    menu.style.display = "none"; // Esconde o menu de game over
    gameLoop(); // Reinicia o loop do jogo
}