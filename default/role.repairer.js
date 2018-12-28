var roleUpgrader = require('role.upgrader');

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
			creep.say('🛠');
		}

		let container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (s) => (s.structureType == STRUCTURE_CONTAINER)
		});
		if (creep.memory.working) {
			if (creep.room.name == creep.memory.home) {
				// find closest structure with less than max hits
				// Exclude walls because they have way too many max hits and would keep
				// our repairers busy forever. We have to find a solution for that later.
				let structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					// the second argument for findClosestByPath is an object which takes
					// a property called filter which can be a function
					// we use the arrow operator to define it
					filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
				});

				// if we find one
				if (structure != undefined) {
					if (creep.pos.getRangeTo(container) <= 1) {
						creep.say('🎶');
						creep.moveRandomWithin(structure);
					}
					let ramparts = creep.room.find(FIND_STRUCTURES, {
						filter: (r) => (r.hits / r.hitsMax) < 0.2 && r.structureType == STRUCTURE_RAMPART
					});
					if (ramparts.length && structure.structureType == STRUCTURE_RAMPART) {
						structure = ramparts[0];
						for (var rampart of ramparts) {
							if (structure.hits > rampart.hits) {
								structure = rampart;
							}
						}
						if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
							// move towards it
							creep.moveTo(structure);
						}
					} else if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
						// move towards it
						creep.moveTo(structure);
					}
				} else { // if we can't fine one
					// upgrade!
					roleUpgrader.run(creep);
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