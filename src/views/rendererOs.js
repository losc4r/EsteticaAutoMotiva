// capturar o foco na busca pelo nome
// a constant foco obtem o elemento html (input) identificado como 'searchCliente'
const foco = document.getElementById('searchClientOs')

// iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    // desativar os botões
    btnUpdate.disabled = true
    btnDelete.disabled = true
    // Foco na busca do cliente
    foco.focus()
})

//captura dos dados dos inputs do formulario (passo 1: fluxo)
let srvOs = document.getElementById('inputDadosOS')
let przOs = document.getElementById('inputPrazoOS')
let stsOs = document.getElementById('inputStatusOS')
let vlrOs = document.getElementById('inputDadosOS')