// Configuração fixa das 5 pistas do jogo. O índice de cada pista deve
// corresponder exatamente ao índice do alvo dentro de treasure-hunt.mind
// (mesma ordem usada em scripts/compile-targets.mjs).
//
// "local" é informação do organizador (material de impressão/montagem) e
// NUNCA deve ser exibida na interface do jogador — só "texto" (enigma),
// "iconePista" (um símbolo ambiente, sempre visível, que remete ao local de
// forma sutil/abstrata — nunca o objeto óbvio do lugar) e, depois de
// revelada, "dicaExtra".

export const TARGETS_SRC = '/targets/treasure-hunt.mind';

export const PONTOS_POR_TESOURO = 100;
export const CUSTO_DICA = 30;

export const PISTAS = [
  {
    id: 'portao-entrada',
    targetIndex: 0,
    local: 'Portão de entrada',
    iconePista: '🚦',
    texto:
      'Separo dois lados sem escolher nenhum.\n' +
      'Quando cedo, permito; quando resisto, impeço.\n' +
      'Quem chega me enfrenta antes de pertencer ao que está além.\n' +
      'Procurem onde a passagem depende de uma abertura.',
    dicaExtra: 'O evento acontece lá dentro, mas o primeiro limite fica antes dele.',
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
    iconePista: '👥',
    texto:
      'Somos muitos, mas repetimos a mesma forma.\n' +
      'Sustentamos quem ouve, sem entender uma palavra.\n' +
      'Temos costas, mas não nos deitamos.\n' +
      'Quando todos olham para um só lugar, permanecemos atrás de cada um.',
    dicaExtra: 'Durante a mensagem, quase todo mundo depende de uma de nós.',
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
    iconePista: '🔄',
    texto:
      'Aqui, partir nem sempre significa sair do lugar.\n' +
      'Há viagens que terminam onde começaram\n' +
      'e descidas procuradas por vontade própria.\n' +
      'Os menores costumam compreender este destino antes dos maiores.',
    dicaExtra: 'Neste lugar, ir e voltar pode ser a própria diversão.',
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
    iconePista: '📶',
    texto:
      'Aproximo o que está separado sem diminuir a distância.\n' +
      'Sou feita de diferenças que se vencem uma por vez.\n' +
      'Para quem chega, posso ser subida;\n' +
      'para quem volta, a mesma resposta muda de sentido.',
    dicaExtra: 'Ligo o lugar onde os veículos ficam a outro nível.',
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
    iconePista: '🧭',
    texto:
      'Recebo quem trouxe vocês, mas não participa do encontro.\n' +
      'Guardo força em silêncio e caminhos em repouso.\n' +
      'Aqui, muitos ficam lado a lado\n' +
      'até que cada um volte a seguir sua própria direção.',
    dicaExtra: 'O que espera aqui costuma ter rodas.',
    tesouro: {
      tipo: 'gema',
      nome: 'Gema verde',
      icone: '💚',
    },
  },
];

export const TOTAL_PISTAS = PISTAS.length;
export const PONTUACAO_MAXIMA = TOTAL_PISTAS * PONTOS_POR_TESOURO;
