var listOfRoles = [
	'harvester',
	'lorry',
	'claimer',
	'upgrader',
	'repairer',
	'builder',
	'wallRepairer'
];

StructureSpawn.prototype.spawnCreepsIfNecessary =
	function() {
		/** @type {Room} */
		let room = this.room;
		// find all creeps in room
		/** @type {Array.<Creep>} */
		let creepsInRoom = room.find(FIND_MY_CREEPS);

		// count the number of creeps alive for each role in this room
		// _.sum will count the number of properties in Game.creeps filtered by the
		//  arrow function, which checks for the creep being a specific role
		/** @type {Object.<string, number>} */
		let numberOfCreeps = {};
		for (let role of listOfRoles) {
			numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
		}
		let maxEnergy = room.energyCapacityAvailable;
		let name = undefined;

		// Check for the initialization flag
		if (!this.memory.init
			|| !this.memory.minCreeps
			|| !this.memory.minLongDistanceHarvesters
			|| !this.memory.roadFlagTimers) {
			// Initialization not done: do it
			if (!this.memory.minCreeps) {
				this.memory.minCreeps = {
					builder: 2,
					harvester: 4,
					lorry: 0,
					repairer: 1,
					upgrader: 1,
					wallRepairer: 1
				};
			}
			if (!this.memory.minLongDistanceHarvesters) {
				this.memory.minLongDistanceHarvesters = {};
			}
			if (!this.memory.roadFlagTimers) {
				this.memory.roadFlagTimers = {};
			}
			// Set the initialization flag
			this.memory.init = true;
		}

		// if no harvesters are left AND either no miners or no lorries are left
		// create a backup creep
		if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['lorry'] == 0) {
			// if there are still miners of enough energy in Storage left
			if (numberOfCreeps['miner'] > 0
			|| (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
				// create a lorry
				name = this.createLorry(150, room.name);
			} else { // if there is no miner and not enough energy in Storage left
				// create a harvester because it can work on its own
				name = this.createCustomCreep(room.energyAvailable, 'harvester', room.name);
			}
		} else { // if no backup creep is required
			// check if all sources have miners
			let sources = room.find(FIND_SOURCES);
			// iterate over all sources
			for (let source of sources) {
				// if the source has no miner
				if ((!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id))
					&& room.energyCapacityAvailable >= 550) {
					// check whether or not the source has a container
					/** @type {Array.StructureContainer} */
					let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
						filter: s => s.structureType == STRUCTURE_CONTAINER
					});
					// if there is a container next to the source
					if (containers.length > 0) {
						// spawn a miner
						name = this.createMiner(source.id, room.name);
						break;
					}
				}
			}
		}

		// if none of the above caused a spawn command check for other roles
		if (name == undefined) {
			for (let role of listOfRoles) {
				// check for claim order
				if (role == 'claimer' && this.memory.claimRoom != undefined) {
					// try to spawn a claimer
					name = this.createClaimer(this.memory.claimRoom);
					// if that worked
					if (!(name < 0)) {
						delete this.memory.claimRoom;
					}
				} else if (numberOfCreeps['harvester'] < this.memory.minCreeps['harvester']) {
					name = this.createCustomCreep(maxEnergy, 'harvester', room.name);
					// if no claim order was found, check other roles
				} else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
					if (role == 'lorry') {
						name = this.createLorry(150, room.name);
					} else {
						name = this.createCustomCreep(maxEnergy, role, room.name);
					}
				}
			}
		}

		// if none of the above caused a spawn command check for LongDistanceHarvesters
		/** @type {Object.<string, number>} */
		let numberOfLongDistanceHarvesters = {};
		if (name == undefined) {
			// count the number of long distance harvesters globally
			for (let roomName in this.memory.minLongDistanceHarvesters) {
				numberOfLongDistanceHarvesters[roomName] = _.sum(Game.creeps, (c) =>
					c.memory.role == 'longDistanceHarvester' && c.memory.target == roomName)

				if (numberOfLongDistanceHarvesters[roomName] < this.memory.minLongDistanceHarvesters[roomName]) {
					name = this.createLongDistanceHarvester(maxEnergy, 3, room.name, roomName, 0);
				}
			}
		}

		// print name to console if spawning was a success
		if (name != undefined && _.isString(name)) {
			console.log(this.name+" spawning new creep: "+name+" ("+Game.creeps[name].memory.role+")");
			for (let role of listOfRoles) {
				console.log(role+": "+numberOfCreeps[role]);
			}
			for (let roomName in numberOfLongDistanceHarvesters) {
				console.log("LongDistanceHarvester"+roomName+": "+numberOfLongDistanceHarvesters[roomName]);
			}
		}
	};

StructureSpawn.prototype.createCustomCreep =
	function(energy, roleName, home) {
		var numberOfParts = Math.floor(energy / 200);
		var body = [];
		for (let i = 0; i < numberOfParts; i++) {
			body.push(WORK);
		}
		for (let i = 0; i < numberOfParts; i++) {
			body.push(CARRY);
		}
		for (let i = 0; i < numberOfParts; i++) {
			body.push(MOVE);
		}

		return this.createCreep(body, undefined, {
			role: roleName,
			home: home,
			working: false
		});
	};

StructureSpawn.prototype.createLongDistanceHarvester =
	function(energy, numberOfWorkParts, home, target, sourceIndex) {
		var body = [];
		for (let i = 0; i < numberOfWorkParts; i++) {
			body.push(WORK);
		}

		energy -= 150 * numberOfWorkParts;

		var numberOfParts = Math.floor(energy / 100);
		for (let i = 0; i < numberOfParts; i++) {
			body.push(CARRY);
		}
		for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
			body.push(MOVE);
		}

		return this.createCreep(body, undefined, {
			role: 'longDistanceHarvester',
			home: home,
			target: target,
			sourceIndex: sourceIndex,
			working: false
		});
	};

StructureSpawn.prototype.createClaimer =
	function(target) {
		return this.createCreep([CLAIM,MOVE], undefined, {
			role: 'claimer',
			target: target
		});
	};

StructureSpawn.prototype.createMiner =
	function(sourceId, home) {
		return this.createCreep([WORK,WORK,WORK,WORK,WORK,MOVE], undefined, {
			role: 'miner',
			sourceId: sourceId,
			home: home
		});
	};

StructureSpawn.prototype.createLorry =
	function(energy, home) {
		var numberOfParts = Math.floor(energy / 150);
		var body = [];
		for (let i = 0; i < numberOfParts * 2; i++) {
			body.push(CARRY);
		}
		for (let i = 0; i < numberOfParts; i++) {
			body.push(MOVE);
		}

		return this.createCreep(body, undefined, {
			role: 'lorry',
			home: home,
			working: false
		});
	};

StructureSpawn.prototype.maintainRoadFlags =
	function() {
		let roadFlags = this.room.find(FIND_FLAGS, {
			filter: (f) => f.color == COLOR_GREY
						&& f.secondaryColor != COLOR_GREY
		});
		roadFlags = roadFlags.sort();
		for (let i = 0; i < roadFlags.length; i++) {
			let flag = this.room.find(FIND_FLAGS, {
				filter: (f) => f.name == roadFlags[i].name
			});
			if (flag == undefined) {
				// if not, delete the memory entry
				console.log("Clearing non-existing flag memory: "+flag.name);
				delete this.memory.roadFlagTimers[roadFlags[i].name];
			} else {
				//console.log(roadFlags[i].name+' has '+this.memory.roadFlagTimers[roadFlags[i].name]+' ticks');
				if (!this.memory.roadFlagTimers[roadFlags[i].name]) {
					this.memory.roadFlagTimers[roadFlags[i].name] = 60;
				} else {
					if (this.memory.roadFlagTimers[roadFlags[i].name] - 1 == 0) {
						switch(roadFlags[i].secondaryColor) {
							case COLOR_BLUE:
								//console.log(roadFlags[i].name+' removal!');
								roadFlags[i].remove();
								delete this.memory.roadFlagTimers[roadFlags[i].name];
								break;
							case COLOR_PURPLE:
								//console.log(roadFlags[i].name+' downgrade to COLOR_BLUE');
								roadFlags[i].setColor(COLOR_GREY, COLOR_BLUE);
								this.memory.roadFlagTimers[roadFlags[i].name] = 60;
								break;
							case COLOR_RED:
								//console.log(roadFlags[i].name+' downgrade to COLOR_PURPLE');
								roadFlags[i].setColor(COLOR_GREY, COLOR_PURPLE);
								this.memory.roadFlagTimers[roadFlags[i].name] = 60;
								break;
							case COLOR_ORANGE:
								//console.log(roadFlags[i].name+' downgrade to COLOR_RED');
								roadFlags[i].setColor(COLOR_GREY, COLOR_RED);
								this.memory.roadFlagTimers[roadFlags[i].name] = 60;
								break;
							case COLOR_YELLOW:
								//console.log(roadFlags[i].name+' downgrade to COLOR_ORANGE');
								roadFlags[i].setColor(COLOR_GREY, COLOR_ORANGE);
								this.memory.roadFlagTimers[roadFlags[i].name] = 60;
								break;
							case COLOR_GREEN:
								//console.log(roadFlags[i].name+' downgrade to COLOR_YELLOW');
								roadFlags[i].setColor(COLOR_GREY, COLOR_YELLOW);
								this.memory.roadFlagTimers[roadFlags[i].name] = 60;
								break;
							default:
								console.log('roadFlag Error (downgrade) at: '+this.pos);
								break;
						}
					} else {
						this.memory.roadFlagTimers[roadFlags[i].name]--;
					}
				}
			}
		}
	}