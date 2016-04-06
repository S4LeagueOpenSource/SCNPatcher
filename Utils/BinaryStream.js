var int53 = require('int53')
var SmartBuffer = require('smart-buffer')
var data

var BinaryStream = function(packet) {
	this.data = new SmartBuffer(packet)
}

BinaryStream.prototype.finalize = function() {
	this.data.writeUInt16LE(this.data.length + 2, 0)
	return this.data.toBuffer()
}

BinaryStream.prototype.readInt8 = function() {
	if(this.data._readOffset + 1 > this.data.length) {
		return 0
	}

	return this.data.readInt8()
}

BinaryStream.prototype.readUInt8 = function() {
	if(this.data._readOffset + 1 > this.data.length) {
		return 0
	}

	return this.data.readUInt8()
}

BinaryStream.prototype.readInt16LE = function() {
	if(this.data._readOffset + 2 > this.data.length) {
		return 0
	}

	return this.data.readInt16LE()
}

BinaryStream.prototype.readUInt16LE = function() {
	if(this.data._readOffset + 2 > this.data.length) {
		return 0
	}

	return this.data.readUInt16LE()
}

BinaryStream.prototype.readInt32LE = function() {
	if(this.data._readOffset + 4 > this.data.length) {
		return 0
	}

	return this.data.readInt32LE()
}

BinaryStream.prototype.readUInt32LE = function() {
	if(this.data._readOffset + 4 > this.data.length) {
		return 0
	}

	return this.data.readUInt32LE()
}

BinaryStream.prototype.readFloatLE = function() {
	if(this.data._readOffset + 4 > this.data.length) {
		return 0
	}

	return this.data.readFloatLE()
}

BinaryStream.prototype.readInt64LE = function() {
	if(this.data._readOffset + 8 > this.data.length) {
		return 0
	}

	return int53.readInt64LE(this.data)
}

BinaryStream.prototype.readUInt64LE = function() {
	if(this.data._readOffset + 8 > this.data.length) {
		return 0
	}

	return int53.readUInt64LE(this.data)
}

BinaryStream.prototype.readString = function(length) {
	return this.data.readString(length)
}

BinaryStream.prototype.readStringNT = function(encoding, encoding2) {
	if(typeof encoding === 'number') {
		var previous_length = this.data._readOffset

		var data = this.data.readStringNT(encoding2)

		var current_length = this.data._readOffset

		var amount = encoding - (current_length - previous_length)

		if(amount != 0) {
			this.data.skip(amount)
		}

		return data
	}

	return this.data.readStringNT(encoding)
}

BinaryStream.prototype.readBuffer = function(length) {
	return this.data.readBuffer(length)
}

BinaryStream.prototype.readRemaining = function() {
	return this.data.readBuffer(this.data.remaining())
}

BinaryStream.prototype.writeIpAddress = function(ip) {
	ip = ip.split('.')
	for (var i = 0; i < ip.length; i++) {
		this.data.writeUInt8(ip[i])
	}
}

BinaryStream.prototype.writeInt8 = function(int) {
	this.data.writeInt8(int)
}

BinaryStream.prototype.writeUInt8 = function(uint) {
	this.data.writeUInt8(uint)
}

BinaryStream.prototype.writeInt16LE = function(int) {
	this.data.writeInt16LE(int)
}

BinaryStream.prototype.writeUInt16LE = function(uint) {
	this.data.writeUInt16LE(uint)
}

BinaryStream.prototype.writeInt32LE = function(int) {
	this.data.writeInt32LE(int)
}

BinaryStream.prototype.writeUInt32LE = function(uint) {
	this.data.writeUInt32LE(uint)
}

BinaryStream.prototype.writeFloatLE = function(float) {
	this.data.writeFloatLE(float)
}

BinaryStream.prototype.writeInt64LE = function(int) {
	var fakeBuffer = new Buffer(8)
	int53.writeInt64LE(int, fakeBuffer)
	this.data.writeBuffer(fakeBuffer)
}

BinaryStream.prototype.writeUInt64LE = function(uint) {
	var fakeBuffer = new Buffer(8)
	int53.writeUInt64LE(uint, fakeBuffer)
	this.data.writeBuffer(fakeBuffer)
}

BinaryStream.prototype.writeString = function(str) {
	this.data.writeString(str)
}

BinaryStream.prototype.writeString = function(str, length) {
	this.data.writeString(str)
	length = length - str.length
	for(var i = 1; i <= length; i++) {
		this.data.writeUInt8(0)
	}
}

BinaryStream.prototype.writeStringNT = function(str) {
	this.data.writeStringNT(str)
}

BinaryStream.prototype.writeBuffer = function(buffer) {
	this.data.writeBuffer(buffer)
}

BinaryStream.prototype.rewind = function(value) {
	if(this.data._readOffset - value < 0) {
		return
	}

	this.data.rewind(value)
}

BinaryStream.prototype.skip = function(value) {
	if(this.data._readOffset + value > this.data.length) {
		return
	}

	this.data.skip(value)
}


module.exports = BinaryStream