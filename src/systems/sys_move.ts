import { Query, System } from 'ape-ecs'
import { Tile } from '../components/com_tile'
import { Move } from '../components/com_move'

export default class MoveSystem extends System {
	private moves!: Query
	init(viewport) {
		this.moves = this.createQuery({
			all: [Move, Tile],
			persist: true,
		})
	}
	update(tick) {
		this.moves.execute().forEach((entity) => {
			const { tile, move } = entity.c
			tile.update({ x: tile.x + move.x, y: tile.y + move.y })
			entity.removeComponent(Move.typeName)
		})
	}
}
