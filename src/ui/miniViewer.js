import * as THREE from 'three';

// Visualizador 3D simples, sem MindAR/câmera, usado no modo demonstração
// e na tela final (baú). Cada instância cria seu próprio renderer; sempre
// chamar destruir() ao trocar de tela para não acumular renderers/loops.
export class MiniViewer3D {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    this.camera.position.set(0, 0.3, 1.4);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    const luz = new THREE.HemisphereLight(0xffffff, 0x2a2050, 1.3);
    this.scene.add(luz);
    const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.7);
    luzDirecional.position.set(0.6, 1, 0.8);
    this.scene.add(luzDirecional);

    this.grupoConteudo = new THREE.Group();
    this.scene.add(this.grupoConteudo);

    this.relogio = new THREE.Clock();
    this._ativo = true;
    this._aoAnimar = null;

    this._redimensionar();
    this._resizeHandler = () => this._redimensionar();
    window.addEventListener('resize', this._resizeHandler);

    this.renderer.setAnimationLoop(() => this._loop());
  }

  _redimensionar() {
    const largura = this.container.clientWidth || 1;
    const altura = this.container.clientHeight || 1;
    this.renderer.setSize(largura, altura);
    this.camera.aspect = largura / altura;
    this.camera.updateProjectionMatrix();
  }

  definirConteudo(objeto3d) {
    this.grupoConteudo.clear();
    this.grupoConteudo.add(objeto3d);
  }

  aoAnimar(callback) {
    this._aoAnimar = callback;
  }

  _loop() {
    if (!this._ativo) return;
    const tempo = this.relogio.getElapsedTime();
    if (this._aoAnimar) this._aoAnimar(tempo, this.grupoConteudo);
    this.renderer.render(this.scene, this.camera);
  }

  destruir() {
    this._ativo = false;
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this._resizeHandler);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
