export function mostrarTela(id) {
  document.querySelectorAll('.tela').forEach((tela) => {
    tela.classList.toggle('oculto', tela.id !== id);
  });
}

export function mostrarModal(id) {
  document.getElementById(id).classList.remove('oculto');
}

export function esconderModal(id) {
  document.getElementById(id).classList.add('oculto');
}

export function el(id) {
  return document.getElementById(id);
}

export function definirSeloDemo(ativo) {
  el('selo-demo-flutuante').classList.toggle('oculto', !ativo);
}
