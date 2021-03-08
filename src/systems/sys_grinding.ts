import { Query, System } from 'ape-ecs'
import Grinding from '../components/com_grinding'
import { Directions, GlobalEntity, GrindState, MoveGrids } from '../types'
import Move from '../components/com_move'
import { addGrids, turnClockwise } from '../util'
import { Level, Tile } from '../level'
import Transform from '../components/com_transform'
import Game from '../components/com_game'
import { RNG } from 'rot-js'
import { RailTile } from '../rail'

const rng = RNG.clone()

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
				game.autoUpdate = true
			}
		})
		grinding.forEach((entity) => {
			const { transform, grinding } = <
				{ transform: Transform; grinding: Grinding }
			>entity.c
			if (grinding.state !== GrindState.End) {
				const rail = <RailTile>level.getTileAt(transform)!.rail
				console.assert(rail)
				let state = GrindState.Continue
				let newDirection = grinding.direction
				if (rail?.directions.includes(newDirection)) {
					// Continue forward
				} else if (rail?.directions.length > 1) {
					// Try turning
					const turns = [
						turnClockwise(newDirection),
						turnClockwise(newDirection, 3),
					].filter((turnDirection) => rail?.directions.includes(turnDirection))
					if (turns.length > 0) {
						// Turn
						newDirection = <Directions>rng.getItem(turns)
					}
				} else {
					state = GrindState.End
				}
				grinding.update({ direction: newDirection, state })
				entity.addComponent({
					type: Move.typeName,
					key: 'move',
					...MoveGrids[newDirection],
					direction: newDirection,
				})
				game.autoUpdate = true
			} else {
				entity.removeComponent(grinding)
			}
		})
	}
}
