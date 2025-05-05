// Capturar o foco na busca pelo nome cliente
//A constante "foco" obtem o elemento html(input) indentificado como "searchClinet"
const foco = document.getElementById('searchOS');

//Iniciar a janela de clientes alterando as propriedades de alguns elementos
document.addEventListener('DOMContentLoaded', () => {
    //Desativar os botão 
    btnUpdate.disabled = true;
    btnDelete.disabled = true;
    //Foco na busca do cliente
    foco.focus();
});

// capturar marcas de veiculos no campo modelo

const selectMarca = document.getElementById("inputMarcaVeiculoOS");
const selectModelo = document.getElementById("inputModeloVeiculoOS");

// Carregar marcas ao abrir a página
fetch("https://parallelum.com.br/fipe/api/v1/carros/marcas")
    .then(response => response.json())
    .then(marcas => {
        selectMarca.innerHTML = '<option selected disabled>Selecione uma marca</option>';
        marcas.forEach(marca => {
            const option = document.createElement("option");
            option.value = marca.codigo; // precisa do código para buscar modelos
            option.textContent = marca.nome;
            selectMarca.appendChild(option);
        });
    });

// Quando uma marca for selecionada
selectMarca.addEventListener("change", () => {
    const marcaSelecionada = selectMarca.value;

    // Desativa e limpa o select de modelos
    selectModelo.innerHTML = '<option>Carregando modelos...</option>';
    selectModelo.disabled = true;

    // Buscar modelos da marca
    fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaSelecionada}/modelos`)
        .then(response => response.json())
        .then(data => {
            const modelos = data.modelos;

            selectModelo.innerHTML = '<option selected disabled>Selecione um modelo</option>';
            modelos.forEach(modelo => {
                const option = document.createElement("option");
                option.value = modelo.nome;
                option.textContent = modelo.nome;
                selectModelo.appendChild(option);
            });

            selectModelo.disabled = false;
        });
});

//captura dos dados dos inputs do formulário (Passo 1: fluxo)
let frmOS = document.getElementById("frmOS");
let srvOS = document.getElementById("inputDadosOS");
let mdlOS = document.getElementById("inputModeloVeiculoOS");
let plcOS = document.getElementById("inputPlacaVeiculoOS");
let przOS = document.getElementById("inputPrazoOS");
let stsOS = document.getElementById("inputStatusOS");
let vlrOS = document.getElementById("inputValorOS");

//==========================================================================
//CRUD CREATE E UPDATE

//Evento associado botão submit (uso das validações do HTML)
frmOS.addEventListener('submit', async (event) => {
    //Evitar o comportamento padrão do submit, que é enviar os dados de formulário e reiniciar o documento HTML
    event.preventDefault()
    //teste importante (recebimento dos dados do formulário) - passo 1 do fluxo
    //console.log(srvOS.value, mdlOS.value, plcOS.value, przOS.value, stsOS.value, vlrOS.value)

    //Crair um objeto para armazenar os dados do cliente antes de enviar ao main 
    const os = {
        servicoOS: srvOS.value,
        modeloOS: mdlOS.value,
        placaOS: plcOS.value,
        prazoOS: przOS.value,
        statusOS: stsOS.value,
        valorOS: vlrOS.value
    }
    //Enviar ao main o objeto OS - Passo 2 (fluxo)
    //Uso do preload.js
    api.newOs(os)
})

//Fim crud create update====================================================

function resetForm() {
    //Limpar os campos e resetar o formulário com as configurações pré definidas
    location.reload() //Recarrega a página
}

//Recebimento do pedido do main para resetar o formulário
api.resetForm((args) => {
    resetForm()
}) 

// ===============================
// = CRUD Create/Update ===============

// =======================
// Manipulação da tecla Enter

// função para manipular o evento da tecla ENTER
function teclaEnter(event) {
    // se a tecla Enter for pressionada
    if (event.key === "Enter") {
      event.preventDefault() // ignorar o comportamento padrão e associar o Enter a busca pelo cliente
      searchOS()
    }
  }
  
  // Função para restaurar o padrão da tecla Enter (submit)
  function restaurarEnter() {
    frmOS.removeEventListener('keydown', teclaEnter)
  }
  
  // "escuta do evento Tecla Enter"
  frmOS.addEventListener('keydown', teclaEnter)
  
  // Fim manipulação Tecla Enter
  // =========================