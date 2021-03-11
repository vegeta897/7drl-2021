import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity, GrindState } from '../types'
import { addGrids } from '../util'
import Player from '../components/com_player'
import Attack from '../components/com_attack'
import Grinding from '../components/com_grinding'
import Game from '../components/com_game'

export default class CollisionSystem extends System {
	private movers!: Query
	init(viewport) {
		this.movers = this.createQuery({
			all: [Transform, Move],
			persist: true,
		})
	}
	update(tick) {
		const game = <Game>this.world.getEntity(GlobalEntity.Game)!.c.game
		this.movers.execute().forEach((entity) => {
			// TODO: Entities are able to move to the same spot since we're checking where they are instead of where they will be
			// Best solution is probably to add the target's move component to their transform
			const { transform, move, grinding } = <
				{ transform: Transform; move: Move; grinding: Grinding }
			>entity.c
			const dest = addGrids(transform, move)
			const destEntity = game.level.entityMap.get(dest.x + ':' + dest.y)
			if (grinding && grinding.state !== GrindState.Start && destEntity) {
				// If grinding, we don't have to check for map collision
				console.log('grinding through', destEntity.id)
				destEntity.destroy()
				return
			} else {
				// Check for collision when moving
				const destWalkable = game.level.isTileWalkable(dest.x, dest.y)
				if (!move.noClip && !destWalkable) {
					// Wall, cancel move
					entity.removeComponent(move)
					if (grinding) {
						entity.removeComponent(grinding)
						game.autoUpdate = false
					}
					return
				}
			}
			if (destEntity) {
				// Entity collision
				// Attack if one of these entities is a player
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
