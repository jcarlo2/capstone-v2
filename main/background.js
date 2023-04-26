import {app, dialog, ipcMain, Menu, BrowserWindow} from 'electron';
import serve from 'electron-serve';
import {createWindow} from './helpers';

const isProd = process.env.NODE_ENV === 'production';
let mainWindow

if (isProd) {
  serve({ directory: 'app' });
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`);
}

(async () => {
  await app.whenReady();

  mainWindow = createWindow('main', {
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: 'src/image/logo.png'
  });

  const mainMenu = Menu.buildFromTemplate([])
  Menu.setApplicationMenu(mainMenu)

  if (isProd) {
    console.log(isProd)
    await mainWindow.loadURL('app://./home.html');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('WAIT')
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on('window-all-closed', () => {
  app.quit();
});

ipcMain.on('login',(e,isVerified)=> {
  console.log(isVerified)
})

ipcMain.on('showError',(e,title,message)=> {
  dialog.showErrorBox(title,message)
})

ipcMain.on('showMessage',(e,title,message)=> {
  dialog.showMessageBoxSync(mainWindow,{
    title: title,
    message: message,
    type: 'none'})
})

ipcMain.on('documentPath',()=> {
  mainWindow.webContents.send('documentPath',app.getPath('documents'))
})

ipcMain.handle('open-dialog-box', async (event, options) => {
  mainWindow.focus();
  const result = await dialog.showMessageBox(mainWindow, options);
  return result.response;
});
