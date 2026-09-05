// Configuração fixa das 3 pistas do jogo. O índice de cada pista deve
// corresponder exatamente ao índice do alvo dentro de treasure-hunt.mind
// (mesma ordem usada em scripts/compile-targets.mjs).

export const TARGETS_SRC = '/targets/treasure-hunt.mind';

export const PONTOS_POR_TESOURO = 100;

export const PISTAS = [
  {
    id: 'recepcao',
    targetIndex: 0,
    local: 'Recepção',
    texto: 'Toda aventura começa com uma boa acolhida.',
    tesouro: {
      tipo: 'cristal',
      nome: 'Cristal azul',
      icone: '🔷',
    },
  },
  {
    id: 'convivencia',
    targetIndex: 1,
    local: 'Área de convivência',
    texto: 'Procure onde a turma se reúne para conversar.',
    tesouro: {
      tipo: 'estrela',
      nome: 'Estrela dourada',
      icone: '⭐',
    },
  },
  {
    id: 'palco',
    targetIndex: 2,
    local: 'Palco',
    texto: 'Onde a voz ganha força e todos prestam atenção.',
    tesouro: {
      tipo: 'chave',
      nome: 'Chave roxa',
      icone: '🔑',
    },
  },
];

export const TOTAL_PISTAS = PISTAS.length;
export const PONTUACAO_MAXIMA = TOTAL_PISTAS * PONTOS_POR_TESOURO;
