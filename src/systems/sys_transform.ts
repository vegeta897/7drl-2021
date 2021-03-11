import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import { addGrids } from '../util'
import Move from '../components/com_move'
import { Level } from '../level'
import { GlobalEntity } from '../types'
import Tweening from '../components/com_tween'

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
		const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		this.moving.execute().forEach((entity) => {
			const { transform, move } = <{ transform: Transform; move: Move }>entity.c
			level.entityMap.delete(transform.x + ':' + transform.y)
			const dest = addGrids(transform, move)
			level.entityMap.set(dest.x + ':' + dest.y, entity)
			transform.update({ dirty: true, ...dest })
			entity.removeComponent(move)
			entity.addComponent({
				type: Tweening.typeName,
				tweenType: Tweening.TweenType.Move,
			})
		})
	}
}
