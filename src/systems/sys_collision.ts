import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity } from '../types'
import Player from '../components/com_player'
import Attack from '../components/com_attack'
import Game from '../components/com_game'
import { equalGrid } from '../util'
import { GrindState } from '../components/com_grinding'

export default class CollisionSystem extends System {
	private nonPlayerMovers!: Query
	init(viewport) {
		this.nonPlayerMovers = this.createQuery({
			all: [Transform, Move],
			not: [Player],
			persist: true,
		})
	}
	update(tick) {
		const game = <Game>this.world.getEntity(GlobalEntity.Game)!.c.game
		const player = this.world.getEntity(GlobalEntity.Player)!
		const nonPlayerMovers = this.nonPlayerMovers.execute()
		const allMovers = [...nonPlayerMovers]
		if (player.c.move) allMovers.push(player)
		if (player.c.move && player.c.grinding) {
			const destEntity = game.level.entityMap.get(
				player.c.move.x + ':' + player.c.move.y
			)
			if (destEntity) {
				// Entity collision
				console.log('player collided with', destEntity.id)
				if (player.c.grinding.state !== GrindState.Start) {
					destEntity.destroy()
				} else {
					player.removeComponent(player.c.move)
					player.addComponent({
						type: Attack.typeName,
						key: 'attack',
						target: destEntity,
					})
				}
			}
		}
		nonPlayerMovers.forEach((entity) => {
			const destWalkable = game.level.isTileWalkable(
				entity.c.move.x,
				entity.c.move.y
			)
			if (!entity.c.move.noClip && !destWalkable) {
				// Wall, cancel move
				entity.removeComponent(entity.c.move)
			} else {
				const destEntity =
					game.level.entityMap.get(entity.c.move.x + ':' + entity.c.move.y) ||
					allMovers.find(
						(otherMover) =>
							otherMover !== entity &&
							otherMover.c.move &&
							equalGrid(<Transform>otherMover.c.move, <Transform>entity.c.move)
					)
				if (destEntity) {
					// Entity collision
					console.log(entity.id, 'collided with', destEntity.id)
					entity.removeComponent(entity.c.move)
					if (destEntity === player) {
						entity.addComponent({
							type: Attack.typeName,
							key: 'attack',
							target: destEntity,
						})
					}
				}
			}
		})
	}
}
