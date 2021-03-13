import { System } from 'ape-ecs'
import { GlobalEntity } from '../types'
import Transform from '../components/com_transform'
import Move from '../components/com_move'
import Game from '../components/com_game'
import Attack from '../components/com_attack'
import Grinding, { GrindState } from '../components/com_grinding'

export default class PlayerSystem extends System {
	update(tick) {
		const game = <Game>this.world.getEntity(GlobalEntity.Game)!.c.game
		const player = this.world.getEntity(GlobalEntity.Player)!
		const { /*transform, */ move, grinding } = <
			{ transform: Transform; move: Move; grinding: Grinding }
		>player.c
		if (grinding) {
			if (grinding.state === GrindState.End) {
				player.removeComponent(grinding)
			}
		}
		if (move) {
			const destWalkable = game.level.isTileWalkable(move.x, move.y)
			if (!move.noClip && !destWalkable) {
				// Wall, cancel move
				player.removeComponent(move)
				if (grinding && grinding.state !== GrindState.End)
					player.removeComponent(grinding)
			} else {
				const destEntity = game.level.entityMap.get(move.x + ':' + move.y)
				if (destEntity) {
					// Entity collision
					player.removeComponent(move)
					player.addComponent({
						type: Attack.typeName,
						key: 'attack',
						target: destEntity,
					})
				}
			}
		}
	}
}
