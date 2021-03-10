import { IComponentConfigValObject, World } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { GlobalEntity, Grid } from '../types'
import { createSprite, TextureID } from '../sprites'
import Game from '../components/com_game'
import { RNG } from 'rot-js'

export function createEnemyComponents(
	container: Container,
	grid: Grid
): IComponentConfigValObject {
	const sprite = createSprite(TextureID.Enemy)
	sprite.alpha = 0
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
	}
}

// TODO: Monsters chase after players, and prefer to walk on rail when doing so
// So players can lure them onto rails and then grind 'em

export function spawnEnemies(world: World, count: number) {
	const { level, entityContainer, worldSprites } = <Game>(
		world.getEntity(GlobalEntity.Game)!.c.game
	)
	let spawned = 0
	let passes = 0
	// TODO: This is bad, spread enemies out
	do {
		level.rooms.forEach((room, roomIndex) => {
			if (roomIndex === level.rooms.length - 1) return
			if (RNG.getUniform() > 0.05) return
			console.log('spawn enemy in room', roomIndex)
			const enemyComponents = createEnemyComponents(entityContainer, {
				x: room.x1 + RNG.getUniformInt(0, room.x2 - room.x1),
				y: room.y1 + RNG.getUniformInt(0, room.y2 - room.y1),
			})
			world.createEntity({
				c: enemyComponents,
			})
			worldSprites.add(enemyComponents.pixi.object)
			spawned++
		})
		passes++
	} while (spawned < count)
	console.log('enemy spawn passes:', passes)
}
