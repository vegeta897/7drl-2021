import { IComponentConfigValObject } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import { createSprite, TextureID } from '../sprites'
import Controller from '../components/com_controller'
import Player from '../components/com_player'
import PixiObject from '../components/com_pixi'
import { Grid } from '../types'

export function createPlayerComponents(
	container: Container,
	grid: Grid
): IComponentConfigValObject {
	const sprite = createSprite(TextureID.Player)
	// sprite.tint = 0xc0c741
	container.addChild(sprite)
	return {
		transform: {
			type: Transform.typeName,
			...grid,
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
