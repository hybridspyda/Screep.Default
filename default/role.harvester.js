var roleUpgrader = require('role.upgrader');
var roleRepairer = require('role.repairer');

module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = true;
		if (creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('⛏');
		}
		if (!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('🚛');
		}

		if (creep.memory.working) {
			if (creep.room.name == creep.memory.home) {
				if (creep.room.controller.level >= 2) {
					var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
							s.structureType == STRUCTURE_EXTENSION ||
							s.structureType == STRUCTURE_TOWER) &&
							s.energy < s.energyCapacity
					});

					if (structure == undefined) {
						structure = creep.room.storage;
					}

					if (structure != undefined) {
						if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(structure);
						}
					} else {
						roleRepairer.run(creep);
					}
				} else {
					roleUpgrader.run(creep);
				}
			} else {
				var exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}	else {
			if (creep.room.name == creep.memory.home) {
				creep.getEnergy(false, true);
			} else {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}
	}
};