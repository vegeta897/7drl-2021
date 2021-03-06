import { Query, System } from 'ape-ecs'
import { Tile } from '../components/com_tile'
import { Move } from '../components/com_move'
import { Entities } from '../types'

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
			if (level.data.get(dest.x + ':' + dest.y).value === 0) {
				tile.update(dest)
			}
			entity.removeComponent(Move.typeName)
		})
	}
}
