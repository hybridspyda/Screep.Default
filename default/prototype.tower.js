// create a new function for StructureTower
StructureTower.prototype.defend =
	function () {
		// find closest hostile creep
		let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		// if one is found...
		if (target != undefined) {
			// ...FIRE!
			this.attack(target);
		}
	};

StructureTower.prototype.healCreeps =
	function () {
		var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (target == undefined && this.energy / this.energyCapacity > 0.3) {
			let creeps = this.room.find(FIND_MY_CREEPS, {
				filter: (c) => c.hits < c.hitsMax
			});

			if (creeps.length) {
				let target = this.pos.findClosestByRange(FIND_MY_CREEPS);
				this.heal(target);
			}
		}
	}

StructureTower.prototype.repairRampart =
	function () {
		// find closest hostile creep
		let target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (target == undefined && this.energy / this.energyCapacity > 0.3) {
			let ramparts = this.room.find(FIND_STRUCTURES, {
				filter: (r) => r.hits < r.hitsMax && r.structureType == STRUCTURE_RAMPART
			});

			if (ramparts.length) {
				target = ramparts[0];
				for (let rampart of ramparts) {
					if (target.hits > rampart.hits) {
						target = rampart;
					}
				}
				if (target.hits < 20000) {
					this.repair(target);
				}
			}
		}
	};