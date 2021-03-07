import { IComponentConfigValObject } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import { createSprite, TextureName } from '../sprites'
import Controller from '../components/com_controller'
import Player from '../components/com_player'
import PixiObject from '../components/com_pixi'

export function createPlayerComponents(
	container: Container,
	x: number,
	y: number
): IComponentConfigValObject {
	const sprite = createSprite(TextureName.Player)
	sprite.tint = 0xc0c741
	container.addChild(sprite)
	return {
		transform: {
			type: Transform.typeName,
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
	}
}
