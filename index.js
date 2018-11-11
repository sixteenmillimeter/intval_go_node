'use strict';

const electron = require('electron');
const { Menu, MenuItem, ipcMain, BrowserWindow, app } = electron;
const os = require('os');
const req = require('request');

const system = require('system');

const delay = require('delay');
const exit = require('exit');
const ffprobe = require('ffprobe');
const ffmpeg = require('ffmpeg');
const capture = require('capture');
let display;


let mainWindow;
let menu;

let SYSTEM;

async function parseMsg(evt, obj) {
	let info;
	let frames;
	if (obj.type === 'start') {
		start();
	} else if (obj.type === 'method') {

	} else if (obj.type === 'video') {
		try {
			info = await ffprobe.info(obj.video)
		} catch (err) {
			console.error(err);
		}
		try {
			frames = await ffprobe.frames(obj.video)
		} catch (err) {
			console.error(err);
		}
		//console.dir(info)
		//console.log(frames)
		send({ type : 'info', info, frames, name : obj.name, path : obj.video })
	}
}

async function send (obj) {
	mainWindow.send('msg', obj);
}

function createMenu () {
	const template = require('./data/menu.json')
	menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

async function createWindow () {
	mainWindow = new BrowserWindow({
		webPreferences: {
      		nodeIntegration: true,
      		allowRunningInsecureContent: false
    	},
		width: 300, 
		height: 400,
		minWidth : 300,
		minHeight : 400//,
		//icon: path.join(__dirname, 'assets/icons/icon.png')
	})
	mainWindow.loadURL('file://' + __dirname + '/index.html')
	if (process.argv.indexOf('-d') !== -1 || process.argv.indexOf('--dev') !== -1) {
		mainWindow.webContents.openDevTools()
	}
	mainWindow.on('closed', () => {
		mainWindow = null
	})

	return true;
}

async function init () {

	try {
		SYSTEM = await system()
	} catch (err) {
		console.error(err);
	}

	display = require('display')(SYSTEM);

	console.dir(SYSTEM);

	await createWindow();

	await delay(200);

	send({ type: 'system', system : SYSTEM });
	//createMenu();

	//await display();
}

async function start () {

}

ipcMain.on('msg', parseMsg)

app.on('ready', init);

app.on('window-all-closed', app.quit);

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
})