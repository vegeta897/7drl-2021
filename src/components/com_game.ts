import { Component } from 'ape-ecs'
import { Level } from '../level'
import { Viewport } from 'pixi-viewport'

export default class Game extends Component {
	static typeName = 'Game'
	level: Level
	wait: boolean
	autoUpdate: boolean
	viewport: Viewport
	static properties = {
		level: null,
		wait: false,
		autoUpdate: false,
		viewport: null,
	}
}
