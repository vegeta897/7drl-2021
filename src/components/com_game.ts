import { Component } from 'ape-ecs'
import { Level } from '../level'

export default class Game extends Component {
	static typeName = 'Game'
	level: Level
	inputLocked: boolean
	autoUpdate: number | null
	timeout: number | null
	static properties = {
		level: null,
		inputLocked: false,
		autoUpdate: null,
		timeout: null,
	}
}
