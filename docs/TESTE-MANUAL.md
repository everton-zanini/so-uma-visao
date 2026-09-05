# Roteiro de teste manual (Android/Chrome e iPhone/Safari)

Nenhum destes testes foi executado em aparelho físico — foram verificados apenas o build, o fluxo de demonstração e a integração até o limite da câmera (ver `VERIFICACOES-E-LIMITACOES.md`). Execute este roteiro antes do evento, idealmente em pelo menos um Android/Chrome e um iPhone/Safari.

## Preparação

1. Imprima os 5 alvos em `print/imprimir.html` (uma folha A4 por imagem, sem cortar as bordas) e fixe cada um no local correto (ver `print/imprimir.html` — material só do organizador, com o local e a resposta de cada alvo).
2. No computador que vai servir o jogo: `npm run dev:https -- --host` e anote o endereço `https://<ip-da-rede>:5173`.
3. No celular, conectado à **mesma rede Wi-Fi**, abra esse endereço no navegador (Chrome no Android, Safari no iPhone).
4. Aceite o aviso de certificado autoassinado ("avançar mesmo assim" / "visitar este site").

## Roteiro

Marque cada item como ✅ (passou), ⚠️ (passou com ressalva — anote) ou ❌ (falhou — anote o que aconteceu).

### 1. Acesso e permissão de câmera
- [ ] Abrir o link: a tela inicial aparece corretamente, sem erro.
- [ ] Clicar em "Começar" → "Procurar tesouro": o navegador pede permissão de câmera.
- [ ] **Permitir**: o vídeo da câmera aparece atrás da interface, estado muda para "procurando imagem".
- [ ] Sair do jogo, entrar de novo, e **negar** a permissão desta vez: aparece uma mensagem clara (não uma tela em branco/travada), e existe um caminho visível para tentar de novo ou usar o modo demonstração.

### 2. Rastreamento
- [ ] Apontar a câmera para o alvo 1 (portão de entrada — ver mapeamento no material do organizador): o cristal azul aparece ancorado sobre a imagem, com uma pequena animação de flutuação/rotação.
- [ ] Afastar a câmera até perder a imagem de vista: o cristal desaparece e o botão "Coletar" fica desabilitado.
- [ ] Apontar de novo para a mesma imagem: o cristal reaparece e "Coletar" volta a habilitar.
- [ ] Apontar para um alvo **errado** (qualquer um dos outros 4, estando na pista 1): o jogo orienta a seguir a pista atual e **não** libera a coleta.
- [ ] Mover/inclinar o celular com o alvo ainda visível: o objeto 3D acompanha o alvo (não fica "grudado" na tela).

### 3. Coleta
- [ ] Com o alvo certo visível, tocar "Coletar": a câmera é encerrada, aparece a confirmação com o nome do tesouro e a pontuação, e a próxima pista é liberada.
- [ ] Conferir no inventário que o tesouro aparece como coletado.
- [ ] Repetir para os 5 alvos, na ordem: portão de entrada → cadeiras → playground → escadas do estacionamento → estacionamento.
- [ ] Ao final: baú 3D aparece sem pedir câmera, "Abrir tesouro" mostra a animação e a mensagem final, com o nome da equipe, a quantidade de dicas usadas e a pontuação (até 500 pontos: 100 por tesouro coletado, menos 30 por cada dica extra revelada).

### 4. Dica extra (novo)
- [ ] Na tela de uma pista ainda não revelada, o botão "Revelar dica (-30 pontos)" aparece e nenhum texto extra é mostrado.
- [ ] Tocar o botão: aparece um pedido de confirmação explicando o desconto antes de revelar qualquer coisa.
- [ ] Cancelar a confirmação: nada é descontado, a dica continua oculta.
- [ ] Confirmar: a dica extra aparece, o botão some, e a pontuação (visível no inventário/tela final) reflete o desconto de 30 pontos.
- [ ] Sair da tela da pista e voltar (ex: abrir o inventário e fechar): a dica revelada continua visível, sem novo desconto.
- [ ] Recarregar a página (com partida em andamento) e continuar a partida salva: a dica revelada permanece visível e o desconto não é aplicado de novo.

### 5. Local e resposta não aparecem para o jogador
- [ ] Em nenhuma tela do jogo (pista, busca por AR, confirmação de coleta, inventário) aparece o nome do local físico (ex: "portão de entrada", "playground") — só o enigma, a dica extra (se revelada) e o indicador "Pista N de 5".
- [ ] O nome/ícone do tesouro só aparece **depois** de coletado (na confirmação de coleta e no inventário), nunca antes.

### 6. Sair/retomar
- [ ] No meio do jogo (após coletar 1 tesouro), fechar a aba/app e abrir de novo: a tela inicial oferece "Continuar partida salva" e retoma exatamente de onde parou.
- [ ] Durante a tela de câmera, apertar "Sair": a câmera é liberada (a luz/indicador de câmera do celular apaga) e volta para a tela da pista sem coletar nada.
- [ ] Trocar de app (ex: abrir outro aplicativo) enquanto a câmera está ativa, depois voltar ao navegador: o jogo não trava, e a câmera pode ser retomada ou reiniciada sem duplicar vídeos/travar.

### 7. Orientação e tela
- [ ] Girar o celular para paisagem e de volta para retrato durante a tela de câmera: o vídeo e o objeto 3D continuam alinhados (sem esticar/deslocar).
- [ ] Testar com o brilho da tela baixo e em ambiente iluminado: os textos continuam legíveis sobre o vídeo da câmera.

### 8. Modo demonstração
- [ ] Escolher "Modo demonstração" na tela inicial: funciona sem pedir câmera.
- [ ] O rótulo "Modo demonstração" fica visível durante toda a sessão.
- [ ] Progresso do modo demonstração não aparece misturado com o de uma partida real (jogar os dois em sequência e conferir que cada um mantém sua própria pontuação/pista).
- [ ] Ao concluir as 5 pistas em modo demonstração, a tela final mostra claramente um aviso de que esse resultado **não vale para a competição**.

### 9. Navegador embutido de app (se aplicável no evento)
- [ ] Abrir o link de dentro do Instagram/TikTok/WhatsApp: verificar se aparece o aviso sugerindo abrir no navegador padrão, e se abrir no navegador padrão resolve o problema.

## Registro de resultados

Para cada aparelho testado, anote: modelo, sistema operacional, navegador e versão, e o resultado de cada item acima. Isso vira a base real de "navegadores/dispositivos efetivamente testados" a divulgar para o evento — não prometa suporte a nenhum aparelho que não tenha passado por este roteiro.
