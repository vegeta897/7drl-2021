import { Component } from 'ape-ecs'
import { Level } from '../level'
import { Container, Sprite } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

export default class Game extends Component {
	static typeName = 'Game'
	level: Level
	autoUpdate: boolean
	viewport: Viewport
	entityContainer: Container
	worldSprites: Set<Sprite>
	static properties = {
		level: null,
		autoUpdate: false,
		viewport: null,
		entityContainer: null,
		worldSprites: null,
	}
}
