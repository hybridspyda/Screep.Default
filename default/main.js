// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');

module.exports.loop = function () {
	// check for memory entries of died creeps by iterating of Memory.creeps
	for (let name in Memory.creeps) {
		// and checking if the creep is still alive
		if (!Game.creeps[name]) {
			// if not, delete the memory entry
			//console.log("Clearing non-existing creep memory: "+name);
			delete Memory.creeps[name];
		}
	}

	// find all creeps
	for (let name in Game.creeps) {
		var resource;
		if (Game.creeps[name].room.storage) {
			for (let resourceType in Game.creeps[name].carry) {
			    if (resourceType != RESOURCE_ENERGY) {
			        resource = resourceType;
				    if (Game.creeps[name].transfer(Game.creeps[name].storage, resourceType) == ERR_NOT_IN_RANGE) {
					    Game.creeps[name].moveTo(Game.creeps[name].storage);
				    }
			    }
			}
		}
		if (resource == undefined) {
			// run creep logic
			Game.creeps[name].runRole();
			Game.creeps[name].createFrequentRoad();
		} else {
		    Game.creeps[name].say(resource);
		}
	}
	
	// find all towers 
	var towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
	// for each tower
	for (let tower of towers) {
		// run tower logic
		tower.defend();
		tower.healCreeps();
		tower.repairRampart();
	}

	// for each spawn
	for (let spawnName in Game.spawns) {
		// run spawn logic
		Game.spawns[spawnName].spawnCreepsIfNecessary();
		Game.spawns[spawnName].maintainRoadFlags();
	}
}