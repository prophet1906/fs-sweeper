// Initialize Logger
const { createLogger, format, transports } = require("winston");
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const logger = createLogger({
  level: "debug",
  levels: logLevels,
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console(), new transports.File({ filename: "sweeper.log" })],
});

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
var cron = require('node-cron')

// Initialize Ajv JSON schema validator
const Ajv = require("ajv/dist/jtd")
const ajv = new Ajv({ allErrors: true })

ajv.addKeyword('cronExpression', {
  modifying: false,
  schema: false,
  validate: function validate(data, dataPath, parentData, parentDataProperty){
    const valid = cron.validate(data)
    if(!valid) {
      validate.errors = [{keyword: 'Cron', message: `${data} shoud be should be a valid cron expression.`, params: {keyword: 'cron'}}];
    }
    return valid;
  },
  errors: true,
});

const configSchemaJTD = JSON.parse(fs.readFileSync('config.jtd.json', 'utf8'))
const parseConfig = ajv.compile(configSchemaJTD)


const createWindow = () => {
  logger.debug("Creating Window and Loading index.html file.")
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')

  win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    logger.debug("Activating Window.")
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    logger.debug("Executing Special Exit for Mac.")
    app.quit()
  }
})

ipcMain.on('read-config', (event, arg) => {
  logger.info("Existing Sweeper Configuration Read.")
  event.returnValue = fs.readFileSync('sweeper-config.json', 'utf8')
})

ipcMain.on('write-config', (event, arg) => {
  const parseResult = parseConfig(arg.config)
  if (!parseResult) {
    logger.error("Sweeper Configuration Update Failed.")
    event.returnValue = parseConfig.errors
  } else {
    fs.writeFileSync('sweeper-config.json', JSON.stringify(arg.config, null, 4))
    logger.info("Sweeper Configuration Updated.")
    event.returnValue = "Configuration Updated Successfully."
  }
})

ipcMain.on('read-logs', (event, arg) => {
  event.returnValue = fs.readFileSync('sweeper.log', 'utf8')
})

ipcMain.on('read-instructions', (event, arg) => {
  event.returnValue = fs.readFileSync('instructions.txt', 'utf8')
})

let tasks = []

function processRule(source, destination, moveFlag) {
  // TODO: Add logic to move or copy files from source to destination
  if(moveFlag) {
    logger.info(`Moving Files from ${source} to ${destination}`)
  } else {
    logger.info(`Copying Files from ${source} to ${destination}`)
  }
}

ipcMain.on('reconfigure-sweeper', (event, arg) => {
  const sweeperConfig = JSON.parse(fs.readFileSync('sweeper-config.json', 'utf8'))
  logger.debug("Stopping Existing Sweeper Tasks.")
  tasks.forEach(task => {
    task.stop()
  })
  logger.debug("Creating New Sweeper Tasks.")
  tasks = sweeperConfig.map(rule => {
    const task = cron.schedule(rule.cron, () =>  {
      processRule(rule.source, rule.destination, rule.move)
    })
    task.start()
    return task   
  })
  logger.info("File System Sweeper Reconfigured.")
  event.returnValue = true
})