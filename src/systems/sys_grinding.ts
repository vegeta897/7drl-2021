import { Query, System } from 'ape-ecs'
import Grinding, { GrindState } from '../components/com_grinding'
import { GlobalEntity, Tags } from '../types'
import Move from '../components/com_move'
import { addGrids, moveDirectional } from '../util'
import { Level, Tile } from '../core/level'
import Transform from '../components/com_transform'
import Game from '../components/com_game'
import { RailData } from '../rail/types'
import Particles from '../components/com_particles'
import {
	addSparkComponents,
	intensifySparks,
	updateSparkComponents,
} from '../rail/particles'
import { Tween } from '@tweenjs/tween.js'
import { GRIND_SPEED } from './sys_tween'
// import { DEFAULT_ZOOM } from '../index'
// import { AnimateOptions } from 'pixi-viewport'

// const GRIND_ZOOM = 5
// const ZOOM_TIME = 500
const INITIAL_GRIND_SPEED = 4

export default class GrindingSystem extends System {
	private moving!: Query
	private grinding!: Query
	init() {
		this.moving = this.createQuery({
			all: [Transform, Move],
			not: [Grinding],
			persist: true,
		})
		this.grinding = this.createQuery({
			all: [Transform, Grinding],
			persist: true,
		})
	}
	update(tick) {
		const { game } = <{ game: Game }>this.world.getEntity(GlobalEntity.Game)!.c
		const level = <Level>game.level

		this.grinding.execute().forEach((entity) => {
			const { transform, grinding } = <
				{ transform: Transform; grinding: Grinding }
			>entity.c
			if (grinding.state === GrindState.Start)
				addSparkComponents(entity, grinding.direction, game.entityContainer)
			const rail = <RailData>level.getTileAt(transform)!.rail
			console.assert(rail)
			let state = GrindState.Continue
			const newDirection = rail.flowMap[grinding.direction]
			if (newDirection === undefined) throw 'grinding from invalid direction'
			const moveTo = addGrids(transform, moveDirectional(newDirection))
			const nextTile = level.getTileAt(moveTo)
			const particles = entity.getComponents(Particles)
			if (
				nextTile?.rail?.flowMap[newDirection] === undefined ||
				grinding.speed === 1
			) {
				state = GrindState.End
				particles.forEach((p) => {
					if (grinding.speed === 1) {
						// If grinding to a halt, tween down the particles
						new Tween(p.emitter)
							.to(
								{
									minimumSpeedMultiplier: 0.7,
									maxLifetime: 0.1,
									frequency: 0.01,
									maxParticles: 0,
								},
								GRIND_SPEED * 2
							)
							.start()
							.onComplete(() => entity.removeComponent(p))
					} else {
						// If not grinding to a halt, just remove the emitter right away
						p.emitter.emit = false
						entity.removeComponent(p)
					}
				})
				// game.viewport.animate({
				// 	scale: DEFAULT_ZOOM,
				// 	time: ZOOM_TIME / 2,
				// 	ease: 'easeInOutCubic',
				// })
			}
			if (nextTile?.solid) {
				// If colliding, grinding doesn't End, it's removed and no Move added
				entity.removeComponent(grinding)
				return
			}
			if (newDirection !== grinding.direction)
				updateSparkComponents(particles, newDirection)
			grinding.update({
				direction: newDirection,
				state,
				distance: grinding.distance + (state === GrindState.End ? 0 : 1),
				speed: grinding.speed + (grinding.boosted ? 1 : -1),
			})
			if (grinding.speed % 8 === 0) {
				// Grinding intensifies
				particles.forEach(({ emitter }) => {
					intensifySparks(emitter)
				})
			}
			// Add move component
			entity.addComponent({
				type: Move.typeName,
				key: 'move',
				...moveTo,
				direction: newDirection,
			})
			if (state === GrindState.Continue) game.autoUpdate = true
		})

		this.moving
			.refresh()
			.execute()
			.forEach((entity) => {
				if (!entity.has(Tags.Player)) return
				const move = <Move>entity.c.move
				if (move.sneak || move.noClip) return
				const destTile = level.getTileAt(move)
				if (
					destTile?.type === Tile.Rail &&
					(destTile.rail!.flowMap[move.direction] !== undefined ||
						destTile.rail!.flowMap.includes(move.direction))
				) {
					// Begin grind
					entity.addComponent({
						type: Grinding.typeName,
						key: 'grinding',
						direction: move.direction,
						speed: INITIAL_GRIND_SPEED,
						boosted: destTile.rail!.booster,
					})
					game.autoUpdate = true
					// game.viewport.animate(<AnimateOptions>{
					// 	scale: GRIND_ZOOM,
					// 	time: ZOOM_TIME,
					// 	ease: 'easeInCubic', // Penner's easing https://github.com/bcherny/penner
					// })
				}
			})
	}
}
