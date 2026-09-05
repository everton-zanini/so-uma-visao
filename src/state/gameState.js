import { PISTAS, TOTAL_PISTAS, PONTOS_POR_TESOURO } from '../config/clues.js';
import { carregarProgresso, salvarProgresso, limparProgresso } from './storage.js';

function progressoInicial(nomeEquipe) {
  return {
    teamName: nomeEquipe || 'Equipe',
    clueIndex: 0,
    collected: PISTAS.map(() => false),
    score: 0,
    completed: false,
    updatedAt: Date.now(),
  };
}

export function obterProgresso(namespace) {
  return carregarProgresso(namespace);
}

export function existePartidaSalva(namespace) {
  const p = carregarProgresso(namespace);
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
    score: progresso.score + PONTOS_POR_TESOURO,
    clueIndex: progresso.clueIndex + 1,
    updatedAt: Date.now(),
  };
  novoProgresso.completed = novoProgresso.clueIndex >= TOTAL_PISTAS;

  salvarProgresso(namespace, novoProgresso);
  return { ok: true, progresso: novoProgresso };
}

export function reiniciarPartida(namespace) {
  limparProgresso(namespace);
}
