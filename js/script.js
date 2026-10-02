// O layout foi desenhado para telas de 1920px e usa larguras fixas.
// Em telas menores, reduz a página inteira para ela caber sem cortar.
var LARGURA_MINIMA = 1600;

function ajustarEscala() {
    var escala = Math.min(1, window.innerWidth / LARGURA_MINIMA);
    document.documentElement.style.zoom = escala;
}

ajustarEscala();
window.addEventListener('resize', ajustarEscala);

// As páginas da loja ficam uma pasta abaixo das demais
var naLoja = window.location.pathname.indexOf('/loja/') !== -1;
var raizSite = naLoja ? '../' : '';

var aviso = null;
var avisoTimer = null;

function mostrarAviso(mensagem) {
    if (!aviso) {
        aviso = document.createElement('div');
        aviso.className = 'aviso';
        aviso.setAttribute('role', 'status');
        document.body.appendChild(aviso);
    }
    aviso.textContent = mensagem;
    aviso.classList.add('visivel');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function() {
        aviso.classList.remove('visivel');
    }, 3500);
}

// Navbar: marca o link da página atual e faz o botão "Doe" funcionar
var paginaAtual = window.location.pathname.split('/').pop() || 'home.html';
if (paginaAtual === 'voluntario-log.html') {
    paginaAtual = 'voluntario-cad.html';
}
if (naLoja) {
    paginaAtual = 'loja.html';
}

document.querySelectorAll('.navbar div:not(.logo):not(.doe) a').forEach(function(link) {
    if (link.getAttribute('href').split('/').pop() === paginaAtual) {
        link.classList.add('active');
    }
});

document.querySelectorAll('.btn_doe').forEach(function(botao) {
    botao.addEventListener('click', function() {
        window.location.href = raizSite + 'doacoes.html';
    });
});

// Links de exemplo (redes sociais, lojas de aplicativo) não levam a lugar nenhum
document.querySelectorAll('.redes-sociais a, .btns-download a').forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarAviso('Este é um projeto de TCC: este link é apenas demonstrativo.');
    });
});

var botaoApp = document.querySelector('.btnbox4');
if (botaoApp) {
    botaoApp.addEventListener('click', function() {
        document.getElementById('aplicativo').scrollIntoView({ behavior: 'smooth' });
    });
}

// Formulários: não existe servidor, então apenas confirmam o envio
function aoEnviar(seletor, acao) {
    var form = document.querySelector(seletor);
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            acao(form);
        });
    }
}

aoEnviar('#form-novidades', function(form) {
    mostrarAviso('Inscrição feita! Você receberá as novidades do BeKind.');
    form.reset();
});

aoEnviar('#form-cadastro', function(form) {
    localStorage.setItem('voluntario', form.nome.value.trim());
    mostrarAviso('Cadastro realizado! Agora é só entrar.');
    setTimeout(function() {
        window.location.href = 'voluntario-log.html';
    }, 1500);
});

aoEnviar('#form-login', function(form) {
    mostrarAviso('Bem-vindo(a), ' + form.nome.value.trim() + '!');
    setTimeout(function() {
        window.location.href = 'home.html';
    }, 1500);
});

var campoCpf = document.getElementById('cpf');
if (campoCpf) {
    campoCpf.addEventListener('input', function() {
        var n = campoCpf.value.replace(/\D/g, '').slice(0, 11);
        campoCpf.value = n
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    });
}

// Doações: filtro por categoria
var categorias = document.querySelectorAll('.categorias [data-categoria]');
categorias.forEach(function(categoria) {
    categoria.addEventListener('click', function() {
        var escolhida = categoria.dataset.categoria;
        categorias.forEach(function(c) {
            c.classList.toggle('ativo', c === categoria);
        });
        var visiveis = 0;
        document.querySelectorAll('.box-card').forEach(function(card) {
            var mostrar = escolhida === 'tudo' || card.dataset.categoria === escolhida;
            card.style.display = mostrar ? '' : 'none';
            if (mostrar) visiveis++;
        });
        document.querySelector('.sem-campanhas').style.display = visiveis ? 'none' : 'block';
    });
});

document.querySelectorAll('.btn-doe').forEach(function(botao) {
    botao.addEventListener('click', function(e) {
        e.preventDefault();
        var ong = botao.closest('.box-card').dataset.ong;
        mostrarAviso('Obrigado por querer ajudar a ' + ong + '! Como este é um projeto de TCC, nenhuma doação é processada.');
    });
});

// Blog
var verMais = document.querySelector('.vermais');
if (verMais) {
    verMais.addEventListener('click', function(e) {
        e.preventDefault();
        mostrarAviso('Você já viu todas as publicações.');
    });
}

// Loja: o carrinho fica salvo no navegador
function lerCarrinho() {
    try {
        return JSON.parse(localStorage.getItem('carrinho')) || [];
    } catch (e) {
        return [];
    }
}

function salvarCarrinho(itens) {
    localStorage.setItem('carrinho', JSON.stringify(itens));
    atualizarContador();
}

function atualizarContador() {
    var contador = document.querySelector('.qtd-carrinho');
    if (contador) {
        contador.textContent = lerCarrinho().length;
    }
}

function formatarPreco(valor) {
    return 'R$' + valor.toFixed(2).replace('.', ',');
}

atualizarContador();

var tamanhos = document.querySelectorAll('.tamanhos button');
tamanhos.forEach(function(botao) {
    botao.addEventListener('click', function() {
        tamanhos.forEach(function(b) {
            b.classList.toggle('selecionado', b === botao);
        });
    });
});

var adicionar = document.querySelector('.adc-carrinho');
if (adicionar) {
    adicionar.addEventListener('click', function(e) {
        e.preventDefault();
        var selecionado = document.querySelector('.tamanhos button.selecionado');
        if (!selecionado) {
            mostrarAviso('Escolha um tamanho antes de adicionar ao carrinho.');
            return;
        }
        var itens = lerCarrinho();
        itens.push({
            nome: adicionar.dataset.nome,
            preco: Number(adicionar.dataset.preco),
            imagem: adicionar.dataset.imagem,
            tamanho: selecionado.textContent
        });
        salvarCarrinho(itens);
        mostrarAviso(adicionar.dataset.nome + ' adicionado ao carrinho.');
    });
}

var listaCarrinho = document.querySelector('.itens-carrinho');

function desenharCarrinho() {
    var itens = lerCarrinho();
    var total = 0;
    listaCarrinho.innerHTML = '';

    itens.forEach(function(item, indice) {
        total += item.preco;

        var linha = document.createElement('div');
        linha.className = 'item-carrinho';

        var imagem = document.createElement('img');
        imagem.src = item.imagem;
        imagem.alt = '';

        var dados = document.createElement('div');
        dados.className = 'item-dados';
        var nome = document.createElement('p');
        nome.textContent = item.nome;
        var tamanho = document.createElement('span');
        tamanho.textContent = 'Tamanho: ' + item.tamanho;
        dados.append(nome, tamanho);

        var preco = document.createElement('text');
        preco.textContent = formatarPreco(item.preco);

        var remover = document.createElement('button');
        remover.textContent = 'Remover';
        remover.addEventListener('click', function() {
            var atuais = lerCarrinho();
            atuais.splice(indice, 1);
            salvarCarrinho(atuais);
            desenharCarrinho();
        });

        linha.append(imagem, dados, preco, remover);
        listaCarrinho.appendChild(linha);
    });

    document.querySelector('.carrinho-vazio').style.display = itens.length ? 'none' : 'block';
    document.querySelector('.resumo-carrinho').style.display = itens.length ? 'flex' : 'none';
    document.querySelector('.total-carrinho').textContent = formatarPreco(total);
}

if (listaCarrinho) {
    desenharCarrinho();
    document.querySelector('.finalizar').addEventListener('click', function() {
        salvarCarrinho([]);
        desenharCarrinho();
        mostrarAviso('Pedido registrado! Como este é um projeto de TCC, nenhuma compra é processada.');
    });
}
