# Verificações e limitações reais

Este documento é uma descrição honesta do que foi efetivamente verificado neste ambiente de desenvolvimento (uma máquina Windows sem celular físico conectado, usando um Chrome controlado por automação) e do que continua pendente de teste manual em aparelhos reais.

## Ambiente de verificação disponível

- Node.js, npm, build do Vite.
- Um Chrome real controlado via automação (Chrome DevTools), incluindo DOM, console, network, redimensionamento de viewport (útil para simular orientação retrato/paisagem).
- **Sem** acesso a uma câmera física nem a um celular real. O Chrome de automação expõe um dispositivo de vídeo (`videoinput`) na lista de `enumerateDevices()`, mas **não há, neste conjunto de ferramentas, um jeito de conceder ou negar a permissão de câmera do navegador** — o prompt nativo de permissão fica pendente indefinidamente quando acionado por automação. Ou seja: dá para verificar que o app *chega corretamente* até o ponto de pedir a câmera, mas não dá para verificar visualmente o rastreamento em si.

## O que foi verificado (com evidência)

- **`npm run build`**: build de produção limpo, sem erros, gerando `index.html`, `proof.html` e `print/imprimir.html` — incluindo a resolução de `mind-ar/src/image-target/three.js`, `three/addons/renderers/CSS3DRenderer.js` e a sintaxe de worker `?worker&inline` usada internamente pelo mind-ar.
- **`npm run dev`**: servidor de desenvolvimento limpo (zero erros de console), depois de resolver 3 problemas reais encontrados nesta sessão (detalhados abaixo em "Bugs encontrados e corrigidos").
- **Carregamento do arquivo de alvos**: `proof.html` busca `targets/proof/card.mind` (o alvo oficial de exemplo do mind-ar-js) com sucesso; `index.html` busca `targets/treasure-hunt.mind` (nossos 3 alvos) com sucesso.
- **Validação estrutural do `treasure-hunt.mind` pelo parser real do MindAR**: chamamos `Compiler.importData()` (a mesma classe usada em tempo de execução pelo jogo) diretamente no navegador sobre o arquivo compilado e confirmamos 3 alvos, cada um 1000×1000, cada um com dados de *matching* (11 níveis de pirâmide) e de *tracking* presentes. Isso comprova que o `.mind` gerado é válido e carregável pelo MindAR de verdade — não é um arquivo vazio, fictício ou só renomeado.
- **Início da câmera até o limite do ambiente**: em `proof.html` e em `index.html`, clicar em "Iniciar câmera"/"Procurar tesouro" corretamente passa pelas checagens prévias (contexto seguro, `getUserMedia` disponível, WebGL disponível, `.mind` carregável), cria a instância do `MindARThree` sem erros, e chama `getUserMedia` de verdade (ficando bloqueado exatamente no prompt de permissão nativo do navegador — não antes, não depois).
- **Mensagens de erro** (tratamento próprio, sem depender do MindAR para isso — ver observação abaixo): testado forçando um caminho de `.mind` inexistente — a mensagem "Falha ao carregar o arquivo de alvos" aparece corretamente e a câmera nunca chega a ser solicitada.
- **Modo demonstração — fluxo completo**: nome da equipe → pista 1/2/3 → "Simular descoberta" em cada uma → inventário mostrando coletados/pendentes corretamente → tela final com baú 3D → animação de abertura da tampa → mensagem final, nome da equipe e "300 pontos" → reiniciar com confirmação → `localStorage` de demo e de partida real corretamente limpos e **nunca compartilhados entre si**.
- **Regras de pontuação/sequência/bloqueio (namespace real)**: verificado chamando diretamente `coletarTesouro()` (a mesma função usada pela UI) — coletar o alvo certo avança a pista e soma 100 pontos; coletar um alvo errado/fora de ordem é bloqueado (`ok:false`, nada muda); ao final, `score` é 300 e `completed:true`, tudo refletido no `localStorage`.
- **Persistência**: iniciar uma partida real, recarregar a página (`location.reload()`) e ver o botão "Continuar partida salva" aparecer e retomar exatamente a mesma pista/equipe.
- **Redimensionamento/orientação**: `proof.html` testado em 390×844 (retrato) e 844×390 (paisagem) — sem quebra de layout nem overflow horizontal (em paisagem aparece uma rolagem vertical leve, aceitável já que o app é desenhado prioritariamente para retrato).

## Bugs encontrados e corrigidos nesta sessão

Registrados aqui porque são exatamente o tipo de problema de integração que o projeto anterior sofreu — e porque a correção faz parte do artefato entregue, não é só um comentário.

1. **Dev server caía com `?worker&inline`**: importar `mind-ar` diretamente (sem excluir do pré-bundle do esbuild) faz o *scanner* de dependências do Vite tentar interpretar a sintaxe de worker `?worker&inline` usada dentro de `mind-ar/src/image-target/compiler.js`/`controller.js` — sintaxe que só o pipeline completo do Vite entende, não o esbuild sozinho. Corrigido excluindo `mind-ar` do pré-bundle (`optimizeDeps.exclude`).
2. **`module is not defined` / `require is not defined` no navegador**: consequência do item 1 — ao excluir `mind-ar` do pré-bundle, suas dependências transitivas CommonJS (`@tensorflow/tfjs`, `@mediapipe/tasks-vision`, `mathjs`, `ml-matrix`, `svd-js`, `tinyqueue`, e as bibliotecas de folha `long` e `seedrandom`) deixam de ser descobertas automaticamente e são servidas cruas. Corrigido listando-as explicitamente em `optimizeDeps.include`.
3. **Checagem de ".mind não encontrado" dava falso negativo em dev**: o servidor de dev do Vite responde **200 com uma página HTML de fallback** para um caminho inexistente, em vez de um 404 real — então checar só `response.ok` não detectava um alvo realmente ausente. Corrigido checando também que o `content-type` da resposta não é `text/html`.
4. **Cena 3D do modo demonstração e da tela final apareciam em branco/distorcidas**: o código criava o `MiniViewer3D` (que mede `clientWidth`/`clientHeight` do container para configurar a câmera) **antes** de tornar a tela visível — com a seção ainda em `display:none`, a medida dava 0 e a câmera ficava com proporção inválida. Corrigido invertendo a ordem (mostrar a tela primeiro, só then construir o visualizador). Também ajustada a altura da cena 3D da tela final (que antes herdava `flex:1` numa tela quase vazia e ficava alta/estreita demais, distorcendo a câmera).

## O que continua pendente (não foi e não podia ser verificado aqui)

- **Rastreamento real de imagem** com uma câmera física apontada para os alvos impressos: encontrar o alvo, ancorar o objeto 3D corretamente sobre ele, perder o alvo ao tirar o celular de vista.
- **Permitir/negar permissão de câmera** de verdade (o navegador de automação não expõe esse controle).
- **iPhone/Safari**: nenhum teste — Safari tem particularidades conhecidas de `getUserMedia`/WebGL que só aparecem em um iPhone real.
- **Android/Chrome real**: nenhum teste em aparelho físico (só em Chrome desktop via automação).
- **Navegador embutido de app** (Instagram/TikTok/Facebook): o aviso existe no código (heurística de `user-agent`), mas nunca foi testado dentro de um desses apps de verdade.
- **Retomar do segundo plano** (trocar de app e voltar): não testável sem um SO móvel real gerenciando o ciclo de vida da aba.

Essas pendências viraram o roteiro manual em [`TESTE-MANUAL.md`](TESTE-MANUAL.md) — **nenhuma delas deve ser considerada "ok" até ser executada em um aparelho real**.

## Limitação conhecida e aceita (não é bug): mensagens de erro de câmera genéricas

Lendo o código-fonte de `mind-ar/src/image-target/three.js`: quando `getUserMedia` falha, o próprio `MindARThree.start()` engole o erro original (`reject()` sem argumento) — ou seja, **não há como saber, a partir da API pública do MindAR, se a falha foi "permissão negada", "câmera ocupada" ou outro motivo**, sem duplicar a chamada de câmera (o que o projeto evita deliberadamente, por instrução explícita de não abrir a câmera separadamente do MindAR). Por isso, esse caso específico mostra uma mensagem genérica ("verifique a permissão e se outro app não está usando a câmera") — os outros casos (HTTPS ausente, `getUserMedia` inexistente, WebGL ausente, `.mind` não encontrado) têm mensagens específicas, verificadas nesta sessão.

## Avisos de console conhecidos (não são erros)

- `THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead.` — o próprio código interno do `mind-ar@1.2.5` ainda usa a API antiga do three.js; é só um aviso de depreciação, não quebra nada com `three@0.160.0`.
- `The kernel '...' for backend 'webgl' is already registered` (dezenas de linhas) — efeito colateral, só em modo de desenvolvimento, de o TensorFlow.js ser inicializado duas vezes (uma pelo nosso `optimizeDeps.include`, outra pela cópia interna do mind-ar). Não aparece no build de produção e não tem efeito funcional observado.
