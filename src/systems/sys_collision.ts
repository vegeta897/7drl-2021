import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity } from '../types'
import { Level, Tile } from '../level'
import { addGrids } from '../util'

export default class CollisionSystem extends System {
	private moves!: Query
	init(viewport) {
		this.moves = this.createQuery({
			all: [Move, Transform],
			persist: true,
		})
	}
	update(tick) {
		const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		this.moves.execute().forEach((entity) => {
			const { transform, move } = <{ transform: Transform; move: Move }>entity.c
			const dest = addGrids(transform, move)
			const destGrid = level.getTileAt(dest.x, dest.y)
			if (destGrid?.type === Tile.Wall) {
				// Wall, cancel move
				entity.removeComponent(move)
			}
		})
	}
}
