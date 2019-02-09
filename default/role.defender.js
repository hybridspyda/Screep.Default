
module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = false;
		
		if (creep.hits < creep.hitsMax) {
			creep.heal(creep);
		}
		
		if (creep.room.name == creep.memory.home) {
			if (creep.pos.isExit()) {
				creep.moveRandomWithin(new RoomPosition(25, 25, creep.memory.home));
			}
			let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target != undefined) {
				let range = creep.pos.getRangeTo(target);
				if (range > 3) {
					creep.moveTo(target);
				} else if (range < 3) {
					let direction = creep.pos.getDirectionTo(target);
					creep.rangedAttack(target);
					direction = (direction + 3) % 8 + 1;
					creep.move(direction);
				}
				creep.rangedAttack(target);
			} else {
				let hurtCreeps = creep.room.find(FIND_MY_CREEPS, {
					filter: (c) => c.hits < c.hitsMax
				});

				if (hurtCreeps.length) {
					let target = creep.pos.findClosestByRange(hurtCreeps);
					if (creep.heal(target) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				} else {
					// look for claimer...
					let claimers = creep.room.find(FIND_MY_CREEPS, {
						filter: (c) => c.memory.role == 'claimer' && c.memory.blockingWall != undefined
					});
					if (claimers.length) {
						let target = Game.getObjectById(claimers[0].memory.blockingWall.id);
						//creep.log(`Blocking target: ${target} found...`);
						if (target != undefined) {
							let range = creep.pos.getRangeTo(target);
							if (range > 3) {
								creep.moveTo(target);
							}
							creep.rangedAttack(target);
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
							}
						} else {
							if (creep.pos.getRangeTo(creep.room.controller) > 3) {
									creep.moveTo(creep.room.controller);
							} else {
									creep.moveRandomWithin(creep.room.controller, 3);
							}
						}
					}
				}
			}
		} else {
			var exit = creep.room.findExitTo(creep.memory.home);
			creep.moveTo(creep.pos.findClosestByRange(exit));
			creep.say('🏠');
		}
	}
};