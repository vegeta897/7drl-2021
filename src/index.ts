import { Application, Ticker } from 'pixi.js'
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
const ZOOM = 2
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
	noTicker: true,
})
stage.addChild(viewport)

const level = new Level()

viewport.addChild(level.container)
viewport.setZoom(ZOOM)

initWorld({ viewport })

world.createEntity({
	id: GlobalEntity.Game,
	c: {
		game: {
			type: Game.typeName,
			level,
			viewport,
		},
		controller: {
			type: Controller.typeName,
		},
	},
})

const [playerX, playerY] = level.dungeon.getRooms()[0].getCenter()

const playerComponents = createPlayerComponents(viewport, playerX, playerY)
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
