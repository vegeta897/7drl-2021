import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import { Easing, Tween } from '@tweenjs/tween.js'
import { ControllerState, GlobalEntity, Grid } from '../types'
import Grinding, { GrindState } from '../components/com_grinding'
import Tweening from '../components/com_tween'
import PixiObject from '../components/com_pixi'
import { tileToSpritePosition } from '../util'
import Controller from '../components/com_controller'
import Game from '../components/com_game'
import { runMainSystems } from '../ecs'
import { TILE_SIZE } from '../index'

// Higher is slower
export const PLAYER_SPEED = 100
export const GRIND_SPEED = 120
export const GRIND_SPEED_GAIN = 80
export const ENEMY_SPEED = 150

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
		const player = this.world.getEntity(GlobalEntity.Player)!
		this.tweening.execute().forEach((entity) => {
			const { transform, pixi, grinding } = <
				{
					transform: Transform
					pixi: PixiObject
					grinding?: Grinding
				}
			>entity.c
			entity.getComponents(Tweening).forEach((tweening) => {
				if (tweening.tweenType === Tweening.TweenType.Move) {
					transform.dirty = false
					const positionTween = this.createTween(pixi.object.position).to(
						tileToSpritePosition(transform)
					)
					if (!grinding) {
						this.addHop(pixi.object.pivot, PLAYER_SPEED)
						positionTween.easing(Easing.Quadratic.Out)
						positionTween.duration(PLAYER_SPEED)
					} else {
						switch (grinding.state) {
							case GrindState.Start:
								positionTween.duration(GRIND_SPEED)
								this.addHop(pixi.object.pivot, GRIND_SPEED, 1.5)
								break
							case GrindState.End:
								positionTween.duration(GRIND_SPEED * 2)
								positionTween.easing(Easing.Quadratic.Out)
								if (grinding.speed > 0)
									this.addHop(pixi.object.pivot, GRIND_SPEED * 2, 2)
								break
							default:
								positionTween.duration(
									GRIND_SPEED *
										(GRIND_SPEED_GAIN / (grinding.speed + GRIND_SPEED_GAIN))
								)
								break
						}
					}
					if (!player) {
						positionTween.duration(ENEMY_SPEED)
					}
					positionTween.start()
				}
				entity.removeComponent(tweening)
			})
		})
		if (this.tweens.size > 0) {
			this.world.getEntity(GlobalEntity.Game)!.c.controller.state =
				ControllerState.Disabled
		} else {
			this.world.getEntity(GlobalEntity.Game)!.c.controller.state =
				ControllerState.Ready
		}
	}
	createTween(tweenObject: Grid): Tween<Grid> {
		const tween = new Tween(tweenObject)
		const remove = () => {
			this.onTweenEnd(tween)
		}
		tween.onComplete(remove).onStop(remove)
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
			if (game.autoUpdate) {
				game.autoUpdate = false
				runMainSystems()
			} else {
				controller.state = ControllerState.Ready
			}
		}
	}
	addHop(pivot: Grid, duration: number, height = 1) {
		const hopUp = this.createTween(pivot)
			.duration(duration / 2)
			.to({ y: 0.2 * height * TILE_SIZE })
			.easing(Easing.Circular.Out)
		const hopDown = this.createTween(pivot)
			.duration(duration / 2)
			.to({ y: 0 })
			.easing(Easing.Circular.In)
		hopUp.chain(hopDown).start()
	}
}
