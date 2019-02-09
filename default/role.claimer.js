module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = false;
		if (creep.room.name != creep.memory.target) {
			var exit = creep.room.findExitTo(creep.memory.target);
			creep.moveTo(creep.pos.findClosestByRange(exit));
		} else {
			if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				if (creep.moveTo(creep.room.controller) == ERR_NO_PATH) {
					//creep.log(`${creep.name} in room ${creep.room.name} cannot find path!`);
					creep.memory.blockingWall = creep.pos.findClosestByRange(FIND_STRUCTURES, {
						filter: (s) => (s.structureType == STRUCTURE_WALL)
					});
				}
			} else if(creep.room.controller) {
				if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
					if (creep.moveTo(creep.room.controller) == ERR_NO_PATH) {
						//creep.log(`${creep.name} in room ${creep.room.name} cannot find path!`);
					}
				}
			}
		}
	}
};