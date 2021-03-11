import { Point } from 'pixi.js'
import { System } from 'ape-ecs'
import { GlobalEntity, Tags } from '../types'
import { Viewport } from 'pixi-viewport'
import { addGrids, diffGrids } from '../util'
import { Util } from 'rot-js'
import { TILE_SIZE } from '../core/sprites'

const PADDING = 1.25 / 3 // Portion of screen to pad

export default class CameraSystem extends System {
	private viewport: Viewport
	init(viewport: Viewport) {
		this.viewport = viewport
	}

	update(tick) {
		const player = this.world.getEntity(GlobalEntity.Player)!
		const target = <Point>player.c.pixi.object.position
		const targetCenter = addGrids(target, {
			x: TILE_SIZE / 2,
			y: TILE_SIZE / 2,
		})
		if (player.has(Tags.UpdateCamera)) {
			player.removeTag(Tags.UpdateCamera)
			this.viewport.moveCenter(<Point>targetCenter)
		} else {
			const xPadding = Math.floor(
				this.viewport.screenWidthInWorldPixels / 2 -
					this.viewport.screenWidthInWorldPixels * PADDING
			)
			const yPadding = Math.floor(
				this.viewport.screenHeightInWorldPixels / 2 -
					this.viewport.screenHeightInWorldPixels * PADDING
			)
			const camOffset = diffGrids(targetCenter, this.viewport.center)
			if (
				Math.abs(camOffset.x) > xPadding ||
				Math.abs(camOffset.y) > yPadding
			) {
				const moveTo = {
					x: Util.clamp(
						this.viewport.center.x,
						targetCenter.x - xPadding,
						targetCenter.x + xPadding
					),
					y: Util.clamp(
						this.viewport.center.y,
						targetCenter.y - yPadding,
						targetCenter.y + yPadding
					),
				}
				this.viewport.moveCenter(<Point>moveTo)
			}
		}
	}
}
