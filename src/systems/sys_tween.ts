import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { Easing, Tween } from '@tweenjs/tween.js'
import { GlobalEntity, GrindState } from '../types'
import { addGrids } from '../util'
import { afterUpdateWorld } from '../ecs'

export const PLAYER_SPEED = 80
export const GRIND_SPEED = 80

export default class TweenSystem extends System {
	private moving!: Query
	private tweens = new Set<Tween<any>>()
	init() {
		this.moving = this.createQuery({
			all: [Transform, Move],
			persist: true,
		})
	}
	update(tick) {
		const { game } = this.world.getEntity(GlobalEntity.Game)!.c
		this.moving.execute().forEach((entity) => {
			const { move, transform, player, grinding } = entity.c
			const moveDest = addGrids(
				{ x: transform.x, y: transform.y },
				{ x: move.x, y: move.y }
			)
			const positionTween = this.createTween(game, transform).to(moveDest)
			if (player && !grinding) {
				this.addHop(game, transform)
				positionTween.easing(Easing.Quadratic.Out)
				positionTween.duration(PLAYER_SPEED)
			}
			if (grinding) {
				positionTween.duration(GRIND_SPEED)
				switch (grinding.state) {
					case GrindState.Start:
						this.addHop(game, transform)
						break
					case GrindState.End:
						this.addHop(game, transform)
						break
				}
			}
			positionTween.start()
			entity.removeComponent(move)
		})
		if (this.tweens.size === 0) {
			// No tweens added
		} else {
			// Tweens added
			game.wait = true
		}
	}
	createTween(game, tweenObject) {
		const tween = new Tween(tweenObject)
		const remove = () => {
			tweenObject.update()
			this.onTweenEnd(game, tween)
		}
		tween
			.onUpdate(() => (tweenObject.dirty = true))
			.onComplete(remove)
			.onStop(remove)
		this.tweens.add(tween)
		return tween
	}
	onTweenEnd(game, tween) {
		this.tweens.delete(tween)
		if (this.tweens.size === 0) {
			// All tweens done
			game.wait = false
			afterUpdateWorld()
		}
	}
	addHop(game, transform) {
		const hopUp = this.createTween(game, transform)
			.duration(PLAYER_SPEED / 2)
			.to({ yOff: 0.2 })
			.easing(Easing.Circular.Out)
		const hopDown = this.createTween(game, transform)
			.duration(PLAYER_SPEED / 2)
			.to({ yOff: 0 })
			.easing(Easing.Circular.In)
		hopUp.chain(hopDown).start()
	}
}
