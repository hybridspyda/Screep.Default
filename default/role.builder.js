var roleRepairer = require('role.repairer');

module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = true;
		if (creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('🗲');
		}
		if (!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('👷');
		}

		let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => (s.structureType == STRUCTURE_CONTAINER)
		});
		if (creep.memory.working) {
			if (creep.room.name == creep.memory.home) {
				let constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
				if (creep.pos.getRangeTo(container) <= 1) {
					creep.say('🎶');
					if (constructionSite != undefined) {
						creep.moveTo(constructionSite);
					} else {
						creep.moveRandomWithin(constructionSite);
					}
				}
				if (constructionSite != undefined) {
					if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
						creep.moveTo(constructionSite);
					} else {
						creep.moveRandom();
					}
				} else {
					roleRepairer.run(creep);
				}
			} else {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		} else {
			if (creep.room.name == creep.memory.home) {
				creep.getEnergy(true, true);
			} else {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}
	}
};