import { Entity, System } from 'ape-ecs'
import { GlobalEntity, Tags } from '../types'
import Game from '../components/com_game'
import { createPlayer } from '../archetypes/player'
import { spawnEnemies } from '../archetypes/enemy'
import { world } from '../core/ecs'
import TWEEN from '@tweenjs/tween.js'

export default class GameSystem extends System {
	update(tick) {
		const gameEntity = this.world.getEntity(GlobalEntity.Game)!
		const player = <Entity>this.world.getEntity(GlobalEntity.Player)!
		const game = <Game>gameEntity.c.game
		if (game.win) {
			game.autoUpdate = false
			TWEEN.getAll().forEach((t) => t.stop())
			game.levelNumber++
			const playerHealth = player.c.health.current
			this.world.entities.forEach((entity) => {
				if (entity !== gameEntity) entity.destroy()
			})
			game.level.destroyLevel()
			game.level.createLevel(game.levelNumber)
			createPlayer(this.world)
			const newPlayer = <Entity>this.world.getEntity(GlobalEntity.Player)!
			newPlayer.c.health.current = playerHealth
			spawnEnemies(world)
			gameEntity.addTag(Tags.UpdateHUD)
		} else if (game.gameOver) {
			game.autoUpdate = false
			TWEEN.getAll().forEach((t) => t.stop())
			game.levelNumber = 1
			this.world.entities.forEach((entity) => {
				if (entity !== gameEntity) entity.destroy()
			})
			game.level.destroyLevel()
			game.level.createLevel()
			createPlayer(this.world)
			spawnEnemies(world)
			gameEntity.addTag(Tags.UpdateHUD)
		}
	}
}
