import { IComponentConfigValObject } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import { createSprite, TextureID } from '../sprites'
import Controller from '../components/com_controller'
import PixiObject from '../components/com_pixi'
import { Grid } from '../types'
import Health from '../components/com_health'

export function createPlayerComponents(
	container: Container,
	grid: Grid
): IComponentConfigValObject {
	const sprite = createSprite(TextureID.Player)
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
		health: {
			type: Health.typeName,
			current: 15,
			max: 15,
		},
	}
}
