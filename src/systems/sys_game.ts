import { System } from 'ape-ecs'
import { GlobalEntity, Tags } from '../types'
import Game from '../components/com_game'
import { createPlayer } from '../archetypes/player'
import { spawnEnemies } from '../archetypes/enemy'
import { world } from '../core/ecs'

export default class GameSystem extends System {
	update(tick) {
		const gameEntity = this.world.getEntity(GlobalEntity.Game)!
		const game = <Game>gameEntity.c.game
		if (game.gameOver) {
			game.levelNumber = 1
			console.log('game over!')
			this.world.entities.forEach((entity) => {
				if (entity !== gameEntity) entity.destroy()
			})
			game.level.destroyLevel()
			game.level.createLevel()
			createPlayer(this.world)
			spawnEnemies(world, 8)
			gameEntity.addTag(Tags.UpdateHUD)
		}
	}
}
