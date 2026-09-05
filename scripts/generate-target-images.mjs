// Gera as 5 imagens de rastreamento (assets-source/targets/*.png), usadas
// tanto para compilar treasure-hunt.mind quanto para a página de impressão.
// São composições gráficas 100% originais (não fotografias), pensadas para
// bom rastreamento por features: alto contraste, detalhes assimétricos
// espalhados por toda a área, sem padrões repetidos nem grandes áreas
// vazias.
import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'assets-source', 'targets');
// Cópia idêntica servida pelo Vite (tudo em public/ é copiado para dist/ no
// build), usada pela página de impressão em print/imprimir.html.
const PRINT_DIR = path.resolve(__dirname, '..', 'public', 'print-images');
const TAMANHO = 1000;

// PRNG determinístico (mulberry32) para resultado reproduzível.
function criarPRNG(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ruidoDeTextura(ctx, rand, paletaAccent) {
  // Muitas formas pequenas e variadas espalhadas pela imagem inteira,
  // evitando áreas vazias e padrões repetidos (posições/raios/rotações
  // aleatórios, não uma grade).
  const formas = 140;
  for (let i = 0; i < formas; i++) {
    const x = rand() * TAMANHO;
    const y = rand() * TAMANHO;
    const tamanho = 10 + rand() * 55;
    const tipo = Math.floor(rand() * 3);
    const corBase = paletaAccent[Math.floor(rand() * paletaAccent.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand() * Math.PI * 2);
    ctx.globalAlpha = 0.35 + rand() * 0.5;
    ctx.fillStyle = corBase;
    if (tipo === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, tamanho / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (tipo === 1) {
      ctx.fillRect(-tamanho / 2, -tamanho / 2, tamanho, tamanho * (0.4 + rand() * 0.6));
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -tamanho / 2);
      ctx.lineTo(tamanho / 2, tamanho / 2);
      ctx.lineTo(-tamanho / 2, tamanho / 2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // Linhas finas cruzando a imagem em ângulos variados, para reforçar
  // bordas/gradientes locais (bons pontos de rastreamento).
  ctx.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    ctx.strokeStyle = paletaAccent[i % paletaAccent.length];
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(rand() * TAMANHO, rand() * TAMANHO);
    ctx.lineTo(rand() * TAMANHO, rand() * TAMANHO);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function desenharMoldura(ctx, corBorda) {
  ctx.strokeStyle = corBorda;
  ctx.lineWidth = 18;
  ctx.strokeRect(9, 9, TAMANHO - 18, TAMANHO - 18);
}

function desenharTitulo(ctx, titulo, corTexto, corFundo) {
  const altura = 120;
  ctx.fillStyle = corFundo;
  ctx.fillRect(0, TAMANHO - altura, TAMANHO, altura);
  ctx.fillStyle = corTexto;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Alguns nomes de local são bem mais longos que os originais ("ESCADAS DO
  // ESTACIONAMENTO"); reduz a fonte até caber na largura da folha.
  const larguraMaxima = TAMANHO - 60;
  let tamanhoFonte = 64;
  ctx.font = `bold ${tamanhoFonte}px sans-serif`;
  while (ctx.measureText(titulo).width > larguraMaxima && tamanhoFonte > 28) {
    tamanhoFonte -= 4;
    ctx.font = `bold ${tamanhoFonte}px sans-serif`;
  }
  ctx.fillText(titulo, TAMANHO / 2, TAMANHO - altura / 2);
}

function gerarPortaoEntrada() {
  const rand = criarPRNG(1);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4ecd8';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#0b1030', '#3a1560', '#e6bd54', '#1c3aa8'];
  ruidoDeTextura(ctx, rand, paleta);

  // Grande arco de portão, deslocado do centro (assimetria).
  ctx.fillStyle = '#0b1030';
  ctx.beginPath();
  ctx.moveTo(340, 780);
  ctx.lineTo(340, 480);
  ctx.arc(430, 480, 90, Math.PI, 0, false);
  ctx.lineTo(520, 780);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e6bd54';
  ctx.beginPath();
  ctx.arc(430, 780, 40, 0, Math.PI * 2);
  ctx.fill();

  desenharMoldura(ctx, '#0b1030');
  desenharTitulo(ctx, 'PORTÃO DE ENTRADA', '#f4ecd8', '#0b1030');

  return canvas.toBuffer('image/png');
}

function gerarCadeiras() {
  const rand = criarPRNG(2);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eef7ee';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#0b1030', '#1c8a5a', '#e6763a', '#e6bd54'];
  ruidoDeTextura(ctx, rand, paleta);

  // Fileiras de encostos de cadeira, com jitter de posição/tamanho para
  // não formar uma grade perfeitamente repetida.
  const corCadeira = ['#1c8a5a', '#e6763a'];
  for (let linha = 0; linha < 4; linha++) {
    const y = 160 + linha * 130 + (rand() - 0.5) * 20;
    const quantidade = 4 + Math.floor(rand() * 2);
    for (let i = 0; i < quantidade; i++) {
      const x = 140 + i * 170 + (rand() - 0.5) * 30;
      const largura = 70 + rand() * 20;
      const altura = 90 + rand() * 24;
      ctx.fillStyle = corCadeira[(linha + i) % corCadeira.length];
      ctx.fillRect(x, y, largura, altura);
      ctx.fillRect(x, y + altura, largura, 14);
    }
  }

  desenharMoldura(ctx, '#0b1030');
  desenharTitulo(ctx, 'CADEIRAS', '#eef7ee', '#0b1030');

  return canvas.toBuffer('image/png');
}

function gerarPlayground() {
  const rand = criarPRNG(3);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#cdeffd';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#ff6b6b', '#ffd166', '#06d6a0', '#118ab2'];
  ruidoDeTextura(ctx, rand, paleta);

  // Bola grande deslocada do centro.
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(360, 360, 130, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(360, 230);
  ctx.lineTo(360, 490);
  ctx.stroke();

  // Escorregador (triângulo) do outro lado, assimétrico.
  ctx.fillStyle = '#06d6a0';
  ctx.beginPath();
  ctx.moveTo(620, 240);
  ctx.lineTo(820, 640);
  ctx.lineTo(560, 640);
  ctx.closePath();
  ctx.fill();

  desenharMoldura(ctx, '#118ab2');
  desenharTitulo(ctx, 'PLAYGROUND', '#ffffff', '#118ab2');

  return canvas.toBuffer('image/png');
}

function gerarEscadasEstacionamento() {
  const rand = criarPRNG(4);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a0e26';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#e6bd54', '#8a3fd6', '#f4ecd8', '#3a1560'];
  ruidoDeTextura(ctx, rand, paleta);

  // Degraus subindo em diagonal, deslocados do centro.
  ctx.fillStyle = '#e6bd54';
  const degraus = 6;
  for (let i = 0; i < degraus; i++) {
    const x = 220 + i * 85;
    const y = 700 - i * 80;
    ctx.fillRect(x, y, 85, 700 - y);
  }

  desenharMoldura(ctx, '#e6bd54');
  desenharTitulo(ctx, 'ESCADAS DO ESTACIONAMENTO', '#1a0e26', '#e6bd54');

  return canvas.toBuffer('image/png');
}

function gerarEstacionamento() {
  const rand = criarPRNG(5);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#e4e8f0';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#0b1030', '#3a1560', '#1c3aa8', '#e6bd54'];
  ruidoDeTextura(ctx, rand, paleta);

  // Silhueta de carro, deslocada do centro.
  ctx.fillStyle = '#0b1030';
  ctx.beginPath();
  ctx.moveTo(260, 620);
  ctx.lineTo(300, 500);
  ctx.lineTo(420, 440);
  ctx.lineTo(600, 440);
  ctx.lineTo(700, 500);
  ctx.lineTo(740, 620);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e6bd54';
  ctx.beginPath();
  ctx.arc(340, 630, 45, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(660, 630, 45, 0, Math.PI * 2);
  ctx.fill();

  // Faixa tracejada de vaga, do outro lado.
  ctx.strokeStyle = '#1c3aa8';
  ctx.lineWidth = 14;
  ctx.setLineDash([30, 24]);
  ctx.beginPath();
  ctx.moveTo(150, 200);
  ctx.lineTo(850, 200);
  ctx.stroke();
  ctx.setLineDash([]);

  desenharMoldura(ctx, '#0b1030');
  desenharTitulo(ctx, 'ESTACIONAMENTO', '#e4e8f0', '#0b1030');

  return canvas.toBuffer('image/png');
}

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(PRINT_DIR, { recursive: true });

const arquivos = [
  ['01-portao-entrada.png', gerarPortaoEntrada],
  ['02-cadeiras.png', gerarCadeiras],
  ['03-playground.png', gerarPlayground],
  ['04-escadas-estacionamento.png', gerarEscadasEstacionamento],
  ['05-estacionamento.png', gerarEstacionamento],
];

for (const [nome, gerar] of arquivos) {
  const buffer = gerar();
  const destino = path.join(OUT_DIR, nome);
  writeFileSync(destino, buffer);
  writeFileSync(path.join(PRINT_DIR, nome), buffer);
  console.log(`Gerado: ${destino} (${buffer.length} bytes)`);
}
