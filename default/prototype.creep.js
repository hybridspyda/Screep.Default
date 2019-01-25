var roles = {
	harvester: require('role.harvester'),
	upgrader: require('role.upgrader'),
	builder: require('role.builder'),
	repairer: require('role.repairer'),
	wallRepairer: require('role.wallRepairer'),
	longDistanceHarvester: require('role.longDistanceHarvester'),
	claimer: require('role.claimer'),
	miner: require('role.miner'),
	lorry: require('role.lorry'),
	defender: require('role.defender')
};

Creep.prototype.runRole = function () {
	if (roles[this.memory.role] != undefined) {
		roles[this.memory.role].run(this);
	} else {
		this.log(`${this.name} has an invalid role!`);
	}
	if (this.ticksToLive < 25) {
		this.say('☠');
	}
	if (this.ticksToLive <= 5) {
		this.log(`${this.memory.role} dying in: ${this.ticksToLive}`);
	}
	if(this.pos.getRangeTo(this.room.controller) == 1) {
		this.signController(this.room.controller, "Powered by HybridAI.");
	}
};

Creep.prototype.moveRandom = function() {
	let start = Math.ceil(Math.random() * 8);
	let direction = 0;
	for (let i = start; i < start + 8; i++) {
		direction = ((i - 1) % 8) + 1;
		let pos = this.pos.getAdjacentPosition(direction);
		if (pos.isExit()) {
			continue;
		}

		break;
	}
	this.move(direction);
};

Creep.prototype.moveRandomWithin = function(goal, dist = 3) {
	let start = Math.ceil(Math.random() * 8);
	let direction = 0;
	for (let i = start; i < start + 8; i++) {
		direction = ((i - 1) % 8) + 1;
		let pos = this.pos.getAdjacentPosition(direction);
		if (pos.isExit()) {
			continue;
		}
		if (pos.getRangeTo(goal) > dist) {
			continue;
		}
		break;
	}
	this.move(direction);
};

/** @function
	@param {bool} useContainer
	@param {bool} useSource */
Creep.prototype.getEnergy = function (useContainer, useSource, pickDropped=true) {
	var container;
	// if the Creep should look for containers
	if (useContainer) {
		// find closest container
		container = this.pos.findClosestByPath(FIND_STRUCTURES, {
			filter: (s) => ((s.structureType == STRUCTURE_CONTAINER
				|| (s.structureType == STRUCTURE_STORAGE
					&& s.room.energyAvailable != s.room.energyCapacityAvailable))
				&& s.store[RESOURCE_ENERGY] > 50)
		});
		// if one was found
		if (container != undefined) {
			// try to withdraw energy, if the container is not in range
			if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				// move towards it
				this.moveTo(container);
			}
			/*if (this.pos.getRangeTo(container) <= 1) {
				this.say('🎶');
				this.moveTo(this.room.controller);
			}*/
		}
	}
	if (pickDropped) {
		var dr_target;
		var range;
		let tombstones = this.room.find(FIND_TOMBSTONES).forEach(tombstone => {
			if(_.sum(tombstone.store) > 0) {
				if (dr_target == undefined
				|| _.sum(tombstone.store) >= this.carryCapacity - _.sum(this.carry)) {
					dr_target = tombstone;
					range = this.pos.getRangeTo(dr_target);
				}
				if (this.withdraw(dr_target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					this.moveTo(dr_target);
				}
			}
		});
		let dropped_resources = this.room.find(FIND_DROPPED_RESOURCES, {
			filter: (dr) => dr.resourceType == RESOURCE_ENERGY
		});
		if (dropped_resources.length) {
			dr_target = this.pos.findClosestByPath(dropped_resources);
			range = this.pos.getRangeTo(dr_target);
			if (range == 0) {
				range = this.pos.getRangeTo(dr_target);
			}	else if (range <= 1 && dr_target.amount >= 10) {
				range = this.pos.getRangeTo(dr_target);
			} else if (range <= 10 && dr_target.amount >= 50) {
				range = this.pos.getRangeTo(dr_target);
			} else {
				dr_target = undefined;
			}
			if (dr_target == undefined) {
				for (let i = 0; i < dropped_resources.length; i++) {
					if (dr_target == undefined
					|| dropped_resources[i].amount >= this.carryCapacity - _.sum(this.carry)) {
						if (this.pos.getRangeTo(dropped_resources[i]) <= this.pos.getRangeTo(container)) {
							dr_target = dropped_resources[i];
							range = this.pos.getRangeTo(dr_target);
						}
					}
				}
			}
		}
	}
	if (dr_target != undefined) {
		this.say('🌢: '+range);
		this.moveTo(dr_target);
		this.pickup(dr_target);
	} else if (container == undefined && useSource) { // if no container was found and the Creep should look for Sources
		// find closest source
		var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

		// try to harvest energy, if the source is not in range
		if (this.harvest(source) == ERR_NOT_IN_RANGE) {
			// move towards it
			this.moveTo(source);
		}
		if (this.pos.getRangeTo(container) <= 1) {
			this.say('🎶');
			this.moveTo(this.room.controller);
		} else if (this.memory.role != 'harvester' && this.memory.role != 'lorry') {
			var spawn = this.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (s) => (s.structureType == STRUCTURE_SPAWN && s.room.energyAvailable == s.room.energyCapacityAvailable)
			});

			if (spawn != undefined) {
				if (this.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					this.moveTo(spawn);
				}
			}
		}
	}
};

Creep.prototype.createFrequentRoad = function () {
	/* Clear ALL roadFlags:
	let roadFlags = Game.rooms.E15N41.find(FIND_FLAGS, {
		filter: (f) => f.color == COLOR_GREY
					&& f.secondaryColor != COLOR_GREY
	});
	for (let i = 0; i < roadFlags.length; i++) {
		roadFlags[i].remove();
	}
	*/
	if (this.memory.canBuildRoads
	&& (this.room.controller.owner == undefined
		|| this.room.controller.owner.username == this.owner.username)) {
		if (this.room.controller.level >= 2) {
			// if in suitable area
			if ((this.pos.x >= 2 && this.pos.x <= 47)
				&& this.pos.y >= 2 && this.pos.y <= 47) {
				// find all 'roadFlags'
				let roadFlags = this.room.find(FIND_FLAGS, {
					filter: (f) => f.color == COLOR_GREY
								&& f.secondaryColor != COLOR_GREY
				});
				roadFlags = roadFlags.sort();
				// check for next name
				let name = undefined;
				// if max roadFlags not reached
				if (roadFlags.length < 120) {
					// iterate through roadFlags
					for (let i = 0; i < roadFlags.length; i++) {
						if (i < 10) {
							if (roadFlags[i].name != 'rFlag0'+i) {
								// use for new name
								name = 'rFlag0'+i;
							}
						} else {
							if (roadFlags[i].name != 'rFlag'+i) {
								// use for new name
								name = 'rFlag'+i;
							}
						}
						if (name != undefined) {
							break;
						}
					}
					if (name == undefined) {
						if (roadFlags.length < 10) {
							name = 'rFlag0'+roadFlags.length;
						} else {
							name = 'rFlag'+roadFlags.length;
						}
					}
				}
				var foundFlags = this.room.lookForAt(LOOK_FLAGS, this.pos);
				if (foundFlags.length && !this.memory.working) {
					for (let i = foundFlags.length - 1; i >= 0; i--) {
						if (foundFlags[i].color == COLOR_GREY && foundFlags[i].secondaryColor != COLOR_GREY) {
							switch(foundFlags[i].secondaryColor) {
								case COLOR_BLUE:
									foundFlags[i].setColor(COLOR_GREY, COLOR_PURPLE);
									break;
								case COLOR_PURPLE:
									foundFlags[i].setColor(COLOR_GREY, COLOR_RED);
									break;
								case COLOR_RED:
									foundFlags[i].setColor(COLOR_GREY, COLOR_ORANGE);
									break;
								case COLOR_ORANGE:
									foundFlags[i].setColor(COLOR_GREY, COLOR_YELLOW);
									break;
								case COLOR_YELLOW:
									foundFlags[i].setColor(COLOR_GREY, COLOR_GREEN);
									break;
								case COLOR_GREEN:
									if (this.room.find(FIND_CONSTRUCTION_SITES).length < 10) {
										this.room.createConstructionSite(this.pos, STRUCTURE_ROAD);
										foundFlags[i].remove();
									}
									break;
								default:
									console.log('roadFlag Error (upgrade) at: '+this.pos);
									break;
							}
						}
					}
				} else if (name != undefined) {
					if (!foundFlags.length && !this.room.lookForAt(LOOK_STRUCTURES, this.pos).length && !this.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.pos).length) {
						this.room.createFlag(this.pos, name, COLOR_GREY, COLOR_BLUE);
					}
				}
			}
		}
	}
};