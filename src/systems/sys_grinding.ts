import { Query, System } from 'ape-ecs'
import { Grinding } from '../components/com_grinding'
import { Tile } from '../components/com_tile'
import { Entities, MoveGrids } from '../types'
import { Move } from '../components/com_move'
import { addGrids, reverseDirection, turnDirection } from '../assets/util'
import { updateWorld } from '../ecs'

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
		this.grinding.execute().forEach((entity) => {
			const { tile, grinding } = entity.c
			if (level.data.get(tile.x + ':' + tile.y).value === 2) {
				for (const direction of [
					reverseDirection(grinding.from),
					turnDirection(grinding.from, 1),
					turnDirection(grinding.from, 3),
				]) {
					const destMove = addGrids(
						{ x: tile.x, y: tile.y },
						MoveGrids[direction]
					)
					if (level.data.get(destMove.x + ':' + destMove.y).value === 1)
						continue
					entity.addComponent({
						type: Move.typeName,
						key: 'move',
						...MoveGrids[direction],
						direction,
					})
					grinding.update({ from: reverseDirection(direction) })
					setTimeout(() => {
						this.world.tick()
						updateWorld()
					}, 80)
					break
				}
			} else {
				entity.removeComponent(grinding)
			}
		})
	}
}
