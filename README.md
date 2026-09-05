# Missão Tesouro

Caça ao tesouro em realidade aumentada (rastreamento de imagem) para uma partida no salão da igreja. Uma equipe segue 5 pistas, aponta a câmera do celular para 5 imagens impressas e coleta tesouros virtuais em 3D. O nome do local de cada pista e a resposta são informações só do organizador — a interface do jogador mostra apenas o enigma, a dica extra (opcional, com desconto de pontos) e o progresso "Pista N de 5".

- **AR**: [MindAR](https://github.com/hiukim/mind-ar-js) (rastreamento de imagem) — **sem WebXR**.
- **3D**: Three.js.
- **Build/dev server**: Vite.
- **UI**: HTML + CSS puros (sem framework).
- **Progresso**: `localStorage` (sem backend, sem login).

Leia também: [`docs/VERIFICACOES-E-LIMITACOES.md`](docs/VERIFICACOES-E-LIMITACOES.md) (o que foi validado e o que ficou pendente), [`docs/TESTE-MANUAL.md`](docs/TESTE-MANUAL.md) (roteiro para Android/iPhone reais) e [`docs/ROTEIRO-APRESENTACAO.md`](docs/ROTEIRO-APRESENTACAO.md) (roteiro de 3 minutos).

## Versões fixadas

| Pacote | Versão | Por quê |
|---|---|---|
| `mind-ar` | `1.2.5` | única versão publicada no npm (não existem os pacotes `mindar-image-three`/`mindar-image` às vezes citados por aí) |
| `three` | `0.160.0` | mínimo exigido pelo mind-ar é `>=0.136.0`, mas a fonte do mind-ar importa `three/addons/...` (só existe a partir do `three@0.150.0`) e `sRGBEncoding` (removido em versões bem mais novas do three) — `0.160.0` é a mais recente testada nesta sessão que atende as duas exigências |
| `vite` | `5.4.21` | mesma major que o próprio mind-ar usa para testar seus exemplos (`vite@^5.0.11`); evitamos pular para o Vite 8 (não testado com essa combinação) |
| `@vitejs/plugin-basic-ssl` | `1.2.0` | versão compatível com Vite 5 (a `2.x` exige Vite 6+) |
| `canvas` | *(fora da árvore de instalação)* | usado só pelos scripts Node de geração/compilação dos alvos (`scripts/generate-target-images.mjs`, `scripts/compile-targets.mjs`); removido como dependência declarada para não quebrar o deploy (o build de produção do Vite nunca importa `canvas`) — instale-o temporariamente com `npm install canvas@2.11.2 --no-save` só quando for rodar esses scripts, ver seção abaixo |

Todas fixadas sem `^`/`~` no `package.json`, com `package-lock.json` versionado.

## Requisitos do ambiente

- **Node.js 20 LTS** (recomendado; testado com `v20.19.0`). O pacote `canvas` (usado só para compilar os alvos) não tem binário pré-compilado publicado para Node 23 no Windows — `npm install` falha tentando compilar do zero. Se você usa `nvm-windows`/`nvm4w`:
  ```
  nvm install 20.19.0
  nvm use 20.19.0
  ```

## Instalação

```
npm install
```

## Rodar em desenvolvimento

```
npm run dev
```

Abre em `http://localhost:5173` (ou outra porta livre). Duas páginas:
- `/index.html` — o jogo completo.
- `/proof.html` — a prova técnica mínima (Etapa 1: só a câmera + 1 cubo sobre o alvo oficial de exemplo).
- `/print/imprimir.html` — página de impressão dos 5 alvos (material só do organizador).

## Testar no celular (câmera exige HTTPS)

A API de câmera do navegador (`getUserMedia`) só funciona em **HTTPS** ou em `localhost`. Para testar no celular pela rede local:

```
npm run dev:https
```

Isso ativa um certificado HTTPS autoassinado (`@vitejs/plugin-basic-ssl`). Depois:
1. Anote o endereço "Network" que o Vite mostrar no terminal (ex: `https://192.168.0.10:5173`) — rode com `-- --host` se ele não aparecer:
   ```
   npm run dev:https -- --host
   ```
2. Abra esse endereço no navegador do celular (mesma rede Wi-Fi).
3. O navegador vai avisar que o certificado não é confiável (é autoassinado) — escolha "avançar/continuar mesmo assim". Isso é esperado em desenvolvimento.
4. Se estiver dentro do navegador embutido de outro app (Instagram/TikTok/Facebook), abra o link no navegador padrão do celular (Chrome ou Safari) — o jogo tenta detectar isso e avisar, mas a detecção não é 100% garantida.

## Build de produção

```
npm run build
npm run preview
```

`npm run preview` também sobe com HTTPS (necessário para testar a câmera a partir do build final). O resultado fica em `dist/` — é um site 100% estático (pode ser hospedado em qualquer servidor HTTPS estático).

## Compilar os alvos de rastreamento (`.mind`)

As 5 imagens de rastreamento já estão geradas em `assets-source/targets/` e o arquivo compilado já está em `public/targets/treasure-hunt.mind` (versionado). Só rode os scripts abaixo se for **trocar as imagens**:

```
node scripts/generate-target-images.mjs   # gera as 5 imagens-fonte (opcional, só se quiser recriá-las)
npm run compile-targets                   # compila assets-source/targets/*.png -> public/targets/treasure-hunt.mind
```

Os dois scripts usam o pacote nativo `canvas` (node-canvas), que **não** faz parte da árvore de instalação do projeto (foi removido de propósito — ver "Versões fixadas" abaixo — para não quebrar o deploy). Para rodá-los localmente, instale o `canvas` de forma temporária e desfaça depois:

```
npm install canvas@2.11.2 --no-save   # instala só para esta sessão, sem alterar package.json/package-lock.json
node scripts/generate-target-images.mjs
npm run compile-targets
npm uninstall canvas                  # remove de novo; depois rode "npm install" se quiser conferir que nada mudou
```

`compile-targets` usa o compilador **oficial** do MindAR (`OfflineCompiler`, de `mind-ar/src/image-target/offline-compiler.js`) rodando em Node puro (via `node-canvas`), a mesma lógica da ferramenta web oficial — sem precisar de navegador nem de câmera. A ordem dos arquivos define o índice de cada alvo; esse índice precisa bater com `targetIndex` em `src/config/clues.js`.

## Imagens de rastreamento e impressão

- `assets-source/targets/01-portao-entrada.png`, `02-cadeiras.png`, `03-playground.png`, `04-escadas-estacionamento.png`, `05-estacionamento.png`: as mesmas imagens usadas para compilar `treasure-hunt.mind`, em alta resolução (1000×1000), com bom contraste e detalhes assimétricos espalhados por toda a área (nada de espaços vazios grandes nem padrões repetidos) — pensadas para bom rastreamento por *features*.
- `print/imprimir.html`: página pronta para impressão, uma imagem por folha (A4), com título e instruções **fora** da área da imagem rastreada. Contém o nome do local e o tesouro de cada alvo — material só do organizador, nunca linkado do jogo.

## Estrutura do projeto

```
proof.html, src/proof/main.js     Etapa 1 — prova técnica mínima (1 alvo oficial, 1 cubo)
index.html, src/main.js           Etapa 2 — jogo completo
src/config/clues.js                Pistas (5), mapeamento de alvos, tesouros, pontuação e custo da dica extra
src/state/                         Estado do jogo + persistência (localStorage) — coleta e dica extra
src/ar/arController.js             Única fonte de verdade do ciclo de vida do MindAR
src/ar/treasures3d.js              Fábricas de geometrias Three.js (cristal, estrela, chave, moeda, gema, baú, cubo)
src/ui/                            Telas (vanilla DOM), sem framework
src/demo/demoScene.js              Lógica do modo demonstração (progresso separado, sem câmera)
scripts/compile-targets.mjs         Compilação oficial dos 5 alvos (Node, sem navegador)
scripts/generate-target-images.mjs  Geração das 5 imagens-fonte
print/imprimir.html                 Página de impressão (material só do organizador)
```

## Navegadores/dispositivos efetivamente testados

Ver [`docs/VERIFICACOES-E-LIMITACOES.md`](docs/VERIFICACOES-E-LIMITACOES.md). Resumo: build e fluxo completo verificados em Chrome desktop (via automação); **nenhum teste em câmera física de celular foi possível neste ambiente de desenvolvimento** — isso é um roteiro manual pendente, descrito em [`docs/TESTE-MANUAL.md`](docs/TESTE-MANUAL.md).

## Fora de escopo (V1)

Login, multiplayer, ranking online, GPS, QR code, painel administrativo, backend, serviços pagos, PWA/offline.
