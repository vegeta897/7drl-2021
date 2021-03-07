import { Query, System } from 'ape-ecs'
import Grinding from '../components/com_grinding'
import Tile from '../components/com_tile'
import { Entities, MoveGrids } from '../types'
import Move from '../components/com_move'
import { addGrids, turnDirection } from '../assets/util'

export const GRIND_SPEED = 80

export default class GrindingSystem extends System {
	private grinding!: Query
	init() {
		this.grinding = this.createQuery({
			all: [Tile, Grinding],
			persist: true,
		})
	}
	update(tick) {
		const { level } = this.world.getEntity(Entities.Level)!.c.level
		const { game } = this.world.getEntity(Entities.Game)!.c
		this.grinding.execute().forEach((entity) => {
			const { tile, grinding } = entity.c
			if (level.data.get(tile.x + ':' + tile.y).value === 2) {
				for (const direction of [
					grinding.direction,
					turnDirection(grinding.direction, 1),
					turnDirection(grinding.direction, 3),
				]) {
					const destMove = addGrids(
						{ x: tile.x, y: tile.y },
						MoveGrids[direction]
					)
					// Check for wall
					if (level.data.get(destMove.x + ':' + destMove.y).value === 1)
						continue
					// Grinding continues
					game.inputLocked = true
					entity.addComponent({
						type: Move.typeName,
						key: 'move',
						...MoveGrids[direction],
						direction,
					})
					grinding.update({ direction })
					game.autoUpdate = GRIND_SPEED
					break
				}
			} else {
				entity.removeComponent(grinding)
				game.inputLocked = false
			}
		})
	}
}
