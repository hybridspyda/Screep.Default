module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = true;
		if (creep.room.name == creep.memory.home) {
			let source = Game.getObjectById(creep.memory.sourceId);
			let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
				filter: s => s.structureType == STRUCTURE_CONTAINER
			})[0];

			if (creep.pos.isEqualTo(container.pos)) {
				creep.harvest(source);
			} else {
				creep.moveTo(container);
			}
		} else {
			var exit = creep.room.findExitTo(creep.memory.home);
			creep.moveTo(creep.pos.findClosestByRange(exit));
			creep.say('🏠');
		}
	}
};