
module.exports = {
	/** @param {Creep} creep **/
	run: function(creep) {
		creep.memory.canBuildRoads = false;
		
		if (creep.hits < creep.hitsMax) {
			creep.heal(creep);
		}
		
		if (creep.room.name == creep.memory.home) {
			let target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if (target != undefined) {
				let range = creep.pos.getRangeTo(target);
				if (range > 3) {
					creep.moveTo(target);
				} else {
					let direction = creep.pos.getDirectionTo(target);
					creep.rangedAttack(target);
					direction = (direction + 3) % 8 + 1;
					creep.move(direction);
				}
				creep.rangedAttack(target);
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
		} else {
			var exit = creep.room.findExitTo(creep.memory.home);
			creep.moveTo(creep.pos.findClosestByRange(exit));
			creep.say('🏠');
		}
	}
};