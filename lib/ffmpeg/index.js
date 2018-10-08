'use strict';

const uuid = require('uuid').v4;
const path = require('path');
const fs = require('fs-extra');

const exec = require('exec');
const exit = require('exit');

let system = {};

function padded_frame (i) {
	let len = (i + '').length;
	let str = i + '';
	for (let x = 0; x < 5 - len; x++) {
		str = '0' + str;
	}
	return str;
}

async function frame (video, frame, obj) {
	let padded = padded_frame(frame);
	let ext = 'tif';
	let tmpoutput;
	let cmd;

	if (system.platform !== 'nix') {
		ext = 'png';
	}

	tmpoutput = path.join('/tmp', `export-${padded}.${ext}`)
	cmd = `ffmpeg -i "${video}" -vf select='gte(n\\,${frame})' -vframes 1 -compression_algo raw -pix_fmt rgb24 "${tmpoutput}"`

	//ffmpeg -i "${video}" -ss 00:00:07.000 -vframes 1 "export-${time}.jpg"

	//ffmpeg -i "${video}" -compression_algo raw -pix_fmt rgb24 "export-%05d.tiff"
	//-vf "select=gte(n\,${frame})" -compression_algo raw -pix_fmt rgb24 "export-${padded}.png"

	let output;
	
	try {
		output = await exec(cmd);
	} catch (err) {
		console.error(err);
	}

	console.log(cmd)

	console.log(output);

}

async function frames (video, obj) {
	let id = uuid();
	let tmppath = path.join(system.tmp, id);
	let tmpoutput = path.join(tmppath, 'export-%05d.tiff');
	try {
		await fs.mkdir(tmppath)
	} catch (Err) {
		console.error(err);
	}

	//ffmpeg -i "${video}" -compression_algo raw -pix_fmt rgb24 "${tmpoutput}"
}

async function clear (id, frame) {

}

async function clearAll (id) {
	let tmppath = path.join(system.tmp, id);
	let files;
	try {
		files = await fs.readdir(tmppath);
	} catch (err) {
		console.error(err);
	}
	if (files) {
		files.forEach(async (file, index) => {
			try {
				await fs.unlink(path.join(tmppath, file));
			} catch (err) {
				console.error(err);
			}
		});
	}
	try {
		await fs.unlink(tmppath);
	} catch (err) {
		console.error(err);
	}
}

frame('/home/mmcw/Downloads/AgXSiteBackgroundV3.mp4', 50)

module.exports.frames = frames;