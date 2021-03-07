import { Point } from 'pixi.js'
import { Tween, Easing } from '@tweenjs/tween.js'
import { System } from 'ape-ecs'
import { TILE_SIZE } from '../.'
import { Entities } from '../types'
import { Viewport } from 'pixi-viewport'

export default class CameraSystem extends System {
	private viewport: Viewport
	tween?: Tween<Point>

	init(viewport: Viewport) {
		this.viewport = viewport
	}
	update(tick) {
		const camera = this.world.getEntity(Entities.Camera)
		if (!camera || !camera.c.follow.target) return
		const { target } = camera.c.follow
		if (target._meta.updated !== tick) return
		if (this.tween) this.tween.stop()
		this.tween = new Tween(<Point>{ ...this.viewport.center })
			.to(
				{
					x: target.x * TILE_SIZE + TILE_SIZE / 2,
					y: target.y * TILE_SIZE + TILE_SIZE / 2,
				},
				300
			)
			.easing(Easing.Quadratic.Out)
			.onUpdate((point) => {
				this.viewport.moveCenter(point)
			})
		this.tween.start().onComplete(() => {
			delete this.tween
		})
	}
}
