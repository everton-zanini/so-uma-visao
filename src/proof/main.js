import * as THREE from 'three';
import { MindARThree } from 'mind-ar/src/image-target/three.js';

const TARGET_SRC = '/targets/proof/card.mind';

const els = {
  container: document.getElementById('ar-container'),
  estado: document.getElementById('indicador-estado'),
  erroCaixa: document.getElementById('erro-caixa'),
  btnIniciar: document.getElementById('btn-iniciar'),
  btnParar: document.getElementById('btn-parar'),
};

let mindarThree = null;
let cubo = null;
let estadoAtual = 'inativo';

function definirEstado(novoEstado, mensagem) {
  estadoAtual = novoEstado;
  els.estado.className = `pastilha estado estado--${novoEstado}`;
  const rotulos = {
    inativo: 'inativo',
    inicializando: 'inicializando…',
    procurando: 'procurando imagem',
    'alvo-encontrado': 'imagem encontrada',
    erro: 'erro',
  };
  els.estado.textContent = mensagem || rotulos[novoEstado] || novoEstado;
}

function mostrarErro(mensagem) {
  els.erroCaixa.textContent = mensagem;
  els.erroCaixa.classList.remove('oculto');
}

function limparErro() {
  els.erroCaixa.classList.add('oculto');
  els.erroCaixa.textContent = '';
}

function webviewSuspeito() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|GSA\/|Twitter/i.test(ua);
}

async function preFlight() {
  if (!window.isSecureContext) {
    throw new Error(
      'A câmera só funciona em conexão segura (HTTPS) ou em "localhost". Abra o endereço com https:// ou sirva o projeto com "npm run dev:https".'
    );
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Este navegador não oferece acesso à câmera (API getUserMedia ausente). Atualize o navegador ou use outro dispositivo.'
    );
  }
  const canvasTeste = document.createElement('canvas');
  const gl = canvasTeste.getContext('webgl') || canvasTeste.getContext('experimental-webgl');
  if (!gl) {
    throw new Error('Este navegador/dispositivo não suporta WebGL, necessário para exibir os objetos 3D.');
  }
  let respostaAlvo;
  try {
    respostaAlvo = await fetch(TARGET_SRC, { method: 'GET', cache: 'no-store' });
  } catch (_err) {
    throw new Error('Falha de rede ao carregar o arquivo de alvos (.mind). Verifique sua conexão e tente novamente.');
  }
  const tipoConteudo = respostaAlvo.headers.get('content-type') || '';
  // Alguns servidores (inclusive o servidor de dev do Vite) respondem 200
  // com uma página HTML de fallback para caminhos inexistentes em vez de
  // um 404 real. Um .mind válido nunca é "text/html", então tratamos esse
  // caso também como "arquivo de alvos não encontrado".
  if (!respostaAlvo.ok || tipoConteudo.includes('text/html')) {
    throw new Error(`Falha ao carregar o arquivo de alvos (.mind) em ${TARGET_SRC}. Verifique se o arquivo existe e tente novamente.`);
  }
}

function criarInstancia() {
  mindarThree = new MindARThree({
    container: els.container,
    imageTargetSrc: TARGET_SRC,
    maxTrack: 1,
    uiLoading: 'no',
    uiScanning: 'no',
    uiError: 'no',
  });

  const luz = new THREE.HemisphereLight(0xffffff, 0x223055, 1.1);
  mindarThree.scene.add(luz);

  const anchor = mindarThree.addAnchor(0);
  const geometria = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const material = new THREE.MeshNormalMaterial();
  cubo = new THREE.Mesh(geometria, material);
  anchor.group.add(cubo);

  anchor.onTargetFound = () => {
    if (estadoAtual !== 'erro') definirEstado('alvo-encontrado');
  };
  anchor.onTargetLost = () => {
    if (estadoAtual !== 'erro') definirEstado('procurando');
  };

  mindarThree.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const relogio = new THREE.Clock();
  mindarThree.renderer.setAnimationLoop(() => {
    const dt = relogio.getDelta();
    if (cubo) {
      cubo.rotation.x += dt * 0.6;
      cubo.rotation.y += dt * 0.9;
    }
    mindarThree.renderer.render(mindarThree.scene, mindarThree.camera);
  });
}

async function aoClicarIniciar() {
  limparErro();
  els.btnIniciar.disabled = true;
  definirEstado('inicializando');

  try {
    await preFlight();
    if (!mindarThree) {
      criarInstancia();
    }
    await mindarThree.start();
    definirEstado('procurando');
    els.btnIniciar.classList.add('oculto');
    els.btnParar.classList.remove('oculto');
  } catch (err) {
    try {
      if (mindarThree) mindarThree.stop();
    } catch (_ignorado) {
      /* câmera pode nunca ter iniciado; nada a liberar */
    }
    definirEstado('erro');
    const mensagemConhecida = err && err.message;
    mostrarErro(
      mensagemConhecida ||
        'Não foi possível acessar a câmera. Verifique se você concedeu a permissão de câmera, se nenhum outro aplicativo está usando a câmera, e tente novamente.'
    );
    els.btnIniciar.disabled = false;
  }
}

function aoClicarParar() {
  if (!mindarThree) return;
  mindarThree.stop();
  definirEstado('inativo');
  els.btnParar.classList.add('oculto');
  els.btnIniciar.classList.remove('oculto');
  els.btnIniciar.disabled = false;
}

els.btnIniciar.addEventListener('click', aoClicarIniciar);
els.btnParar.addEventListener('click', aoClicarParar);

if (webviewSuspeito()) {
  mostrarErro(
    'Parece que você está em um navegador interno de outro aplicativo (Instagram, TikTok, Facebook, etc.). Se a câmera não funcionar, abra este link no navegador padrão do celular (Chrome ou Safari).'
  );
}

definirEstado('inativo');
