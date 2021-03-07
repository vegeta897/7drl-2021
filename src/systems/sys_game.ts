import { System } from 'ape-ecs'
import { Entities } from '../types'
import { updateWorld } from '../ecs'

export default class GameSystem extends System {
	update(tick) {
		const { game } = this.world.getEntity(Entities.Game)!.c
		if (game.autoUpdate !== null && game.timeout === null) {
			game.timeout = setTimeout(() => {
				clearTimeout(game.timeout)
				game.timeout = null
				updateWorld()
				this.world.tick()
			}, game.autoUpdate)
			game.autoUpdate = null
		}
	}
}
