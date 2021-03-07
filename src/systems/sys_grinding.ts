import { Query, System } from 'ape-ecs'
import Grinding from '../components/com_grinding'
import { GlobalEntity, GrindState, MoveGrids } from '../types'
import Move from '../components/com_move'
import { addGrids, turnDirection } from '../util'
import { Tile } from '../level'

export default class GrindingSystem extends System {
	private noGrindMoving!: Query
	private grinding!: Query
	init() {
		this.noGrindMoving = this.createQuery({
			all: [Move],
			not: [Grinding],
			persist: true,
		})
		this.grinding = this.createQuery({
			all: [Grinding],
			persist: true,
		})
	}
	update(tick) {
		const { game } = this.world.getEntity(GlobalEntity.Game)!.c
		const noGrindMoving = this.noGrindMoving.execute()
		const grinding = this.grinding.execute()
		noGrindMoving.forEach((entity) => {
			const { move, transform } = entity.c
			const dest = { x: transform.x + move.x, y: transform.y + move.y }
			const destGrid = game.level.data.get(dest.x + ':' + dest.y)
			if (destGrid.value === Tile.Rail) {
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
			const { transform, grinding } = entity.c
			if (grinding.state !== GrindState.End) {
				for (const direction of [
					grinding.direction,
					turnDirection(grinding.direction, 1),
					turnDirection(grinding.direction, 3),
				]) {
					const destMove = addGrids(
						{ x: transform.x, y: transform.y },
						MoveGrids[direction]
					)
					// Check for wall
					const destTile = game.level.data.get(destMove.x + ':' + destMove.y)
						.value
					if (destTile === Tile.Wall) continue
					// Grinding continues
					entity.addComponent({
						type: Move.typeName,
						key: 'move',
						...MoveGrids[direction],
						direction,
					})
					grinding.update({
						direction,
						state:
							destTile === Tile.Rail ? GrindState.Continue : GrindState.End,
					})
					game.autoUpdate = true
					break
				}
			} else {
				entity.removeComponent(grinding)
			}
		})
	}
}
