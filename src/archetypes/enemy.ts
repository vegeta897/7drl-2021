import { Entity, IComponentConfigValObject, World } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { GlobalEntity, Grid } from '../types'
import { createSprite, TextureID } from '../sprites'
import Game from '../components/com_game'
import { RNG } from 'rot-js'
import Follow from '../components/com_follow'
import Health from '../components/com_health'

let enemyCount = 0

export function createEnemyComponents(
	container: Container,
	grid: Grid,
	player: Entity
): IComponentConfigValObject {
	const sprite = createSprite(TextureID.Enemy)
	sprite.alpha = 0
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
			target: player,
		},
		health: {
			type: Health.typeName,
			current: health,
			max: health,
		},
	}
}

// TODO: Monsters chase after players, and prefer to walk on rail when doing so
// So players can lure them onto rails and then grind 'em

// Or maybe some other behavior that works better for the grinding gameplay?

export function spawnEnemies(world: World, count: number) {
	const { level } = <Game>world.getEntity(GlobalEntity.Game)!.c.game
	const px = level.rooms[0].x1 + 4
	const py = level.rooms[0].y1 + 1
	spawnEnemy(world, px, py)
	let spawned = 0
	let passes = 0
	// TODO: This is bad, spread enemies out
	do {
		level.rooms.forEach((room, roomIndex) => {
			if (roomIndex === level.rooms.length - 1) return
			if (RNG.getUniform() > 0.05) return
			// console.log('spawn enemy in room', roomIndex)
			const x = room.x1 + RNG.getUniformInt(0, room.x2 - room.x1)
			const y = room.y1 + RNG.getUniformInt(0, room.y2 - room.y1)
			if (level.entityMap.has(x + ':' + y)) return
			spawnEnemy(world, x, y)
			spawned++
		})
		passes++
	} while (spawned < count)
	console.log('enemy spawn passes:', passes)
}

function spawnEnemy(world, x, y) {
	const { level, entityContainer, worldSprites } = <Game>(
		world.getEntity(GlobalEntity.Game)!.c.game
	)
	const player = <Entity>world.getEntity(GlobalEntity.Player)!
	const enemyComponents = createEnemyComponents(
		entityContainer,
		{ x, y },
		player
	)
	console.log('setting entity map', x + ':' + y, 'to enemy')
	level.entityMap.set(
		x + ':' + y,
		world.createEntity({
			id: `enemy${++enemyCount}`,
			c: enemyComponents,
		})
	)
	worldSprites.add(enemyComponents.pixi.object)
}
