/* Se der qualquer erro, aparece uma faixa vermelha no topo com o motivo
   (e o site volta a mostrar o conteúdo, sem efeitos) */
window.addEventListener("error", function (e) {
  document.documentElement.classList.remove("js");
  var d = document.getElementById("erroJs");
  if (!d) { d = document.createElement("div"); d.id = "erroJs"; document.body.appendChild(d); }
  d.textContent = "Erro no site: " + e.message + " (linha " + e.lineno + ")";
});

/* ===== Firebase ===== */
const firebaseConfig = {
  apiKey: "AIzaSyBxt0S_NGB4fatTd6x0CP2BPhqVxvPJcKs",
  authDomain: "claudia-fitness-d5d8e.firebaseapp.com",
  projectId: "claudia-fitness-d5d8e",
  storageBucket: "claudia-fitness-d5d8e.firebasestorage.app",
  messagingSenderId: "613004915926",
  appId: "1:613004915926:web:e4636bcc3941b86e660577"
};

const WHATSAPP = "5584981807021";
const TAM = ["PP", "P", "M", "G", "GG"];

/* ===== As peças da loja =====
   Para colocar fotos reais, adicione "fotos" na peça, na ordem dos ângulos:
   fotos: ["img/regata-frente.jpg", "img/regata-costas.jpg", "img/regata-lado.jpg"]
   Sem fotos, aparece o desenho "CF" com o nome do ângulo. */
const PRODUTOS = [
  { id: "p1", nome: "Blusa Regata Rosa",        cat: "Blusas", preco: 69.9,  cor: "rosa",   t: TAM },
  { id: "p2", nome: "Blusa Cropped Preta",      cat: "Blusas", preco: 74.9,  cor: "preto",  t: TAM },
  { id: "p3", nome: "Blusa Manga Longa Branca", cat: "Blusas", preco: 89.9,  cor: "branco", t: TAM },
  { id: "p6", nome: "Short Cintura Alta Rosa",  cat: "Shorts", preco: 79.9,  cor: "rosa",   t: TAM },
  { id: "p7", nome: "Short Bike Preto",         cat: "Shorts", preco: 69.9,  cor: "preto",  t: TAM },
  { id: "p8", nome: "Short Esportivo Branco",   cat: "Shorts", preco: 64.9,  cor: "branco", t: TAM }
];
const CORES = ["rosa", "preto", "branco"];
const ANGULOS = ["Frente", "Costas", "Lateral", "Detalhe", "Look completo"];

/* As 3 fileiras de carrossel */
const LINHAS = [
  { id: "linha-destaques", titulo: "Destaques", mostra: () => true },
  { id: "linha-blusas",    titulo: "Blusas",    mostra: (p) => p.cat === "Blusas" },
  { id: "linha-shorts",    titulo: "Shorts",    mostra: (p) => p.cat === "Shorts" }
];

/* se algum elemento não existir na página, usa um elemento vazio para o resto do código não parar */
const $ = (id) => document.getElementById(id) || document.createElement("div");
const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const corDe = (p) => (CORES.includes(p.cor) ? p.cor : "rosa");
const qtdAngulos = (p) => (Array.isArray(p.fotos) && p.fotos.length ? p.fotos.length : 3);

/* ---------- Efeito de entrada ao rolar a página ---------- */
document.documentElement.classList.add("js");
let revAgendado = false;

function revisar() {
  revAgendado = false;
  const pend = document.querySelectorAll(".rev:not(.visivel)");
  if (!pend.length) return;
  const h = window.innerHeight;
  pend.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < h * 0.9) el.classList.add("visivel");
  });
}

function agendarRev() {
  if (revAgendado) return;
  revAgendado = true;
  requestAnimationFrame(revisar);
}
window.addEventListener("scroll", agendarRev, { passive: true });
window.addEventListener("resize", agendarRev);
window.addEventListener("load", agendarRev);

/* ---------- Toast ---------- */
let tt;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(tt);
  tt = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ---------- Foto (ou desenho) de cada ângulo ---------- */
function fotoHTML(p, i, comRotulo) {
  const ang = ANGULOS[i] || "Foto " + (i + 1);
  const url = Array.isArray(p.fotos) ? p.fotos[i] : "";
  const rot = comRotulo ? `<small class="angulo">${esc(ang)}</small>` : "";
  if (url) return `<img src="${esc(url)}" alt="${esc(p.nome)} - ${esc(ang)}" loading="lazy" draggable="false">${rot}`;
  return `CF${rot}`;
}

/* ---------- Catálogo em carrossel ---------- */
function cardHTML(p, linhaId) {
  const nome = "t-" + linhaId + "-" + p.id;
  return `
    <article class="card" data-id="${esc(p.id)}" tabindex="0">
      <div class="foto c-${corDe(p)}" aria-hidden="true">${fotoHTML(p, 0, false)}</div>
      <div class="info">
        <small class="ccat">${esc(p.cat)}</small>
        <h3>${esc(p.nome)}</h3>
        <span class="preco">${brl(p.preco)}</span>
        <div class="tamanhos" role="radiogroup" aria-label="Tamanho de ${esc(p.nome)}">
          ${p.t.map((t, i) => `<label><input type="radio" name="${esc(nome)}" value="${esc(t)}" ${i === 0 ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}
        </div>
        <button class="btn" type="button" data-add="${esc(p.id)}">Adicionar ao carrinho</button>
      </div>
    </article>`;
}

function renderLinhas() {
  $("linhas").innerHTML = LINHAS.map((l) => {
    const itens = PRODUTOS.filter(l.mostra);
    if (!itens.length) return "";
    return `
    <div class="linha" id="${esc(l.id)}">
      <div class="linha-topo"><h3>${esc(l.titulo)}</h3></div>
      <div class="carrossel">${itens.map((p) => cardHTML(p, l.id)).join("")}</div>
    </div>`;
  }).join("");
  document.querySelectorAll(".carrossel").forEach(ativarCarrossel);
}

/* arrastar com o mouse no PC (no celular o dedo já arrasta sozinho) */
function ativarCarrossel(c) {
  let ponteiro = null, x0 = 0, s0 = 0, moveu = false;
  c.addEventListener("dragstart", (e) => e.preventDefault());
  c.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (e.target.closest("button, label, input")) return;
    ponteiro = e.pointerId; x0 = e.clientX; s0 = c.scrollLeft; moveu = false;
  });
  c.addEventListener("pointermove", (e) => {
    if (ponteiro !== e.pointerId) return;
    const dx = e.clientX - x0;
    if (!moveu && Math.abs(dx) > 6) {
      moveu = true;
      c.classList.add("arrastando");
      try { c.setPointerCapture(e.pointerId); } catch (err) {}
    }
    if (moveu) c.scrollLeft = s0 - dx;
  });
  const soltar = (e) => {
    if (ponteiro !== e.pointerId) return;
    ponteiro = null;
    c.classList.remove("arrastando");
    if (moveu) {
      c.dataset.arrastou = "1"; /* impede que soltar o mouse abra a peça */
      setTimeout(() => { delete c.dataset.arrastou; }, 0);
    }
  };
  c.addEventListener("pointerup", soltar);
  c.addEventListener("pointercancel", soltar);
}

$("linhas").addEventListener("click", (e) => {
  const car = e.target.closest(".carrossel");
  if (car && car.dataset.arrastou) return;

  const b = e.target.closest("[data-add]");
  if (b) {
    const p = PRODUTOS.find((x) => x.id === b.dataset.add);
    if (!p) return;
    const r = b.closest(".card").querySelector("input[type=radio]:checked");
    adicionar(p.id, r ? r.value : p.t[0]);
    return;
  }
  if (e.target.closest("label, input")) return;
  const card = e.target.closest(".card");
  if (!card) return;
  const r = card.querySelector("input[type=radio]:checked");
  abrirProduto(card.dataset.id, r ? r.value : null);
});

$("linhas").addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("card")) {
    e.preventDefault();
    const r = e.target.querySelector("input[type=radio]:checked");
    abrirProduto(e.target.dataset.id, r ? r.value : null);
  }
});

/* ---------- Zoom da peça com setas de ângulos ---------- */
const dlgProduto = $("dlgProduto");
let zId = null, zIdx = 0, zTotal = 1;

function irPara(i) {
  zIdx = (i + zTotal) % zTotal;
  $("zTrilho").style.transform = "translateX(" + (-zIdx * 100) + "%)";
  $("zPontos").querySelectorAll("button").forEach((b, n) => b.setAttribute("aria-current", String(n === zIdx)));
}

function abrirProduto(id, tamanho) {
  const p = PRODUTOS.find((x) => x.id === id);
  if (!p) return;
  zId = p.id;
  zTotal = qtdAngulos(p);
  const cor = corDe(p);
  let slides = "", pontos = "";
  for (let i = 0; i < zTotal; i++) {
    slides += `<div class="foto c-${cor}" aria-hidden="true">${fotoHTML(p, i, true)}</div>`;
    pontos += `<button type="button" data-ir="${i}" aria-label="Ver ${esc(ANGULOS[i] || "foto " + (i + 1))}"></button>`;
  }
  $("zTrilho").innerHTML = slides;
  $("zPontos").innerHTML = pontos;
  $("zAnt").hidden = $("zProx").hidden = $("zPontos").hidden = zTotal < 2;
  irPara(0);
  $("zCat").textContent = p.cat;
  $("zNome").textContent = p.nome;
  $("zPreco").textContent = brl(p.preco);
  $("zTam").innerHTML = p.t.map((t) =>
    `<label><input type="radio" name="z-tam" value="${esc(t)}" ${t === (tamanho || p.t[0]) ? "checked" : ""}><span>${esc(t)}</span></label>`
  ).join("");
  if (!dlgProduto.open) dlgProduto.showModal();
}

$("zAnt").addEventListener("click", () => irPara(zIdx - 1));
$("zProx").addEventListener("click", () => irPara(zIdx + 1));
$("zPontos").addEventListener("click", (e) => {
  const b = e.target.closest("[data-ir]");
  if (b) irPara(Number(b.dataset.ir));
});

/* deslizar o dedo (ou o mouse) na foto troca o ângulo */
let galX = null;
$("zGal").addEventListener("pointerdown", (e) => {
  if (e.target.closest("button")) return;
  galX = e.clientX;
});
$("zGal").addEventListener("pointerup", (e) => {
  if (galX === null) return;
  const dx = e.clientX - galX;
  galX = null;
  if (Math.abs(dx) > 40) irPara(zIdx + (dx < 0 ? 1 : -1));
});
$("zGal").addEventListener("pointercancel", () => { galX = null; });

/* setas do teclado trocam o ângulo (menos quando está escolhendo o tamanho) */
dlgProduto.addEventListener("keydown", (e) => {
  if (e.target.type === "radio") return;
  if (e.key === "ArrowRight") irPara(zIdx + 1);
  if (e.key === "ArrowLeft") irPara(zIdx - 1);
});

$("zAdd").addEventListener("click", () => {
  const r = $("zTam").querySelector("input[type=radio]:checked");
  const p = PRODUTOS.find((x) => x.id === zId);
  if (!p) return;
  adicionar(p.id, r ? r.value : p.t[0]);
  dlgProduto.close();
});
$("fecharProduto").addEventListener("click", () => dlgProduto.close());
dlgProduto.addEventListener("click", (e) => { if (e.target === dlgProduto) dlgProduto.close(); });

/* ---------- Carrinho ---------- */
let carrinho = [];

function carregar() {
  try {
    const bruto = JSON.parse(localStorage.getItem("rn_carrinho") || "[]");
    if (!Array.isArray(bruto)) return;
    carrinho = bruto.map((i) => {
      const p = PRODUTOS.find((x) => x.id === i.id);
      const q = Math.floor(Number(i.q));
      return p && p.t.includes(i.t) && q > 0 ? { id: p.id, t: i.t, q: Math.min(q, 10) } : null;
    }).filter(Boolean);
  } catch (e) { carrinho = []; }
}

function salvar() {
  try { localStorage.setItem("rn_carrinho", JSON.stringify(carrinho)); } catch (e) {}
  renderCarrinho();
}

function adicionar(id, t) {
  const i = carrinho.find((x) => x.id === id && x.t === t);
  if (i) i.q = Math.min(i.q + 1, 10);
  else carrinho.push({ id: id, t: t, q: 1 });
  salvar();
  toast("Adicionado ao carrinho");
}

const totalCarrinho = () => carrinho.reduce((s, i) => s + PRODUTOS.find((p) => p.id === i.id).preco * i.q, 0);

function renderCarrinho() {
  $("qtdCarrinho").textContent = carrinho.reduce((s, i) => s + i.q, 0);
  $("total").textContent = brl(totalCarrinho());
  const ul = $("itens");
  if (!carrinho.length) {
    ul.innerHTML = '<li class="vazio">Seu carrinho está vazio. Escolha uma peça para começar.</li>';
    return;
  }
  ul.innerHTML = carrinho.map((i, n) => {
    const p = PRODUTOS.find((x) => x.id === i.id);
    return `<li>
      <div><strong>${esc(p.nome)}</strong><br><small>Tamanho ${esc(i.t)} · ${brl(p.preco)}</small></div>
      <strong>${brl(p.preco * i.q)}</strong>
      <div class="qtd"><button type="button" data-d="${n}" aria-label="Diminuir">−</button><span>${i.q}</span><button type="button" data-u="${n}" aria-label="Aumentar">+</button></div>
      <button type="button" class="btn-link" data-r="${n}">Remover</button>
    </li>`;
  }).join("");
}

$("itens").addEventListener("click", (e) => {
  const d = e.target.dataset;
  let n;
  if (d.u !== undefined) { n = +d.u; if (carrinho[n]) carrinho[n].q = Math.min(carrinho[n].q + 1, 10); }
  else if (d.d !== undefined) { n = +d.d; if (carrinho[n] && --carrinho[n].q <= 0) carrinho.splice(n, 1); }
  else if (d.r !== undefined) { carrinho.splice(+d.r, 1); }
  else return;
  salvar();
});
$("btnLimpar").addEventListener("click", () => { carrinho = []; salvar(); });

/* ---------- Gaveta e menu ---------- */
const gaveta = $("gaveta"), fundo = $("fundo"), menu = $("menu"), btnMenu = $("btnMenu");

function abrirCarrinho() {
  fecharMenu();
  gaveta.classList.add("aberta");
  gaveta.setAttribute("aria-hidden", "false");
  fundo.hidden = false;
  $("fecharCarrinho").focus();
}
function fecharCarrinho() {
  gaveta.classList.remove("aberta");
  gaveta.setAttribute("aria-hidden", "true");
  fundo.hidden = true;
}
function fecharMenu() {
  menu.classList.remove("aberto");
  btnMenu.setAttribute("aria-expanded", "false");
  btnMenu.setAttribute("aria-label", "Abrir menu");
  document.body.classList.remove("trava");
  if (!gaveta.classList.contains("aberta")) fundo.hidden = true;
}

btnMenu.addEventListener("click", () => {
  const abrir = !menu.classList.contains("aberto");
  menu.classList.toggle("aberto", abrir);
  btnMenu.setAttribute("aria-expanded", String(abrir));
  btnMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("trava", abrir);
  fundo.hidden = !abrir;
});
menu.addEventListener("click", (e) => { if (e.target.tagName === "A") fecharMenu(); });
fundo.addEventListener("click", () => { fecharCarrinho(); fecharMenu(); });
$("btnCarrinho").addEventListener("click", abrirCarrinho);
$("fecharCarrinho").addEventListener("click", fecharCarrinho);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { fecharCarrinho(); fecharMenu(); } });
/* se a tela aumentar com o menu aberto, fecha o menu */
window.addEventListener("resize", () => { if (window.innerWidth > 820) fecharMenu(); });

/* ---------- Conta: variáveis ---------- */
let auth = null, user = null, F = null, modo = "entrar";
const dlg = $("dlgConta");

function aviso(t) {
  const a = $("avisoConta");
  a.textContent = t || "";
  a.hidden = !t;
}

function definirModo(m) {
  modo = m;
  const criar = m === "criar";
  $("tituloConta").textContent = criar ? "Criar conta" : "Entrar";
  $("btnEnviar").textContent = criar ? "Criar conta" : "Entrar";
  $("abaEntrar").setAttribute("aria-selected", String(!criar));
  $("abaCriar").setAttribute("aria-selected", String(criar));
  $("nome").hidden = !criar;
  $("lblNome").hidden = !criar;
  $("nome").required = criar;
  $("senha").autocomplete = criar ? "new-password" : "current-password";
  $("btnEsqueci").hidden = criar;
  aviso("");
}

function abrirConta(m, msg) {
  fecharMenu();
  definirModo(m);
  aviso(msg);
  if (!dlg.open) dlg.showModal();
}

function atualizarConta() {
  const b = $("btnConta");
  b.textContent = user ? "Sair" : "Entrar";
  b.title = user ? "Conectada(o) como " + (user.displayName || user.email || "") : "";
}

/* ---------- Finalizar pelo WhatsApp ---------- */
$("btnFinalizar").addEventListener("click", () => {
  if (!carrinho.length) return toast("Adicione ao menos uma peça");
  if (!user) {
    fecharCarrinho();
    abrirConta("entrar", "Entre na sua conta para finalizar o pedido.");
    return;
  }
  const linhas = carrinho.map((i) => {
    const p = PRODUTOS.find((x) => x.id === i.id);
    return "• " + i.q + "x " + p.nome + " (tam. " + i.t + ") - " + brl(p.preco * i.q);
  });
  const nome = (user.displayName || "").slice(0, 60);
  const msg = "Olá! Quero finalizar meu pedido na Claudia Fitness.\n\nCliente: " + nome +
    "\nE-mail: " + (user.email || "") + "\n\n" + linhas.join("\n") +
    "\n\nTotal: " + brl(totalCarrinho()) + "\n\nComo faço o pagamento e qual o prazo de entrega?";
  window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank", "noopener,noreferrer");
});
$("linkContato").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent("Olá! Vim pelo site da Claudia Fitness.");

/* ---------- Início da loja (roda antes do Firebase, assim as peças sempre aparecem) ---------- */
$("ano").textContent = new Date().getFullYear();
carregar();
renderLinhas();
renderCarrinho();
atualizarConta();
revisar();

/* ---------- Firebase (carrega à parte; se falhar, a loja continua funcionando) ---------- */
const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
const fbPronto = (async () => {
  try {
    if (location.protocol === "file:") return;
    const app = await import(FB + "firebase-app.js");
    const a = await import(FB + "firebase-auth.js");
    F = a;
    auth = a.getAuth(app.initializeApp(firebaseConfig));
    a.onAuthStateChanged(auth, (u) => { user = u; atualizarConta(); });
  } catch (e) {}
})();

async function pronto() {
  await fbPronto;
  if (auth) return true;
  aviso(location.protocol === "file:"
    ? "Para entrar, abra o site pelo endereço publicado (https://) ou por localhost, não pelo arquivo no computador."
    : "Não foi possível conectar ao login agora. Recarregue a página e tente de novo.");
  return false;
}

const ERROS = {
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/email-already-in-use": "Este e-mail já tem conta. Use a aba Entrar.",
  "auth/weak-password": "Senha fraca. Use ao menos 8 caracteres.",
  "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
  "auth/popup-closed-by-user": "Login com Google cancelado.",
  "auth/popup-blocked": "O navegador bloqueou a janela do Google. Libere pop-ups e tente de novo.",
  "auth/unauthorized-domain": "Este endereço não está autorizado no Firebase. Veja Authentication > Settings > Authorized domains."
};
const msgErro = (e) => ERROS[e && e.code] || "Não foi possível concluir. Tente novamente.";
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

$("abaEntrar").addEventListener("click", () => definirModo("entrar"));
$("abaCriar").addEventListener("click", () => definirModo("criar"));
$("fecharConta").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

$("formConta").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!(await pronto())) return;
  const email = $("email").value.trim(), senha = $("senha").value, nome = $("nome").value.trim();
  if (!emailOk(email)) return aviso("Digite um e-mail válido.");
  if (modo === "criar") {
    if (nome.length < 2) return aviso("Digite seu nome.");
    if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) return aviso("A senha precisa de 8 caracteres, com letras e números.");
  } else if (!senha) return aviso("Digite sua senha.");
  const btn = $("btnEnviar");
  btn.disabled = true;
  try {
    if (modo === "criar") {
      const c = await F.createUserWithEmailAndPassword(auth, email, senha);
      await F.updateProfile(c.user, { displayName: nome });
      user = c.user;
      atualizarConta();
    } else {
      await F.signInWithEmailAndPassword(auth, email, senha);
    }
    $("formConta").reset();
    dlg.close();
    toast("Tudo certo! Você está logada(o).");
  } catch (err) { aviso(msgErro(err)); }
  finally { btn.disabled = false; }
});

$("btnGoogle").addEventListener("click", async () => {
  if (!(await pronto())) return;
  try {
    await F.signInWithPopup(auth, new F.GoogleAuthProvider());
    dlg.close();
    toast("Login com Google feito!");
  } catch (err) { aviso(msgErro(err)); }
});

$("btnEsqueci").addEventListener("click", async () => {
  const email = $("email").value.trim();
  if (!emailOk(email)) return aviso("Digite seu e-mail acima para receber o link de nova senha.");
  if (!(await pronto())) return;
  try { await F.sendPasswordResetEmail(auth, email); } catch (e) {}
  aviso("Se este e-mail tiver conta, enviamos um link para criar nova senha.");
});

$("btnConta").addEventListener("click", async () => {
  if (user && auth) { await F.signOut(auth); toast("Você saiu da conta."); }
  else abrirConta("entrar");
});
// fim
