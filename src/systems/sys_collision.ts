import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity } from '../types'
import { Level } from '../level'
import { addGrids } from '../util'
import Player from '../components/com_player'
import Attack from '../components/com_attack'

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
			const destWalkable = level.isTileWalkable(dest.x, dest.y)
			if (!move.noClip && !destWalkable) {
				// Wall, cancel move
				entity.removeComponent(move)
				return
			}
			const destEntity = level.entityMap.get(dest.x + ':' + dest.y)
			if (destEntity) {
				// Entity, cancel move
				entity.removeComponent(move)
				if (entity.has(Player) || destEntity.has(Player)) {
					entity.addComponent({
						type: Attack.typeName,
						key: 'attack',
						target: destEntity,
					})
				}
			}
		})
	}
}
