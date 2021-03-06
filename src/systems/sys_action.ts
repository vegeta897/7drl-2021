import { Query, System } from 'ape-ecs'
import { Controller } from '../components/com_controller'
import { Tile } from '../components/com_tile'
import { MoveGrids } from '../types'
import { Move } from '../components/com_move'

// TODO: Add a way to block actions (when tweening movement, grinding, etc)

export default class ActionSystem extends System {
	private controllersUpdated!: Query
	init() {
		this.controllersUpdated = this.createQuery({
			all: [Controller],
			only: [Tile],
			persist: true,
		})
	}
	update(tick) {
		let actionTaken = false
		this.controllersUpdated.execute().forEach((entity) => {
			const tile = entity.c.tile
			if (tile) {
				const { direction } = entity.c.controller
				const move = MoveGrids[direction]
				if (move) {
					actionTaken = true
					entity.addComponent({
						type: Move.typeName,
						key: 'move',
						...move,
						direction,
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
