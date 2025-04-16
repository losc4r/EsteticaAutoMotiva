console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')

// Esta linha está relacionada ao preload.js
const path = require('node:path')

// Importação dos métodos conectar e desconectar (módulo de conexão)
const { conectar, desconectar } = require('./database.js')

// importação do Schema Clientes da camada model
const clientModel = require('./src/models/clientes.js')

//Importação do modelo de dados do os
const osModel = require("./src/models/os.js")

// importação do pacote jspdf (npm i jspdf)
const { jspdf, default: jsPDF } = require('jspdf')

// importação da biblioteca fs (nativa do javascript) para manipulação de arquivos
const fs = require('fs')

// Janela principal
let win
const createWindow = () => {
  // a linha abaixo define o tema (claro ou escuro)
  nativeTheme.themeSource = 'light' //(dark ou light)
  win = new BrowserWindow({
    width: 800,
    height: 600,
    //autoHideMenuBar: true,
    //minimizable: false,
    resizable: false,
    //ativação do preload
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('./src/views/index.html')

  // recebimento dos pedidos para abertura de janelas (botões) autorizado no preload.js
  ipcMain.on('client-window', () => {
    clientWindow()
  })
  ipcMain.on('os-window', () => {
    osWindow()
  })
}

// Janela Sobre
function aboutWindow() {
  nativeTheme.themeSource = 'light'
  // ↓ obtém a janela principal ↓
  const main = BrowserWindow.getFocusedWindow()
  let about // ← estabelecer uma relação hierárquica entre janelas
  if (main) {
    about = new BrowserWindow({
      width: 360,
      height: 200,
      autoHideMenuBar: true,
      resizable: false,
      minimizable: false,
      parent: main,
      modal: true,

    })
  }
  about.loadFile('./src/views/sobre.html')
}

// JANELA CLIENTES

let client
function clientWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client = new BrowserWindow({
      width: 1020,
      height: 720,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
      //ativação do preload.js
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
  client.loadFile('./src/views/clientes.html')
  client.center() //inicar no centro da tela
}

// JANELA OS

let os
function osWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    os = new BrowserWindow({
      width: 1020,
      heigth: 720,
      //autoHideMenuBar: true,
      resizable: false,
      parent: main,
      modal: true,
            //ativação do preload.js
            webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
  os.loadFile('./src/views/os.html')
  os.center() //inicar no centro da tela
}

// Iniciar a aplicação
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// reduzir logs não críticos
app.commandLine.appendSwitch('log-level', '3')

// iniciar a conexão com o banco de dados (pedido direto do preload.js)
ipcMain.on('db-connect', async (event) => {
  let conectado = await conectar()
  // se conectado for igual a true
  if (conectado) {
    // enviar uma mensagem para o renderizador trocar o ícone
    setTimeout(() => {
      event.reply('db-status', "conectado")
    }, 500)
  }
})

// IMPORTANTE! Desconectar do banco de dados quando a aplicação for encerrada
app.on('before-quit', () => {
  desconectar()
})


// template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Clientes',
        click: () => clientWindow()
      },
      {
        label: 'Ordem de Serviço',
        click: () => osWindow()
      },
      {
        label: 'Sair',
        click: () => app.quit(),
        accelerator: 'Alt+F4'
      }
    ]
  },
  {
    label: 'Relatórios',
    submenu: [
      {
        label: 'Clientes',
        click: () => relatorioClientes()
      },
      {
        label: 'Serviços Realizados'
      },
      {
        label: 'Faturamento'
      },
    ]
  },
  {
    label: 'Ferramentas',
    submenu: [
      {
        label: 'Aplicar zoom',
        role: 'zoomIn'
      },
      {
        label: 'Reduzir',
        role: 'zoomOut'
      },
      {
        label: 'Restaurar o zoom padrão',
        role: 'resetZoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Recarregar',
        role: 'reload'
      },
      {
        label: 'Ferramentas do Desenvolvedor',
        role: 'toggleDevTools'
      }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      {
        label: 'Sobre',
        click: () => aboutWindow()
      }
    ]
  }
]

// ==========================
// == Clientes - CRUD Create

// recebimento do objeto que contem os dados do cliente
ipcMain.on('new-client', async (event, client) => {
  // importante! teste de recebimento dos dados do cliente
  console.log(client)
  // cadastrar a estrutura de dados no banco de dados MongoDB
  try {
    // criar uma nova de estrtutra de dados usando a classe modelo
    // Atenção os atributos precisam ser identicos ao modelo de dados Clientes.js e os valores são defifidos pelo conteúdo do objeto cliente
    const newClient = new clientModel({
      nomeCliente: client.nameCli,
      cpfCliente: client.cpfCli,
      emailCliente: client.emailCli,
      foneCliente: client.phoneCli,
      cepCliente: client.cepCli,
      logradouroCliente: client.addressCli,
      numeroCliente: client.numberCli,
      complementoCliente: client.complementCli,
      bairroCliente: client.bairroCli,
      cidadeCliente: client.cityClient,
      ufCliente: client.ufCli,
    })
    // salvar os dados do cliente no banco de dados
    await newClient.save()
    // mensagem de confirmção
    dialog.showMessageBox({
      // customização
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      // ação ao pressionar o botão
      if (result.response === 0) {
        // enviar um pedido para o renderizador limpar os campos e resetar as configurações pré definidas (rótulo) preload.js
        event.reply('reset-form')
      }
    })
  } catch (error) {
    // se o código de erro for 11000 (cpf duplicado) enviar uma mensagem ao usuário
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção",
        message: "CPF já está cadastrado\n Verificque se digitou corretamente",
        buttons: ['OK']
      }).then((result) => {

      })
    }
    console.log(error)
  }
})
// == Fim - Cliente - CRUD Create
// =========== Relatório de Cliente ============

async function relatorioClientes() {
  try {
    // passo 1: consultar o banco de dados e obter a listagem de clientes cadastrados por ordem alfabetica
    const clientes = await clientModel.find().sort({ nomeCliente: 1 })

    // teste de recebimento da listagem de clientes
    // console.log(clientes)
    // Passo 2: Formatação do documento pdf
    // p - portrait | l - landscape | mm e a4 (folha A4(210x297mm))
    const doc = new jsPDF('p', 'mm', 'a4')

    // inserir imagem no documento pdf
    // imagePath (caminho da imagem que será inserida no pdf)
    // imageBase 64 (usa da biblioteca fs para ler o arquivo no formato png)
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) //(5mm, 8mm x,y)

    // definir o tamanho da fonte
    doc.setFontSize(18)

    // escrever um texto (título)
    doc.text("Relatório de Clientes", 14, 45)//x,y (mm) 

    // inserir a data atual no relatório
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    // variavel de apio na formatação
    let y = 60
    doc.text("Nome", 14, y)
    doc.text("Telefone", 80, y)
    doc.text("E-mail", 130, y)
    y += 5

    // desenhar linha
    doc.setLineWidth(0.5) // expessura da linha
    doc.line(10, y, 200, y) // inicio e fim

    //renderizar os clientes cadastrados no banco
    y += 10 // espaçãmento da linha
    // percorrer o vetor clientes (obtido do banco) usando o laço forEach (equivale ao laço for)
    clientes.forEach((c) => {
      // adicionar outra página se a folha inteira for preenchida (estratégia é saber o tamanho da folha)
      if (y > 280) {
        doc.addPage()
        y = 20 // resetar a variável y
        // redesenhar o cabeçalho
        doc.text("Nome", 14, y)
        doc.text("Telefone", 80, y)
        doc.text("E-mail", 130, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }
      doc.text(c.nomeCliente, 14, y)
      doc.text(c.foneCliente, 80, y)
      doc.text(c.emailCliente || "N/A", 130, y)
      y += 10 // quebra de linha
    })

    // Adicionar numeração automatica de páginas
    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    // Definir o caminho do arquivo temporário e nome do arquivo
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')

    // salvar  temporariamente o arquivo
    doc.save(filePath)

    // abrir o arquivo no aplicativo padrão de leitura de pdf do computador do usuário
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

// =========== FIM Relatório de Cliente =============

// =========== CRUD OS ==============================

ipcMain.on('new-os', async (event, os) => {
  console.log(os)
  try {
    const newOs = new osModel({

      servicooS: os.servicoOS,
      modelooS: os.modeloOS,
      placaoS: os.placaOS,
      prazooS: os.prazoOS,
      statusoS: os.statusOS,
      valoroS: os.valorOS

    })
    await newOs.save()

    dialog.showMessageBox({
      type: 'info',
      title: "Aviso",
      message: "Ordem de Serviço Adicionada!!!",
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form')
      }
    })
  } catch (error) {
    console.error('Erro ao salvar OS:', error);
  }
})