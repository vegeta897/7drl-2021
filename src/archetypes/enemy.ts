import { Entity, IComponentConfigValObject, World } from 'ape-ecs'
import { Container } from 'pixi.js'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { GlobalEntity, Grid } from '../types'
import { createSprite, TextureID } from '../core/sprites'
import Game from '../components/com_game'
import { RNG } from 'rot-js'
import Follow from '../components/com_follow'
import Health from '../components/com_health'
import { DEBUG_VISIBILITY } from '../core/level'

let enemyID = 0

function createEnemyComponents(
	container: Container,
	grid: Grid,
	player: Entity
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

export function spawnEnemies(world: World) {
	const { level } = <Game>world.getEntity(GlobalEntity.Game)!.c.game
	if (level.rooms.length === 0) return
	const count = Math.floor(16)
	let spawned = 0
	let passes = 0
	// TODO: This is bad, spread enemies out
	do {
		level.rooms.forEach((room, roomIndex) => {
			if (roomIndex === 0) return
			if (RNG.getUniform() > 0.05) return
			// console.log('spawn enemy in room', roomIndex)
			const x = room.x1 + RNG.getUniformInt(0, room.width - 1)
			const y = room.y1 + RNG.getUniformInt(0, room.height - 1)
			if (level.entityMap.has(x + ':' + y)) return
			spawnEnemy(world, x, y)
			spawned++
		})
		passes++
	} while (spawned < count)
	console.log('enemy spawn passes:', passes)
}

function spawnEnemy(world, x, y) {
	const { level, entityContainer } = <Game>(
		world.getEntity(GlobalEntity.Game)!.c.game
	)
	const player = <Entity>world.getEntity(GlobalEntity.Player)!
	const enemyComponents = createEnemyComponents(
		entityContainer,
		{ x, y },
		player
	)
	level.entityMap.set(
		x + ':' + y,
		world.createEntity({
			id: `enemy${++enemyID}`,
			c: enemyComponents,
		})
	)
	entityContainer.addChild(enemyComponents.pixi.object)
}
