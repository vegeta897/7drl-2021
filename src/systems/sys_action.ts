import { Query, System } from 'ape-ecs'
import { Controller } from '../components/com_controller'
import { Tile } from '../components/com_tile'
import { MoveGrids } from '../types'
import { Move } from '../components/com_move'

export default class ActionSystem extends System {
	private controllersUpdated!: Query
	init() {
		this.controllersUpdated = this.createQuery({
			all: [Controller],
			only: [Tile],
			persist: true,
		})
	}
	update(tick: number) {
		let actionTaken = false
		this.controllersUpdated.execute().forEach((entity) => {
			const tile = entity.c.tile
			if (tile) {
				const move = MoveGrids[entity.c.controller.direction]
				if (move) {
					actionTaken = true
					entity.addComponent({
						type: Move.typeName,
						key: 'move',
						...move,
					})
				}
			}
			entity.c.controller.direction = null
		})
		if (actionTaken) {
			this.world.tick()
		}
	}
}
