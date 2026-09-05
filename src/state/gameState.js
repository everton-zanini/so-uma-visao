import { PISTAS, TOTAL_PISTAS, PONTOS_POR_TESOURO, CUSTO_DICA } from '../config/clues.js';
import { carregarProgresso, salvarProgresso, limparProgresso } from './storage.js';

function progressoInicial(nomeEquipe) {
  return {
    teamName: nomeEquipe || 'Equipe',
    clueIndex: 0,
    collected: PISTAS.map(() => false),
    dicasReveladas: PISTAS.map(() => false),
    score: 0,
    completed: false,
    updatedAt: Date.now(),
  };
}

function calcularPontuacao(progresso) {
  const totalColetados = progresso.collected.filter(Boolean).length;
  const totalDicas = progresso.dicasReveladas.filter(Boolean).length;
  return PONTOS_POR_TESOURO * totalColetados - CUSTO_DICA * totalDicas;
}

// Uma partida salva antes desta versão (com um número diferente de pistas)
// não é compatível com o formato atual — tratamos como "sem partida salva"
// em vez de deixar a UI quebrar tentando ler campos/índices inexistentes.
function progressoCompativel(p) {
  return (
    !!p &&
    Array.isArray(p.collected) &&
    p.collected.length === TOTAL_PISTAS &&
    Array.isArray(p.dicasReveladas) &&
    p.dicasReveladas.length === TOTAL_PISTAS
  );
}

export function obterProgresso(namespace) {
  const p = carregarProgresso(namespace);
  return progressoCompativel(p) ? p : null;
}

export function existePartidaSalva(namespace) {
  const p = obterProgresso(namespace);
  return !!p && !p.completed;
}

export function iniciarNovaPartida(namespace, nomeEquipe) {
  const progresso = progressoInicial(nomeEquipe);
  salvarProgresso(namespace, progresso);
  return progresso;
}

export function obterPistaAtual(progresso) {
  if (!progresso || progresso.completed) return null;
  return PISTAS[progresso.clueIndex] || null;
}

export function coletarTesouro(namespace, progresso, targetIndex) {
  const pistaAtual = obterPistaAtual(progresso);
  if (!pistaAtual || pistaAtual.targetIndex !== targetIndex) {
    return { ok: false, progresso };
  }
  if (progresso.collected[progresso.clueIndex]) {
    return { ok: false, progresso };
  }

  const novoProgresso = {
    ...progresso,
    collected: progresso.collected.map((valor, indice) =>
      indice === progresso.clueIndex ? true : valor
    ),
    clueIndex: progresso.clueIndex + 1,
    updatedAt: Date.now(),
  };
  novoProgresso.completed = novoProgresso.clueIndex >= TOTAL_PISTAS;
  novoProgresso.score = calcularPontuacao(novoProgresso);

  salvarProgresso(namespace, novoProgresso);
  return { ok: true, progresso: novoProgresso };
}

export function revelarDica(namespace, progresso, clueIndex) {
  if (progresso.dicasReveladas[clueIndex]) {
    return { ok: true, progresso, jaRevelada: true };
  }

  const novoProgresso = {
    ...progresso,
    dicasReveladas: progresso.dicasReveladas.map((valor, indice) =>
      indice === clueIndex ? true : valor
    ),
    updatedAt: Date.now(),
  };
  novoProgresso.score = calcularPontuacao(novoProgresso);

  salvarProgresso(namespace, novoProgresso);
  return { ok: true, progresso: novoProgresso, jaRevelada: false };
}

export function reiniciarPartida(namespace) {
  limparProgresso(namespace);
}
