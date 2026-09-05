// Gera as 3 imagens de rastreamento (assets-source/targets/*.png), usadas
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
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(titulo, TAMANHO / 2, TAMANHO - altura / 2);
}

function gerarRecepcao() {
  const rand = criarPRNG(1);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#f4ecd8';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#0b1030', '#3a1560', '#e6bd54', '#1c3aa8'];
  ruidoDeTextura(ctx, rand, paleta);

  // Grande arco de "porta de entrada", deslocado do centro (assimetria).
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
  desenharTitulo(ctx, 'RECEPÇÃO', '#f4ecd8', '#0b1030');

  return canvas.toBuffer('image/png');
}

function gerarConvivencia() {
  const rand = criarPRNG(2);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eef7ee';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#0b1030', '#1c8a5a', '#e6763a', '#e6bd54'];
  ruidoDeTextura(ctx, rand, paleta);

  // Dois "balões de conversa" sobrepostos, fora do centro.
  ctx.fillStyle = '#1c8a5a';
  ctx.beginPath();
  ctx.ellipse(360, 340, 150, 105, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(300, 420);
  ctx.lineTo(260, 480);
  ctx.lineTo(340, 430);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e6763a';
  ctx.beginPath();
  ctx.ellipse(620, 500, 130, 95, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(690, 560);
  ctx.lineTo(740, 610);
  ctx.lineTo(650, 570);
  ctx.closePath();
  ctx.fill();

  desenharMoldura(ctx, '#0b1030');
  desenharTitulo(ctx, 'ÁREA DE CONVIVÊNCIA', '#eef7ee', '#0b1030');

  return canvas.toBuffer('image/png');
}

function gerarPalco() {
  const rand = criarPRNG(3);
  const canvas = createCanvas(TAMANHO, TAMANHO);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1a0e26';
  ctx.fillRect(0, 0, TAMANHO, TAMANHO);

  const paleta = ['#e6bd54', '#8a3fd6', '#f4ecd8', '#3a1560'];
  ruidoDeTextura(ctx, rand, paleta);

  // Cone de luz de holofote, deslocado, mais uma estrela grande (voz em
  // destaque) fora do centro.
  ctx.fillStyle = 'rgba(230,189,84,0.55)';
  ctx.beginPath();
  ctx.moveTo(500, 0);
  ctx.lineTo(230, 760);
  ctx.lineTo(770, 760);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#8a3fd6';
  ctx.beginPath();
  const cx = 620;
  const cy = 330;
  const pontas = 5;
  const rExt = 95;
  const rInt = 40;
  for (let i = 0; i < pontas * 2; i++) {
    const raio = i % 2 === 0 ? rExt : rInt;
    const ang = (i / (pontas * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(ang) * raio;
    const y = cy + Math.sin(ang) * raio;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  desenharMoldura(ctx, '#e6bd54');
  desenharTitulo(ctx, 'PALCO', '#1a0e26', '#e6bd54');

  return canvas.toBuffer('image/png');
}

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(PRINT_DIR, { recursive: true });

const arquivos = [
  ['01-recepcao.png', gerarRecepcao],
  ['02-convivencia.png', gerarConvivencia],
  ['03-palco.png', gerarPalco],
];

for (const [nome, gerar] of arquivos) {
  const buffer = gerar();
  const destino = path.join(OUT_DIR, nome);
  writeFileSync(destino, buffer);
  writeFileSync(path.join(PRINT_DIR, nome), buffer);
  console.log(`Gerado: ${destino} (${buffer.length} bytes)`);
}
