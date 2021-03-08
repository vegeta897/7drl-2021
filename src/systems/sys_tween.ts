import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import { Easing, Tween } from '@tweenjs/tween.js'
import { GlobalEntity, GrindState } from '../types'
import { addGrids } from '../util'
import { afterUpdateWorld } from '../ecs'
import Game from '../components/com_game'
import Player from '../components/com_player'
import Grinding from '../components/com_grinding'

export const PLAYER_SPEED = 100
export const GRIND_SPEED = 100

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
		const { game } = <Game>this.world.getEntity(GlobalEntity.Game)!.c
		this.moving.execute().forEach((entity) => {
			const { move, transform, player, grinding } = <
				{
					move: Move
					transform: Transform
					player: Player | undefined
					grinding: Grinding | undefined
				}
			>entity.c
			const moveDest = addGrids(move, transform)
			const positionTween = this.createTween(game, transform).to(moveDest)
			if (player && !grinding) {
				this.addHop(game, transform)
				positionTween.easing(Easing.Quadratic.Out)
				positionTween.duration(PLAYER_SPEED)
			}
			if (grinding) {
				switch (grinding.state) {
					case GrindState.Start:
						positionTween.duration(GRIND_SPEED * 2)
						this.addHop(game, transform, 2)
						break
					case GrindState.End:
						positionTween.duration(GRIND_SPEED * 2)
						this.addHop(game, transform, 1.5)
						break
					default:
						positionTween.duration(GRIND_SPEED)
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
	createTween(game: Game, tweenObject: Transform): Tween<Transform> {
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
	addHop(game, transform, size = 1) {
		const hopUp = this.createTween(game, transform)
			.duration((PLAYER_SPEED / 2) * size * 0.8)
			.to({ yOff: 0.2 * size })
			.easing(Easing.Circular.Out)
		const hopDown = this.createTween(game, transform)
			.duration((PLAYER_SPEED / 2) * size * 0.8)
			.to({ yOff: 0 })
			.easing(Easing.Circular.In)
		hopUp.chain(hopDown).start()
	}
}
