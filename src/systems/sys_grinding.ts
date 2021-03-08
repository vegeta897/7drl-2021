import { Query, System } from 'ape-ecs'
import Grinding from '../components/com_grinding'
import { GlobalEntity, GrindState, MoveGrids } from '../types'
import Move from '../components/com_move'
import { addGrids, reverseDirection } from '../util'
import { Tile } from '../level'
import Transform from '../components/com_transform'

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
		const { game } = this.world.getEntity(GlobalEntity.Game)!.c
		const noGrindMoving = this.noGrindMoving.execute()
		const grinding = this.grinding.execute()
		noGrindMoving.forEach((entity) => {
			const { move, transform } = <{ transform: Transform; move: Move }>entity.c
			const dest = addGrids(move, transform)
			const destGrid = game.level.getTileAt(dest.x, dest.y)
			if (destGrid.type === Tile.Rail) {
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
				const tile = game.level.getTileAt(transform.x, transform.y)
				const fromDirection = reverseDirection(grinding.direction)
				// Get next rail by filtering linked rails
				const nextRail = tile.rail.linkedTo.filter(
					(linked, dir) => linked && dir !== fromDirection
				)[0]
				let state = GrindState.End
				let { direction } = grinding
				if (nextRail) {
					// Continue grinding to next rail
					state = GrindState.Continue
					direction = tile.rail.linkedTo.indexOf(nextRail)
				}
				grinding.update({ direction, state })
				entity.addComponent({
					type: Move.typeName,
					key: 'move',
					...MoveGrids[direction],
					direction,
				})
				game.autoUpdate = true
			} else {
				entity.removeComponent(grinding)
			}
		})
	}
}
