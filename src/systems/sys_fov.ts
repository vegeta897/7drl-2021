import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import { FOV } from 'rot-js'
import { Easing, Tween } from '@tweenjs/tween.js'
import { GlobalEntity } from '../types'
import { Level } from '../level'
import Player from '../components/com_player'
import PixiObject from '../components/com_pixi'

const FOV_RADIUS = 12
const FOG_VISIBILITY = 0.3 // Max visibility of previously seen tiles
const TWEEN_TIME = 80

function getEasedVisibility(visibility: number, radius: number): number {
	return visibility * Easing.Sinusoidal.Out((FOV_RADIUS - radius) / FOV_RADIUS)
}

function getVisibilityTweenTime(distance: number, factor: number = 1): number {
	return TWEEN_TIME + TWEEN_TIME * (distance / 5) * factor
}

type VisibilityMap = Map<string, [visibility: number, radius: number]>

export default class FOVSystem extends System {
	private transforms!: Query
	private prevVisibilityMap: VisibilityMap = new Map()
	init() {
		this.transforms = this.createQuery({
			all: [Transform, PixiObject],
			not: [Player],
			persist: true,
		})
	}
	update(tick) {
		let visibilityUpdated = false
		const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		const playerTransform = <Transform>(
			this.world.getEntity(GlobalEntity.Player)!.c.transform
		)
		// Player moved, update visibility map
		if (playerTransform._meta.updated === tick) {
			visibilityUpdated = true
			const newVisibilityMap: VisibilityMap = new Map()
			const fov = new FOV.PreciseShadowcasting((x, y) => {
				const tile = level.getTileAt({ x, y })
				return !tile || tile.seeThrough
			})
			fov.compute(
				playerTransform.x,
				playerTransform.y,
				FOV_RADIUS,
				(x, y, radius, visibility) => {
					const gridKey = x + ':' + y
					const prevVisibility = this.prevVisibilityMap.get(gridKey)
					newVisibilityMap.set(gridKey, [
						Math.max(
							getEasedVisibility(visibility, radius),
							prevVisibility ? prevVisibility[0] : 0
						),
						radius,
					])
				}
			)
			// Update static tiles
			level.tiles.forEach((tile, gridKey) => {
				if (!tile.sprite) return
				if (
					!this.prevVisibilityMap.has(gridKey) &&
					!newVisibilityMap.has(gridKey)
				)
					return
				const prevVisibility = this.prevVisibilityMap.get(gridKey)
				const newVisibility = newVisibilityMap.get(gridKey)
				if (prevVisibility && !newVisibility) {
					// Previously visible tile no longer visible
					const alpha = Math.min(
						FOG_VISIBILITY,
						Math.max(prevVisibility[0], tile.revealed)
					)
					if (tile.sprite.alpha !== alpha) {
						new Tween(tile.sprite)
							.to({ alpha }, getVisibilityTweenTime(prevVisibility[1]))
							.start()
					}
				} else if (newVisibility) {
					tile.revealed = Math.max(tile.revealed, newVisibility[0])
					const alpha = tile.revealed
					if (tile.sprite.alpha !== alpha) {
						new Tween(tile.sprite)
							.to({ alpha }, getVisibilityTweenTime(newVisibility[1]))
							.start()
					}
				}
			})
			this.prevVisibilityMap = newVisibilityMap
		}
		// Update non-player entities
		this.transforms.execute().forEach((entity) => {
			const { transform, pixi } = <{ transform: Transform; pixi: PixiObject }>(
				entity.c
			)
			const distanceFromPlayer = Math.max(
				Math.abs(transform.x - playerTransform.x),
				Math.abs(transform.y - playerTransform.y)
			)
			// If entity moved or visibility map was updated
			if (!visibilityUpdated && transform._meta.updated !== tick) return
			const previousVisibility = this.prevVisibilityMap.get(
				transform.x + ':' + transform.y
			)
			const alpha = previousVisibility ? previousVisibility[0] : 0
			if (alpha !== pixi.object.alpha)
				new Tween(pixi.object)
					.to({ alpha }, getVisibilityTweenTime(distanceFromPlayer, 0.5))
					.start()
		})
	}
}
