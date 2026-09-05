import { PISTAS, TOTAL_PISTAS } from '../config/clues.js';
import {
  obterProgresso,
  existePartidaSalva,
  iniciarNovaPartida,
  obterPistaAtual,
  coletarTesouro,
  revelarDica,
  reiniciarPartida,
} from '../state/gameState.js';
import { arController } from '../ar/arController.js';
import { criarVisualizadorDemo, simularDescoberta } from '../demo/demoScene.js';
import { MiniViewer3D } from '../ui/miniViewer.js';
import { criarBau } from '../ar/treasures3d.js';
import { mostrarTela, mostrarModal, esconderModal, el, definirSeloDemo } from './dom.js';

let modo = 'real';
let progresso = null;
let demoViewer = null;
let finalViewer = null;
let finalBauRefs = null;
let tampaAberta = false;

function namespaceAtual() {
  return modo === 'demo' ? 'demo' : 'real';
}

function verificarPartidaSalva() {
  el('btn-continuar').classList.toggle('oculto', !existePartidaSalva('real'));
}

function irParaTelaAtual() {
  if (!progresso) {
    mostrarTela('tela-inicio');
    return;
  }
  if (progresso.completed) {
    mostrarTelaFinal();
  } else {
    mostrarTelaPista();
  }
}

function comecarPartida(modoEscolhido) {
  const nome = el('input-nome-equipe').value.trim() || 'Equipe';
  modo = modoEscolhido;
  progresso = iniciarNovaPartida(namespaceAtual(), nome);
  definirSeloDemo(modo === 'demo');
  irParaTelaAtual();
}

function continuarPartidaReal() {
  const salvo = obterProgresso('real');
  if (!salvo) return;
  modo = 'real';
  progresso = salvo;
  definirSeloDemo(false);
  irParaTelaAtual();
}

function renderizarDicaExtra(pista) {
  const revelada = progresso.dicasReveladas[progresso.clueIndex];
  el('btn-revelar-dica').classList.toggle('oculto', revelada);
  el('bloco-dica-extra').classList.toggle('oculto', !revelada);
  el('dica-extra-texto').textContent = revelada ? pista.dicaExtra : '';
}

function aoClicarRevelarDica() {
  mostrarModal('modal-confirmar-dica');
}

function aoConfirmarRevelarDica() {
  const resultado = revelarDica(namespaceAtual(), progresso, progresso.clueIndex);
  progresso = resultado.progresso;
  esconderModal('modal-confirmar-dica');
  mostrarTelaPista();
}

function aoCancelarRevelarDica() {
  esconderModal('modal-confirmar-dica');
}

function mostrarTelaPista() {
  const pista = obterPistaAtual(progresso);
  if (!pista) {
    irParaTelaAtual();
    return;
  }

  el('indicador-progresso-pista').textContent = `Pista ${progresso.clueIndex + 1} de ${TOTAL_PISTAS}`;
  el('pista-texto').textContent = pista.texto;
  renderizarDicaExtra(pista);

  const ehDemo = modo === 'demo';
  el('btn-procurar').classList.toggle('oculto', ehDemo);
  el('btn-simular').classList.toggle('oculto', !ehDemo);
  el('cena-demo-pista').classList.toggle('oculto', !ehDemo);

  // Mostrar a tela (e por tabela o container) ANTES de construir o
  // MiniViewer3D: se o container ainda estiver dentro de uma seção
  // "display:none", clientWidth/clientHeight ficam em 0 e a cena nunca
  // aparece.
  mostrarTela('tela-pista');

  if (demoViewer) {
    demoViewer.destruir();
    demoViewer = null;
  }
  if (ehDemo) {
    demoViewer = criarVisualizadorDemo(el('cena-demo-pista'), progresso);
  }
}

function aoClicarSimular() {
  const resultado = simularDescoberta(progresso);
  if (!resultado.ok) return;
  progresso = resultado.progresso;
  if (demoViewer) {
    demoViewer.destruir();
    demoViewer = null;
  }
  irParaTelaAtual();
}

function resetarPainelDescoberta() {
  el('ar-container-jogo').classList.remove('oculto');
  el('btn-coletar').classList.remove('oculto');
  el('btn-coletar').disabled = true;
  el('erro-caixa-jogo').classList.add('oculto');
  el('btn-tentar-demo-apos-erro').classList.add('oculto');
  el('confirmacao-coleta').classList.add('oculto');
}

function aoClicarProcurar() {
  const pista = obterPistaAtual(progresso);
  if (!pista) return;
  resetarPainelDescoberta();
  el('pista-lembrete').textContent = 'Aponte a câmera para a imagem da pista atual.';
  mostrarTela('tela-descoberta');
  arController.iniciar(el('ar-container-jogo'), pista.targetIndex, progresso.collected);
}

function aoClicarSairAR() {
  arController.parar();
  mostrarTelaPista();
}

function mostrarConfirmacaoColeta(pista) {
  el('ar-container-jogo').classList.add('oculto');
  el('btn-coletar').classList.add('oculto');
  el('erro-caixa-jogo').classList.add('oculto');
  el('btn-tentar-demo-apos-erro').classList.add('oculto');
  el('confirmacao-titulo').textContent = `Tesouro coletado: ${pista.tesouro.nome}!`;
  el('confirmacao-texto').textContent = `+100 pontos. Pontuação total: ${progresso.score}.`;
  el('confirmacao-coleta').classList.remove('oculto');
}

function aoClicarColetar() {
  const pista = obterPistaAtual(progresso);
  if (!pista) return;
  const resultado = coletarTesouro('real', progresso, pista.targetIndex);
  if (!resultado.ok) return;
  progresso = resultado.progresso;
  arController.parar();
  mostrarConfirmacaoColeta(pista);
}

function aoClicarContinuarAposColeta() {
  irParaTelaAtual();
}

function aoClicarTentarDemo() {
  arController.parar();
  const nomeAtual = progresso ? progresso.teamName : el('input-nome-equipe').value.trim() || 'Equipe';
  const existente = obterProgresso('demo');
  modo = 'demo';
  progresso = existente && !existente.completed ? existente : iniciarNovaPartida('demo', nomeAtual);
  definirSeloDemo(true);
  irParaTelaAtual();
}

function renderizarInventario() {
  const grade = el('grade-inventario');
  grade.innerHTML = '';
  PISTAS.forEach((pista, indice) => {
    const coletado = progresso.collected[indice];
    const slot = document.createElement('div');
    slot.className = `slot${coletado ? ' slot--coletado' : ''}`;
    const icone = document.createElement('span');
    icone.className = 'slot-icone';
    icone.textContent = coletado ? pista.tesouro.icone : '❔';
    const nome = document.createElement('span');
    nome.textContent = coletado ? pista.tesouro.nome : '???';
    slot.append(icone, nome);
    grade.appendChild(slot);
  });
  el('pontuacao-total').textContent = `${progresso.score} pontos`;
}

function aoClicarVerInventario() {
  renderizarInventario();
  mostrarTela('tela-inventario');
}

function aoClicarFecharInventario() {
  irParaTelaAtual();
}

function mostrarTelaFinal() {
  el('mensagem-final').classList.add('oculto');
  el('equipe-final').classList.add('oculto');
  el('dicas-usadas-final').classList.add('oculto');
  el('pontuacao-final').classList.add('oculto');
  el('btn-abrir-tesouro').classList.remove('oculto');
  el('btn-abrir-tesouro').disabled = false;
  el('aviso-demo-final').classList.toggle('oculto', modo !== 'demo');
  el('equipe-final').textContent = `Equipe: ${progresso.teamName}`;
  const totalDicas = progresso.dicasReveladas.filter(Boolean).length;
  el('dicas-usadas-final').textContent = `Dicas utilizadas: ${totalDicas}`;
  el('pontuacao-final').textContent = `${progresso.score} pontos`;
  tampaAberta = false;

  mostrarTela('tela-final');

  if (finalViewer) {
    finalViewer.destruir();
    finalViewer = null;
  }
  finalViewer = new MiniViewer3D(el('cena-final'));
  const { grupo, grupoTampa } = criarBau();
  grupo.scale.setScalar(0.7);
  finalBauRefs = { grupoTampa };
  finalViewer.definirConteudo(grupo);
  finalViewer.aoAnimar((tempo) => {
    grupo.rotation.y = Math.sin(tempo * 0.5) * 0.3;
  });
}

function animarAberturaTampa() {
  const inicioTempo = performance.now();
  const duracao = 800;
  function passo(agora) {
    const t = Math.min(1, (agora - inicioTempo) / duracao);
    if (finalBauRefs) finalBauRefs.grupoTampa.rotation.x = -Math.PI * 0.65 * t;
    if (t < 1) {
      requestAnimationFrame(passo);
    } else {
      el('mensagem-final').classList.remove('oculto');
      el('equipe-final').classList.remove('oculto');
      el('dicas-usadas-final').classList.remove('oculto');
      el('pontuacao-final').classList.remove('oculto');
    }
  }
  requestAnimationFrame(passo);
}

function aoClicarAbrirTesouro() {
  if (tampaAberta) return;
  tampaAberta = true;
  el('btn-abrir-tesouro').disabled = true;
  animarAberturaTampa();
}

function aoClicarReiniciar() {
  mostrarModal('modal-confirmar');
}

function aoConfirmarReiniciar() {
  reiniciarPartida(namespaceAtual());
  progresso = null;
  modo = 'real';
  if (finalViewer) {
    finalViewer.destruir();
    finalViewer = null;
  }
  if (demoViewer) {
    demoViewer.destruir();
    demoViewer = null;
  }
  definirSeloDemo(false);
  esconderModal('modal-confirmar');
  verificarPartidaSalva();
  mostrarTela('tela-inicio');
}

function aoCancelarReiniciar() {
  esconderModal('modal-confirmar');
}

function conectarEventosAR() {
  const rotulosEstado = {
    inativo: 'inativo',
    inicializando: 'inicializando…',
    procurando: 'procurando imagem',
    'alvo-encontrado': 'imagem encontrada',
    erro: 'erro',
  };

  arController.on('onEstadoMudou', (estado) => {
    const indicador = el('indicador-estado-jogo');
    indicador.className = `pastilha estado estado--${estado}`;
    indicador.textContent = rotulosEstado[estado] || estado;
    if (estado !== 'alvo-encontrado') {
      el('btn-coletar').disabled = true;
    }
  });

  arController.on('onAlvoCorreto', () => {
    el('btn-coletar').disabled = false;
  });

  arController.on('onAlvoErrado', () => {
    el('erro-caixa-jogo').textContent = 'Essa não é a pista atual. Siga a pista e procure a imagem certa.';
    el('erro-caixa-jogo').classList.remove('oculto');
    el('btn-coletar').disabled = true;
  });

  arController.on('onAlvoPerdido', () => {
    el('btn-coletar').disabled = true;
    el('erro-caixa-jogo').classList.add('oculto');
  });

  arController.on('onErro', (mensagem) => {
    el('erro-caixa-jogo').textContent = mensagem;
    el('erro-caixa-jogo').classList.remove('oculto');
    el('btn-tentar-demo-apos-erro').classList.remove('oculto');
    el('btn-coletar').disabled = true;
  });

  arController.on('onAvisoWebview', () => {
    el('erro-caixa-jogo').textContent =
      'Se a câmera não abrir, você pode estar em um navegador interno de outro aplicativo. Tente abrir este link no navegador padrão do celular (Chrome ou Safari).';
    el('erro-caixa-jogo').classList.remove('oculto');
  });
}

export function iniciarApp() {
  conectarEventosAR();
  verificarPartidaSalva();

  el('btn-comecar').addEventListener('click', () => comecarPartida('real'));
  el('btn-modo-demo').addEventListener('click', () => comecarPartida('demo'));
  el('btn-continuar').addEventListener('click', continuarPartidaReal);

  el('btn-revelar-dica').addEventListener('click', aoClicarRevelarDica);
  el('btn-confirmar-dica').addEventListener('click', aoConfirmarRevelarDica);
  el('btn-cancelar-dica').addEventListener('click', aoCancelarRevelarDica);

  el('btn-procurar').addEventListener('click', aoClicarProcurar);
  el('btn-simular').addEventListener('click', aoClicarSimular);
  el('btn-sair-ar').addEventListener('click', aoClicarSairAR);
  el('btn-coletar').addEventListener('click', aoClicarColetar);
  el('btn-continuar-apos-coleta').addEventListener('click', aoClicarContinuarAposColeta);
  el('btn-tentar-demo-apos-erro').addEventListener('click', aoClicarTentarDemo);

  el('btn-ver-inventario').addEventListener('click', aoClicarVerInventario);
  el('btn-fechar-inventario').addEventListener('click', aoClicarFecharInventario);

  el('btn-abrir-tesouro').addEventListener('click', aoClicarAbrirTesouro);
  el('btn-reiniciar').addEventListener('click', aoClicarReiniciar);
  el('btn-confirmar-reiniciar').addEventListener('click', aoConfirmarReiniciar);
  el('btn-cancelar-reiniciar').addEventListener('click', aoCancelarReiniciar);

  mostrarTela('tela-inicio');
}
