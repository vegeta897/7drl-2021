import { Component } from 'ape-ecs'
import { Level } from '../core/level'
import { Container } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export default class Game extends Component {
	static typeName = 'Game'
	level: Level
	autoUpdate: boolean
	viewport: Viewport
	entityContainer: Container
	gameOver: boolean
	win: boolean
	static properties = {
		level: null,
		autoUpdate: false,
		viewport: null,
		entityContainer: null,
		gameOver: false,
		win: false,
	}
}
