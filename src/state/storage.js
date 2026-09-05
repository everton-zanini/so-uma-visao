const CHAVE_REAL = 'missao-tesouro:real';
const CHAVE_DEMO = 'missao-tesouro:demo';

function chave(namespace) {
  return namespace === 'demo' ? CHAVE_DEMO : CHAVE_REAL;
}

export function carregarProgresso(namespace) {
  try {
    const bruto = window.localStorage.getItem(chave(namespace));
    if (!bruto) return null;
    const dados = JSON.parse(bruto);
    if (!dados || typeof dados !== 'object') return null;
    return dados;
  } catch (_err) {
    return null;
  }
}

export function salvarProgresso(namespace, progresso) {
  try {
    window.localStorage.setItem(chave(namespace), JSON.stringify(progresso));
    return true;
  } catch (_err) {
    return false;
  }
}

export function limparProgresso(namespace) {
  try {
    window.localStorage.removeItem(chave(namespace));
  } catch (_err) {
    /* localStorage indisponível (modo privado/quota); nada a fazer */
  }
}
