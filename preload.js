const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  move: (input) => ipcRenderer.send('move', input),
  btnPressed: (btn) => ipcRenderer.send('controller-input', btn),
  onInputRelease: (callback) => ipcRenderer.on('dpad', (e, value) => callback(e, value)),
  onInput: (callback) => ipcRenderer.on('update', (e, value) => callback(e, value))
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})