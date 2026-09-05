import * as THREE from 'three';

// Só geometrias/materiais nativos do Three.js — sem modelos, texturas ou
// fontes externas, conforme o escopo do MVP.

export function criarCristalAzul() {
  const grupo = new THREE.Group();
  const geometria = new THREE.OctahedronGeometry(0.16, 0);
  const material = new THREE.MeshStandardMaterial({
    color: 0x3a6bff,
    emissive: 0x1c3aa8,
    emissiveIntensity: 0.6,
    roughness: 0.25,
    metalness: 0.1,
  });
  const cristal = new THREE.Mesh(geometria, material);
  grupo.add(cristal);
  return grupo;
}

export function criarEstrelaDourada() {
  const grupo = new THREE.Group();
  const pontas = 5;
  const raioExterno = 0.18;
  const raioInterno = 0.075;
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

  const geometria = new THREE.ExtrudeGeometry(forma, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
  geometria.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0xe6bd54,
    emissive: 0x7a5a10,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.4,
  });
  const estrela = new THREE.Mesh(geometria, material);
  grupo.add(estrela);
  return grupo;
}

export function criarChaveRoxa() {
  const grupo = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0x8a3fd6,
    emissive: 0x3a1560,
    emissiveIntensity: 0.5,
    roughness: 0.35,
    metalness: 0.3,
  });

  const argola = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.022, 12, 24), material);
  argola.position.y = 0.1;
  grupo.add(argola);

  const haste = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.03), material);
  haste.position.y = -0.03;
  grupo.add(haste);

  const dente1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.03), material);
  dente1.position.set(0.03, -0.09, 0);
  grupo.add(dente1);

  const dente2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.03), material);
  dente2.position.set(0.025, -0.14, 0);
  grupo.add(dente2);

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
