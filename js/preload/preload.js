const { contextBridge, ipcRenderer } = require('electron');
const initializeAudio = require ('./metaFinder.js');
const findBeats = require ('./beatFinder.js');

contextBridge.exposeInMainWorld('metadata', {
  initializeAudio: (audioPath) => initializeAudio(audioPath),
  findBeats: (audioPath) => findBeats(audioPath),
  getCassetteData: () => ipcRenderer.invoke('get-cassette-data'),
  saveCassetteData: (uuid, data) => ipcRenderer.invoke('save-cassette-data', uuid, data),
  extractPalette: (coverHash) => ipcRenderer.invoke('extract-palette', coverHash),
  getAudioBuffer: (audioPath) => ipcRenderer.invoke('get-audio-buffer', audioPath)
});

contextBridge.exposeInMainWorld('filesystem', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  selectExportFolder: () => ipcRenderer.invoke('select-export-folder'),
  exportCassette: (uuid, destFolder) => ipcRenderer.invoke('export-cassette', uuid, destFolder)
});