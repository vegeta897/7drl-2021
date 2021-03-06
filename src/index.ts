import { Application, Ticker } from 'pixi.js'
import TWEEN from '@tweenjs/tween.js'
import './style.css'
import { Level } from './level'
import { world, updateWorld, initWorld } from './ecs'
import { createPlayer } from './archetypes/player'
import { Entities } from './types'
import Follow from './components/com_follow'
import { Viewport } from 'pixi-viewport'

const WIDTH = 800
const HEIGHT = 600

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

const room = level.map.getRooms()[0]
viewport.addChild(level.container)
viewport.setZoom(2)

const [playerX, playerY] = room.getCenter()
initWorld({ viewport })
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
