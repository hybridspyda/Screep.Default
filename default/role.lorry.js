module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = true;
		if (creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('📥');
		}
		if (!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('🚛');
		}

		let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => (s.structureType == STRUCTURE_CONTAINER)
		});
		if (creep.memory.working) {
			if (creep.room.name == creep.memory.home) {
				var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (s) => (s.structureType == STRUCTURE_SPAWN
								 || s.structureType == STRUCTURE_EXTENSION
								 || s.structureType == STRUCTURE_TOWER)
								 && s.energy < s.energyCapacity
				});

				if (target == undefined) {
					target = creep.room.storage;
				}

				if (target != undefined) {
					if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				} else {
					if (creep.pos.getRangeTo(container) <= 1) {
						creep.say('🎶');
						creep.moveRandom();
					} else {
						/*if(creep.room.controller) {
							if(creep.signController(creep.room.controller, "Powered by HybridAI.") == ERR_NOT_IN_RANGE) {
								creep.moveTo(creep.room.controller);
							}
						}*/
						creep.moveTo(creep.room.controller);
						if (creep.pos.getRangeTo(creep.room.controller) <= 3) {
							creep.drop(RESOURCE_ENERGY);
						}
					}
				}
			} else {
				var exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}	else {
			if (creep.room.name == creep.memory.home) {
				creep.getEnergy(true, false, false);
			} else {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}
	}
};