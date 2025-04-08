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
let frmOs = document.getElementById('frmOs')
let srvOs = document.getElementById('inputDadosOS')
let przOs = document.getElementById('inputPrazoOS')
let stsOs = document.getElementById('inputStatusOS')
let vlrOs = document.getElementById('inputDadosOS')

// Evento associado ao botão submmit (uso das validações do html)
frmOs.addEventListener('submit', async (event) => {
    //evitar o comportamento padrão do submit que é enviar os dados do formulário e reiniciar o documento html
    event.preventDefault()
    //criar um objeto para armazenar os dados cliente antes de enviar ao main
    const os = {
        servicoOs: srvOs.value,
        prazoOs: przOs.value,
        statusOs: stsOs.value,
        valorOs: vlrOs.value
    }
})