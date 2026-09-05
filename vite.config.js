import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: mode === 'https' ? [basicSsl()] : [],
  optimizeDeps: {
    // O scanner de dependências do esbuild não entende o import
    // "*.worker.js?worker&inline" (sintaxe própria do Vite) usado dentro de
    // mind-ar/src/image-target/{compiler,controller}.js, o que derruba o
    // servidor de dev caso o esbuild tente varrer o pacote inteiro. Por
    // isso excluímos "mind-ar" do pré-bundle e o servimos como ESM nativo.
    exclude: ['mind-ar'],
    // Só que, ao excluir "mind-ar", o scanner também deixa de descobrir as
    // dependências internas dele (tfjs, mediapipe, msgpack, mathjs,
    // ml-matrix, svd-js, tinyqueue), que são CommonJS e precisam do
    // pré-bundle do esbuild para virar ESM (senão o navegador falha com
    // "module/require is not defined"). Listamos aqui exatamente as
    // dependências declaradas no package.json do mind-ar para forçar esse
    // pré-bundle.
    include: [
      '@tensorflow/tfjs',
      '@mediapipe/tasks-vision',
      '@msgpack/msgpack',
      'mathjs',
      'ml-matrix',
      'svd-js',
      'tinyqueue',
      // Dependências CommonJS de folha (via protobufjs dentro do
      // mediapipe, e via o gerador de números aleatórios do tfjs-core)
      // que o scanner não descobre sozinho nesta árvore.
      'long',
      'seedrandom',
    ],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        proof: resolve(__dirname, 'proof.html'),
        imprimir: resolve(__dirname, 'print/imprimir.html'),
      },
    },
  },
}));
