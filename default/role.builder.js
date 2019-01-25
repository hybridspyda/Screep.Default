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
    			    let constructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
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
    					roleRepairer.run(creep);
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