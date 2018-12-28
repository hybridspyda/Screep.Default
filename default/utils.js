'use strict';

String.prototype.rpad = function(padString, length) {
	var str = this;
	while (str.length < length) {
		str = str + padString;
	}
	return str;
};

String.prototype.lpad = function(padString, length) {
	var str = this;
	while (str.length < length) {
		str = padString + str;
	}
	return str;
};

Room.prototype.log = function(message) {
	console.log(`${Game.time} ${this.name.rpad(' ', 27)} ${message}`);
};

RoomObject.prototype.log = function(message) {
	console.log(`${Game.time} ${this.room.name.rpad(' ', 6)} ${this.name.rpad(' ', 20)} ${this.pos} ${message}`);
};

RoomPosition.prototype.getAdjacentPosition = function(direction) {
	var adjacentPos = [
		[0, 0],
		[0, -1],
		[1, -1],
		[1, 0],
		[1, 1],
		[0, 1],
		[-1, 1],
		[-1, 0],
		[-1, -1]
	];
	return new RoomPosition(this.x + adjacentPos[direction][0], this.y + adjacentPos[direction][1], this.roomName);
};

RoomPosition.prototype.isExit = function() {
	if (this.x <= 1 || this.x >= 48 || this.y <= 1 || this.y >= 48) {
		return true;
	}
	return false;
};