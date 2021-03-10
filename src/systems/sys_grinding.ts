import { Query, System } from 'ape-ecs'
import Grinding from '../components/com_grinding'
import { Directions, GlobalEntity, GrindState } from '../types'
import Move from '../components/com_move'
import {
	addGrids,
	moveDirectional,
	reverseDirection,
	turnClockwise,
} from '../util'
import { Level, Tile } from '../level'
import Transform from '../components/com_transform'
import Game from '../components/com_game'
import { RNG } from 'rot-js'
import { RailData } from '../rail/types'
import Particles from '../components/com_particles'
import {
	addSparkComponents,
	intensifySparks,
	updateSparkComponents,
} from '../rail/particles'
import { Tween } from '@tweenjs/tween.js'
import { GRIND_SPEED } from './sys_tween'
import Controller from '../components/com_controller'
// import { DEFAULT_ZOOM } from '../index'
// import { AnimateOptions } from 'pixi-viewport'

const rng = RNG.clone()

// const GRIND_ZOOM = 5
// const ZOOM_TIME = 500
const INITIAL_GRIND_SPEED = 4

export default class GrindingSystem extends System {
	private noGrindMoving!: Query
	private grinding!: Query
	init() {
		this.noGrindMoving = this.createQuery({
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
		const { game, controller } = <{ game: Game; controller: Controller }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
		const level = <Level>game.level
		const noGrindMoving = this.noGrindMoving.execute()
		const grinding = this.grinding.execute()
		noGrindMoving.forEach((entity) => {
			if (controller.sneak || controller.boost) return
			const { move, transform } = <{ transform: Transform; move: Move }>entity.c
			const destGrid = level.getTileAt(addGrids(move, transform))
			if (
				destGrid?.type === Tile.Rail &&
				(destGrid.rail!.directions.includes(move.direction) ||
					destGrid.rail!.directions.includes(reverseDirection(move.direction)))
			) {
				// Begin grind
				entity.addComponent({
					type: Grinding.typeName,
					key: 'grinding',
					direction: move.direction,
					speed: INITIAL_GRIND_SPEED,
					boosted: destGrid.rail!.booster,
				})
				// game.viewport.animate(<AnimateOptions>{
				// 	scale: GRIND_ZOOM,
				// 	time: ZOOM_TIME,
				// 	ease: 'easeInCubic', // Penner's easing https://github.com/bcherny/penner
				// })
				game.autoUpdate = true
			}
		})
		grinding.forEach((entity) => {
			const { transform, grinding } = <
				{ transform: Transform; grinding: Grinding }
			>entity.c
			if (grinding.state !== GrindState.End) {
				if (grinding.state === GrindState.Start)
					addSparkComponents(entity, grinding.direction, game.entityContainer)
				const rail = <RailData>level.getTileAt(transform)!.rail
				console.assert(rail)
				let state = GrindState.Continue
				let newDirection = grinding.direction
				if (!rail?.directions.includes(newDirection)) {
					// Try turning
					const turns = [
						turnClockwise(newDirection),
						turnClockwise(newDirection, 3),
					].filter((turnDirection) => rail?.directions.includes(turnDirection))
					if (turns.length > 0) {
						// Turn
						newDirection = <Directions>rng.getItem(turns)
					}
				}
				const moveGrid = moveDirectional(newDirection)
				const nextTile = level.getTileAt(addGrids(transform, moveGrid))
				if (
					!nextTile?.rail?.directions.includes(
						reverseDirection(newDirection)
					) ||
					grinding.speed === 1
				) {
					state = GrindState.End
					entity.getComponents(Particles).forEach((p) => {
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
				const particles = entity.getComponents(Particles)
				if (newDirection !== grinding.direction)
					updateSparkComponents(particles, newDirection)
				grinding.update({
					direction: newDirection,
					state,
					distance: grinding.distance + (state === GrindState.End ? 0 : 1),
					speed: grinding.speed + (grinding.boosted ? 1 : -1),
				})
				if (grinding.distance % 8 === 0) {
					// Grinding intensifies
					particles.forEach(({ emitter }) => {
						intensifySparks(emitter)
					})
				}
				entity.addComponent({
					type: Move.typeName,
					key: 'move',
					...moveGrid,
					direction: newDirection,
				})
				game.autoUpdate = true
			} else {
				entity.removeComponent(grinding)
			}
		})
	}
}
