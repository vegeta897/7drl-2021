import { Application, Ticker, Container, Sprite } from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import './style.css'
import { Level } from './level'
import { world, runMainSystems, initWorld } from './ecs'
import { createPlayerComponents } from './archetypes/player'
import { GlobalEntity, SystemGroup, Tags } from './types'
import { Viewport } from 'pixi-viewport'
import Game from './components/com_game'
import Controller from './components/com_controller'
import { spawnEnemies } from './archetypes/enemy'

const WIDTH = 960
const HEIGHT = 720
export const DEFAULT_ZOOM = 3
export const TILE_SIZE = 16

const { view, stage } = new Application({
	width: WIDTH,
	height: HEIGHT,
	backgroundColor: 0x1f0e1c,
	sharedTicker: true,
})
view.id = 'viewport'
view.addEventListener('contextmenu', (e) => e.preventDefault())
document.body.appendChild(view)

Ticker.shared.add(() => {
	TWEEN.update()
	world.runSystems(SystemGroup.Render)
})
const viewport = new Viewport({
	screenWidth: view.width,
	screenHeight: view.height,
})
stage.addChild(viewport)

const worldSprites: Set<Sprite> = new Set()

const level = new Level(worldSprites)

viewport.addChild(level.container)
viewport.setZoom(DEFAULT_ZOOM)

const HUD = new Container()
HUD.setTransform(
	WIDTH - (TILE_SIZE * 3 - 2) * DEFAULT_ZOOM,
	HEIGHT - (TILE_SIZE + 2) * DEFAULT_ZOOM,
	3,
	3
)
stage.addChild(HUD)

initWorld({ viewport, HUD })

const entityContainer = new Container()
viewport.addChild(entityContainer)

world.createEntity({
	id: GlobalEntity.Game,
	c: {
		game: {
			type: Game.typeName,
			level,
			viewport,
			entityContainer,
			worldSprites,
		},
		controller: {
			type: Controller.typeName,
		},
	},
})

// TODO: Show title card on first long grind on first level

// TODO: Final boss will be in a big room with a rail maze (use rotJS maze-gen)

// Player gains initial grinding momentum during game (killing monsters)
// In starting room, there is a rail with booster that links into the main rail with a turn leading toward the dungeon rooms
// In starting room of first level, put some small rails of different lengths so the player can learn the basics. also put a dummy enemy on a couple of them so they can learn how to grind into enemies
// Put enemies on the long line just before the dungeon
// Make the long line turn off to the side when reaching the dungeon, so it doesn't take you all the way to the end booster
// Add a key to one of the enemies that opens the door to the final booster room

const px = level.rooms[0].x1 + 1
const py = level.rooms[0].y1 + 1
const playerComponents = createPlayerComponents(
	entityContainer,
	// level.levelStart
	{ x: px, y: py }
)
console.log('setting entity map', px + ':' + py, 'to player')
level.entityMap.set(
	px + ':' + py,
	world.createEntity({
		id: GlobalEntity.Player,
		tags: [Tags.UpdateHUD],
		c: playerComponents,
	})
)

spawnEnemies(world, 8)

runMainSystems()
