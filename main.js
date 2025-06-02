console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu, ipcMain, dialog, shell } = require('electron')


const path = require('node:path')


const { conectar, desconectar } = require('./database.js')


const clientModel = require('./src/models/clientes.js')
const cpfModel = require('./src/models/clientes.js')


const osModel = require("./src/models/os.js")


const { jspdf, default: jsPDF } = require('jspdf')


const mongoose = require('mongoose')


const fs = require('fs')


const prompt = require('electron-prompt')


let win
const createWindow = () => {

  nativeTheme.themeSource = 'light'
  win = new BrowserWindow({
    width: 800,
    height: 600,

    resizable: false,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('./src/views/index.html')

 
  ipcMain.on('client-window', () => {
    clientWindow()
  })
  ipcMain.on('os-window', () => {
    osWindow()
  })
}


function aboutWindow() {
  nativeTheme.themeSource = 'light'
 
  const main = BrowserWindow.getFocusedWindow()
  let about 
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



let client
function clientWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    client = new BrowserWindow({
      width: 1020,
      height: 720,
   
      resizable: false,
      parent: main,
      modal: true,
     
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
  client.loadFile('./src/views/clientes.html')
  client.center() 
}



let os
function osWindow() {
  nativeTheme.themeSource = 'light'
  const main = BrowserWindow.getFocusedWindow()
  if (main) {
    os = new BrowserWindow({
      width: 1020,
      heigth: 1920,
     
      resizable: false,
      parent: main,
      modal: true,
      
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
  }
  os.loadFile('./src/views/os.html')
  os.center() 
}


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


app.commandLine.appendSwitch('log-level', '3')


ipcMain.on('db-connect', async (event) => {
  let conectado = await conectar()
 
  if (conectado) {
   
    setTimeout(() => {
      event.reply('db-status', "conectado")
    }, 500)
  }
})


app.on('before-quit', () => {
  desconectar()
})



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
        label: 'Ordem de Serviços',
        submenu: [
          {
            label: 'Abertas',
            click: () => relatorioOSAbertas()
          },
          {
            label: 'Andamento',
            click: () => relatorioOSAndamento()
          },
          {
            label: 'Finalizadas',
            click: () => relatorioOSFinalizadas()
          },
          {
            label: 'Canceladas',
            click: () => relatorioOSCanceladas()
          }
        ]
      }
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


ipcMain.on('new-client', async (event, client) => {
  
  console.log(client)
  
  try {
    
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
    
    await newClient.save()
    
    dialog.showMessageBox({
      
      type: 'info',
      title: "Aviso",
      message: "Cliente adicionado com sucesso",
      buttons: ['OK']
    }).then((result) => {
      
      if (result.response === 0) {

        event.reply('reset-form')
      }
    })
  } catch (error) {
    
    if (error.code === 11000) {
      dialog.showMessageBox({
        type: 'error',
        title: "Atenção",
        message: "CPF já está cadastrado\n Verifique se digitou corretamente",
        buttons: ['OK']
      }).then((result) => {

      })
    }
    console.log(error)
  }
})


async function relatorioClientes() {
  try {
    
    const clientes = await clientModel.find().sort({ nomeCliente: 1 })

    
    const doc = new jsPDF('p', 'mm', 'a4')

    
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) 

    
    doc.setFontSize(18)

    
    doc.text("Relatório de Clientes", 14, 45) 

   
    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    
    let y = 60
    doc.text("Nome", 14, y)
    doc.text("Telefone", 80, y)
    doc.text("E-mail", 130, y)
    y += 5

    
    doc.setLineWidth(0.5) 
    doc.line(10, y, 200, y) 

    
    y += 10 
    clientes.forEach((c) => {
      
      if (y > 280) {
        doc.addPage()
        y = 20 
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
      y += 10 
    })

    
    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'clientes.pdf')

    
    doc.save(filePath)

    
    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}



ipcMain.on('validate-search', () => {
  dialog.showMessageBox({
    type: 'warning',
    title: "Atenção",
    message: "Preencha o campo de busca",
    buttons: ['OK']
  })
})

ipcMain.on('search-name', async (event, name) => {
  
  try {
    const dataClient = await clientModel.find({
      $or: [
        { nomeCliente: new RegExp(name, 'i') },
        { cpfCliente: new RegExp(name, 'i') }
      ]
    })
    console.log(dataClient)
    if (dataClient.length === 0) {
      dialog.showMessageBox({
        type: 'question',
        title: 'Aviso',
        message: "Cliente não cadastrado. \nDeseja cadastrar esse cliente?",
        defaultId: 0, 
        buttons: ['Sim', 'Não'] 

      }).then((result) => {
        if (result.response === 0) {
          
          event.reply('set-client')
        } else {
          
          event.reply('reset-form')
        }

      })
    }


    
    event.reply('render-client', JSON.stringify(dataClient))
  } catch (error) {
    console.log(error)
  }
})



ipcMain.on('delete-client', async (event, id) => {
  console.log(id) 
  try {
    
    const { response } = await dialog.showMessageBox(client, {
      type: 'warning',
      title: "Atenção!",
      message: "Deseja excluir este cliente? \nEsta ação não poderá ser desfeita",
      buttons: ['Cancelar', 'Excluir'] 
    })
    if (response === 1) {

      
      const delClient = await clientModel.findByIdAndDelete(id)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)
  }
})



ipcMain.on('update-client', async (event, client) => {
  console.log(client) 
  try {

    
    const updateClient = await clientModel.findByIdAndUpdate(
      client.idCli,
      {
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
      },
      {
        new: true
      }
    )
    
    dialog.showMessageBox({
      
      type: 'info',
      title: "Aviso",
      message: "Dados atualizados com sucesso",
      buttons: ['OK']
    }).then((result) => {
      
      if (result.response === 0) {
        
        event.reply('reset-form')
      }
    })
  } catch (error) {
    console.log(error)
  }
})


async function relatorioOSAbertas() {
  try {

    const clientes = await osModel.find({ stats: 'Aberta' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) 

    doc.setFontSize(18)

    doc.text("Relatório de O.S em Aberto", 14, 45)

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Modelo Veiculo", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) 
    doc.line(10, y, 200, y) 

    y += 10 

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("Modelo Veículo", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }

      doc.text(c.modelo || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

async function relatorioOSAndamento() {
  try {

    const clientes = await osModel.find({ stats: 'Em andamento' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) 

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Modelo Veiculo", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) 
    doc.line(10, y, 200, y) 

    y += 10 

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("Modelo Veículo", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }

      doc.text(c.modelo || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

async function relatorioOSFinalizadas() {
  try {

    const clientes = await osModel.find({ stats: 'Finalizada' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) 

    doc.setFontSize(18)

    doc.text("Relatório de O.S Finalizadas", 14, 45)

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Modelo Veiculo", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) 
    doc.line(10, y, 200, y) 

    y += 10 

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("Modelo Veículo", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }

      doc.text(c.modelo || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}

async function relatorioOSCanceladas() {
  try {

    const clientes = await osModel.find({ stats: 'Cancelada' }).sort({ prazo: 1 })

    const doc = new jsPDF('p', 'mm', 'a4')

    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 20, 8) 

    doc.setFontSize(18)

    doc.text("Relatório de Ordem de Serviços", 14, 45)

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    doc.setFontSize(12)
    doc.text(`Data: ${dataAtual}`, 160, 10)

    let y = 60
    doc.text("Modelo Veiculo", 14, y)
    doc.text("Funcionario", 70, y)
    doc.text("Serviço", 120, y)
    doc.text("Prazo de Entrega", 165, y)
    y += 5

    doc.setLineWidth(0.5) 
    doc.line(10, y, 200, y) 

    y += 10 

    clientes.forEach((c) => {

      if (y > 280) {
        doc.addPage()
        y = 20
        doc.text("Modelo Veículo", 14, y)
        doc.text("Funcionário", 70, y)
        doc.text("Serviço", 120, y)
        doc.text("Prazo de Entrega", 165, y)
        y += 5
        doc.setLineWidth(0.5)
        doc.line(10, y, 200, y)
        y += 10
      }

      doc.text(c.modelo || "N/A", 14, y)
      doc.text(c.funcionario || "N/A", 70, y)
      doc.text(c.servico || "N/A", 120, y)
      doc.text(c.prazo || "N/A", 165, y)
      y += 10
    })

    const paginas = doc.internal.getNumberOfPages()
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.text(`Página ${i} de ${paginas}`, 105, 290, { align: 'center' })
    }

    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'ordemservico.pdf')

    doc.save(filePath)

    shell.openPath(filePath)
  } catch (error) {
    console.log(error)
  }
}








ipcMain.on('search-clients', async (event) => {
  try {
    
    const clientes = await clientModel.find().sort({ nomeCliente: 1 })
    

    
    event.reply('list-clients', JSON.stringify(clientes))

  } catch (error) {
    console.log(error)
  }
})



ipcMain.on('validate-client', (event) => {
  dialog.showMessageBox({
    type: 'warning',
    title: "Aviso!",
    message: "É obrigatório vincular o cliente na Ordem de Serviço",
    buttons: ['OK']
  }).then((result) => {
    
    if (result.response === 0) {
      event.reply('set-search')
    }
  })
})

ipcMain.on('new-os', async (event, os) => {
  
  console.log(os)
  
  try {
    
    const newOS = new osModel({
      idCliente: os.idClientOS,
      nome: os.nome_OS,
      cpf: os.cpf_OS,
      telefone: os.telefone_OS,
      marca: os.marca_OS,
      modelo: os.modelo_OS,
      placa: os.placa_OS,
      prazo: os.prazo_OS,
      funcionario: os.funcionario_OS,
      stats: os.stats_OS,
      servico: os.servico_OS,
      observacoes: os.observacoes_OS,
      valor: os.valor_OS
    })
    
    await newOS.save()

    
    const osId = newOS._id
    console.log("ID da nova OS:", osId)

    
    dialog.showMessageBox({
      
      type: 'info',
      title: "Aviso",
      message: "OS gerada com sucesso.\nDeseja imprimir esta OS?",
      buttons: ['Sim', 'Não'] 
    }).then((result) => {
      
      if (result.response === 0) {
        
        printOS(osId)
        
        event.reply('reset-form')
      } else {
        
        event.reply('reset-form')
      }
    })
  } catch (error) {
    console.log(error)
  }
})


ipcMain.on('search-os', (event) => {
  
  prompt({
    title: 'Buscar OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
      type: 'text'
    },
    type: 'input',
    width: 400,
    height: 200
  }).then(async (result) => {
    if (result !== null) {

      
      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          const dataOS = await osModel.findById(result)
          if (dataOS) {
            console.log(dataOS)
            event.reply('render-os', JSON.stringify(dataOS))
          } else {
            dialog.showMessageBox({
              type: 'warning',
              title: "Aviso!",
              message: "OS não encontrada",
              buttons: ['OK']
            })
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        dialog.showMessageBox({
          type: 'error',
          title: "Atenção!",
          message: "Formato do número da OS inválido.\nVerifique e tente novamente.",
          buttons: ['OK']
        })
      }
    }
  })
})




ipcMain.on('delete-os', async (event, idOS) => {
  console.log(idOS) 
  try {
    
    const { response } = await dialog.showMessageBox(os, {
      type: 'warning',
      title: "Atenção!",
      message: "Deseja excluir esta ordem de serviço?\nEsta ação não poderá ser desfeita.",
      buttons: ['Cancelar', 'Excluir'] 
    })
    if (response === 1) {
      
      const delOS = await osModel.findByIdAndDelete(idOS)
      event.reply('reset-form')
    }
  } catch (error) {
    console.log(error)
  }
})



ipcMain.on('update-os', async (event, os) => {
  console.log(os);

  try {
    const updateOS = await osModel.findByIdAndUpdate(
      os._id, 
      {
        idCliente: os.idCliente,
        nome: os.nome,
        cpf: os.cpf,
        telefone: os.telefone,
        marca: os.marca,
        modelo: os.modelo,
        placa: os.placa,
        prazo: os.prazo,
        funcionario: os.funcionario,
        stats: os.stats,
        servico: os.servico,
        observacoes: os.observacoes,
        valor: os.valor
      },
      { new: true }
    );

    dialog.showMessageBox({
      type: 'info',
      title: 'Aviso',
      message: 'Dados da OS alterados com sucesso',
      buttons: ['OK']
    }).then((result) => {
      if (result.response === 0) {
        event.reply('reset-form');
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar OS:', error);
  }
});




ipcMain.on('print-os', async (event) => {
  prompt({
    title: 'Imprimir OS',
    label: 'Digite o número da OS:',
    inputAttrs: {
      type: 'text'
    },
    type: 'input',
    width: 400,
    height: 200
  }).then(async (result) => {
    
    if (result !== null) {
      
      if (mongoose.Types.ObjectId.isValid(result)) {
        try {
          
          const dataOS = await osModel.findById(result)
          if (dataOS && dataOS !== null) {
            console.log(dataOS) 
            const dataClient = await clientModel.find({
              _id: dataOS.idCliente
            })
            console.log(dataClient)
            
            const doc = new jsPDF('p', 'mm', 'a4')
            const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
            const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
            doc.addImage(imageBase64, 'PNG', 5, 8)
            doc.setFontSize(18)
            doc.text("OS:", 14, 45) 
            doc.setFontSize(12)

            
            dataClient.forEach((c) => {
              
              doc.setFont("helvetica", "bold");
              doc.text("Cliente:", 14, 65);
              doc.setFont("helvetica", "normal");
              doc.text(c.nomeCliente, 35, 65);

              
              doc.setFont("helvetica", "bold");
              doc.text("Telefone:", 85, 65);
              doc.setFont("helvetica", "normal");
              doc.text(c.foneCliente, 110, 65);

              
              doc.setFont("helvetica", "bold");
              doc.text("Email:", 150, 65);
              doc.setFont("helvetica", "normal");
              doc.text(c.emailCliente || "N/A", 170, 65);
            });


            
            doc.line(14, 70, 200, 70); 

            let baseY = 90; 

            
            doc.setFont("helvetica", "bold");
            doc.text("Modelo:", 14, baseY);
            doc.setFont("helvetica", "normal");
            doc.text(String(dataOS.modelo), 50, baseY);
            baseY += 10;

            
            doc.setFont("helvetica", "bold");
            doc.text("Placa:", 14, baseY);
            doc.setFont("helvetica", "normal");
            doc.text(String(dataOS.placa), 50, baseY);
            baseY += 10;

            doc.setFont("helvetica", "bold");
            doc.text("Funcionário:", 14, baseY);
            doc.setFont("helvetica", "normal");
            doc.text(String(dataOS.funcionario), 50, baseY);
            baseY += 10;

       
            doc.setFont("helvetica", "bold");
            doc.text("Prazo:", 14, baseY);
            doc.setFont("helvetica", "normal");
            doc.text(String(dataOS.prazo), 50, baseY);
            baseY += 10;

            
            doc.setFont("helvetica", "bold");
            doc.text("Valor:", 14, baseY);
            doc.setFont("helvetica", "normal");
            doc.text(String(dataOS.valor), 50, baseY);
            baseY += 10;

            
            doc.setFont("helvetica", "bold");
            doc.text("Serviço:", 14, baseY);
            doc.setFont("helvetica", "normal");
            doc.text(String(dataOS.servico), 50, baseY);
            baseY += 10;

          
doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text("Observações:", 14, baseY);

doc.setFont("helvetica", "normal");
doc.setFontSize(8);

           
            doc.setFontSize(8)
            const termo = `
Termo de Serviço e Garantia – Estética Automotiva
O cliente autoriza a execução dos serviços automotivos descritos nesta ordem, estando ciente de que:

O diagnóstico e orçamento são gratuitos apenas mediante aprovação do serviço. Em caso de recusa, poderá ser cobrada uma taxa de avaliação técnica.

Produtos e materiais utilizados no serviço poderão ser descartados ou devolvidos ao cliente caso solicitado no ato do atendimento.

A garantia dos serviços prestados é de 90 dias, conforme o Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o serviço executado ou produto aplicado, desde que o veículo não tenha sido submetido a intervenções de terceiros ou uso indevido.

Não nos responsabilizamos por itens pessoais deixados no interior do veículo. É recomendável a retirada de objetos antes da realização dos serviços.

Veículos não retirados em até 90 dias após a conclusão dos serviços estarão sujeitos à cobrança de taxa de permanência ou destinação adequada, conforme o Art. 1.275 do Código Civil.

O cliente declara estar ciente e de acordo com todos os termos acima descritos.`

            
            doc.text(termo, 14, 150, { maxWidth: 180 }) 
            const tempDir = app.getPath('temp')
            const filePath = path.join(tempDir, 'os.pdf')
            
            doc.save(filePath)
            
            shell.openPath(filePath)
          } else {
            dialog.showMessageBox({
              type: 'warning',
              title: "Aviso!",
              message: "OS não encontrada",
              buttons: ['OK']
            })
          }

        } catch (error) {
          console.log(error)
        }
      } else {
        dialog.showMessageBox({
          type: 'error',
          title: "Atenção!",
          message: "Código da OS inválido.\nVerifique e tente novamente.",
          buttons: ['OK']
        })
      }
    }
  })
})

async function printOS(osId) {
  try {
    const dataOS = await osModel.findById(osId)

    const dataClient = await clientModel.find({
      _id: dataOS.idCliente
    })
    console.log(dataClient)
    
    const doc = new jsPDF('p', 'mm', 'a4')
    const imagePath = path.join(__dirname, 'src', 'public', 'img', 'logo.png')
    const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' })
    doc.addImage(imageBase64, 'PNG', 5, 8)
    doc.setFontSize(18)
    doc.text("OS:", 14, 45) 
    doc.setFontSize(12)

    
    dataClient.forEach((c) => {
      
      doc.setFont("helvetica", "bold");
      doc.text("Cliente:", 14, 65);
      doc.setFont("helvetica", "normal");
      doc.text(c.nomeCliente, 35, 65);

      
      doc.setFont("helvetica", "bold");
      doc.text("Telefone:", 85, 65);
      doc.setFont("helvetica", "normal");
      doc.text(c.foneCliente, 110, 65);

      
      doc.setFont("helvetica", "bold");
      doc.text("Email:", 150, 65);
      doc.setFont("helvetica", "normal");
      doc.text(c.emailCliente || "N/A", 170, 65);
    });


    
    doc.line(14, 70, 200, 70); 

    
    let baseY = 90; 

    
    doc.setFont("helvetica", "bold");
    doc.text("Modelo:", 14, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(dataOS.modelo), 50, baseY);
    baseY += 10;

    
    doc.setFont("helvetica", "bold");
    doc.text("Placa:", 14, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(dataOS.placa), 50, baseY);
    baseY += 10;

   
    doc.setFont("helvetica", "bold");
    doc.text("Funcionário:", 14, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(dataOS.funcionario), 50, baseY);
    baseY += 10;

    
    doc.setFont("helvetica", "bold");
    doc.text("Prazo:", 14, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(dataOS.prazo), 50, baseY);
    baseY += 10;

    
    doc.setFont("helvetica", "bold");
    doc.text("Valor:", 14, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(dataOS.valor), 50, baseY);
    baseY += 10;

    
    doc.setFont("helvetica", "bold");
    doc.text("Serviço:", 14, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(dataOS.servico), 50, baseY);
    baseY += 10;

    

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.text("Observações:", 14, baseY);

doc.setFont("helvetica", "normal");
doc.setFontSize(8);

    
    doc.setFontSize(8)
    const termo = `
Termo de Serviço e Garantia – Estética Automotiva
O cliente autoriza a execução dos serviços automotivos descritos nesta ordem, estando ciente de que:

O diagnóstico e orçamento são gratuitos apenas mediante aprovação do serviço. Em caso de recusa, poderá ser cobrada uma taxa de avaliação técnica.

Produtos e materiais utilizados no serviço poderão ser descartados ou devolvidos ao cliente caso solicitado no ato do atendimento.

A garantia dos serviços prestados é de 90 dias, conforme o Art. 26 do Código de Defesa do Consumidor, e cobre exclusivamente o serviço executado ou produto aplicado, desde que o veículo não tenha sido submetido a intervenções de terceiros ou uso indevido.

Não nos responsabilizamos por itens pessoais deixados no interior do veículo. É recomendável a retirada de objetos antes da realização dos serviços.

Veículos não retirados em até 90 dias após a conclusão dos serviços estarão sujeitos à cobrança de taxa de permanência ou destinação adequada, conforme o Art. 1.275 do Código Civil.

O cliente declara estar ciente e de acordo com todos os termos acima descritos.`

    
    doc.text(termo, 14, 150, { maxWidth: 180 })

    
    const tempDir = app.getPath('temp')
    const filePath = path.join(tempDir, 'os.pdf')
    
    doc.save(filePath)
    
    shell.openPath(filePath)

  } catch (error) {
    console.log(error)
  }
}
