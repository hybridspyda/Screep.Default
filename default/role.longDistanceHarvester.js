module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = false;
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
					if (creep.hits == creep.hitsMax) {
						if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(target);
						}
					}
				} else {
					var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
							filter: (s) => (s.structureType == STRUCTURE_SPAWN)
					});
					if (spawn != undefined) {
							if (creep.pos.getRangeTo(spawn) > 3) {
									creep.moveTo(spawn);
							} else {
									creep.moveRandomWithin(spawn, 3);
									if (creep.pos.getRangeTo(spawn) == 1) {
											creep.drop(RESOURCE_ENERGY);
									}
							}
					}
				}
			} else {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}	else {
			if (creep.hits != creep.hitsMax) {
				let exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			} else if (creep.room.name == creep.memory.target) {
				let source = creep.room.find(FIND_SOURCES)[creep.memory.sourceIndex];
				if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
					creep.moveTo(source);
				}
			} else {
				let exit = creep.room.findExitTo(creep.memory.target);
				creep.moveTo(creep.pos.findClosestByRange(exit));
			}
		}
	}
};