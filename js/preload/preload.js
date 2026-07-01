const { contextBridge, ipcRenderer } = require('electron');
const initializeAudio = require ('./metaFinder.js');
const findBeats = require ('./beatFinder.js');

contextBridge.exposeInMainWorld('metadata', {
  initializeAudio: (audioPath) => initializeAudio(audioPath),
  findBeats: (audioPath) => findBeats(audioPath),
  getCassetteData: () => ipcRenderer.invoke('get-cassette-data')
});

contextBridge.exposeInMainWorld('filesystem', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog')
});