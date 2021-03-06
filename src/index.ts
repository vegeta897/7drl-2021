import { Application, Ticker } from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import './style.css'
import { Level } from './level'
import { world, updateWorld, initWorld } from './ecs'
import { createPlayer } from './archetypes/player'
import { Entities } from './types'
import Follow from './components/com_follow'
import { Viewport } from 'pixi-viewport'
import LevelData from './components/com_level'

const WIDTH = 960
const HEIGHT = 640
const ZOOM = 2
export const TILE_SIZE = 16

const { view, stage } = new Application({
	width: WIDTH,
	height: HEIGHT,
})
view.id = 'viewport'
view.addEventListener('contextmenu', (e) => e.preventDefault())
document.body.appendChild(view)

Ticker.shared.add(() => {
	TWEEN.update()
})

const viewport = new Viewport({
	screenWidth: view.width,
	screenHeight: view.height,
})
stage.addChild(viewport)

const level = new Level()

viewport.addChild(level.container)
viewport.setZoom(ZOOM)

initWorld({ viewport })

world.createEntity({
	id: Entities.Level,
	c: {
		level: {
			type: LevelData.typeName,
			level,
		},
	},
})

const [playerX, playerY] = level.dungeon.getRooms()[0].getCenter()
const player = createPlayer(world, viewport, playerX, playerY)

world.createEntity({
	id: Entities.Camera,
	c: {
		follow: {
			type: Follow.typeName,
			target: player.c.tile,
		},
	},
})
updateWorld()
