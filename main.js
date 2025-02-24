console.log("Processo principal")

const { app, BrowserWindow, nativeTheme, Menu } = require('electron')

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
    resizable: false
  })

  // menu personalizado
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))

  win.loadFile('./src/views/index.html')
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

// template do menu
const template = [
  {
    label: 'Cadastro',
    submenu: [
      {
        label: 'Clientes'
      },
      {
        label: 'Veículos'
      },
      {
        label: 'Ordem de Serviço'
      },
      { label: 'Funcionários'
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