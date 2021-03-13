import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { GlobalEntity } from '../types'
import Attack from '../components/com_attack'
import Game from '../components/com_game'
import { equalGrid } from '../util'
import { GrindState } from '../components/com_grinding'
import { createDeathParticles } from '../core/particles'
import Follow from '../components/com_follow'

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
		const player = this.world.getEntity(GlobalEntity.Player)!
		const movers = [...this.movers.execute()]
		if (player.c.move && player.c.grinding) {
			const destEntity = game.level.entityMap.get(
				player.c.move.x + ':' + player.c.move.y
			)
			if (destEntity) {
				// Entity collision
				if (player.c.grinding.state !== GrindState.Start) {
					// TODO: Particles!
					createDeathParticles(
						game.entityContainer,
						player.c.grinding.direction,
						destEntity.has(Follow) ? 'bone' : 'dummy',
						{
							pos: {
								x: destEntity.c.pixi.object.position.x,
								y: destEntity.c.pixi.object.position.y,
							},
							addAtBack: false,
						}
					)
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
		movers.forEach((entity) => {
			if (entity === player) return // Movers includes player but player updated above
			if (entity.destroyed) return
			const move = <Move>entity.c.move
			const destWalkable = game.level.isTileWalkable(move.x, move.y)
			if (!move.noClip && !destWalkable) {
				// Wall, cancel move
				entity.removeComponent(move)
			} else {
				const destEntity =
					game.level.entityMap.get(move.x + ':' + move.y) ||
					movers.find(
						(otherMover) =>
							otherMover !== entity &&
							otherMover.c.move &&
							equalGrid(<Transform>otherMover.c.move, move)
					)
				if (destEntity) {
					// Entity collision
					entity.removeComponent(move)
					if (destEntity === player) {
						entity.addComponent({
							type: Attack.typeName,
							key: 'attack',
							target: destEntity,
							direction: move.direction,
						})
					}
				}
			}
		})
	}
}
