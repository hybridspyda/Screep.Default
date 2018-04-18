var roleRepairer = require('role.repairer');
var roleUpgrader = require('role.upgrader');

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
						creep.moveTo(creep.room.controller);
					}
				}
				if (constructionSite != undefined) {
					if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
						creep.moveTo(constructionSite);
					}
				} else {
					let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						// the second argument for findClosestByPath is an object which takes
						// a property called filter which can be a function
						// we use the arrow operator to define it
						filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
					});
					if (structure != undefined) {
						let ramparts = creep.room.find(FIND_STRUCTURES, {
							filter: (r) => (r.hits / r.hitsMax) < 0.2 && r.structureType == STRUCTURE_RAMPART
						});
						if (ramparts.length && structure.structureType == STRUCTURE_RAMPART) {
							roleRepairer.run(creep);
						} else {
							roleUpgrader.run(creep);
						}
					} else {
						roleUpgrader.run(creep);
					}
				}
			} else {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		} else {
			creep.getEnergy(true, true);
		}
	}
};