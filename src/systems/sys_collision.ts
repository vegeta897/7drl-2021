import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity } from '../types'
import { Tile } from '../level'

export default class CollisionSystem extends System {
	private moves!: Query
	init(viewport) {
		this.moves = this.createQuery({
			all: [Move, Transform],
			persist: true,
		})
	}
	update(tick) {
		const { level } = this.world.getEntity(GlobalEntity.Game)!.c.game
		this.moves.execute().forEach((entity) => {
			const { transform, move } = entity.c
			const dest = { x: transform.x + move.x, y: transform.y + move.y }
			const destGrid = level.getTileAt(dest.x, dest.y)
			if (destGrid.type === Tile.Wall) {
				// Wall, cancel move
				entity.removeComponent(move)
			}
		})
	}
}
