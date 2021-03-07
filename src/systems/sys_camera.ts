import { Point } from 'pixi.js'
import { System } from 'ape-ecs'
import { GlobalEntity } from '../types'
import { Viewport } from 'pixi-viewport'
import { addGrids, diffGrids } from '../util'
import { TILE_SIZE } from '../index'
import { Util } from 'rot-js'

const CAM_RADIUS = 3

export default class CameraSystem extends System {
	private viewport: Viewport
	private targetLast
	init(viewport: Viewport) {
		this.viewport = viewport
	}
	update(tick) {
		const camera = this.world.getEntity(GlobalEntity.Camera)
		if (!camera || !camera.c.follow.target) return
		const { target } = camera.c.follow
		const targetCenter = addGrids(target, {
			x: TILE_SIZE / 2,
			y: TILE_SIZE / 2,
		})
		if (!this.targetLast) {
			this.viewport.moveCenter(<Point>targetCenter)
		} else {
			const radius = CAM_RADIUS * TILE_SIZE
			const camOffset = diffGrids(targetCenter, this.viewport.center)
			if (Math.abs(camOffset.x) > radius || Math.abs(camOffset.y) > radius) {
				const moveTo = {
					x: Util.clamp(
						this.viewport.center.x,
						targetCenter.x - radius,
						targetCenter.x + radius
					),
					y: Util.clamp(
						this.viewport.center.y,
						targetCenter.y - radius,
						targetCenter.y + radius
					),
				}
				this.viewport.moveCenter(<Point>moveTo)
			}
		}
		this.targetLast = { ...targetCenter }
	}
}
