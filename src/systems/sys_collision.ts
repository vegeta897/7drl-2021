import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity, GrindState } from '../types'
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
		const movers = this.movers.execute()
		movers.forEach((entity) => {
			const { /*transform,*/ move, grinding } = <
				{ transform: Transform; move: Move; grinding: Grinding }
			>entity.c
			const destEntity = game.level.entityMap.get(move.x + ':' + move.y)
			if (grinding) {
				// If grinding, we don't have to check for map collision
				if (destEntity) {
					if (grinding.state === GrindState.Start) {
						entity.removeComponent(grinding)
					} else {
						console.log(tick, 'grinding through', destEntity.id)
						destEntity.destroy()
						return // Don't need to perform entity collision
					}
				}
			} else {
				// Check for collision when moving
				const destWalkable = game.level.isTileWalkable(move.x, move.y)
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
				// Entity collision (not grinding)
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
