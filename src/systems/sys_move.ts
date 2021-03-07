import { Query, System } from 'ape-ecs'
import Tile from '../components/com_tile'
import Move from '../components/com_move'
import { Entities } from '../types'
import Grinding from '../components/com_grinding'

export default class MoveSystem extends System {
	private moves!: Query
	init(viewport) {
		this.moves = this.createQuery({
			all: [Move, Tile],
			persist: true,
		})
	}
	update(tick) {
		const { level } = this.world.getEntity(Entities.Level)!.c.level
		this.moves.execute().forEach((entity) => {
			const { tile, move } = entity.c
			const dest = { x: tile.x + move.x, y: tile.y + move.y }
			const destGrid = level.data.get(dest.x + ':' + dest.y)
			if (destGrid.value !== 1) {
				tile.update(dest)
				if (!entity.has(Grinding) && destGrid.value === 2) {
					entity.addComponent({
						type: Grinding.typeName,
						key: 'grinding',
						direction: move.direction,
					})
				}
			}
			entity.removeComponent(move)
		})
	}
}
