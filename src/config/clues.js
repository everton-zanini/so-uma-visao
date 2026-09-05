// Configuração fixa das 5 pistas do jogo. O índice de cada pista deve
// corresponder exatamente ao índice do alvo dentro de treasure-hunt.mind
// (mesma ordem usada em scripts/compile-targets.mjs).
//
// "local" é informação do organizador (material de impressão/montagem) e
// NUNCA deve ser exibida na interface do jogador — só "texto" (enigma) e,
// depois de revelada, "dicaExtra".

export const TARGETS_SRC = '/targets/treasure-hunt.mind';

export const PONTOS_POR_TESOURO = 100;
export const CUSTO_DICA = 30;

export const PISTAS = [
  {
    id: 'portao-entrada',
    targetIndex: 0,
    local: 'Portão de entrada',
    texto: 'Toda jornada começa por onde todos entram e saem.',
    dicaExtra: 'É o primeiro lugar que você atravessa ao chegar ao salão — o caminho de entrada.',
    tesouro: {
      tipo: 'cristal',
      nome: 'Cristal azul',
      icone: '🔷',
    },
  },
  {
    id: 'cadeiras',
    targetIndex: 1,
    local: 'Cadeiras',
    texto: 'Procure onde tantos se sentam, lado a lado, esperando o que vem a seguir.',
    dicaExtra: 'Fileiras enfileiradas, prontas para quem chega e se acomoda para o culto.',
    tesouro: {
      tipo: 'estrela',
      nome: 'Estrela dourada',
      icone: '⭐',
    },
  },
  {
    id: 'playground',
    targetIndex: 2,
    local: 'Playground',
    texto: 'Onde a alegria salta mais alto e o brincar nunca para.',
    dicaExtra: 'É a área de recreação, com brinquedos para as crianças.',
    tesouro: {
      tipo: 'chave',
      nome: 'Chave roxa',
      icone: '🔑',
    },
  },
  {
    id: 'escadas-estacionamento',
    targetIndex: 3,
    local: 'Escadas do estacionamento',
    texto: 'Degrau a degrau, o caminho leva para onde os carros ficam guardados.',
    dicaExtra: 'Procure a escada que liga o salão ao estacionamento.',
    tesouro: {
      tipo: 'moeda',
      nome: 'Moeda dourada',
      icone: '🪙',
    },
  },
  {
    id: 'estacionamento',
    targetIndex: 4,
    local: 'Estacionamento',
    texto: 'O último passo da jornada é onde os carros descansam, esperando a volta para casa.',
    dicaExtra: 'É a área externa onde os carros ficam estacionados.',
    tesouro: {
      tipo: 'gema',
      nome: 'Gema verde',
      icone: '💚',
    },
  },
];

export const TOTAL_PISTAS = PISTAS.length;
export const PONTUACAO_MAXIMA = TOTAL_PISTAS * PONTOS_POR_TESOURO;
