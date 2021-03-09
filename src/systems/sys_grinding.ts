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
import { createSparkEmitter } from '../rail/particles'
import { DEFAULT_ZOOM } from '../index'
import { AnimateOptions } from 'pixi-viewport'

const rng = RNG.clone()

const GRIND_ZOOM = 5
const ZOOM_TIME = 500

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
		const { game } = <Game>this.world.getEntity(GlobalEntity.Game)!.c
		const level = <Level>game.level
		const noGrindMoving = this.noGrindMoving.execute()
		const grinding = this.grinding.execute()
		noGrindMoving.forEach((entity) => {
			const { move, transform } = <{ transform: Transform; move: Move }>entity.c
			const destGrid = level.getTileAt(addGrids(move, transform))
			if (
				destGrid?.type === Tile.Rail &&
				destGrid.rail?.directions.includes(move.direction)
			) {
				// Begin grind
				entity.addComponent({
					type: Grinding.typeName,
					key: 'grinding',
					direction: move.direction,
				})
				game.viewport.animate(<AnimateOptions>{
					scale: GRIND_ZOOM,
					time: ZOOM_TIME,
					ease: 'easeInCubic', // Penner's easing
				})
				game.autoUpdate = true
			}
		})
		grinding.forEach((entity) => {
			const { transform, grinding } = <
				{ transform: Transform; grinding: Grinding }
			>entity.c
			if (grinding.state !== GrindState.End) {
				if (grinding.state === GrindState.Start) {
					entity.addComponent({
						type: Particles.typeName,
						emitter: createSparkEmitter(game.viewport, { x: 4, y: 13 }),
					})
					entity.addComponent({
						type: Particles.typeName,
						emitter: createSparkEmitter(game.viewport, { x: 12, y: 13 }),
					})
				}
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
					nextTile?.rail?.directions.includes(reverseDirection(newDirection))
				) {
				} else {
					state = GrindState.End
					entity
						.getComponents(Particles)
						.forEach((p) => (p.emitter.emit = false))
					game.viewport.animate({
						scale: DEFAULT_ZOOM,
						time: ZOOM_TIME / 2,
						ease: 'easeInOutCubic', // Penner's easing
					})
				}
				grinding.update({
					direction: newDirection,
					state,
					distance: grinding.distance + (state === GrindState.End ? 0 : 1),
				})
				entity.addComponent({
					type: Move.typeName,
					key: 'move',
					...moveGrid,
					direction: newDirection,
				})
				game.autoUpdate = true
			} else {
				entity.removeComponent(grinding)
				entity
					.getComponents(Particles)
					.forEach((p) => entity.removeComponent(p))
			}
		})
	}
}
