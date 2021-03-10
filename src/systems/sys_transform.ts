import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import { addGrids } from '../util'
import Move from '../components/com_move'

// Only affects transforms that aren't being tweened
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
			const { transform, move } = <{ transform: Transform; move: Move }>entity.c
			transform.update(addGrids(transform, move))
			entity.removeComponent(move)
		})
	}
}
