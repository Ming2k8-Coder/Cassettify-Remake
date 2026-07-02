const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('node:path');
const fs = require('node:fs/promises');

let win;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // Connect preload.js to main path
      preload: path.join(__dirname, 'js/preload/preload.js'),
      sandbox: false
    }
  })
  // Remove toolbar
  //win.removeMenu();

  win.loadFile('views/index.html');
}

// Handle getting audio files and return only their paths
ipcMain.handle('open-file-dialog', async () => {
  const audioFiles = await dialog.showOpenDialog(win, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Audio', extensions: ['mp3', 'ogg', 'wav', 'flac'] }]
  });

  if (audioFiles.canceled) return [];

  return audioFiles.filePaths;
});

// Read and return metadata from each cassette in the cassettes folder as a dictionary
ipcMain.handle('get-cassette-data', async () => {
  const cassetteFolder = __dirname + '/cassettes/';
  try {
    await fs.access(cassetteFolder);
  } catch {
    return []; // Folder doesn't exist yet, return empty list
  }
  
  let cassetteList = await fs.readdir(cassetteFolder);
  let cassetteDataList = [];
  for (let i = 0; i < cassetteList.length; i++)  {
    try {
        const meta = JSON.parse(await fs.readFile(cassetteFolder + cassetteList[i] + '/meta.json'));
        cassetteDataList.push(meta);
    } catch(err) {
        // Skip folders without valid meta.json
    }
  }
  return cassetteDataList.sort((a, b) => a.artist.localeCompare(b.artist));
});

// Update cassette metadata in meta.json
ipcMain.handle('save-cassette-data', async (event, uuid, updatedData) => {
  const metaPath = path.join(__dirname, 'cassettes', uuid, 'meta.json');
  try {
    const rawData = await fs.readFile(metaPath, 'utf8');
    let meta = JSON.parse(rawData);
    
    // Update fields
    meta = { ...meta, ...updatedData };
    
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 4));
    return { success: true, meta: meta };
  } catch (err) {
    console.error(`Failed to update meta.json for ${uuid}:`, err);
    return { success: false, error: err.message };
  }
});

// Extract palette using node-vibrant
const Vibrant = require('node-vibrant');
ipcMain.handle('extract-palette', async (event, coverHash) => {
  const imagePath = path.join(__dirname, 'cassetteAlbumCovers', `${coverHash}.jpg`);
  try {
    const palette = await Vibrant.from(imagePath).getPalette();
    // Format the palette into hex strings
    return {
      success: true,
      palette: {
        Vibrant: palette.Vibrant ? palette.Vibrant.hex : null,
        Muted: palette.Muted ? palette.Muted.hex : null,
        DarkVibrant: palette.DarkVibrant ? palette.DarkVibrant.hex : null,
        DarkMuted: palette.DarkMuted ? palette.DarkMuted.hex : null,
        LightVibrant: palette.LightVibrant ? palette.LightVibrant.hex : null,
        LightMuted: palette.LightMuted ? palette.LightMuted.hex : null,
      }
    };
  } catch (err) {
    console.error(`Failed to extract palette for ${coverHash}:`, err);
    return { success: false, error: err.message };
  }
});

// Start application
app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong');
  createWindow();

  // Window setting for MacOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Window setting for Windows & Linux
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});