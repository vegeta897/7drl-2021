import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import { addGrids } from '../util'
import Move from '../components/com_move'

export default class TransformSystem extends System {
	private moving!: Query
	init() {
		this.moving = this.createQuery({
			all: [Transform, Move],
			persist: true,
		})
	}

	update(tick) {
		this.moving.execute().forEach((entity) => {
			const { transform, move } = entity.c
			transform.update(
				addGrids({ x: transform.x, y: transform.y }, { x: move.x, y: move.y })
			)
			entity.removeComponent(move)
		})
	}
}
