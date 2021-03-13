import { Entity, Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { Level } from '../core/level'
import { GlobalEntity, GlobalSprite, Tags } from '../types'
import Tweening from '../components/com_tween'
import Game from '../components/com_game'
import { Easing, Tween } from '@tweenjs/tween.js'

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
		const player = <Entity>this.world.getEntity(GlobalEntity.Player)!
		const gameEntity = this.world.getEntity(GlobalEntity.Game)!
		const level = <Level>gameEntity.c.game.level
		this.moving.execute().forEach((entity) => {
			const { transform, move } = <{ transform: Transform; move: Move }>entity.c
			level.entityMap.delete(transform.x + ':' + transform.y)
			level.entityMap.set(move.x + ':' + move.y, entity)
			transform.update({ dirty: true, x: move.x, y: move.y })
			entity.removeComponent(move)
			entity.addComponent({
				type: Tweening.typeName,
				tweenType: Tweening.TweenType.Move,
			})
			if (entity === player) {
				// console.log(transform.x, transform.y)
				player.addTag(Tags.UpdateVisibility)
				if (transform.x < 20) {
					const game = <Game>gameEntity.c.game
					game.gameOver = true
					game.win = true
				}
				if (transform.x === 51 && transform.y === 6) {
					new Tween(level.container.getChildByName!(GlobalSprite.HoldShift))
						.to({ alpha: 1 }, 500)
						.easing(Easing.Sinusoidal.Out)
						.start()
				}
				if (transform.x > 80) {
					level.container.getChildByName!(GlobalSprite.HoldShift).alpha = 0
				}
			}
		})
	}
}
