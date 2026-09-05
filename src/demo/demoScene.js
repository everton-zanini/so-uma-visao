import { PISTAS } from '../config/clues.js';
import {
  criarCristalAzul,
  criarEstrelaDourada,
  criarChaveRoxa,
  animarFlutuacao,
} from '../ar/treasures3d.js';
import { obterPistaAtual, coletarTesouro } from '../state/gameState.js';
import { MiniViewer3D } from '../ui/miniViewer.js';

const NAMESPACE_DEMO = 'demo';

const FABRICAS_POR_TIPO = {
  cristal: criarCristalAzul,
  estrela: criarEstrelaDourada,
  chave: criarChaveRoxa,
};

export function criarVisualizadorDemo(container, progresso) {
  const viewer = new MiniViewer3D(container);
  const pista = obterPistaAtual(progresso);
  if (pista) {
    const objeto3d = FABRICAS_POR_TIPO[pista.tesouro.tipo]();
    objeto3d.scale.setScalar(1.8);
    viewer.definirConteudo(objeto3d);
    viewer.aoAnimar((tempo) => animarFlutuacao(objeto3d, tempo));
  }
  return viewer;
}

export function simularDescoberta(progresso) {
  const pista = obterPistaAtual(progresso);
  if (!pista) return { ok: false, progresso };
  return coletarTesouro(NAMESPACE_DEMO, progresso, pista.targetIndex);
}

export { NAMESPACE_DEMO, PISTAS };
