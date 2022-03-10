function novoElemento(tag, className){
    const elem = document.createElement(tag)
    elem.className = className
    return elem
}

function Barreira(reversa = false){
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParBarreira(altura, abertura, x){
    this.elemento = novoElemento('div', 'par-barreiras')
    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSup = Math.random() * (altura - abertura)
        const alturaInf = altura - abertura - alturaSup
        this.superior.setAltura(alturaSup)
        this.inferior.setAltura(alturaInf)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

// const b = new ParBarreira(500, 200, 400)
// document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto){
    this.pares = [
        new ParBarreira(altura, abertura, largura),
        new ParBarreira(altura, abertura, largura + espaco),
        new ParBarreira(altura, abertura, largura + espaco * 2),
        new ParBarreira(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            //quando o elemento sair da area do jogo
            if(par.getX() < -par.getLargura()){
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if(cruzouMeio) notificarPonto()
        })
    }
}


function Passaro(alturaJogo){
    let voando = false
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 6 : -3)
        const alturaMax = alturaJogo - this.elemento.clientHeight

        if(novoY <= 0){
            this.setY(0)
        }else if(novoY >= alturaMax){
            this.setY(alturaMax)
        }else{
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo/2)
}


// const barreiras = new Barreiras(530, 1200, 200, 400)
// const passaro = new Passaro(700)
// const AreaDoJogo  = document.querySelector('[wm-flappy]')

// AreaDoJogo.appendChild(passaro.elemento)
// barreiras.pares.forEach(par => AreaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)


function Progresso(){
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}


function sobreposicao(elementoA, elementoB){
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function Colisao(passaro, barreiras){
    let colidiu = false
    barreiras.pares.forEach(ParBarreira => {
        if(!colidiu){
            const superior = ParBarreira.superior.elemento
            const inferior = ParBarreira.inferior.elemento
            colidiu = sobreposicao(passaro.elemento, superior) || sobreposicao(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird(){
    let pontos = 0
    const AreaDoJogo = document.querySelector('[wm-flappy]')
    const altura = AreaDoJogo.clientHeight
    const largura = AreaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400, () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    AreaDoJogo.appendChild(progresso.elemento)
    AreaDoJogo.appendChild(passaro.elemento)

    barreiras.pares.forEach(par => AreaDoJogo.appendChild(par.elemento))

    this.start = () => {
        //loop do jogo
        const tempo = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if(Colisao(passaro, barreiras)){
                clearInterval(tempo)
            }
        }, 20)
    }
}

new FlappyBird().start()