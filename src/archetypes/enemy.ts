import { IComponentConfigValObject, World } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { GlobalEntity, Grid } from '../types'
import { createSprite, TextureID } from '../core/sprites'
import Game from '../components/com_game'
import { RNG } from 'rot-js'
import Follow from '../components/com_follow'
import Health from '../components/com_health'
import { DEBUG_VISIBILITY, TileData } from '../core/level'

let enemyID = 0

function createEnemyComponents(
	container: Container,
	grid: Grid
): IComponentConfigValObject {
	const sprite = createSprite(TextureID.Enemy)
	if (!DEBUG_VISIBILITY) sprite.alpha = 0
	container.addChild(sprite)
	const health = RNG.getUniformInt(2, 4)
	return {
		transform: {
			type: Transform.typeName,
			...grid,
		},
		pixi: {
			type: PixiObject.typeName,
			object: sprite,
		},
		follow: {
			type: Follow.typeName,
		},
		health: {
			type: Health.typeName,
			current: health,
			max: health,
		},
	}
}

export function spawnEnemies(world: World) {
	const { level } = <Game>world.getEntity(GlobalEntity.Game)!.c.game
	if (level.rooms.length === 0) return
	const floorTiles: TileData[] = []
	level.rooms.forEach(
		(room) => !room.noEnemies && floorTiles.push(...room.tiles.data.values())
	)
	const minimum = Math.floor(floorTiles.length * 0.02)
	let spawned = 0
	do {
		const spawnTile = RNG.getItem(floorTiles)!
		if (level.entityMap.has(spawnTile.x + ':' + spawnTile.y)) continue
		spawnEnemy(world, spawnTile.x, spawnTile.y)
		spawned++
	} while (spawned < minimum)
	console.log('spawned', spawned, 'enemies')
}

function spawnEnemy(world, x, y) {
	const { level, entityContainer } = <Game>(
		world.getEntity(GlobalEntity.Game)!.c.game
	)
	const enemyComponents = createEnemyComponents(entityContainer, { x, y })
	level.entityMap.set(
		x + ':' + y,
		world.createEntity({
			id: `enemy${++enemyID}`,
			c: enemyComponents,
		})
	)
	entityContainer.addChild(enemyComponents.pixi.object)
}
