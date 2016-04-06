process.title = 'SCNPatcher'

var fs = require('fs')

var async = require('async')

var SmartBuffer = require('smart-buffer')
var BinaryStream = require('./Utils/BinaryStream')
var Logger = require('./Utils/Logger')

var Config = require('./Config')
var EScnID = require('./Constants/EScnID')
var EScnVersion = require('./Constants/EScnVersion')

var log = new Logger('SCNPatcher')

var files

log.info('Starting SCNPatcher...')

async.series({
	loadDirFromSourcePath: function(callback) {
		log.debug('Check if the Source Path "' + Config.sourceFolder + '" exists.')

		fs.readdir(Config.sourceFolder, function(err, result) {
			if(err) {
				if(err.code === 'ENOENT') {
					return callback('Please create the folder "' + Config.sourceFolder + '".', null)
				} else {
					return callback(err, null)
				}
			}

			files = result

			log.info(files.length + ' files found.')

			callback(null, null)
		})
	},
	loadFilesFromSourcePath: function(callback) {
		log.debug('Starting to load files...')

		async.mapSeries(files, function(file, callback) {
			fs.readFile(Config.sourceFolder + '/' + file, function (err, data) {
				if(err) {

				}

				log.debug('File Name: ' + file)

				log.debug('--- DATA FROM FILE START ---')

				var bin = new BinaryStream(data)

				var version = bin.readUInt32LE()

				log.debug('SCN Version: ' + version)

				var id = bin.readUInt32LE()

				if(id !== EScnID.Root) {
					log.error('This is no SCN File from S4 League.')
					return callback(null, null)
				}

				log.debug('--- ROOT ---')

				var objectName = bin.readStringNT()
				log.debug('Object Name: ' + objectName)

				var parentName = bin.readStringNT()
				log.debug('Parent Name: ' + parentName)

				bin.skip(68) // or 16 x readFloatLE() ... But not needed ;o

				var version = bin.readUInt32LE()

				if(version === EScnVersion.Version1) {
					version = 1
				} else if(version === EScnVersion.Version2) {
					version = 2
				} else {
					log.error('Unkwnown Object Version. ' + version)
					return callback()
				}

				log.debug('Object Version: ' + version)

				var objectCount = bin.readUInt32LE()
				objectCount++
				log.debug('Object Count: ' + objectCount)

				if(version === Config.patchTo) {
					log.info('SCN File ' + file + ' is already Version ' + Config.patchTo + '.')
					return callback(null, null)
				}

				log.debug('--- DATA FROM FILE END ---')

				patch(file, bin, version, Config.patchTo, function(err) {
					if(err) {
						log.error(err)
						return callback()
					}

					log.info('Patched SCN File ' + file + ' from ' + version + ' to ' + Config.patchTo + '.')
					callback()
				})
			})
		},
		function() {
			callback(null, null)
		})
	}
}, function(err) {
	if(err) {
		log.error(err)
		process.exit()
	}
})

function patch(file, bin, from, to, callback) {
	if(from === 1 && to === 2) {
		// Set Version to 2
		// Add 1 Byte
	} else if(from === 2 && to === 1) {
		// Set version to 1
		// Remove 1 Byte
	} else {
		callback('Unsupported Patch - from Version: ' + from + ' to Version: ' + to)
	}

	var newFile = new SmartBuffer()

	bin.data._readOffset = 0
	bin.data._writeOffset = 0 // Reset read offset

	newFile.writeUInt32LE(bin.readUInt32LE()) // SCN Version
	newFile.writeUInt32LE(bin.readUInt32LE()) // Object ID
	newFile.writeStringNT(bin.readStringNT()) // Object Name
	newFile.writeStringNT(bin.readStringNT()) // Parent Name
	newFile.writeBuffer(bin.readBuffer(68)) // or 16 x readFloatLE() ... But not needed ;o

	if(from === 1 && to === 2) {
		bin.skip(4)
		newFile.writeUInt32LE(EScnVersion.Version2)
		newFile.writeUInt32LE(bin.readUInt32LE()) // Object Count

		newFile.writeUInt8(0) // Add missing 1 Byte

		newFile.writeBuffer(bin.readRemaining()) // Read and add remaining data
	} else if(from === 2 && to === 1) {
		bin.skip(4)
		newFile.writeUInt32LE(EScnVersion.Version1)
		newFile.writeUInt32LE(bin.readUInt32LE()) // Object Count

		bin.skip(1) // Remove 1 Byte

		newFile.writeBuffer(bin.readRemaining()) // Read and add remaining data
	}

	// And save to target folder
	fs.writeFile(Config.targetFolder + '/' + file, newFile.toBuffer(), { encoding: 'binary' }, function (err) {
		if (err) throw err

		callback()
	})
}