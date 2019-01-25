var roleRepairer = require('role.repairer');

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
				let constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
					filter: (cs) => (cs.structureType == STRUCTURE_WALL
												|| cs.structureType == STRUCTURE_RAMPART)
				});
				if (constructionSite != undefined) {
					if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
						creep.moveTo(constructionSite);
					} else {
						creep.moveRandomWithin(constructionSite);
					}
				} else {
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
						//creep.log(`${target}`)
						if (creep.repair(target) == ERR_NOT_IN_RANGE) {
							creep.moveTo(target);
						}
					} else {
						roleRepairer.run(creep);
					}
				}
			} else {
				var exit = creep.room.findExitTo(creep.memory.home);
				creep.moveTo(creep.pos.findClosestByRange(exit));
				creep.say('🏠');
			}
		}	else {
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