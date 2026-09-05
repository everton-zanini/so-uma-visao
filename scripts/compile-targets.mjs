// Compila as 5 imagens de assets-source/targets/ em public/targets/treasure-hunt.mind
// usando o compilador oficial do MindAR (mind-ar/src/image-target/offline-compiler.js),
// a mesma lógica usada pela ferramenta web oficial — só que rodando em Node puro
// (via node-canvas), sem precisar de navegador nem de câmera.
//
// A ORDEM dos arquivos abaixo define o índice de cada alvo (0 a 4), que deve
// corresponder ao targetIndex configurado em src/config/clues.js.
import { OfflineCompiler } from 'mind-ar/src/image-target/offline-compiler.js';
import { loadImage } from 'canvas';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '..', 'assets-source', 'targets');
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'targets');
const OUT_FILE = path.join(OUT_DIR, 'treasure-hunt.mind');

const ARQUIVOS_NA_ORDEM = [
  '01-portao-entrada.png',
  '02-cadeiras.png',
  '03-playground.png',
  '04-escadas-estacionamento.png',
  '05-estacionamento.png',
];

async function main() {
  console.log('Carregando imagens-fonte...');
  const imagens = [];
  for (const nome of ARQUIVOS_NA_ORDEM) {
    const caminho = path.join(SRC_DIR, nome);
    const img = await loadImage(caminho);
    console.log(`  [${imagens.length}] ${nome} — ${img.width}x${img.height}`);
    imagens.push(img);
  }

  console.log('Compilando alvos (isso pode levar alguns segundos por imagem)...');
  const compiler = new OfflineCompiler();
  await compiler.compileImageTargets(imagens, (percent) => {
    process.stdout.write(`\r  progresso: ${percent.toFixed(1)}%   `);
  });
  process.stdout.write('\n');

  const buffer = compiler.exportData();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, Buffer.from(buffer));
  console.log(`Arquivo gerado: ${OUT_FILE} (${buffer.byteLength} bytes)`);
}

main().catch((err) => {
  console.error('Falha ao compilar os alvos:', err);
  process.exitCode = 1;
});
