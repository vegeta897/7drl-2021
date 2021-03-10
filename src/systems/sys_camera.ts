import { Point } from 'pixi.js'
import { System } from 'ape-ecs'
import { GlobalEntity } from '../types'
import { Viewport } from 'pixi-viewport'
import { addGrids, diffGrids } from '../util'
import { TILE_SIZE } from '../index'
import { Util } from 'rot-js'

const PADDING = 1.25 / 3 // Portion of screen to pad

export default class CameraSystem extends System {
	private viewport: Viewport
	private reCenter = true
	init(viewport: Viewport) {
		this.viewport = viewport
	}

	update(tick) {
		const target = <Point>(
			this.world.getEntity(GlobalEntity.Player)!.c.pixi.object.position
		)
		const targetCenter = addGrids(target, {
			x: TILE_SIZE / 2,
			y: TILE_SIZE / 2,
		})
		if (this.reCenter) {
			this.viewport.moveCenter(<Point>targetCenter)
			this.reCenter = false
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
