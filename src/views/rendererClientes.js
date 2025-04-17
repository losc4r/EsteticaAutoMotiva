
function buscarCEP() {

  let cep = document.getElementById('inputCEPClient').value
  let urlAPI = `https://viacep.com.br/ws/${cep}/json/`
  fetch(urlAPI)
    .then(response => response.json())
    .then(dados => {
      document.getElementById('inputAddressClient').value = dados.logradouro
      document.getElementById('inputBairroClient').value = dados.bairro
      document.getElementById('inputCidadeClient').value = dados.localidade
      document.getElementById('inputUFClient').value = dados.uf

    })
    .catch(error => console.log(error)
    )
}

// vetor global que será usado na manipulação dos dados
let arrayClient = []

// capturar o foco na busca pelo nome
// a constant foco obtem o elemento html (input) identificado como 'searchCliente'
const foco = document.getElementById('searchClient')

// iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
  // desativar os botões
  btnUpdate.disabled = true
  btnDelete.disabled = true
  // Foco na busca do cliente
  foco.focus()
})

//captura dos dados dos inputs do formulario (passo 1: fluxo)
let frmClient = document.getElementById('frmClient')
let nameClient = document.getElementById('inputNameClient')
let cpfClient = document.getElementById('inputCPFClient')
let emailClient = document.getElementById('inputEmailClient')
let phoneClient = document.getElementById('inputPhoneClient')
let cepClient = document.getElementById('inputCEPClient')
let addressClient = document.getElementById('inputAddressClient')
let numberClient = document.getElementById('inputNumberClient')
let complementClient = document.getElementById('inputComplementClient')
let bairroClient = document.getElementById('inputBairroClient')
let cityClient = document.getElementById('inputCidadeClient')
let ufClient = document.getElementById('inputUFClient')

// ===============================
// = CRUD Create/Update ===============

// Evento associado ao botão submmit (uso das validações do html)
frmClient.addEventListener('submit', async (event) => {
  //evitar o comportamento padrão do submit que é enviar os dados do formulário e reiniciar o documento html
  event.preventDefault()
  //teste importante (recebimento dos dados do formulário - passo 1 do fluxo)
  //console.log(nameClient.value, cpfClient.value, emailClient.value, phoneClient.value, cepClient.value, addressClient.value, numberClient.value, complementClient.value, bairroClient.value, cityClient.value, ufClient.value)
  //criar um objeto para armazenar os dados cliente antes de enviar ao main
  const client = {
    nameCli: nameClient.value,
    cpfCli: cpfClient.value,
    emailCli: emailClient.value,
    phoneCli: phoneClient.value,
    cepCli: cepClient.value,
    addressCli: addressClient.value,
    numberCli: numberClient.value,
    complementCli: complementClient.value,
    bairroCli: bairroClient.value,
    cityClient: cityClient.value,
    ufCli: ufClient.value
  }
  // enviar ao main o objeto client - (Passo 2 - fluxo)
  // uso do preload.js
  api.newClient(client)
})

// = Fim CRUD Create/Update

// ========= CRUD Read ================

function buscarCliente() {
  //console.log("teste do botão buscar")
  // passo 1: capturar o nome do cliente
  let name = document.getElementById('searchClient').value
  console.log(name) // teste do passo 1
  api.searchName(name) // passo 2: envio do nome ao main
  // recebimento dos dados do cliente
  api.renderClient((event, dataClient) => {
    console.log(dataClient) // teste do passo 5
    // passo 6 renderizar os dados do cliente no formulário 
    // - criar um vetor global para manipulação dos dados
    // - criar uma constante para converter os dados recebidos(string) para o formato JSON
    // usar o laço forEach para percorrer o vetor e setar os campos (caixas de texto) do formulário
    const dadosCliente = JSON.parse(dataClient)
    // atribuir ao vetor os dados do cliente
    arrayClient = dadosCliente
    // extrair os dados do cliente
    arrayClient.forEach((c) => {
        nameClient.value = c.nomeCliente,
        cpfClient.value = c.cpfCliente,
        emailClient.value = c.emailCliente,
        phoneClient.value = c.foneCliente,
        cepClient.value = c.cepCliente,
        addressClient.value = c.logradouroCliente,
        numberClient.value = c.numeroCliente,
        complementClient.value = c.complementoCliente,
        bairroClient.value = c.bairroCliente,
        cityClient.value = c.cidadeCliente,
        ufClient.value = c.ufCliente
    })
  })
}

// ========= Fim CRUD Read ============

// =================== Reset Form ============ //

function resetForm() {
  // limpar os campos e resetar o formulário com as configuraçoes pré definidas
  location.reload
}

// recebimento do pedido do main para resetar o formulario
api.resetForm((args) => {
  resetForm()
})

// =================== Fim Reset Form ======== //

// === Função para aplicar máscara no CPF ===
function aplicarMascaraCPF(campo) {
  let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (cpf.length > 3) cpf = cpf.replace(/^(\d{3})(\d)/, "$1.$2");
  if (cpf.length > 6) cpf = cpf.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  if (cpf.length > 9) cpf = cpf.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");

  campo.value = cpf;
}

// === Função para validar CPF ===
function validarCPF() {
  let campo = document.getElementById('inputCPFClient');
  let cpf = campo.value.replace(/\D/g, ""); // Remove caracteres não numéricos

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
  }

  let soma = 0, resto;

  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
  }

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) {
    campo.style.borderColor = "red";
    campo.style.color = "red";
    return false;
  }

  campo.style.borderColor = "green";
  campo.style.color = "green";
  return true;
}

// Adicionar eventos para CPF
cpfClient.addEventListener("input", () => aplicarMascaraCPF(cpfClient)); // Máscara ao digitar
cpfClient.addEventListener("blur", validarCPF); // Validação ao perder o foco