import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import { Easing, Tween } from '@tweenjs/tween.js'
import { ControllerState, GlobalEntity, Grid } from '../types'
import Grinding, { GrindState } from '../components/com_grinding'
import Tweening from '../components/com_tween'
import PixiObject from '../components/com_pixi'
import {
	moveDirectional,
	reverseDirection,
	tileToSpritePosition,
} from '../util'
import Controller from '../components/com_controller'
import Game from '../components/com_game'
import { runMainSystems } from '../core/ecs'
import { TILE_SIZE } from '../core/sprites'
import { Tile } from '../core/level'

// Higher is slower
export const PLAYER_SPEED = 100
export const GRIND_SPEED = 120

export default class TweenSystem extends System {
	private tweening!: Query
	private tweens = new Set<Tween<any>>()
	init() {
		this.tweening = this.createQuery({
			all: [Tweening, Transform, PixiObject],
			persist: true,
		})
	}
	update(tick) {
		const { controller, game } = <{ controller: Controller; game: Game }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
		this.tweening.execute().forEach((entity) => {
			const { transform, pixi, grinding } = <
				{
					transform: Transform
					pixi: PixiObject
					grinding?: Grinding
				}
			>entity.c
			entity.getComponents(Tweening).forEach((tweening) => {
				if (tweening.tweens.length > 0) return // Already tweening
				if (tweening.tweenType === Tweening.TweenType.Move) {
					transform.dirty = false
					const toSpritePosition = tileToSpritePosition(transform)
					const onTile = game.level.getTileAt(transform)
					if (onTile?.type === Tile.Rail) toSpritePosition.y -= 3
					const positionTween = this.createTween(
						pixi.object.position,
						tweening
					).to(toSpritePosition)
					if (!grinding) {
						this.addHop(tweening, pixi.object.pivot, PLAYER_SPEED)

						positionTween.easing(Easing.Quadratic.Out)
						positionTween.duration(PLAYER_SPEED)
					} else {
						switch (grinding.state) {
							case GrindState.Start:
								positionTween.duration(GRIND_SPEED)
								this.addHop(tweening, pixi.object.pivot, GRIND_SPEED, 1.5)

								break
							case GrindState.End:
								positionTween.duration(GRIND_SPEED * 1.7)
								positionTween.easing(Easing.Sinusoidal.Out)
								if (grinding.speed > 0)
									this.addHop(tweening, pixi.object.pivot, GRIND_SPEED * 1.5, 2)

								break
							default:
								positionTween.duration(
									Math.max(1000 / 30, GRIND_SPEED - grinding.speed / 4)
								)
								break
						}
					}
					positionTween.start()
				} else if (tweening.tweenType === Tweening.TweenType.Attack) {
					const offset = moveDirectional(
						reverseDirection(tweening.direction),
						0.2 * TILE_SIZE
					)
					this.createTween(pixi.object.pivot, tweening)
						.to(offset, 30)
						.easing(Easing.Sinusoidal.In)
						.chain(
							this.createTween(pixi.object.pivot, tweening)
								.to({ x: 0, y: 0 }, 70)
								.easing(Easing.Sinusoidal.In)
						)
						.start()
				}
			})
		})
		this.tweens.forEach((tween) => {
			if (!tween.isPlaying()) this.tweens.delete(tween)
		})
		if (this.tweens.size > 0) {
			controller.state = ControllerState.Disabled
		} else {
			if (game.autoUpdate) {
				game.autoUpdate = false
				runMainSystems()
			} else {
				controller.state = ControllerState.Ready
			}
		}
	}
	createTween(tweenObject: Grid, tweening: Tweening): Tween<Grid> {
		const tween = new Tween(tweenObject)
		const remove = () => {
			if (tweening.entity.getComponents(Tweening).has(tweening))
				tweening.entity.removeComponent(tweening)
			this.onTweenEnd(tween)
		}
		tween.onComplete(remove).onStop(() => this.tweens.delete(tween))
		this.tweens.add(tween)
		return tween
	}
	onTweenEnd(tween) {
		this.tweens.delete(tween)
		if (this.tweens.size === 0) {
			// All tweens done
			const { controller, game } = <{ controller: Controller; game: Game }>(
				this.world.getEntity(GlobalEntity.Game)!.c
			)
			if (game.autoUpdate && !game.gameOver && !game.win) {
				game.autoUpdate = false
				runMainSystems()
			} else {
				controller.state = ControllerState.Ready
			}
		}
	}
	addHop(tweening: Tweening, pivot: Grid, duration: number, height = 1) {
		const hopUp = this.createTween(pivot, tweening)
			.duration(duration / 2)
			.to({ y: 0.2 * height * TILE_SIZE })
			.easing(Easing.Circular.Out)
		const hopDown = this.createTween(pivot, tweening)
			.duration(duration / 2)
			.to({ y: 0 })
			.easing(Easing.Circular.In)
		hopUp.chain(hopDown).start()
	}
}
