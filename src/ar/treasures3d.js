import * as THREE from 'three';

// Só geometrias/materiais nativos do Three.js — sem modelos, texturas ou
// fontes externas, conforme o escopo do MVP. Estilo low-poly consistente:
// poucos segmentos, flatShading, sem sombra/pós-processamento.

const ALTURA_HASTE_BASE = 0.085; // topo da haste dourada da base — onde cada emblema começa

// Base pequena de troféu, compartilhada pelos 5 tesouros: prisma hexagonal
// escuro + friso dourado + haste dourada. Só o emblema em cima muda.
function criarBaseTrofeu() {
  const grupo = new THREE.Group();

  const materialBase = new THREE.MeshStandardMaterial({
    color: 0x2a1f45,
    flatShading: true,
    roughness: 0.55,
    metalness: 0.2,
  });
  const materialDourado = new THREE.MeshStandardMaterial({
    color: 0xe6bd54,
    emissive: 0x7a5a10,
    emissiveIntensity: 0.45,
    flatShading: true,
    roughness: 0.35,
    metalness: 0.55,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.035, 6), materialBase);
  base.position.y = 0.0175;
  grupo.add(base);

  const friso = new THREE.Mesh(new THREE.CylinderGeometry(0.101, 0.101, 0.01, 6), materialDourado);
  friso.position.y = 0.04;
  grupo.add(friso);

  const haste = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.04, 6), materialDourado);
  haste.position.y = 0.065;
  grupo.add(haste);

  return grupo;
}

export function criarTrofeuChaveAcolhida() {
  const grupo = criarBaseTrofeu();
  const material = new THREE.MeshStandardMaterial({
    color: 0xe6bd54,
    emissive: 0x7a5a10,
    emissiveIntensity: 0.55,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.55,
  });

  const emblema = new THREE.Group();
  const argola = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 6, 8), material);
  argola.position.y = 0.075;
  emblema.add(argola);

  const haste = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.13, 0.026), material);
  haste.position.y = -0.015;
  emblema.add(haste);

  const dente1 = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.026, 0.026), material);
  dente1.position.set(0.028, -0.06, 0);
  emblema.add(dente1);

  const dente2 = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.026, 0.026), material);
  dente2.position.set(0.024, -0.105, 0);
  emblema.add(dente2);

  emblema.position.y = ALTURA_HASTE_BASE;
  grupo.add(emblema);
  return grupo;
}

export function criarTrofeuCristalEscuta() {
  const grupo = criarBaseTrofeu();
  const geometria = new THREE.OctahedronGeometry(0.15, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x3a6bff,
    emissive: 0x16255e,
    emissiveIntensity: 0.55,
    flatShading: true,
    roughness: 0.25,
    metalness: 0.15,
  });
  const cristal = new THREE.Mesh(geometria, material);
  cristal.position.y = ALTURA_HASTE_BASE + 0.14;
  grupo.add(cristal);
  return grupo;
}

export function criarTrofeuEstrelaAlegria() {
  const grupo = criarBaseTrofeu();
  const pontas = 5;
  const raioExterno = 0.17;
  const raioInterno = 0.07;
  const forma = new THREE.Shape();
  for (let i = 0; i < pontas * 2; i++) {
    const raio = i % 2 === 0 ? raioExterno : raioInterno;
    const angulo = (i / (pontas * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angulo) * raio;
    const y = Math.sin(angulo) * raio;
    if (i === 0) forma.moveTo(x, y);
    else forma.lineTo(x, y);
  }
  forma.closePath();

  // depth generosa (não uma "moeda" fina): girando em torno do eixo Y
  // (animarFlutuacao), uma extrusão fina desaparece de perfil por boa parte
  // do giro — com mais espessura a estrela continua reconhecível de
  // qualquer ângulo.
  const geometria = new THREE.ExtrudeGeometry(forma, { depth: 0.1, bevelEnabled: false });
  geometria.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0x8a5a10,
    emissiveIntensity: 0.55,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.35,
  });
  const estrela = new THREE.Mesh(geometria, material);
  estrela.position.y = ALTURA_HASTE_BASE + 0.11;
  grupo.add(estrela);
  return grupo;
}

export function criarTrofeuChamaPerseveranca() {
  const grupo = criarBaseTrofeu();

  const materialExterna = new THREE.MeshStandardMaterial({
    color: 0xff7a3c,
    emissive: 0x7a2e0a,
    emissiveIntensity: 0.5,
    flatShading: true,
    roughness: 0.4,
    metalness: 0.15,
  });
  const materialInterna = new THREE.MeshStandardMaterial({
    color: 0xffd166,
    emissive: 0x8a5a10,
    emissiveIntensity: 0.6,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.2,
  });

  const chamaExterna = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), materialExterna);
  chamaExterna.position.y = ALTURA_HASTE_BASE + 0.11;
  grupo.add(chamaExterna);

  const chamaInterna = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 6), materialInterna);
  chamaInterna.position.y = ALTURA_HASTE_BASE + 0.15;
  chamaInterna.rotation.z = 0.12;
  grupo.add(chamaInterna);

  return grupo;
}

export function criarTrofeuBussolaProposito() {
  const grupo = criarBaseTrofeu();

  const materialDisco = new THREE.MeshStandardMaterial({
    color: 0xc99a2e,
    emissive: 0x6b4a10,
    emissiveIntensity: 0.4,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.5,
  });
  const materialAgulhaNorte = new THREE.MeshStandardMaterial({
    color: 0xe6bd54,
    emissive: 0x7a5a10,
    emissiveIntensity: 0.55,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.5,
  });
  const materialAgulhaSul = new THREE.MeshStandardMaterial({
    color: 0x8a3fd6,
    emissive: 0x3a1560,
    emissiveIntensity: 0.45,
    flatShading: true,
    roughness: 0.35,
    metalness: 0.3,
  });

  // Disco "de pé" (como um medalhão), não deitado feito uma mesinha: um
  // disco deitado (eixo no Y, igual ao giro de animarFlutuacao) mostra só a
  // borda fina o tempo todo para uma câmera de frente. De pé, ele encara a
  // câmera na maior parte do giro, como qualquer outro troféu.
  const centroY = ALTURA_HASTE_BASE + 0.13;
  const disco = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8), materialDisco);
  disco.rotation.x = Math.PI / 2;
  disco.position.y = centroY;
  grupo.add(disco);

  const agulhaNorte = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.11, 6), materialAgulhaNorte);
  agulhaNorte.position.set(0, centroY + 0.06, 0.012);
  grupo.add(agulhaNorte);

  const agulhaSul = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.11, 6), materialAgulhaSul);
  agulhaSul.rotation.z = Math.PI;
  agulhaSul.position.set(0, centroY - 0.06, 0.012);
  grupo.add(agulhaSul);

  return grupo;
}

export function criarBau() {
  const grupo = new THREE.Group();
  const materialMadeira = new THREE.MeshStandardMaterial({
    color: 0x6b4a2f,
    roughness: 0.8,
    metalness: 0.05,
  });
  const materialDourado = new THREE.MeshStandardMaterial({
    color: 0xe6bd54,
    roughness: 0.3,
    metalness: 0.6,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.32), materialMadeira);
  base.position.y = 0;
  grupo.add(base);

  const fivela = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), materialDourado);
  fivela.position.set(0, 0.05, 0.17);
  grupo.add(fivela);

  const grupoTampa = new THREE.Group();
  grupoTampa.position.set(0, 0.14, -0.16);
  const tampa = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.32), materialMadeira);
  tampa.position.set(0, 0.08, 0.16);
  grupoTampa.add(tampa);
  grupo.add(grupoTampa);

  return { grupo, grupoTampa };
}

export function criarCuboProva() {
  const geometria = new THREE.BoxGeometry(0.35, 0.35, 0.35);
  const material = new THREE.MeshNormalMaterial();
  return new THREE.Mesh(geometria, material);
}

export function animarFlutuacao(objeto, tempo, offset = 0) {
  objeto.rotation.y = tempo * 0.8 + offset;
  objeto.position.y = 0.03 * Math.sin(tempo * 2 + offset);
}
