import * as THREE from 'three';
import { MindARThree } from 'mind-ar/src/image-target/three.js';
import { TARGETS_SRC, PISTAS } from '../config/clues.js';
import {
  criarCristalAzul,
  criarEstrelaDourada,
  criarChaveRoxa,
  animarFlutuacao,
} from './treasures3d.js';

const FABRICAS_POR_TIPO = {
  cristal: criarCristalAzul,
  estrela: criarEstrelaDourada,
  chave: criarChaveRoxa,
};

function webviewSuspeito() {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Line\/|MicroMessenger|TikTok|GSA\/|Twitter/i.test(ua);
}

async function preFlight(targetSrc) {
  if (!window.isSecureContext) {
    throw new Error(
      'A câmera só funciona em conexão segura (HTTPS) ou em "localhost". Peça para o organizador servir o jogo com "npm run dev:https" (ou abrir via https://).'
    );
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Este navegador não oferece acesso à câmera. Tente atualizar o navegador ou usar outro aparelho.');
  }
  const canvasTeste = document.createElement('canvas');
  const gl = canvasTeste.getContext('webgl') || canvasTeste.getContext('experimental-webgl');
  if (!gl) {
    throw new Error('Este aparelho/navegador não suporta WebGL, necessário para mostrar os tesouros em 3D.');
  }
  let resposta;
  try {
    resposta = await fetch(targetSrc, { method: 'GET', cache: 'no-store' });
  } catch (_err) {
    throw new Error('Falha de rede ao carregar as imagens de rastreamento. Verifique sua conexão e tente de novo.');
  }
  const tipoConteudo = resposta.headers.get('content-type') || '';
  if (!resposta.ok || tipoConteudo.includes('text/html')) {
    throw new Error('Não foi possível carregar as imagens de rastreamento (.mind). Avise o organizador do jogo.');
  }
}

class ARController {
  constructor() {
    this.mindarThree = null;
    this.anchors = [];
    this.estado = 'inativo';
    this.targetIndexEsperado = null;
    this.callbacks = {};
    this.relogio = new THREE.Clock();
    this.anchorVisivelIndex = null;
  }

  on(evento, callback) {
    this.callbacks[evento] = callback;
  }

  _emitirEstado(novoEstado) {
    this.estado = novoEstado;
    if (this.callbacks.onEstadoMudou) this.callbacks.onEstadoMudou(novoEstado);
  }

  _criarInstancia(container) {
    this.mindarThree = new MindARThree({
      container,
      imageTargetSrc: TARGETS_SRC,
      maxTrack: 1,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
    });

    const luz = new THREE.HemisphereLight(0xffffff, 0x2a2050, 1.2);
    this.mindarThree.scene.add(luz);
    const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.6);
    luzDirecional.position.set(0.5, 1, 0.5);
    this.mindarThree.scene.add(luzDirecional);

    PISTAS.forEach((pista, indice) => {
      const anchor = this.mindarThree.addAnchor(pista.targetIndex);
      const fabrica = FABRICAS_POR_TIPO[pista.tesouro.tipo];
      const objeto3d = fabrica();
      objeto3d.scale.setScalar(1.6);
      anchor.group.add(objeto3d);

      anchor.onTargetFound = () => {
        this.anchorVisivelIndex = pista.targetIndex;
        if (pista.targetIndex === this.targetIndexEsperado) {
          this._emitirEstado('alvo-encontrado');
          if (this.callbacks.onAlvoCorreto) this.callbacks.onAlvoCorreto(pista.targetIndex);
        } else if (this.callbacks.onAlvoErrado) {
          this.callbacks.onAlvoErrado(pista.targetIndex);
        }
      };
      anchor.onTargetLost = () => {
        if (this.anchorVisivelIndex === pista.targetIndex) {
          this.anchorVisivelIndex = null;
        }
        if (this.estado !== 'erro') {
          this._emitirEstado('procurando');
          if (this.callbacks.onAlvoPerdido) this.callbacks.onAlvoPerdido(pista.targetIndex);
        }
      };

      this.anchors.push({ anchor, objeto3d, targetIndex: pista.targetIndex });
    });

    this.mindarThree.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  _loopRender() {
    const tempo = this.relogio.getElapsedTime();
    this.anchors.forEach(({ objeto3d, targetIndex }, indice) => {
      if (targetIndex === this.anchorVisivelIndex) {
        animarFlutuacao(objeto3d, tempo, indice);
      }
    });
    if (this.mindarThree) {
      this.mindarThree.renderer.render(this.mindarThree.scene, this.mindarThree.camera);
    }
  }

  async iniciar(container, targetIndexEsperado) {
    this.targetIndexEsperado = targetIndexEsperado;
    this.anchorVisivelIndex = null;
    this._emitirEstado('inicializando');

    if (webviewSuspeito() && this.callbacks.onAvisoWebview) {
      this.callbacks.onAvisoWebview();
    }

    try {
      await preFlight(TARGETS_SRC);
    } catch (err) {
      this._emitirEstado('erro');
      if (this.callbacks.onErro) this.callbacks.onErro(err.message);
      return false;
    }

    if (!this.mindarThree) {
      this._criarInstancia(container);
    }

    try {
      await this.mindarThree.start();
    } catch (_err) {
      try {
        this.mindarThree.stop();
      } catch (_ignorado) {
        /* câmera pode nunca ter iniciado */
      }
      this._emitirEstado('erro');
      if (this.callbacks.onErro) {
        this.callbacks.onErro(
          'Não foi possível acessar a câmera. Verifique se a permissão de câmera foi concedida e se nenhum outro aplicativo está usando a câmera agora.'
        );
      }
      return false;
    }

    this.mindarThree.renderer.setAnimationLoop(() => this._loopRender());
    this._emitirEstado('procurando');
    return true;
  }

  parar() {
    if (!this.mindarThree) return;
    this.mindarThree.renderer.setAnimationLoop(null);
    try {
      this.mindarThree.stop();
    } catch (_err) {
      /* já parado */
    }
    this.anchorVisivelIndex = null;
    this._emitirEstado('inativo');
  }
}

export const arController = new ARController();
