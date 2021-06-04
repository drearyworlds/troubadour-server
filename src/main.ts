import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import * as url from 'url'
import Configuration from './config/configuration-service'
import LogService from './logging/log-service'
import { LogLevel } from './logging/log-service'
import { TroubadourServer } from './troubadour-server'

let win: BrowserWindow

app.on('ready', () => {
  createWindow();
  LogService.win = win

  LogService.log(LogLevel.Info, `Userdata path: ${app.getPath(`userData`)}`)
  Configuration.initialize(app.getPath(`userData`))

  // Start the Troubadour server
  let server: TroubadourServer = new TroubadourServer()
  server.Run()
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

function createWindow() {
  win = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../dist/index.html`),
      protocol: 'file:',
      slashes: true,
    })
  )

  win.on('closed', () => {
    win = null
  })
}