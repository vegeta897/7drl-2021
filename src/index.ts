import { Application, Ticker, Container } from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import './style.css'
import { Level } from './level'
import { world, updateWorld, initWorld } from './ecs'
import { createPlayerComponents } from './archetypes/player'
import { GlobalEntity, SystemGroup } from './types'
import Follow from './components/com_follow'
import { Viewport } from 'pixi-viewport'
import Game from './components/com_game'
import Controller from './components/com_controller'

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

const level = new Level()

viewport.addChild(level.container)
viewport.setZoom(DEFAULT_ZOOM)

initWorld({ viewport })

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
		},
		controller: {
			type: Controller.typeName,
		},
	},
})

// TODO: Show title card on first long grind on first level

// TODO: Create gate on rail before first room after arriving in dungeon, to prevent player from grinding all the way back to the start and dying before they finished the whole track

const playerComponents = createPlayerComponents(
	entityContainer,
	// level.levelStart
	{ x: level.rooms[0].x1 + 1, y: level.rooms[0].y1 + 1 }
)
world.createEntity({
	id: GlobalEntity.Player,
	c: playerComponents,
})

const FOLLOW = true
world.createEntity({
	id: GlobalEntity.Camera,
	c: {
		follow: {
			type: Follow.typeName,
			target: FOLLOW
				? playerComponents.pixi.object.position
				: { x: 200, y: 100 },
		},
	},
})

updateWorld()
