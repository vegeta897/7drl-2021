import { Component } from 'ape-ecs'
import { Level } from '../level'
import { Container } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export default class Game extends Component {
	static typeName = 'Game'
	level: Level
	autoUpdate: boolean
	viewport: Viewport
	entityContainer: Container
	gameOver: boolean
	levelNumber: number
	static properties = {
		level: null,
		autoUpdate: false,
		viewport: null,
		entityContainer: null,
		gameOver: false,
		levelNumber: 1,
	}
}
