var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');
var roleWallRepairer = require('role.wallRepairer');

module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = true;
		if (creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('🗲');
		}
		if (!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
			switch(creep.memory.secondaryRole) {
				case 'repairer':
					creep.memory.secondaryRole = 'upgrader';
					break;
				case 'upgrader':
					creep.memory.secondaryRole = 'wallRepairer';
					break;
				default:
					creep.memory.secondaryRole = 'repairer';
					break;
			}
			creep.memory.working = true;
			creep.say('👷');
		}

		let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => (s.structureType == STRUCTURE_CONTAINER)
		});
		if (creep.memory.working) {
			if (creep.room.name == creep.memory.home) {
				let spawn = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
					filter: (s) => (s.structureType == STRUCTURE_SPAWN)
				});
				if (spawn != undefined) {
					if (creep.build(spawn) == ERR_NOT_IN_RANGE) {
						creep.moveTo(spawn);
					} else {
						creep.moveRandomWithin(spawn);
					}
				} else {
					let constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
						filter: (s) => (s.structureType == STRUCTURE_CONTAINER ||
							s.structureType == STRUCTURE_EXTENSION)
					});
					if (constructionSite == undefined) {
						constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
					}
					if (constructionSite != undefined) {
						if (creep.pos.getRangeTo(container) <= 1) {
							creep.say('🎶');
							creep.moveRandomWithin(constructionSite);
						} else {
							creep.moveTo(constructionSite);
						}
						if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
							creep.moveTo(constructionSite);
						} else {
							creep.moveRandomWithin(constructionSite);
						}
					} else {
						switch(creep.memory.secondaryRole) {
							case 'repairer':
								roleRepairer.run(creep);
								break;
							case 'upgrader':
								roleUpgrader.run(creep);
								break;
							case 'wallRepairer':
								roleWallRepairer.run(creep);
								break;
						}
					}
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