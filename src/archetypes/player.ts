import { Entity, World } from 'ape-ecs'
import { Container } from 'pixi.js'
import { Tile } from '../components/com_tile'
import { createSprite, SPRITES } from '../sprites'
import { Entities } from '../types'
import { Controller } from '../components/com_controller'
import { Player } from '../components/com_player'

export function createPlayer(world: World, container: Container, x, y): Entity {
	const sprite = createSprite(SPRITES.PLAYER)
	sprite.tint = 0x22aa99
	container.addChild(sprite)
	const player = world.createEntity({
		c: {
			tile: {
				type: Tile.typeName,
				sprite,
				x,
				y,
			},
			controller: {
				type: Controller.typeName,
			},
			player: {
				type: Player.typeName,
			},
		},
		id: Entities.Player,
	})
	return player
}
