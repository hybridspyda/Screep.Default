var roleBuilder = require('role.builder');

module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = false;
		if (creep.memory.working && creep.carry.energy == 0) {
			creep.memory.working = false;
			creep.say('🗲');
		}
		if (!creep.memory.working && _.sum(creep.carry) == creep.carryCapacity) {
			creep.memory.working = true;
			creep.say('🚧');
		}
		let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => (s.structureType == STRUCTURE_CONTAINER)
		});
		if (creep.memory.working) {
			if (creep.room.name == creep.memory.home) {
				var walls = creep.room.find(FIND_STRUCTURES, {
					filter: (s) => s.structureType == STRUCTURE_WALL
				});

				var target = undefined;
				for (let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001) {
					for (let wall of walls) {
						if (wall.hits / wall.hitsMax < percentage) {
							target = wall;
							break;
						}
					}

					if (target != undefined) {
						break;
					}
				}

				if (target != undefined) {
					if (creep.repair(target) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				} else {
					roleBuilder.run(creep);
				}
			} else {
				var exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}
		else {
			creep.getEnergy(true, true);
		}
	}
};