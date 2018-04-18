var roles = {
	harvester: require('role.harvester'),
	upgrader: require('role.upgrader'),
	builder: require('role.builder'),
	repairer: require('role.repairer'),
	wallRepairer: require('role.wallRepairer'),
	longDistanceHarvester: require('role.longDistanceHarvester'),
	claimer: require('role.claimer'),
	miner: require('role.miner'),
	lorry: require('role.lorry')
};

Creep.prototype.runRole =
	function () {
		if (roles[this.memory.role] != undefined) {
			roles[this.memory.role].run(this);
		} else {
			console.log(this.name+" has an invalid role!");
		}
	};

/** @function
	@param {bool} useContainer
	@param {bool} useSource */
Creep.prototype.getEnergy =
	function (useContainer, useSource) {
		let dropped_energy = this.room.find(FIND_DROPPED_RESOURCES, {
			filter: (de) => de.amount >= 10
		});
		var de_target;
		var range;
		if (dropped_energy.length) {
			for (let i = 0; i < dropped_energy.length; i++) {
				if (dropped_energy[i].amount >= 200) {
					de_target = dropped_energy[i];
				}
			}
			if (de_target) {
				range = this.pos.getRangeTo(de_target);
			} else {
				de_target = this.pos.findClosestByPath(dropped_energy);
				if (range <= 10 && de_target.amount >= 50) {
					range = this.pos.getRangeTo(de_target);
				} else if (range <= 1 && de_target.amount >= 5) {
					range = this.pos.getRangeTo(de_target);
				} else if (range == 0) {
					range = this.pos.getRangeTo(de_target);
				} else {
					de_target = undefined;
				}
			}
		}
		if (de_target) {
			this.say('🌢: '+range);
			this.moveTo(de_target);
			this.pickup(de_target);
		} else {
			var container;
			// if the Creep should look for containers
			if (useContainer) {
				// find closest container
				container = this.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (s) => ((s.structureType == STRUCTURE_CONTAINER
								|| (s.structureType == STRUCTURE_STORAGE && s.room.energyAvailable != s.room.energyCapacityAvailable))
								&& s.store[RESOURCE_ENERGY] > 0)
				});
				// if one was found
				if (container != undefined) {
					// try to withdraw energy, if the container is not in range
					if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						// move towards it
						this.moveTo(container);
					}
					if (this.pos.getRangeTo(container) <= 1) {
						this.say('🎶');
						this.moveTo(this.room.controller);
					}
				}
			}
			// if no container was found and the Creep should look for Sources
			if (container == undefined && useSource) {
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
				}
			}
		}	
	};

Creep.prototype.createFrequentRoad =
	function () {
		/* Clear ALL roadFlags:
		let roadFlags = Game.rooms.roomName.find(FIND_FLAGS, {
			filter: (f) => f.color == COLOR_GREY
						&& f.secondaryColor != COLOR_GREY
		});
		for (let i = 0; i < roadFlags.length; i++) {
			roadFlags[i].remove();
		}
		*/
		if (this.memory.canBuildRoads && this.room.controller.owner.username == this.owner.username) {
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
									this.room.createConstructionSite(this.pos, STRUCTURE_ROAD);
									foundFlags[i].remove();
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
	};