// Stub: nunca deve ser executado em produção. O único consumidor real de 'canvas'
// é mind-ar/src/image-target/offline-compiler.js, que não faz parte do bundle do app
// (só é importado por scripts/compile-targets.mjs, rodado localmente).
function unavailable() {
  throw new Error(
    "canvas-stub: pacote 'canvas' real não está instalado. " +
      "Rode `npm install canvas --no-save` localmente para usar scripts/compile-targets.mjs."
  );
}

module.exports = {
  createCanvas: unavailable,
  loadImage: unavailable,
  Image: unavailable,
};
