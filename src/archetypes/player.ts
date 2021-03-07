import { Entity, World } from 'ape-ecs'
import { Container } from 'pixi.js'
import { Tile } from '../components/com_tile'
import { createSprite, SPRITES } from '../sprites'
import { Entities } from '../types'
import { Controller } from '../components/com_controller'
import { Player } from '../components/com_player'
import { PixiObject } from '../components/com_pixi'

export function createPlayer(world: World, container: Container, x, y): Entity {
	const sprite = createSprite(SPRITES.Player)
	sprite.tint = 0x22aa99
	container.addChild(sprite)
	const player = world.createEntity({
		c: {
			tile: {
				type: Tile.typeName,
				x,
				y,
			},
			pixi: {
				type: PixiObject.typeName,
				object: sprite,
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
