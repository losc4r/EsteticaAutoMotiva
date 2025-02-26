/**
 * Arquivo de pré carregamento e reforço de segurança na comunicação entre processos (IPC)
 */

// importação dos recursos do framework electron
// contextBrigde (segurança) ipcRenderer (comunicação)
const {contextBridge, ipcRenderer} = require('electron')

// expor (autorizar a comunicação entre processos)
contextBridge.exposeInMainWorld('api', {
    clientWindow: () => ipcRenderer.send('client-window'),
    veiculoWindow: () => ipcRenderer.send('veiculo-window'),
    osWindow: () => ipcRenderer.send('os-window'),
    funcionarioWindow: () => ipcRenderer.send('funcionario-window')
})
